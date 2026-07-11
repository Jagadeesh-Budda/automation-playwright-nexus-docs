# Playwright Academy Cheat Sheet: AST & Framework Engineering

Quick reference for Abstract Syntax Tree (AST) code auditing and custom linter validation quality gates.

---

## 1. AST Node Structure
AST parsers translate code strings into structured nodes:
* `CallExpression`: Represents calling a function (e.g. `page.click()`).
* `MemberExpression`: Represents property/method access (e.g. `page.waitForTimeout`).
* `Identifier`: Names of variables, arguments, or methods (e.g. `expect`).

---

## 2. Acorn Parser Custom Audit Script
Traverse code syntaxes programmatically to enforce rules and block commit violations:

```typescript
// scripts/ast-compliance.ts
import * as fs from 'fs';
import * as acorn from 'acorn';
import { walk } from 'estree-walker';

export function checkFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // 1. Compile file into AST
  const ast = acorn.parse(content, { ecmaVersion: 2020, sourceType: 'module' });
  
  // 2. Traverse tree nodes
  walk(ast, {
    enter(node: any) {
      // Rule A: Ban hardcoded page.waitForTimeout()
      if (
        node.type === 'CallExpression' &&
        node.callee.type === 'MemberExpression' &&
        node.callee.object.name === 'page' &&
        node.callee.property.name === 'waitForTimeout'
      ) {
        console.error(`❌ AST Violation: page.waitForTimeout used in ${filePath}`);
        process.exitCode = 1;
      }
    }
  });
}
```

---

## 3. Configuring lint gate task
Integrate the linter check inside git hooks or package configuration:

```json
// package.json script task
{
  "scripts": {
    "lint:ast": "tsx scripts/ast-compliance.ts"
  }
}
```

---

## 4. Key Do's and Don'ts

### Do
* Use AST validation to enforce policies (like blocking page assertions in helpers classes) that standard linters can't capture.
* Output descriptive error logs containing the target file path and line number when violations occur.
* Configure the AST checks to fail fast inside git commit prehooks.

### Don't
* Don't write regex checks (e.g. string matching `/waitForTimeout/`) for code checks; comments or safe object declarations will cause false positives.
* Don't run AST validations on dependency folders (`node_modules`).
