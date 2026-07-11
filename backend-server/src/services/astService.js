const acorn = require('acorn');
const walk = require('acorn-walk');

class AstService {
    /**
     * Validates Playwright code string with deep semantic AST checks.
     * @param {string} code 
     * @param {Object} rationale { issue: string, fix: string }
     * @param {Object} contract (Optional) { successSignal: { selector: string } }
     * @returns {Object} { valid: boolean, issues: string[], errors: string[] }
     */
    validatePlaywrightCode(code, rationale = null, contract = null) {
        const issues = [];
        const errors = [];
        
        // Wrap the code in an async function so top-level await doesn't fail parsing 
        const wrappedCode = `async function _wrapper() { ${code} }`;
        
        let ast;
        try {
            ast = acorn.parse(wrappedCode, { ecmaVersion: 2022, sourceType: "module" });
        } catch (err) {
            return { valid: false, issues: [`Syntax Error: ${err.message}`], errors: ['ERR_SYNTAX'] };
        }

        const actionNames = ['click', 'fill', 'type', 'selectOption', 'check', 'uncheck', 'press', 'goto'];
        const allowedMatchers = ['toBeVisible', 'toHaveText', 'toHaveURL', 'toHaveAttribute', 'toBeHidden'];
        const resilientLocators = ['getByRole', 'getByText', 'getByLabel', 'getByPlaceholder', 'getByTestId', 'getByAltText', 'getByTitle'];
        const mandatoryResilient = ['getByRole', 'getByTestId'];
        
        let hasExpect = false;
        let hasAction = false;
        let hasResilientLocator = false;
        let hasMandatoryResilient = false;
        let hasSuccessfulAssertion = false;
        
        let actions = [];
        let assertions = [];

        walk.ancestor(ast, {
            CallExpression(node, state, ancestors) {
                const callee = node.callee;
                
                // 1. Detect Actions and waitForTimeout
                if (callee.type === 'MemberExpression') {
                    const propName = callee.property.name;
                    
                    if (propName === 'waitForTimeout') {
                        issues.push(`Hard Fail: waitForTimeout is strictly prohibited.`);
                        if (!errors.includes('ERR_WAIT_FOR_TIMEOUT')) errors.push('ERR_WAIT_FOR_TIMEOUT');
                    }
                    
                    if (actionNames.includes(propName)) {
                        hasAction = true;
                        
                        const isAwaited = ancestors.some(a => a.type === 'AwaitExpression' || a.type === 'ReturnStatement');
                        if (!isAwaited) {
                            issues.push(`Missing 'await' before '${propName}' action.`);
                            if (!errors.includes('ERR_MISSING_AWAIT')) errors.push('ERR_MISSING_AWAIT');
                        }
                        
                        actions.push({ node, propName, start: node.start });
                    }

                    // Detect resilient locators
                    if (resilientLocators.includes(propName)) {
                        hasResilientLocator = true;
                    }
                    if (mandatoryResilient.includes(propName)) {
                        hasMandatoryResilient = true;
                    }
                }
                
                // 2. Detect Assertions (expect)
                if (callee.type === 'MemberExpression') {
                    const object = callee.object;
                    if (object && object.type === 'CallExpression' && object.callee.name === 'expect') {
                        hasExpect = true;
                        const matcher = callee.property.name;
                        
                        // Extract locator from expect() call
                        const expectArgs = object.arguments;
                        let targetsSuccessSignal = false;
                        
                        if (contract && contract.successSignal && expectArgs.length > 0) {
                            const arg = expectArgs[0];
                            // Simple check: if the arg is a CallExpression, check its arguments
                            if (arg.type === 'CallExpression' && arg.arguments.length > 0) {
                                const selectorArg = arg.arguments[0];
                                if (selectorArg.type === 'Literal' && selectorArg.value === contract.successSignal.selector) {
                                    targetsSuccessSignal = true;
                                    hasSuccessfulAssertion = true;
                                }
                            }
                        }
                        
                        assertions.push({ node, matcher, start: node.start, targetsSuccessSignal });
                        
                        if (!allowedMatchers.includes(matcher)) {
                            issues.push(`Assertion '${matcher}' is not allowed. Use UI-specific matchers like toBeVisible().`);
                            if (!errors.includes('ERR_GENERIC_ASSERTION')) errors.push('ERR_GENERIC_ASSERTION');
                        }
                    }
                }
                
                // 3. Detect Locators for Brittle CSS
                if (callee.type === 'MemberExpression' && callee.property.name === 'locator') {
                    const args = node.arguments;
                    if (args.length > 0 && args[0].type === 'Literal') {
                        const selector = args[0].value;
                        if (typeof selector === 'string') {
                            if (selector.includes('nth-child') || selector.split(' ').length > 4 || selector.split('>').length > 3) {
                                issues.push(`Brittle CSS Selector detected: '${selector}'`);
                                if (!errors.includes('ERR_BRITTLE_CSS')) errors.push('ERR_BRITTLE_CSS');
                            }
                        }
                    }
                }
            }
        });

        // 4. Action -> Assertion Linkage (Control Flow)
        if (actions.length > 0 && assertions.length > 0) {
            const lastAction = actions[actions.length - 1];
            const assertionsAfterAction = assertions.filter(a => a.start > lastAction.start);
            
            if (assertionsAfterAction.length === 0) {
                issues.push("Action must be followed by a validating assertion.");
                if (!errors.includes('ERR_NO_ASSERTION_AFTER_ACTION')) errors.push('ERR_NO_ASSERTION_AFTER_ACTION');
            }
        }

        // Action Sequence Validation (Multi-step flow)
        if (contract && contract.requiredSequence && contract.requiredSequence.length > 0) {
            const actualSequence = actions.map(a => a.propName);
            // Check if actualSequence contains the requiredSequence in order
            let sequenceIndex = 0;
            for (const action of actualSequence) {
                if (action === contract.requiredSequence[sequenceIndex]) {
                    sequenceIndex++;
                }
                if (sequenceIndex === contract.requiredSequence.length) break;
            }

            if (sequenceIndex < contract.requiredSequence.length) {
                issues.push(`Flow Violation: Missing required action sequence [${contract.requiredSequence.join(' -> ')}].`);
                if (!errors.includes('ERR_INCOMPLETE_FLOW')) errors.push('ERR_INCOMPLETE_FLOW');
            }
        }

        if (!hasExpect) {
            issues.push("Code must include at least one 'expect' assertion.");
            if (!errors.includes('ERR_MISSING_ASSERTION')) errors.push('ERR_MISSING_ASSERTION');
        }

        if (contract && contract.successSignal && !hasSuccessfulAssertion) {
            issues.push(`Assertion Quality Violation: You are not asserting the correct outcome. Expected visibility check on '${contract.successSignal.selector}'.`);
            if (!errors.includes('ERR_POOR_ASSERTION_QUALITY')) errors.push('ERR_POOR_ASSERTION_QUALITY');
        }

        if (!hasAction) {
            issues.push("Code must include at least one Playwright action (e.g., page.click).");
            if (!errors.includes('ERR_MISSING_ACTION')) errors.push('ERR_MISSING_ACTION');
        }

        // Mandatory Resilience Check
        if (!hasMandatoryResilient) {
            issues.push("Resilience Rule: At least one locator must use getByRole() or getByTestId().");
            if (!errors.includes('ERR_MANDATORY_RESILIENCE')) errors.push('ERR_MANDATORY_RESILIENCE');
        }

        // 5. Rationale Cross-Validation
        if (rationale && rationale.fix) {
            if (rationale.fix === 'Used getByRole' && !hasMandatoryResilient) {
                issues.push(`Rationale mismatch: You claimed to use 'getByRole', but no role-based locators were found.`);
                if (!errors.includes('ERR_RATIONALE_MISMATCH_LOCATOR')) errors.push('ERR_RATIONALE_MISMATCH_LOCATOR');
            }
            
            if (rationale.fix === 'Asserted UI outcome' && !hasExpect) {
                issues.push(`Rationale mismatch: You claimed to add an assertion, but no 'expect' calls were found.`);
                if (!errors.includes('ERR_RATIONALE_MISMATCH_ASSERTION')) errors.push('ERR_RATIONALE_MISMATCH_ASSERTION');
            }
        }

        const valid = issues.length === 0 && errors.length === 0;

        return {
            valid,
            issues,
            errors
        };
    }

    /**
     * Validates Architecture (Separation of Concerns) between PO and Spec.
     * @param {string} poCode 
     * @param {string} specCode 
     * @returns {Object} { valid: boolean, issues: string[] }
     */
    /**
     * Validates Architecture (Separation of Concerns) between PO and Spec.
     * @param {string} poCode 
     * @param {string} specCode 
     * @returns {Object} { valid: boolean, issues: string[] }
     */
    validateArchitecture(poCode, specCode) {
        const issues = [];
        
        try {
            // 1. Analyze Spec File (as a Module to allow imports)
            const specAst = acorn.parse(specCode, { ecmaVersion: 2022, sourceType: "module" });
            const forbiddenInSpec = ['locator', 'getByRole', 'getByText', 'getByLabel', 'getByPlaceholder', 'getByTestId', 'getByAltText', 'getByTitle'];
            
            let usesPO = false;

            walk.simple(specAst, {
                NewExpression(node) {
                    if (node.callee.name && node.callee.name.includes('Page')) {
                        usesPO = true;
                    }
                },
                CallExpression(node) {
                    if (node.callee.type === 'MemberExpression') {
                        const propName = node.callee.property.name;
                        
                        // Check for forbidden raw Playwright calls in Spec
                        if (forbiddenInSpec.includes(propName)) {
                            issues.push(`Architecture Violation: Low-level locator '${propName}' found in Spec. Move to Page Object.`);
                        }
                        
                        const obj = node.callee.object;
                        if (obj.name === 'page' && ['click', 'fill', 'type'].includes(propName)) {
                            issues.push(`Architecture Violation: Raw page.${propName}() found in Spec. Encapsulate in PO methods.`);
                        }
                    }
                }
            });

            if (!usesPO) {
                issues.push("Architecture Violation: Spec file must instantiate a Page Object (e.g., new LoginPage(page)).");
            }

            // 2. Analyze Page Object
            const poAst = acorn.parse(poCode, { ecmaVersion: 2022, sourceType: "module" });
            let hasMethods = false;
            let hasClass = false;

            walk.simple(poAst, {
                ClassDeclaration(node) {
                    hasClass = true;
                },
                MethodDefinition(node) {
                    if (node.kind === 'method') hasMethods = true;
                }
            });

            if (!hasClass) issues.push("Architecture Violation: Page Object must be defined as a Class.");
            if (!hasMethods) issues.push("Architecture Violation: Page Object must contain reusable action methods.");

        } catch (err) {
            issues.push(`Architecture Parsing Error: ${err.message}`);
        }

        return {
            valid: issues.length === 0,
            issues
        };
    }
}

module.exports = new AstService();
