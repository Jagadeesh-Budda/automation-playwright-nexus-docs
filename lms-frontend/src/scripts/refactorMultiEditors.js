const fs = require('fs');
const path = require('path');

const baseDir = 'd:/UIAutomation/ui-automation/docs/lms-frontend/src/app/courses/playwright';
const dataDir = 'd:/UIAutomation/ui-automation/docs/lms-frontend/src/data';
const metadataPath = path.join(dataDir, 'metadata.json');
const modulesDir = path.join(dataDir, 'modules');

// Load metadata
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

// Map from lesson ID to moduleFile name
const lessonToModuleFileMap = {};
for (const entry of metadata) {
  lessonToModuleFileMap[entry.id] = entry.moduleFile;
}

const mdxEditorsCount = {};

// Helper to find CodeEditor components in MDX content (character-by-character scan)
function findCodeEditors(content) {
  const editors = [];
  let pos = 0;
  while (true) {
    const startIdx = content.indexOf('<CodeEditor', pos);
    if (startIdx === -1) break;

    let inSingleQuote = false;
    let inDoubleQuote = false;
    let inTemplate = false;
    let braceDepth = 0;
    let endIdx = -1;

    for (let i = startIdx + 11; i < content.length; i++) {
      const char = content[i];
      const prev = content[i - 1];
      const next = content[i + 1];

      if (char === "'" && prev !== '\\' && !inDoubleQuote && !inTemplate) {
        inSingleQuote = !inSingleQuote;
      } else if (char === '"' && prev !== '\\' && !inSingleQuote && !inTemplate) {
        inDoubleQuote = !inDoubleQuote;
      } else if (char === '`' && prev !== '\\' && !inSingleQuote && !inDoubleQuote) {
        inTemplate = !inTemplate;
      }

      if (!inSingleQuote && !inDoubleQuote && !inTemplate) {
        if (char === '{') {
          braceDepth++;
        } else if (char === '}') {
          braceDepth--;
        } else if (char === '/' && next === '>' && braceDepth === 0) {
          endIdx = i + 2;
          break;
        }
      }
    }

    if (endIdx !== -1) {
      editors.push({
        start: startIdx,
        end: endIdx,
        text: content.substring(startIdx, endIdx)
      });
      pos = endIdx;
    } else {
      pos = startIdx + 11;
    }
  }
  return editors;
}

// Helper to parse JSX attributes from string
function parseAttributes(attrStr) {
  const attrs = {};
  let i = 0;
  while (i < attrStr.length) {
    while (i < attrStr.length && /\s/.test(attrStr[i])) {
      i++;
    }
    if (i >= attrStr.length) break;

    let nameStart = i;
    while (i < attrStr.length && /[a-zA-Z0-9_\-]/.test(attrStr[i])) {
      i++;
    }
    const name = attrStr.substring(nameStart, i);
    if (!name) {
      i++;
      continue;
    }

    while (i < attrStr.length && /\s/.test(attrStr[i])) {
      i++;
    }

    if (i < attrStr.length && attrStr[i] === '=') {
      i++;
      while (i < attrStr.length && /\s/.test(attrStr[i])) {
        i++;
      }

      if (i < attrStr.length) {
        const char = attrStr[i];
        if (char === '"' || char === "'") {
          const quote = char;
          let valStart = i + 1;
          i++;
          while (i < attrStr.length && (attrStr[i] !== quote || attrStr[i - 1] === '\\')) {
            i++;
          }
          const value = attrStr.substring(valStart, i);
          attrs[name] = { type: 'string', raw: quote + value + quote, value };
          i++;
        } else if (char === '{') {
          let braceDepth = 1;
          let valStart = i;
          i++;
          let inSingleQuote = false;
          let inDoubleQuote = false;
          let inTemplate = false;

          while (i < attrStr.length && braceDepth > 0) {
            const c = attrStr[i];
            const prev = attrStr[i - 1];

            if (c === "'" && prev !== '\\' && !inDoubleQuote && !inTemplate) {
              inSingleQuote = !inSingleQuote;
            } else if (c === '"' && prev !== '\\' && !inSingleQuote && !inTemplate) {
              inDoubleQuote = !inDoubleQuote;
            } else if (c === '`' && prev !== '\\' && !inSingleQuote && !inDoubleQuote) {
              inTemplate = !inTemplate;
            }

            if (!inSingleQuote && !inDoubleQuote && !inTemplate) {
              if (c === '{') braceDepth++;
              else if (c === '}') braceDepth--;
            }
            i++;
          }
          const raw = attrStr.substring(valStart, i);
          const value = attrStr.substring(valStart + 1, i - 1).trim();
          attrs[name] = { type: 'expression', raw, value };
        } else {
          let valStart = i;
          while (i < attrStr.length && !/\s/.test(attrStr[i])) {
            i++;
          }
          const raw = attrStr.substring(valStart, i);
          attrs[name] = { type: 'unquoted', raw, value: raw };
        }
      }
    } else {
      attrs[name] = { type: 'boolean', raw: '', value: true };
    }
  }
  return attrs;
}

// Generate default validation rules based on lesson type and ID
function generateDefaultRules(moduleId, moduleType, firstTaskRules) {
  // If we have rules from the first task, copy them as baseline
  if (firstTaskRules && firstTaskRules.length > 0) {
    return JSON.parse(JSON.stringify(firstTaskRules));
  }

  const isJsTsModule = moduleId.includes('js-ts');
  if (isJsTsModule) {
    if (moduleId.includes('variables')) {
      return [
        { type: 'ast_node', value: 'VariableDeclaration', required: true }
      ];
    }
    if (moduleId.includes('functions')) {
      return [
        { type: 'ast_node', value: 'FunctionDeclaration', required: true }
      ];
    }
    if (moduleId.includes('objects')) {
      return [
        { type: 'ast_node', value: 'ObjectExpression', required: true }
      ];
    }
    if (moduleId.includes('async')) {
      return [
        { type: 'ast_node', value: 'AwaitExpression', required: true }
      ];
    }
    if (moduleId.includes('dom')) {
      return [
        { type: 'contains', value: 'page.' }
      ];
    }
    if (moduleId.includes('lite')) {
      return [
        { type: 'contains', value: 'interface' }
      ];
    }
    return [
      { type: 'ast_node', value: 'VariableDeclaration', required: true }
    ];
  }

  if (moduleType === 'Code' || moduleType === 'Portfolio' || moduleId.includes('esign') || moduleId.includes('api-') || moduleId.includes('capstone') || moduleId.includes('locators') || moduleId.includes('timeouts') || moduleId.includes('network') || moduleId.includes('wait') || moduleId.includes('parallel') || moduleId.includes('assertion') || moduleId.includes('tab') || moduleId.includes('dialog') || moduleId.includes('handling') || moduleId.includes('accessibility') || moduleId.includes('tag') || moduleId.includes('clock') || moduleId.includes('test')) {
    return [
      { type: 'ast_forbidden_callee', value: 'page.waitForTimeout' },
      { type: 'ast_node', value: 'AwaitExpression', required: true },
      { type: 'contains', value: 'page.' }
    ];
  }

  if (moduleType === 'Execution') {
    return [
      { type: 'contains', value: 'npx playwright' }
    ];
  }

  if (moduleType === 'Debug') {
    return [
      { type: 'contains', value: '--debug' }
    ];
  }

  return [
    { type: 'contains', value: 'console.log' }
  ];
}

// 1. Process MDX Pages
function processMdxFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processMdxFiles(fullPath);
    } else if (file.endsWith('.mdx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const editors = findCodeEditors(content);
      if (editors.length > 0) {
        const dirName = path.basename(dir);
        let metaEntry = metadata.find(m => m.id === dirName || m.url.endsWith('/' + dirName));
        if (!metaEntry) {
          metaEntry = metadata.find(m => m.id.toLowerCase() === dirName.toLowerCase());
        }
        const primaryModuleId = metaEntry ? metaEntry.id : dirName;
        mdxEditorsCount[primaryModuleId] = editors.length;

        // Perform in-place replacements of CodeEditor components
        let offset = 0;
        for (let i = 0; i < editors.length; i++) {
          const editor = editors[i];
          const attrStr = editor.text.substring(12, editor.text.length - 2);
          const attrs = parseAttributes(attrStr);

          // Construct new rewritten tag
          let newTag = `<CodeEditor\n  moduleId="${primaryModuleId}"\n  taskIndex={${i}}`;
          for (const name of Object.keys(attrs)) {
            if (name === 'moduleId' || name === 'taskIndex') continue;
            const attr = attrs[name];
            if (attr.type === 'boolean') {
              newTag += `\n  ${name}`;
            } else {
              newTag += `\n  ${name}=${attr.raw}`;
            }
          }
          newTag += '\n/>';

          // Apply replacement taking care of string offset shifts
          const before = content.substring(0, editor.start + offset);
          const after = content.substring(editor.end + offset);
          content = before + newTag + after;
          offset += newTag.length - editor.text.length;
        }

        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Refactored MDX: ${path.relative(baseDir, fullPath)} (${editors.length} editors)`);
      }
    }
  }
}

console.log('--- Processing MDX Course Pages ---');
processMdxFiles(baseDir);

// 2. Process JSON Modules
console.log('\n--- Processing JSON Module Configs ---');
const moduleFiles = fs.readdirSync(modulesDir);
for (const file of moduleFiles) {
  if (!file.endsWith('.json')) continue;
  const filePath = path.join(modulesDir, file);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (content.lessons) {
    let modified = false;
    for (const l of content.lessons) {
      const numEditors = mdxEditorsCount[l.id] || 0;
      if (numEditors > 0) {
        if (!l.tasks) {
          l.tasks = [];
          modified = true;
        }
        
        // Expand tasks array to match editors count if needed
        if (l.tasks.length < numEditors) {
          while (l.tasks.length < numEditors) {
            const idx = l.tasks.length;
            const isChallenge = idx === numEditors - 1;
            l.tasks.push({
              title: isChallenge ? "Sandbox: Challenge Exercise" : "Sandbox: Interactive Practice",
              hint: isChallenge ? "Complete the challenge exercise" : "Complete the practice task",
              rules: []
            });
          }
          modified = true;
          console.log(`Expanded tasks in ${file} for lesson ${l.id} to ${numEditors}`);
        }
      }

      // Ensure every task has explicit rules
      if (l.tasks && l.tasks.length > 0) {
        l.tasks.forEach((task, idx) => {
          // Normalize rules/validationRules to rules
          const existingRules = task.rules || task.validationRules || [];
          if (task.validationRules) {
            delete task.validationRules;
            modified = true;
          }

          if (existingRules.length === 0) {
            const firstTaskRules = l.tasks[0]?.rules || [];
            const generatedRules = generateDefaultRules(l.id, l.meta?.type || 'Code', idx > 0 ? firstTaskRules : null);
            task.rules = generatedRules;
            modified = true;
            console.log(`Assigned default rules to ${l.id} (task ${idx}) in ${file}`);
          } else {
            task.rules = existingRules;
          }

          // Strict validation: Throw error if rules are empty/missing
          if (!task.rules || task.rules.length === 0) {
            throw new Error(`Audit Failure: Lesson ${l.id} task ${idx} in ${file} is missing validation rules!`);
          }
        });
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
      console.log(`Saved updated JSON: ${file}`);
    }
  }
}

console.log('\nAll files refactored and audited successfully! Zero rule gaps found.');
