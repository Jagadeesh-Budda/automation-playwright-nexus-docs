/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { StateHelper } from '../utils/stateHelper';

type EliteFixtures = {
  makeAxeBuilder: () => AxeBuilder;
  stateHelper: StateHelper;
};

export const test = base.extend<EliteFixtures>({
  makeAxeBuilder: async ({ page }, use) => {
    const makeAxeBuilder = () => new AxeBuilder({ page });
    await use(makeAxeBuilder);
  },
  stateHelper: async ({ page }, use) => {
    const helper = new StateHelper(page);
    // Register init script FIRST - runs before React on every navigation.
    // This sets asa_user_id/asa_user_name BEFORE Zustand initializes,
    // so the AppInitializer modal never appears and never blocks clicks.
    await helper.registerUserProfileInitScript();
    await use(helper);
  }
});

export { expect } from '@playwright/test';
