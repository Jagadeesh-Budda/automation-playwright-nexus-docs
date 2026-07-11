const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src', 'data');
const metadataPath = path.join(dataDir, 'metadata.json');
const modulesOutDir = path.join(dataDir, 'modules');
const outputPath = path.join(dataDir, 'modules.json');

console.log('Assembling modules.json from split files...');

if (!fs.existsSync(metadataPath)) {
  console.error(`Error: metadata.json not found at ${metadataPath}`);
  process.exit(1);
}

const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
const moduleCache = {};
const allLessons = [];

metadata.forEach((meta) => {
  const moduleFile = meta.moduleFile;
  if (!moduleCache[moduleFile]) {
    const filePath = path.join(modulesOutDir, `${moduleFile}.json`);
    if (fs.existsSync(filePath)) {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      moduleCache[moduleFile] = content.lessons || [];
    } else {
      console.warn(`Warning: Module file ${moduleFile}.json not found for lesson ${meta.id}`);
      moduleCache[moduleFile] = [];
    }
  }

  const lessonsList = moduleCache[moduleFile];
  const lesson = lessonsList.find((l) => l.id === meta.id);
  if (lesson) {
    allLessons.push(lesson);
  } else {
    console.error(`Error: Lesson with ID ${meta.id} not found in ${moduleFile}.json`);
  }
});

fs.writeFileSync(outputPath, JSON.stringify(allLessons, null, 2), 'utf8');
console.log(`Successfully assembled ${allLessons.length} lessons into ${outputPath}!`);
