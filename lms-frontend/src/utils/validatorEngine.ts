import { parse } from '@babel/parser';
// @ts-expect-error - no types available for @babel/traverse by default
import traverse from '@babel/traverse';

export interface ValidationResult {
  valid: boolean;
  issues: string[];
  message?: string;
}

export function validateCode(code: string, moduleId: string, modulesData: any[]): ValidationResult {
  if (!code) {
    return { valid: false, issues: ['No code provided.'] };
  }

  const issues: string[] = [];
  const normalizedCode = code.trim().toLowerCase();

  const targetModule = modulesData.find((m: any) => m.id === moduleId);
  const moduleType = targetModule?.meta?.type || 'Code'; // default to Code

  // ── Dynamic Rules from modules.json ──────────────────────────────────────
  let hasDynamicRules = false;
  const astRules: Array<{ type: string; value: string; required?: boolean; min?: number; count: number; title: string }> = [];
  
  if (targetModule && targetModule.tasks && targetModule.tasks.length > 0) {
    targetModule.tasks.forEach((task: any) => {
      const taskRules = task.rules || task.validationRules;
      if (taskRules && taskRules.length > 0) {
        hasDynamicRules = true;
        taskRules.forEach((rule: any) => {
          if (rule.type.startsWith('ast_')) {
            astRules.push({ ...rule, count: 0, title: task.title });
          } else if (rule.type === 'contains') {
            if (!normalizedCode.includes(rule.value.toLowerCase())) {
              issues.push(`AST Gate Failed: Code must contain '${rule.value}' (${task.title}).`);
            }
          } else if (rule.type === 'not_contains') {
            if (normalizedCode.includes(rule.value.toLowerCase())) {
              issues.push(`AST Gate Failed: Code must NOT contain '${rule.value}' (${task.title}).`);
            }
          } else if (rule.type === 'regex') {
            const re = new RegExp(rule.value, 'i');
            if (!re.test(code)) {
              issues.push(`AST Gate Failed: Code does not match required pattern (${task.title}).`);
            }
          }
        });
      }
    });
  }

  if (!hasDynamicRules) {
    issues.push("Validation Config Error: Missing validation rules for this challenge. Please contact course authors.");
  }

  // ── AST Parsing & Validation ───────────────────────────────────────────────
  const isCliModule = ['Execution', 'Debug', 'Config', 'DevOps'].includes(moduleType);
  const isJavaScriptModule = !isCliModule;
  
  if (isJavaScriptModule && hasDynamicRules) {
    try {
      const ast = parse(code, { 
        sourceType: 'module', 
        plugins: ['typescript'] 
      });
      
      traverse(ast, {
        ImportDeclaration(path: any) {
          const importSource = path.node.source.value;
          astRules.filter(r => r.type === 'ast_import' && r.value === importSource).forEach(r => r.count++);
        },
        VariableDeclaration() {
          astRules.filter(r => r.type === 'ast_node' && r.value === 'VariableDeclaration').forEach(r => r.count++);
        },
        FunctionDeclaration() {
          astRules.filter(r => r.type === 'ast_node' && r.value === 'FunctionDeclaration').forEach(r => r.count++);
        },
        ArrowFunctionExpression() {
          astRules.filter(r => r.type === 'ast_node' && r.value === 'ArrowFunctionExpression').forEach(r => r.count++);
        },
        ObjectExpression() {
          astRules.filter(r => r.type === 'ast_node' && r.value === 'ObjectExpression').forEach(r => r.count++);
        },
        ClassDeclaration() {
          astRules.filter(r => r.type === 'ast_node' && r.value === 'ClassDeclaration').forEach(r => r.count++);
        },
        AwaitExpression() {
          astRules.filter(r => r.type === 'ast_node' && r.value === 'AwaitExpression').forEach(r => r.count++);
        },
        CallExpression(path: any) {
          const callee = path.node.callee;
          let calleeName = '';
          
          if (callee.type === 'Identifier') {
             calleeName = callee.name;
          } else if (callee.type === 'MemberExpression') {
             if (callee.object.type === 'Identifier' && callee.property.type === 'Identifier') {
                 calleeName = `${callee.object.name}.${callee.property.name}`;
             }
          }
          
          astRules.filter(r => r.type === 'ast_callee' && r.value === calleeName).forEach(r => r.count++);
          astRules.filter(r => r.type === 'ast_callee_any' && (r as any).values.includes(calleeName)).forEach(r => r.count++);
          astRules.filter(r => r.type === 'ast_forbidden_callee' && r.value === calleeName).forEach(r => r.count++);
          astRules.filter(r => r.type === 'ast_count' && r.value === calleeName).forEach(r => r.count++);
        }
      });
      
      // ── Process ast_* rules ────────────────────────────────────────────────────
      astRules.forEach(rule => {
         const isRequired = rule.required !== false;
         if (rule.type === 'ast_forbidden_callee') {
            if (rule.count > 0) {
               issues.push(`AST Gate Failed: Forbidden pattern used '${rule.value}()' (${rule.title}).`);
            }
         } else {
            if (isRequired && rule.count === 0) {
               if (rule.type === 'ast_callee') {
                  issues.push(`AST Gate Failed: Missing required function call '${rule.value}()' (${rule.title}).`);
               } else if (rule.type === 'ast_callee_any') {
                  issues.push(`AST Gate Failed: Missing required function call '${(rule as any).values.join(' or ')}' (${rule.title}).`);
               } else if (rule.type === 'ast_node') {
                  issues.push(`AST Gate Failed: Missing required syntax element '${rule.value}' (${rule.title}).`);
               } else if (rule.type === 'ast_import') {
                  issues.push(`AST Gate Failed: Missing required import '${rule.value}' (${rule.title}).`);
               }
            }
            if (rule.min && rule.count < rule.min) {
               issues.push(`AST Gate Failed: '${rule.value}' must be used at least ${rule.min} times (${rule.title}).`);
            }
         }
      });
    } catch (err: any) {
      issues.push(`Syntax Error: Invalid JavaScript/TypeScript. ${err.message}`);
    }
  }

  if (issues.length > 0) {
    return { valid: false, issues };
  }

  return { valid: true, issues: [], message: 'Required Syntax Patterns Verified' };
}
