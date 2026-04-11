import { Page, expect } from "@playwright/test";

export async function loginUser(
  page: Page,
  email: string,
  password: string,
  rememberMe: boolean = false,
  tag: string,
) {
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);

  if (rememberMe) {
    await page.check('input[name="rememberMe"]');
  }

  await page.getByRole("button", { name: "Se Connecter" }).click();
  await expect(page.getByText(tag)).toBeVisible({
    timeout: 10000,
  });
}
