import { Page } from '@playwright/test';

export interface MasteryStoreState {
  completedModules: string[];
  userProgress: Record<string, number>;
  timeSpentSeconds: number;
}

export class StateHelper {
  constructor(private page: Page) {}

  /**
   * Directly sets the mastery store state in localStorage
   * bypassing the UI entirely. Useful for anti-cheat testing
   * or setting up prerequisite conditions.
   */
  async setMasteryState(state: Partial<MasteryStoreState>) {
    await this.page.evaluate((newState) => {
      const existingStr = window.localStorage.getItem('mastery-store');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let existing: any = {};
      if (existingStr) {
        try {
          existing = JSON.parse(existingStr);
        } catch (_e) {}
      }
      
      const merged = {
        state: {
          ...existing.state,
          ...newState
        },
        version: 0
      };
      
      window.localStorage.setItem('mastery-store', JSON.stringify(merged));
    }, state);
  }

  /**
   * Retrieves the current state from localStorage
   */
  async getMasteryState(): Promise<MasteryStoreState | null> {
    return await this.page.evaluate(() => {
      const str = window.localStorage.getItem('mastery-store');
      if (!str) return null;
      try {
        const parsed = JSON.parse(str);
        return parsed.state;
      } catch (_e) {
        return null;
      }
    });
  }

  /**
   * Clears only the progress-related fields while PRESERVING userId/userName
   * so the AppInitializer setup modal never appears and blocks clicks.
   * The app uses keys: asa_user_id, asa_user_name (NOT mastery-store)
   */
  async clearMasteryState() {
    await this.page.evaluate(() => {
      // Ensure the identity keys are always set before clearing progress
      if (!window.localStorage.getItem('asa_user_id')) {
        window.localStorage.setItem('asa_user_id', 'test-user-playwright');
        window.localStorage.setItem('asa_user_name', 'Playwright Test');
      }
      // Remove progress-only key (Zustand persisted store)
      window.localStorage.removeItem('mastery-store');
    });
  }

  /**
   * Registers an init script that injects the user profile into localStorage
   * BEFORE React loads on any page navigation.
   * Call this once per test context (e.g., in fixture setup).
   */
  async registerUserProfileInitScript() {
    // addInitScript runs before any page scripts - guaranteed to run before React/Zustand
    await this.page.addInitScript(() => {
      if (!window.localStorage.getItem('asa_user_id')) {
        window.localStorage.setItem('asa_user_id', 'test-user-playwright');
        window.localStorage.setItem('asa_user_name', 'Playwright Test');
      }
    });
  }

  /**
   * @deprecated Use registerUserProfileInitScript() instead.
   * Sets user profile after page load — does NOT work reliably because
   * React/Zustand may already have initialized with empty state.
   */
  async ensureUserProfile() {
    await this.page.evaluate(() => {
      window.localStorage.setItem('asa_user_id', 'test-user-playwright');
      window.localStorage.setItem('asa_user_name', 'Playwright Test');
    });
  }
}
