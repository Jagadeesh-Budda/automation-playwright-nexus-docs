/**
 * generate_search_index.js
 * 
 * Reads modules.json and all 54 MDX page files to build a rich
 * search index saved to src/data/search-index.json.
 * 
 * Run: node generate_search_index.js
 */

const fs = require('fs');
const path = require('path');

const coursesPath = path.join(__dirname, 'src/app/courses/playwright');
const outputPath = path.join(__dirname, 'src/data/search-index.json');
const modulesOutDir = path.join(__dirname, 'src/data/modules');

const modules = [];
fs.readdirSync(modulesOutDir).forEach((file) => {
  if (file.endsWith('.json')) {
    const fileContent = JSON.parse(fs.readFileSync(path.join(modulesOutDir, file), 'utf-8'));
    if (fileContent.lessons) {
      modules.push(...fileContent.lessons);
    }
  }
});

// Find all directories inside route groups like (01-novice)
const stageFolders = fs.readdirSync(coursesPath).filter(f => 
  f.startsWith('(') && fs.statSync(path.join(coursesPath, f)).isDirectory()
);

const folderEntries = [];
const folderMap = {}; // module-slug -> relative path like "(01-novice)/01-js-ts-variables"

for (const stage of stageFolders) {
  const stagePath = path.join(coursesPath, stage);
  const lessons = fs.readdirSync(stagePath).filter(f => 
    fs.statSync(path.join(stagePath, f)).isDirectory()
  );
  
  for (const lesson of lessons) {
    folderEntries.push(path.join(stage, lesson));
    const slug = lesson.replace(/^\d+-/, '');
    folderMap[slug] = path.join(stage, lesson).replace(/\\/g, '/');
    folderMap[lesson] = path.join(stage, lesson).replace(/\\/g, '/');
  }
}

function extractTextFromMdx(content) {
  // Remove MDX/JSX component tags like <Quiz ... />
  let text = content.replace(/<[^>]+>/g, ' ');
  // Remove markdown code blocks
  text = text.replace(/```[\s\S]*?```/g, ' ');
  // Remove inline code
  text = text.replace(/`[^`]+`/g, ' ');
  // Remove markdown heading markers
  text = text.replace(/#{1,6}\s/g, '');
  // Remove markdown table separators
  text = text.replace(/\|[-:]+\|/g, '');
  // Remove markdown bold/italic
  text = text.replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1');
  // Remove blockquotes
  text = text.replace(/^>\s*/gm, '');
  // Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

const searchIndex = [];

for (const mod of modules) {
  const folder = folderMap[mod.id];
  let mdxContent = '';
  let pageText = '';

  if (folder) {
    const mdxPath = path.join(coursesPath, folder, 'page.mdx');
    if (fs.existsSync(mdxPath)) {
      mdxContent = fs.readFileSync(mdxPath, 'utf-8');
      pageText = extractTextFromMdx(mdxContent);
    }
  }

  // Build keyword tags from objectives + spec + quiz questions
  const keywords = [
    mod.title,
    mod.meta?.outcome || '',
    mod.meta?.type || '',
    ...(mod.objectives || []).map(o => o.title),
    ...Object.values(mod.spec || {}).flat(),
    ...(Object.values(mod.quizPool || {}).flat().map(q => q.q || '')),
  ].filter(Boolean).join(' ');

  // Determine the URL by stripping out the route group folder e.g. "(01-novice)/01-js-ts-variables" -> "01-js-ts-variables"
  let routeUrl = '#';
  if (folder) {
    const parts = folder.split('/');
    const lessonFolder = parts[parts.length - 1]; // "01-js-ts-variables"
    routeUrl = `/courses/playwright/${lessonFolder}`;
  }

  searchIndex.push({
    id: mod.id,
    title: mod.title,
    group: mod.group,
    url: routeUrl,
    type: mod.meta?.type || 'Concept',
    time: mod.meta?.time || '',
    outcome: mod.meta?.outcome || '',
    keywords,
    content: Array.from(pageText).slice(0, 2000).join(''), // Safe unicode slice
    snippet: Array.from(pageText).slice(0, 150).join(''),  // Safe unicode slice
  });
}

fs.writeFileSync(outputPath, JSON.stringify(searchIndex, null, 2));
console.log(`✅ Search index generated: ${searchIndex.length} entries → src/data/search-index.json`);
