import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://automationnexus.online';
  
  const routes = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/resume`, lastModified: new Date() },
    { url: `${baseUrl}/elite-test-bed`, lastModified: new Date() },
  ];
  
  try {
    const coursesDir = path.join(process.cwd(), 'src/app/courses/playwright');
    
    function getSlugs(dir: string): string[] {
      let slugs: string[] = [];
      const list = fs.readdirSync(dir);
      list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          if (file.startsWith('(') && file.endsWith(')')) {
            slugs = slugs.concat(getSlugs(fullPath));
          } else {
            if (fs.existsSync(path.join(fullPath, 'page.mdx'))) {
              slugs.push(file);
            }
          }
        }
      });
      return slugs;
    }
    
    const slugs = getSlugs(coursesDir);
    slugs.forEach(slug => {
      routes.push({
        url: `${baseUrl}/courses/playwright/${slug}`,
        lastModified: new Date()
      });
    });
  } catch (err) {
    console.error('Sitemap generation error:', err);
  }
  
  return routes;
}
