# Playwright Locators - Technical Interview Guide

This guide compiles 65 core technical interview questions, coding exercises, and evaluation criteria designed to assess candidates on Playwright locators, selector architecture, and Page Object Model engineering.

---

## Part 1: Beginner Questions (1 - 30)

### 1. What is a locator in Playwright?
* **Expected Answer**: A locator is a pointer to one or more elements on a page. It encapsulates the query logic to find elements but does not immediately perform the lookup. Lookups are executed lazily at the moment of action.
* **Common Mistakes**: Describing a locator as a static reference or cache of a DOM element (like in Selenium), which leads to stale element errors.
* **Follow-up**: What is the primary benefit of lazy evaluation?

### 2. How do you create a basic locator in Playwright?
* **Expected Answer**: You create it by calling `page.locator(selector)` or one of the semantic locator methods (e.g., `page.getByRole()`, `page.getByText()`).
* **Common Mistakes**: Believing that you must write `await page.locator(...)` during declaration. Only actions on the locator are awaited.
* **Follow-up**: Can you declare locators before the page navigates?

### 3. What is the difference between `page.locator()` and the older `page.$()`?
* **Expected Answer**: `page.locator()` returns a reusable `Locator` object that supports auto-waiting, lazy evaluation, and auto-retries. `page.$()` returns an eager `ElementHandle` that does not support auto-waiting or retrying and throws stale element exceptions if the DOM updates.
* **Common Mistakes**: Recommending `page.$()` for modern test suites.
* **Follow-up**: When is the only time you should use `ElementHandle`? (Answer: Never, it is deprecated/discouraged for tests).

### 4. What is the "Locator Priority Ladder" in Playwright?
* **Expected Answer**: It is the recommended sequence of locator methods, prioritizing user-facing accessibility semantics first, and falling back to test ids and raw CSS/XPath only when necessary:
  1. `getByRole()` (accessibility/role)
  2. `getByLabel()` (form labels)
  3. `getByPlaceholder()` (placeholders)
  4. `getByText()` (static text)
  5. `getByTestId()` (escape hatch)
  6. `page.locator()` (CSS/XPath)
* **Common Mistakes**: Recommending CSS class names or XPath as a first choice.
* **Follow-up**: Why is role preferred over text?

### 5. Why should you avoid raw CSS selectors like `page.locator('.submit-btn')`?
* **Expected Answer**: CSS class names are implementation details. They change frequently during styling refactors, making tests fragile. Semantic selectors (like roles and labels) mirror user interaction and are highly resilient to structural code changes.
* **Common Mistakes**: Stating CSS is bad because it is slow (modern engines make it fast, the issue is structural fragility).
* **Follow-up**: What happens to a CSS-based test if the application is migrated from Bootstrap to Tailwind?

### 6. How do you click an element using a locator?
* **Expected Answer**: `await locator.click();`. Playwright automatically waits for the element to meet all actionability checks before clicking.
* **Common Mistakes**: Adding manual delays (`page.waitForTimeout`) or checking visibility manually before calling `.click()`.
* **Follow-up**: What is the default timeout for a click action?

### 7. How do you type text into an input field in Playwright?
* **Expected Answer**: `await locator.fill('text');`. The `.fill()` method clears the input first and then inputs the text. For keypress-by-keypress typing, you use `.pressSequentially('text')`.
* **Common Mistakes**: Using `.type()` (which is deprecated in newer versions).
* **Follow-up**: What is the difference between `.fill()` and `.pressSequentially()`?

### 8. How do you clear an input field?
* **Expected Answer**: `await locator.clear();` or `await locator.fill('');`.
* **Common Mistakes**: Simulating multiple backspace keypress events manually.
* **Follow-up**: Does `.fill('new text')` require a prior `.clear()` call? (Answer: No, `.fill()` handles it).

### 9. What is `getByRole` and why is it preferred?
* **Expected Answer**: `getByRole` queries the accessibility tree (ARIA roles) of the application. It ensures elements are correctly structured for screen readers and represents the most robust way to find buttons, links, headings, etc.
* **Common Mistakes**: Believing `getByRole` queries HTML tag names directly. It queries ARIA roles (e.g. `<div role="button">` matches `'button'`).
* **Follow-up**: What are the two most common options passed to `getByRole`? (Answer: `name` and `exact`).

### 10. How do you select a button labeled "Submit" using `getByRole`?
* **Expected Answer**: `page.getByRole('button', { name: 'Submit' })` or `/submit/i` for case-insensitive matching.
* **Common Mistakes**: Omitting the name constraint or typing `getByRole('Submit')`.
* **Follow-up**: Is the `name` option an exact or partial match by default?

### 11. How do you select a checkbox using `getByRole`?
* **Expected Answer**: `page.getByRole('checkbox', { name: 'Accept Terms' })`. You can check state constraints using options like `{ checked: true }`.
* **Common Mistakes**: Targeting the checkbox via CSS tag name `input[type="checkbox"]` without checking its accessibility label.
* **Follow-up**: How do you assert it is checked?

### 12. What does `getByLabel` do? When is it used?
* **Expected Answer**: It locates form inputs based on the text of the `<label>` connected to them via the `for` attribute or nested structure.
* **Common Mistakes**: Believing it queries the `aria-label` attribute directly (it queries associated label elements, though it falls back to aria-label).
* **Follow-up**: If a label has text "Email Address", how do you target the input?

### 13. What is the purpose of `getByPlaceholder`?
* **Expected Answer**: To locate form fields by matching their HTML placeholder text (e.g. `placeholder="Search..."`).
* **Common Mistakes**: Using it as a primary selector when a proper label is available.
* **Follow-up**: What is the accessibility drawback of placeholder text?

### 14. What does `getByText` do?
* **Expected Answer**: Locates text nodes in the document. It is useful for checking static content, confirmation banners, and paragraphs.
* **Common Mistakes**: Relying on it for interactive elements like buttons, which should use `getByRole`.
* **Follow-up**: Is `getByText` case-sensitive by default?

### 15. What does `getByTestId` do?
* **Expected Answer**: It selects elements by their unique testing identifier (e.g., `data-testid`). It serves as an escape hatch when accessibility roles or text matches are unsuitable.
* **Common Mistakes**: Overusing it for standard links/buttons that already have unique accessible names.
* **Follow-up**: Where is the default test ID attribute configured?

### 16. How do you change the test ID attribute name from `data-testid` to something else?
* **Expected Answer**: In `playwright.config.ts`, set the `use.testIdAttribute` property (e.g. `'data-qa'`).
* **Common Mistakes**: Writing a helper wrapper method to resolve custom attributes manually.
* **Follow-up**: Can you configure this dynamically in the test code?

### 17. Does defining a locator immediately execute a query in the DOM? Explain.
* **Expected Answer**: No. Locators are lazy. Defining `const cta = page.getByRole('button')` is just a description of *how* to find the button. No query is made until an action like `await cta.click()` is invoked.
* **Common Mistakes**: Believing locator declarations can throw "element not found" errors.
* **Follow-up**: How does lazy evaluation prevent stale element exceptions?

### 18. What is auto-waiting in Playwright?
* **Expected Answer**: Playwright automatically checks the target element's actionability status before executing an action. If the element isn't ready, Playwright waits up to the configured timeout limit.
* **Common Mistakes**: Thinking auto-waiting applies to every locator call; it only applies to actions (e.g., click, fill, hover).
* **Follow-up**: How long is the default timeout? (Answer: 30 seconds, unless changed).

### 19. Name three actionability checks that Playwright performs automatically.
* **Expected Answer**: Candidates can name any three of:
  1. Attached to DOM
  2. Visible on screen
  3. Stable (not animating)
  4. Enabled (not disabled)
  5. Editable (for fill/type actions)
  6. Receives pointer events (not blocked by overlay)
* **Common Mistakes**: Listing "page loaded" (that is page navigation, not element actionability).
* **Follow-up**: How does Playwright check if an element is stable?

### 20. What happens if an element is hidden when you try to click it?
* **Expected Answer**: Playwright's auto-wait mechanism will pause and wait for the element to become visible. If it doesn't become visible within the timeout limit, the action throws a timeout exception.
* **Common Mistakes**: Believing it immediately throws a "NoSuchElement" exception.
* **Follow-up**: How can you force a click on a hidden element? (Answer: Passing `{ force: true }`).

### 21. How do you assert that an element is visible on the page?
* **Expected Answer**: `await expect(locator).toBeVisible();`.
* **Common Mistakes**: Writing `expect(await locator.isVisible()).toBe(true);` which does not auto-retry and leads to race conditions.
* **Follow-up**: Why is the locator assertion preferred over boolean checks?

### 22. What is the difference between static waits and auto-waiting assertions?
* **Expected Answer**: Static waits (`page.waitForTimeout(5000)`) halt execution for a fixed duration regardless of state, wasting time. Auto-waiting assertions poll the DOM dynamically and resolve as soon as the condition is met, maximizing test speed.
* **Common Mistakes**: Defending static waits as a quick fix for flakiness.
* **Follow-up**: How often does Playwright poll during an assertion? (Answer: Every 5ms - 100ms).

### 23. How do you check if a checkbox is checked?
* **Expected Answer**: `await expect(locator).toBeChecked();`.
* **Common Mistakes**: Checking `await locator.isChecked()` in a standard assert.
* **Follow-up**: How do you assert that it is unchecked?

### 24. How do you verify the text content of an element?
* **Expected Answer**: `await expect(locator).toHaveText('Expected Text');` or `.toContainText('substring');`.
* **Common Mistakes**: Using `.textContent()` in a basic assertion.
* **Follow-up**: How do you ignore whitespace differences? (Answer: Use regex or check with `toContainText`).

### 25. How do you verify that a button is disabled?
* **Expected Answer**: `await expect(locator).toBeDisabled();`.
* **Common Mistakes**: Checking for the `disabled` HTML attribute manually.
* **Follow-up**: How do you verify the opposite state? (`.toBeEnabled()`).

### 26. What is the difference between `toBeVisible()` and `toBeAttached()`?
* **Expected Answer**: `toBeAttached()` verifies the element exists in the DOM. `toBeVisible()` verifies it is in the DOM *and* has a non-empty bounding box, is not display:none, and is not hidden.
* **Common Mistakes**: Assuming an element attached to the DOM is always visible to the user.
* **Follow-up**: In what scenarios would you assert attachment rather than visibility?

### 27. How do you count the number of matching elements?
* **Expected Answer**: `await locator.count();`.
* **Common Mistakes**: Attempting to resolve counts using `locator.all().length` without awaiting properly.
* **Follow-up**: What is the assertion equivalent to check counts? (`await expect(locator).toHaveCount(n)`).

### 28. How do you get the value of an attribute of an element?
* **Expected Answer**: `await locator.getAttribute('attribute-name');`.
* **Common Mistakes**: Believing attribute checks are auto-waiting assertions.
* **Follow-up**: What is the assertion for attributes? (`await expect(locator).toHaveAttribute('name', 'val')`).

### 29. How do you retrieve the input value of a text box?
* **Expected Answer**: `await locator.inputValue();`.
* **Common Mistakes**: Using `.textContent()` or `.innerText()` on an `<input>` element (which return empty string).
* **Follow-up**: What assertion checks input values? (`await expect(locator).toHaveValue('expected')`).

### 30. How do you select an option from a dropdown?
* **Expected Answer**: `await locator.selectOption('value-or-label');`.
* **Common Mistakes**: Attempting to click the dropdown, wait, and click the option manually when a native select element exists.
* **Follow-up**: How do you clear a selected option? (`await locator.selectOption([])`).

---

## Part 2: Intermediate Questions (31 - 50)

### 31. What is a Strict Mode violation in Playwright?
* **Expected Answer**: An exception thrown by Playwright when you invoke an action (like `.click()`) on a locator that matches more than one element in the DOM.
* **Common Mistakes**: Thinking strict mode affects element queries (it only throws on action execution).
* **Follow-up**: Does it affect assertions like `expect(locator).toHaveCount(2)`? (Answer: No, assertions target multi-element lists safely).

### 32. Why does strict mode fail the test instead of clicking the first element?
* **Expected Answer**: Implicitly clicking the first matching element masks bugs. If the layout changes or elements shift, the test might click the wrong element silently, leading to false positives or confusing failures.
* **Common Mistakes**: Describing it as a limitation of the engine.
* **Follow-up**: How did Selenium handle this? (Answer: Clicked the first match silently).

### 33. How do you handle a strict mode violation?
* **Expected Answer**: Refine the locator to be unique. This can be done by chaining (e.g. scoping to a container), using `.filter()`, or specifying accessibility attributes like the `name` parameter in `getByRole()`.
* **Common Mistakes**: Instantly appending `.first()` or `.nth(0)` to silence the error.
* **Follow-up**: Why is `.first()` dangerous in production test suites?

### 34. Explain the difference between partial and exact matching in `getByText`.
* **Expected Answer**: Partial matching (default) matches substring occurrences case-insensitively. Exact matching (`{ exact: true }`) requires a full string match, including case and punctuation.
* **Common Mistakes**: Assuming `{ exact: true }` ignores leading/trailing whitespace.
* **Follow-up**: How does `getByRole` name matching behave? (Answer: It is a partial substring match by default).

### 35. How do you use a regular expression with `getByText`?
* **Expected Answer**: Pass a RegExp object directly as the search query: `page.getByText(/shipped/i)`.
* **Common Mistakes**: Passing the regex inside quotes: `page.getByText('/shipped/i')`.
* **Follow-up**: How do you match a number dynamically in text?

### 36. What is locator chaining? Provide an example.
* **Expected Answer**: Appending locators to narrow the lookup scope. Example:
  ```typescript
  const sidebar = page.locator('#sidebar');
  const logoutButton = sidebar.getByRole('button', { name: 'Logout' });
  await logoutButton.click();
  ```
* **Common Mistakes**: Forgetting that chaining preserves lazy evaluation.
* **Follow-up**: How many DOM queries are made in the example above? (Answer: One combined query at the moment of click).

### 37. How does chaining help avoid strict mode violations?
* **Expected Answer**: It localizes the query context. If there are multiple "Edit" buttons on a page, chaining `page.locator('#row-2').getByRole('button', { name: 'Edit' })` ensures only the button inside `#row-2` is evaluated.
* **Common Mistakes**: Believing chaining is slower than a single complex XPath.
* **Follow-up**: Can you chain filters?

### 38. What is the `.filter()` method on a locator?
* **Expected Answer**: A locator method that refines a list of matching elements based on criteria like text content (`hasText`), descendants (`has`), or exclusions (`hasNot`), returning a new locator.
* **Common Mistakes**: Thinking `.filter()` performs a DOM lookup and returns an array of elements.
* **Follow-up**: How does `.filter()` differ from standard CSS child selectors?

### 39. How do you filter a locator by text contents using `.filter({ hasText: '...' })`?
* **Expected Answer**:
  ```typescript
  const rows = page.getByRole('row');
  const targetRow = rows.filter({ hasText: 'DOC-2024-001' });
  ```
* **Common Mistakes**: Writing `.filter('DOC-2024-001')` without the options object configuration wrapper.
* **Follow-up**: Can you pass a regular expression to `hasText`? (Answer: Yes).

### 40. How do you filter a locator by regular expression using `.filter()`?
* **Expected Answer**: Pass the regex to `hasText`: `locator.filter({ hasText: /pending/i })`.
* **Common Mistakes**: Using a separate string match loop.
* **Follow-up**: Does `hasText` match partial or exact strings by default?

### 41. What is the difference between chaining `parent.locator(child)` and using a CSS descendant selector like `parent child`?
* **Expected Answer**: Functionally they resolve similarly, but chaining allows you to mix locator types (like combining raw selectors with accessibility-driven `getByRole` calls): `page.locator('table').getByRole('button')`. CSS selectors require strings.
* **Common Mistakes**: Confusing chaining syntax.
* **Follow-up**: Which approach is cleaner when refactoring code to POM structure?

### 42. How does Playwright handle elements inside `<iframe>` tags?
* **Expected Answer**: Playwright requires switching context using `FrameLocator`. You cannot target elements inside an iframe directly from the main `page` context.
* **Common Mistakes**: Querying iframe elements directly using `page.locator()`.
* **Follow-up**: How do frames affect auto-waiting?

### 43. What is `frameLocator` and how is it used?
* **Expected Answer**: `frameLocator` scopes search queries inside an iframe element. Example:
  ```typescript
  const iframe = page.frameLocator('#payment-frame');
  await iframe.getByLabel('Card Number').fill('4111...');
  ```
* **Common Mistakes**: Forgetting to await actions inside the frame, or attempting to write `await page.frameLocator(...)`.
* **Follow-up**: Can you chain frame locators? (Answer: Yes, for nested iframes).

### 44. How do you target the first matching element of a locator query?
* **Expected Answer**: `locator.first();`.
* **Common Mistakes**: Accessing element index elements via array indexing like `locator[0]`.
* **Follow-up**: What is the locator index equivalent? (`locator.nth(0)`).

### 45. How do you target the 3rd element matching a locator query?
* **Expected Answer**: `locator.nth(2);` (since indexing is 0-based).
* **Common Mistakes**: Writing `locator.nth(3)`.
* **Follow-up**: What exception is thrown if the index does not exist when executing an action?

### 46. Why is using `.first()`, `.last()`, or `.nth()` discouraged for dynamic lists?
* **Expected Answer**: Positional indexing is fragile. If the list updates, sorts, or shifts due to backend updates, index-based targets will select the wrong element. Content-based matching (e.g., using `.filter({ hasText: '...' })`) is far more resilient.
* **Common Mistakes**: Relying on `.first()` in testing lists to speed up test execution.
* **Follow-up**: How would you safely select the first element in a static list?

### 47. How do you handle native browser dialogs (like alerts or prompts) in Playwright?
* **Expected Answer**: Register a listener prior to the action triggering the dialog:
  ```typescript
  page.on('dialog', async dialog => {
    await dialog.accept();
  });
  ```
* **Common Mistakes**: Expecting Playwright to auto-wait for dialogs or trying to locate the dialog using `page.getByRole('dialog')` (which only matches HTML dialog components, not native dialogs).
* **Follow-up**: What is the default browser behavior if no dialog listener is registered? (Answer: Playwright dismisses dialogs automatically).

### 48. What is the difference between locator-based actions and page-based actions?
* **Expected Answer**: Page-based actions (e.g. `page.click('css')`) are deprecated/legacy interfaces. They perform a single search on execution and do not return reusable query definitions. Locator-based actions (e.g. `page.locator('css').click()`) are the modern standard, offering reusability and native retries.
* **Common Mistakes**: Using page-based click/fill methods in new tests.
* **Follow-up**: Why did Playwright deprecate page-based selectors?

### 49. How do you capture a screenshot of a specific element using its locator?
* **Expected Answer**: `await locator.screenshot({ path: 'element.png' });`. Playwright handles scrolling the element into view first.
* **Common Mistakes**: Taking a full page screenshot and attempting to crop it manually.
* **Follow-up**: Can you mask specific child locators during a screenshot? (Answer: Yes, using the `mask` option).

### 50. What is `page.pause()` and how does it assist in debugging locators?
* **Expected Answer**: `page.pause()` pauses execution and launches the Playwright Inspector. It provides a "Record" interface and a console to test locator syntax interactively in real-time.
* **Common Mistakes**: Forgetting to run the test in headed mode, which is required for `page.pause()`.
* **Follow-up**: What CLI command starts execution in debug mode? (Answer: `npx playwright test --debug`).

---

## Part 3: Advanced Questions (51 - 60)

### 51. How do you filter a parent element based on whether it contains a specific child element?
* **Expected Answer**: Use `.filter({ has: locator })`. Example:
  ```typescript
  const rows = page.getByRole('row');
  const rowWithCheckbox = rows.filter({
    has: page.getByRole('checkbox', { checked: true })
  });
  ```
* **Common Mistakes**: Searching children first and trying to traverse backward in the DOM using XPath (`/..`).
* **Follow-up**: Explain the performance advantage of `.filter({ has: ... })` over backward XPath queries.

### 52. How do you filter elements to *exclude* those containing a specific child using `hasNot`?
* **Expected Answer**: Use `.filter({ hasNot: locator })`. Example:
  ```typescript
  const finishedCards = cardList.filter({
    hasNot: page.getByRole('status', { name: 'In Progress' })
  });
  ```
* **Common Mistakes**: Writing complex CSS negation chains (`:not()`).
* **Follow-up**: Can you chain `hasText` with `hasNot`?

### 53. How do you chain multiple `.filter()` calls to locate a specific row in a data table?
* **Expected Answer**:
  ```typescript
  const row = page.getByRole('row')
    .filter({ hasText: 'DOC-2024-001' })
    .filter({ has: page.getByRole('status', { name: 'Approved' }) });
  ```
* **Common Mistakes**: Believing multiple filters resolve immediately (they resolve as a single query when actioned).
* **Follow-up**: What is the behavior if no rows match the combined filters?

### 54. Coding Challenge: Write a selector to locate a table row containing a document ID "DOC-99" and click the "Approve" button inside that row.
* **Expected Answer**:
  ```typescript
  const targetRow = page.getByRole('row').filter({ hasText: 'DOC-99' });
  await targetRow.getByRole('button', { name: 'Approve' }).click();
  ```
* **Common Mistakes**: Utilizing a loop to iterate through rows checking indices.
* **Follow-up**: What happens if "DOC-99" appears in multiple rows?

### 55. Coding Challenge: How do you automate pagination to locate a record that may appear on a later page?
* **Expected Answer**:
  ```typescript
  let found = false;
  while (!found) {
    const row = page.getByRole('row').filter({ hasText: 'TARGET-ID' });
    if (await row.isVisible()) {
      found = true;
      await row.getByRole('button', { name: 'View' }).click();
    } else {
      const nextBtn = page.getByRole('button', { name: 'Next' });
      if (await nextBtn.isDisabled()) {
        throw new Error('Record not found on any page');
      }
      await nextBtn.click();
      await expect(page.getByRole('progressbar')).toBeHidden(); // Wait for reload
    }
  }
  ```
* **Common Mistakes**: Omitting the loading screen wait condition, leading to race conditions on the next loop iteration.
* **Follow-up**: Why must you wait for the progress bar to be hidden after clicking next?

### 56. Coding Challenge: How do you scrape all values from a specific column in a dynamic table?
* **Expected Answer**:
  ```typescript
  const dataRows = page.getByRole('row').filter({ hasText: /DOC-\d+/ });
  const count = await dataRows.count();
  const values: string[] = [];

  for (let i = 0; i < count; i++) {
    const cellValue = await dataRows.nth(i).getByRole('cell').first().textContent();
    if (cellValue) values.push(cellValue.trim());
  }
  ```
* **Common Mistakes**: Resolving counts or values inside `map()` or `forEach()` arrays on pending locators directly.
* **Follow-up**: How would you assert that the values array is not empty?

### 57. Coding Challenge: How do you verify that clicking a table header sorts the rows correctly?
* **Expected Answer**:
  ```typescript
  // 1. Sort ascending
  await page.getByRole('columnheader', { name: 'Date' }).click();

  // 2. Fetch first and last row values
  const firstVal = await page.getByRole('row').nth(1).getByRole('cell').nth(2).textContent();
  const lastVal = await page.getByRole('row').last().getByRole('cell').nth(2).textContent();

  // 3. Compare values
  expect(new Date(firstVal!).getTime()).toBeLessThan(new Date(lastVal!).getTime());
  ```
* **Common Mistakes**: Reading the whole table into memory when checking boundaries is sufficient and faster.
* **Follow-up**: How do you assert descending sort order?

### 58. Coding Challenge: How do you test search/filtering functionality in a data grid?
* **Expected Answer**:
  ```typescript
  // 1. Enter query in search box
  await page.getByRole('searchbox').fill('Clinical Trial');
  await expect(page.getByRole('progressbar')).toBeHidden(); // Wait for sync

  // 2. Get matches and verify all contain the query
  const matches = page.getByRole('row').filter({ hasText: /DOC-/ });
  const count = await matches.count();
  for (let i = 0; i < count; i++) {
    const text = await matches.nth(i).textContent();
    expect(text?.toLowerCase()).toContain('clinical trial');
  }
  ```
* **Common Mistakes**: Relying on static wait delays after search input.
* **Follow-up**: How do you verify the empty state works correctly?

### 59. How do you handle loading spinners or skeleton screens when table content reloads?
* **Expected Answer**: Write explicit assertions checking visibility state:
  ```typescript
  const spinner = page.getByRole('progressbar');
  await expect(spinner).toBeVisible({ timeout: 2000 });
  await expect(spinner).toBeHidden({ timeout: 10000 });
  ```
* **Common Mistakes**: Not checking for the spinner's appearance, which can lead to checking stale DOM states before new network requests resolve.
* **Follow-up**: What is the danger if the reload is faster than 5ms? (Answer: Spinner may not show up. You should also check for table row updates).

### 60. What is `expect.poll()` and when would you use it instead of standard locator assertions?
* **Expected Answer**: `expect.poll()` is used to assert against functions that return a value asynchronously (e.g. checking database values, API responses, or page locations) rather than standard DOM elements. It retries the function dynamically until the assertion passes.
* **Common Mistakes**: Using `expect.poll()` to check standard locator visibility when `expect(locator).toBeVisible()` does it natively.
* **Follow-up**: What is the default polling interval for `expect.poll()`?

---

## Part 4: Architect Questions (61 - 65)

### 61. Where should locators be defined in a Page Object Model (POM)? Properties vs Methods.
* **Expected Answer**: Locators should be declared as `readonly` class properties and initialized inside the class constructor. They should not be declared as methods that recreate the locator object on every call.
  ```typescript
  // ✅ Correct
  export class LoginPage {
    readonly usernameField: Locator;
    constructor(page: Page) {
      this.usernameField = page.getByLabel('Username');
    }
  }
  ```
* **Common Mistakes**: Defining methods like `getUsernameInput() { return this.page.locator(...) }` which bypasses locator declaration syntax.
* **Follow-up**: Why does using properties make test files cleaner?

### 62. Explain the "Composition Over Inheritance" pattern in Page Object Models.
* **Expected Answer**: Instead of using inheritance to share page structures (e.g. `DashboardPage extends BasePage`), represent reusable layout blocks (like navbars, sidebar panels, table grids) as component classes. Instantiate them as properties on page classes.
  ```typescript
  export class DashboardPage {
    readonly navbar: NavbarComponent;
    readonly sideNav: SideNavComponent;
    constructor(page: Page) {
      this.navbar = new NavbarComponent(page);
      this.sideNav = new SideNavComponent(page);
    }
  }
  ```
* **Common Mistakes**: Designing massive inheritance chains that cascade breaking selector changes to child classes.
* **Follow-up**: How does composition simplify page structure updates?

### 63. How do you handle role-based element variations or feature flags in a Page Object locator scheme?
* **Expected Answer**: Group elements inside the constructor. Provide helper state methods that check visibility or presence dynamically using methods returning boolean state checks:
  ```typescript
  export class AccountPage {
    readonly adminPanel: Locator;
    readonly clientPanel: Locator;

    constructor(page: Page) {
      this.adminPanel = page.getByRole('region', { name: 'Admin Panel' });
      this.clientPanel = page.getByRole('region', { name: 'Client Panel' });
    }

    async getActionCta(): Promise<Locator> {
      if (await this.adminPanel.isVisible()) {
        return this.adminPanel.getByRole('button', { name: 'Manage System' });
      }
      return this.clientPanel.getByRole('button', { name: 'View Account' });
    }
  }
  ```
* **Common Mistakes**: Writing duplicate page objects for each role representation.
* **Follow-up**: How would composition scale this role management pattern?

### 64. How do you structure locators for tests that span across multiple browser tabs or popup windows?
* **Expected Answer**: Coordinate browser tabs using the page context's `popup` event, returning a new `Page` reference:
  ```typescript
  async openPreview(docId: string): Promise<Page> {
    const popupPromise = this.page.waitForEvent('popup');
    await this.getActionButton(docId, 'Preview').click();
    const newTab = await popupPromise;
    await newTab.waitForLoadState();
    return newTab;
  }
  ```
  The test script then constructs locators directly from this returned tab reference.
* **Common Mistakes**: Expecting the main `page` object context to follow tab focus automatically.
* **Follow-up**: How do you verify tab closure?

### 65. Why is it an anti-pattern to include assertions inside Page Object methods? How should locator state be returned instead?
* **Expected Answer**: Assertions inside Page Objects couple test logic with element navigation. It limits POM reuse. For example, if a method checks `await expect(this.successBanner).toBeVisible()`, you cannot reuse that method in a test checking error outcomes or validation failures. Instead, Page Objects should perform actions or return locators, leaving the assertion to the test script.
  ```typescript
  // ❌ Anti-pattern: Hardcoded assertion
  async uploadFile(path: string) {
    await this.input.setInputFiles(path);
    await expect(this.successBanner).toBeVisible();
  }

  // ✅ Correct: Action only
  async uploadFile(path: string) {
    await this.input.setInputFiles(path);
  }
  ```
* **Common Mistakes**: Defending internal page object assertions as a way to keep test scripts short.
* **Follow-up**: How can custom fixtures be used to simplify assertions without cluttering the test script?
