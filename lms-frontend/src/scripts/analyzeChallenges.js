const fs = require('fs');
const path = require('path');

const baseDir = 'd:/UIAutomation/ui-automation/docs/lms-frontend/src/app/courses/playwright';
const results = [];

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

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.mdx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const editors = findCodeEditors(content);
      if (editors.length > 0) {
        const primaryModuleId = path.basename(dir);
        results.push({
          file: path.relative(baseDir, fullPath).replace(/\\/g, '/'),
          moduleId: primaryModuleId,
          editorCount: editors.length,
          editors: editors.map((e, index) => {
            const attrStr = e.text.substring(12, e.text.length - 2);
            const attrs = parseAttributes(attrStr);
            return {
              index,
              moduleId: attrs.moduleId ? attrs.moduleId.value : null,
              placeholder: attrs.placeholder ? attrs.placeholder.value : null
            };
          })
        });
      }
    }
  }
}

walk(baseDir);
fs.writeFileSync('C:/Users/krama/.gemini/antigravity-ide/brain/7b64689d-db9e-4a18-a163-70137031781e/scratch/detailed_editors_audit.json', JSON.stringify(results, null, 2));
console.log('Saved detailed audit of editors!');
