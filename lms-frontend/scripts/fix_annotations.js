const fs = require('fs');
const path = require('path');

const files = [
  "d:\\UIAutomation\\ui-automation\\docs\\lms-frontend\\src\\app\\courses\\playwright\\(05-expert)\\(05b-expert-specialization)\\112-industry-healthcare\\page.mdx",
  "d:\\UIAutomation\\ui-automation\\docs\\lms-frontend\\src\\app\\courses\\playwright\\(05-expert)\\(05b-expert-specialization)\\110-industry-banking\\page.mdx",
  "d:\\UIAutomation\\ui-automation\\docs\\lms-frontend\\src\\app\\courses\\playwright\\(05-expert)\\(05b-expert-specialization)\\107-ai-automation\\page.mdx",
  "d:\\UIAutomation\\ui-automation\\docs\\lms-frontend\\src\\app\\courses\\playwright\\(05-expert)\\(05b-expert-specialization)\\111-industry-ecommerce\\page.mdx",
  "d:\\UIAutomation\\ui-automation\\docs\\lms-frontend\\src\\app\\courses\\playwright\\(05-expert)\\(05b-expert-specialization)\\106-observability\\page.mdx",
  "d:\\UIAutomation\\ui-automation\\docs\\lms-frontend\\src\\app\\courses\\playwright\\(05-expert)\\(05b-expert-specialization)\\104-db-validation\\page.mdx",
  "d:\\UIAutomation\\ui-automation\\docs\\lms-frontend\\src\\app\\courses\\playwright\\(05-expert)\\(05b-expert-specialization)\\103-adv-auth\\page.mdx",
  "d:\\UIAutomation\\ui-automation\\docs\\lms-frontend\\src\\app\\courses\\playwright\\(05-expert)\\(05b-expert-specialization)\\102-api-mocking\\page.mdx",
  "d:\\UIAutomation\\ui-automation\\docs\\lms-frontend\\src\\app\\courses\\playwright\\(05-expert)\\(05b-expert-specialization)\\105-network-debug\\page.mdx"
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  content = content.replace(/@\{id=[^;]+;\s*text=([^}]+)\}/g, '$1');
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
