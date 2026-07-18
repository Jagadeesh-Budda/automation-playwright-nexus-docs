/**
 * revision-center.spec.ts — Phase 3 Revision Center E2E Tests
 *
 * Tests bookmark, note (multi-note), highlight, scheduler, and analytics flows.
 * Uses random asa_user_id per run for isolation (same pattern as onboarding.spec.ts).
 */
import { test, expect, Page } from '@playwright/test';

// ── Test isolation helpers ────────────────────────────────────────────────────
function randomUserId(): string {
  return `test_rc_${Math.random().toString(36).slice(2, 9)}_${Date.now()}`;
}

async function setupTestUser(page: Page, userId: string, userName = 'RC Test User') {
  await page.addInitScript(({ id, name }) => {
    window.localStorage.setItem('asa_user_id', id);
    window.localStorage.setItem('asa_user_name', name);
  }, { id: userId, name: userName });
  await page.goto('/');
}

// ── Base URL ──────────────────────────────────────────────────────────────────
const BASE = 'http://localhost:3000';

// ── Bookmark Tests ────────────────────────────────────────────────────────────
test.describe.configure({ mode: 'serial' });
test.describe('Revision Center — Bookmarks', () => {
  test('should navigate to revision center', async ({ page }) => {
    const userId = randomUserId();
    await setupTestUser(page, userId);
    await page.goto(`${BASE}/revision-center`);
    await expect(page.locator('h1').filter({ hasText: 'Revision Center' })).toBeVisible({ timeout: 10000 });
  });

  test('should show empty bookmarks initially', async ({ page }) => {
    const userId = randomUserId();
    await setupTestUser(page, userId);
    await page.goto(`${BASE}/revision-center`);
    await page.click('[id="revision-tab-bookmarks"]');
    await expect(page.locator('.revision-empty').first()).toBeVisible({ timeout: 8000 });
  });

  test('should bookmark a lesson via API and show it in center', async ({ page, request }) => {
    const userId = randomUserId();
    await setupTestUser(page, userId);

    // Bookmark a lesson via API
    const response = await request.post(`${BASE}/api/revision/bookmarks`, {
      data: { lessonId: '10-first-test' },
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
    });
    expect(response.ok()).toBeTruthy();

    await page.goto(`${BASE}/revision-center`);
    await page.click('[id="revision-tab-bookmarks"]');
    // Should show bookmark card
    await expect(page.locator('[id^="bookmark-goto-"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should remove a bookmark', async ({ page, request }) => {
    const userId = randomUserId();
    await setupTestUser(page, userId);
    const lessonId = '10-first-test';

    // Create bookmark
    await request.post(`${BASE}/api/revision/bookmarks`, {
      data: { lessonId },
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
    });

    // Delete bookmark
    const del = await request.delete(`${BASE}/api/revision/bookmarks/${encodeURIComponent(lessonId)}`, {
      headers: { 'x-user-id': userId },
    });
    const body = await del.json();
    expect(body.success).toBe(true);
  });
});

// ── Note Tests ────────────────────────────────────────────────────────────────
test.describe('Revision Center — Notes (multi-note)', () => {
  test('should create a note', async ({ request }) => {
    const userId = randomUserId();
    const response = await request.post(`${BASE}/api/revision/notes`, {
      data: { lessonId: 'locators', title: 'CSS Selectors', content: 'Always prefer `data-testid` over CSS selectors.' },
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.note.title).toBe('CSS Selectors');
    expect(body.note.lessonId).toBe('locators');
  });

  test('should create multiple notes for the same lesson', async ({ request }) => {
    const userId = randomUserId();
    const lessonId = 'locators';
    const noteTitles = ['CSS Selectors', 'Interview Question', 'Common Mistake'];

    for (const title of noteTitles) {
      const res = await request.post(`${BASE}/api/revision/notes`, {
        data: { lessonId, title, content: `Content for ${title}` },
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
      });
      expect(res.status()).toBe(201);
    }

    // Fetch all notes for this lesson
    const listRes = await request.get(`${BASE}/api/revision/notes?lessonId=${lessonId}`, {
      headers: { 'x-user-id': userId },
    });
    const listBody = await listRes.json();
    expect(listBody.notes.length).toBe(3);
  });

  test('should update a note title and content', async ({ request }) => {
    const userId = randomUserId();

    // Create
    const create = await request.post(`${BASE}/api/revision/notes`, {
      data: { lessonId: 'assertions', title: 'Original Title', content: 'Original content' },
      headers: { 'x-user-id': userId },
    });
    const { note } = await create.json();

    // Update
    const update = await request.patch(`${BASE}/api/revision/notes/${note.id}`, {
      data: { title: 'Updated Title', content: 'Updated content' },
      headers: { 'x-user-id': userId },
    });
    const body = await update.json();
    expect(body.note.title).toBe('Updated Title');
    expect(body.note.content).toBe('Updated content');
  });

  test('should delete a note', async ({ request }) => {
    const userId = randomUserId();

    const create = await request.post(`${BASE}/api/revision/notes`, {
      data: { lessonId: 'assertions', title: 'To Delete', content: 'Delete me' },
      headers: { 'x-user-id': userId },
    });
    const { note } = await create.json();

    const del = await request.delete(`${BASE}/api/revision/notes/${note.id}`, {
      headers: { 'x-user-id': userId },
    });
    const body = await del.json();
    expect(body.success).toBe(true);

    // Confirm deleted
    const list = await request.get(`${BASE}/api/revision/notes?lessonId=assertions`, {
      headers: { 'x-user-id': userId },
    });
    const listBody = await list.json();
    expect(listBody.notes.find((n: any) => n.id === note.id)).toBeUndefined();
  });

  test('note editor UI shows create note button', async ({ page }) => {
    const userId = randomUserId();
    await setupTestUser(page, userId);
    await page.goto(`${BASE}/revision-center`);
    await page.click('[id="revision-tab-notes"]');
    await expect(page.locator('[id="create-note-btn"]')).toBeVisible({ timeout: 8000 });
  });
});

// ── Highlight Tests ───────────────────────────────────────────────────────────
test.describe('Revision Center — Highlights', () => {
  test('should create a highlight with occurrenceIndex', async ({ request }) => {
    const userId = randomUserId();
    const res = await request.post(`${BASE}/api/revision/highlights`, {
      data: {
        lessonId:        'locators',
        paragraphId:     'para-3',
        anchorText:      'page.locator',
        focusText:       '.btn-submit',
        occurrenceIndex: 0,
        color:           'yellow',
      },
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.highlight.occurrenceIndex).toBe(0);
  });

  test('should list highlights for a lesson', async ({ request }) => {
    const userId = randomUserId();
    await request.post(`${BASE}/api/revision/highlights`, {
      data: { lessonId: 'locators', paragraphId: 'para-1', anchorText: 'getText', focusText: 'button', occurrenceIndex: 0, color: 'green' },
      headers: { 'x-user-id': userId },
    });

    const list = await request.get(`${BASE}/api/revision/highlights?lessonId=locators`, {
      headers: { 'x-user-id': userId },
    });
    const body = await list.json();
    expect(body.highlights.length).toBeGreaterThanOrEqual(1);
  });

  test('should delete a highlight', async ({ request }) => {
    const userId = randomUserId();
    const create = await request.post(`${BASE}/api/revision/highlights`, {
      data: { lessonId: 'assertions', paragraphId: 'para-2', anchorText: 'expect', focusText: 'toBeVisible', occurrenceIndex: 1, color: 'pink' },
      headers: { 'x-user-id': userId },
    });
    const { highlight } = await create.json();

    const del = await request.delete(`${BASE}/api/revision/highlights/${highlight.id}`, {
      headers: { 'x-user-id': userId },
    });
    const body = await del.json();
    expect(body.success).toBe(true);
  });
});

// ── Spaced Repetition Tests ───────────────────────────────────────────────────
test.describe('Revision Center — Spaced Repetition Scheduler', () => {
  test('confidence 1 (forgot) should schedule next review in 1 day', async ({ request }) => {
    const userId = randomUserId();
    const lessonId = 'intro-playwright';
    const res = await request.post(`${BASE}/api/revision/schedule/review`, {
      data: { lessonId, confidence: 1 },
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
    });
    const body = await res.json();
    expect(body.success).toBe(true);

    const nextReview = new Date(body.schedule.nextReview);
    const now        = new Date();
    const diffDays   = Math.round((nextReview.getTime() - now.getTime()) / 86_400_000);
    expect(diffDays).toBe(1);
  });

  test('confidence 5 (easy) should schedule next review in 30 days', async ({ request }) => {
    const userId = randomUserId();
    const lessonId = 'locators';
    const res = await request.post(`${BASE}/api/revision/schedule/review`, {
      data: { lessonId, confidence: 5 },
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
    });
    const body = await res.json();
    expect(body.success).toBe(true);

    const nextReview = new Date(body.schedule.nextReview);
    const now        = new Date();
    const diffDays   = Math.round((nextReview.getTime() - now.getTime()) / 86_400_000);
    expect(diffDays).toBe(30);
  });

  test('review sets lastReviewedVersion to current lesson version', async ({ request }) => {
    const userId = randomUserId();
    const lessonId = 'locators';
    const res = await request.post(`${BASE}/api/revision/schedule/review`, {
      data: { lessonId, confidence: 4 },
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
    });
    const body = await res.json();
    expect(body.schedule.lastReviewedVersion).toBe(body.schedule.lessonVersion);
  });

  test('due items endpoint returns results', async ({ request }) => {
    const userId = randomUserId();

    // Record a review with confidence 1 → due tomorrow
    await request.post(`${BASE}/api/revision/schedule/review`, {
      data: { lessonId: 'intro-playwright', confidence: 1 },
      headers: { 'x-user-id': userId },
    });

    const res = await request.get(`${BASE}/api/revision/schedule`, {
      headers: { 'x-user-id': userId },
    });
    const body = await res.json();
    expect(body.records.length).toBeGreaterThanOrEqual(1);
  });
});

// ── Analytics Tests ───────────────────────────────────────────────────────────
test.describe('Revision Center — Analytics', () => {
  test('analytics tab shows section', async ({ page }) => {
    const userId = randomUserId();
    await setupTestUser(page, userId);
    await page.goto(`${BASE}/revision-center`);
    await page.click('[id="revision-tab-analytics"]');
    // Should show empty state or analytics panel
    const panel = page.locator('.analytics-panel, .revision-empty');
    await expect(panel.first()).toBeVisible({ timeout: 10000 });
  });

  test('analytics API returns success', async ({ request }) => {
    const userId = randomUserId();
    const res = await request.get(`${BASE}/api/revision/analytics`, {
      headers: { 'x-user-id': userId },
    });
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.analytics).toBeDefined();
    expect(typeof body.analytics.retentionRate).toBe('number');
    expect(Array.isArray(body.analytics.weakTopics)).toBe(true);
  });
});

// ── UI Integration Tests ──────────────────────────────────────────────────────
test.describe('Revision Center — UI Integration', () => {
  test('all 5 tabs are clickable', async ({ page }) => {
    const userId = randomUserId();
    await setupTestUser(page, userId);
    await page.goto(`${BASE}/revision-center`);

    const tabs = ['today', 'bookmarks', 'notes', 'analytics', 'calendar'];
    for (const tab of tabs) {
      await page.click(`[id="revision-tab-${tab}"]`);
      await expect(page.locator(`[id="revision-tab-${tab}"]`)).toHaveAttribute('aria-selected', 'true');
    }
  });

  test('quick note button shows text area', async ({ page }) => {
    const userId = randomUserId();
    await setupTestUser(page, userId);
    await page.goto(`${BASE}/revision-center`);
    await page.click('[id="quick-note-btn"]');
    await expect(page.locator('.revision-quick-note-input')).toBeVisible({ timeout: 5000 });
  });

  test('header revision center link navigates correctly', async ({ page }) => {
    const userId = randomUserId();
    await setupTestUser(page, userId);
    await page.goto(`${BASE}/`);
    const link = page.locator('[id="header-revision-center-link"]');
    if (await link.isVisible()) {
      await link.click();
      await expect(page).toHaveURL(/revision-center/);
    }
  });
});
