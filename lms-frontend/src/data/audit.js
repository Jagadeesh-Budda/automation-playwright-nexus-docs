const fs = require('fs');
const data = JSON.parse(fs.readFileSync('d:/UIAutomation/ui-automation/docs/lms-frontend/src/data/modules.json', 'utf8'));

let total = 0;
let missingPaths = 0;
let missingCategory = 0;
let missingOptional = 0;
let missingIndustryTags = 0;

const categories = {
  'core': 0,
  'enterprise': 0,
  'industry-specific': 0,
  'project': 0,
  'sandbox': 0,
  'reference': 0
};
const invalidCategories = [];

const paths = {
  'foundations': 0,
  'enterprise': 0,
  'regulated': 0
};
const invalidPaths = new Set();

const reviewItems = [];

const modules = Array.isArray(data) ? data : (data.modules || Object.values(data));

modules.forEach(m => {
  total++;
  
  if (!m.hasOwnProperty('learningPaths') || !Array.isArray(m.learningPaths)) {
    missingPaths++;
  } else {
    // Unique paths per module
    const uniquePaths = [...new Set(m.learningPaths)];
    uniquePaths.forEach(p => {
      if (paths[p] !== undefined) paths[p]++;
      else invalidPaths.add(p);
    });
  }
  
  if (!m.hasOwnProperty('category')) missingCategory++;
  else {
    if (categories[m.category] !== undefined) categories[m.category]++;
    else invalidCategories.push({id: m.id, cat: m.category});
  }
  
  if (!m.hasOwnProperty('optional')) missingOptional++;
  if (!m.hasOwnProperty('industryTags')) missingIndustryTags++;
  
  if (['industry-specific', 'project', 'sandbox', 'reference'].includes(m.category)) {
     reviewItems.push({id: m.id, title: m.title, category: m.category, paths: m.learningPaths});
  }
});

console.log("=== METADATA COVERAGE ===");
console.log(`Total: ${total}`);
console.log(`Missing Paths: ${missingPaths}`);
console.log(`Missing Category: ${missingCategory}`);
console.log(`Missing Optional: ${missingOptional}`);
console.log(`Missing Industry Tags: ${missingIndustryTags}`);

console.log("\n=== CATEGORY VALIDATION ===");
console.table(categories);
if (invalidCategories.length > 0) console.log("Invalid Categories:", invalidCategories.slice(0, 10));

console.log("\n=== PATH VALIDATION ===");
console.table(paths);
if (invalidPaths.size > 0) console.log("Invalid Paths:", Array.from(invalidPaths));

console.log("\n=== CLASSIFICATION REVIEW ===");
reviewItems.slice(0, 50).forEach(i => {
  console.log(`${i.id} | ${i.title} | ${i.category} | ${JSON.stringify(i.paths)}`);
});
