const fs = require('fs');
const file = 'd:/UIAutomation/ui-automation/docs/lms-frontend/src/app/page.tsx';
let data = fs.readFileSync(file, 'utf8');
data = data.replace(/fill="url\(#([a-zA-Z0-9]+)-\$\{idSuffix\}\)"/g, 'fill={`url(#$1-${idSuffix})`}');
data = data.replace(/stroke="url\(#([a-zA-Z0-9]+)-\$\{idSuffix\}\)"/g, 'stroke={`url(#$1-${idSuffix})`}');
fs.writeFileSync(file, data);
console.log("Done");
