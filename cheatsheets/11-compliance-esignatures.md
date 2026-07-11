# Playwright Academy Cheat Sheet: Compliance & E-Signatures

Quick reference for electronic signature modal gates, SMS OTP gateway routing mocks, and audit logs validation.

---

## 1. E-Signature Modal Pattern
Verify password confirmation and signing reason in compliance overlays:

```typescript
// pages/EsignModal.ts
export class EsignModal {
  readonly root: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly reason: Locator;
  readonly confirmBtn: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('dialog', { name: 'E-Sign Document' });
    this.email = this.root.getByLabel('Email Address');
    this.password = this.root.getByLabel('Password');
    this.reason = this.root.getByLabel('Reason for Signature');
    this.confirmBtn = this.root.getByRole('button', { name: 'Sign' });
  }

  async sign(emailVal: string, passVal: string, reasonVal: string) {
    await this.email.fill(emailVal);
    await this.password.fill(passVal);
    await this.reason.selectOption(reasonVal);
    await this.confirmBtn.click();
  }
}
```

---

## 2. MFA SMS OTP Interceptor Route
Avoid slow or fragile third-party SMS tool hookings by intercepting and mocking the verification endpoint:

```typescript
await page.route('**/api/auth/verify-otp', async (route) => {
  const postData = route.request().postDataJSON();
  
  if (postData.otp === '998877') {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, sessionToken: 'mock-session-jwt' })
    });
  } else {
    await route.fulfill({ status: 400 });
  }
});
```

---

## 3. Audit Log Row Validation
Verify that compliance actions are written to audit trail grids:
```typescript
const auditRow = page.getByRole('row')
  .filter({ hasText: 'DOC-2024-009' })
  .filter({ hasText: 'SIGNED' });

await expect(auditRow).toBeVisible();
await expect(auditRow.getByRole('cell').nth(3)).toHaveText('reviewer@company.com');
```

---

## 4. Key Do's and Don'ts

### Do
* Mock external MFA/OTP messaging interfaces (`page.route()`) to keep pipelines fast and deterministic.
* Assert that the signature reason logs match compliance regulatory codes (e.g. CFR Part 11).
* Keep signing passwords securely inside environment secrets (CI repository secrets).

### Don't
* Don't perform real-world SMS operations in regression test runs.
* Don't forget to assert audit trail creation immediately after the signing action.
