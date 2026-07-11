# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: exhaustive.spec.ts >> Exhaustive Curriculum Check >> Module Page Loads: 0.2: Functions & Scope
- Location: tests\exhaustive.spec.ts:13:9

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/courses/playwright/02-js-ts-functions", waiting until "load"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - alert [ref=e2]
  - generic [ref=e4]:
    - generic [ref=e5]:
      - img [ref=e7]
      - heading "Playwright Mastery Setup" [level=3] [ref=e10]
      - paragraph [ref=e11]: Create your local profile to track code challenges and claim verified credentials.
    - generic [ref=e12]:
      - generic [ref=e13]:
        - generic [ref=e14]: Your Full Name
        - textbox "e.g. Jane Doe" [ref=e15]
      - button "Initialize Profile" [disabled] [ref=e16] [cursor=pointer]:
        - img [ref=e17]
        - text: Initialize Profile
      - button "Restore from Sync Code or User ID" [ref=e21] [cursor=pointer]
  - complementary [ref=e22]:
    - link "Aegis Automation" [ref=e24] [cursor=pointer]:
      - /url: /
      - img [ref=e27]
      - generic:
        - generic: Aegis
        - generic: Automation
    - link "Dashboard" [ref=e33] [cursor=pointer]:
      - /url: /
      - img [ref=e34]
      - generic: Dashboard
    - generic [ref=e40]:
      - generic [ref=e41]:
        - generic [ref=e43]: 🌱
        - generic:
          - heading "Novice" [level=3]
          - generic [ref=e46]: Completed
      - generic [ref=e47]:
        - generic [ref=e49]: 🚀
        - generic:
          - heading "Advanced Beginner" [level=3]
          - generic [ref=e52]: Completed
      - generic [ref=e53]:
        - generic [ref=e55]: 🏗
        - generic:
          - heading "Competent" [level=3]
          - generic [ref=e58]: Completed
      - generic [ref=e59]:
        - generic [ref=e61]: ⚙️
        - generic:
          - heading "Proficient" [level=3]
          - generic [ref=e64]: Completed
      - generic [ref=e65]:
        - generic [ref=e67]: 🧠
        - generic:
          - heading "Expert" [level=3]
          - generic:
            - generic [ref=e69]: Current Stage
            - generic: 0 / 44 Lessons
    - generic [ref=e71]:
      - generic [ref=e72]:
        - generic [ref=e73]:
          - generic [ref=e74]: Current Rank
          - generic [ref=e75]: Junior Specialist
        - generic [ref=e76]:
          - img [ref=e77]
          - generic [ref=e79]: "1"
      - generic [ref=e81]:
        - generic [ref=e82]: 20 XP
        - generic [ref=e83]: 0% Total
      - generic [ref=e85]:
        - img [ref=e86]
        - generic [ref=e90]: "Goal: Automation Engineer"
  - generic [ref=e91]:
    - banner [ref=e92]:
      - generic [ref=e95]:
        - img
        - textbox "Search all 122 lessons… Ctrl+K" [ref=e96]:
          - /placeholder: Search all 122 lessons…  Ctrl+K
      - generic [ref=e97]:
        - button [ref=e99] [cursor=pointer]:
          - img [ref=e100]
        - button "Read Article Aloud" [ref=e103] [cursor=pointer]:
          - img [ref=e104]
        - button [ref=e108] [cursor=pointer]:
          - img [ref=e109]
    - generic [ref=e111]:
      - generic [ref=e112]: Home > Playwright Guide
      - article [ref=e113]:
        - paragraph [ref=e116]: Decrypting progress ledger...
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import * as fs from 'fs';
  3  | import * as path from 'path';
  4  | 
  5  | // Load modules data
  6  | const modulesPath = path.resolve(__dirname, '../src/data/modules.json');
  7  | const modulesData = JSON.parse(fs.readFileSync(modulesPath, 'utf8'));
  8  | 
  9  | test.describe('Exhaustive Curriculum Check', () => {
  10 |   for (const module of modulesData) {
  11 |     const slug = module.slug || module.id;
  12 |     
  13 |     test(`Module Page Loads: ${module.title}`, async ({ page }) => {
  14 |       // Go to the specific module's URL
> 15 |       await page.goto(`http://localhost:3000/courses/playwright/${slug}`);
     |                  ^ Error: page.goto: Test timeout of 30000ms exceeded.
  16 | 
  17 |       // Ensure the page actually loads content (an H1 should exist)
  18 |       // Note: If the module is locked, it will show "Module Gate Locked" instead of the module title.
  19 |       // We check for either standard chapter content or the locked gate.
  20 |       const hasHeader = await page.locator('h1').count() > 0;
  21 |       const hasLockedGate = await page.locator('h2', { hasText: 'Module Gate Locked' }).count() > 0;
  22 | 
  23 |       expect(hasHeader || hasLockedGate).toBeTruthy();
  24 | 
  25 |       // Ensure the Sidebar is still rendered on the layout
  26 |       const sidebarItems = page.locator('aside');
  27 |       expect(await sidebarItems.count()).toBeGreaterThan(0);
  28 |     });
  29 |   }
  30 | });
  31 | 
```