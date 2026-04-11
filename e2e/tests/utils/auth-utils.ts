import { Page, expect } from "@playwright/test";

export async function loginUser(
  page: Page,
  email: string,
  password: string,
  rememberMe: boolean = false,
  tag: string,
) {
  await page.goto("http://localhost:5173/auth/login");
  await page.getByTestId("login-email-input").fill(email);
  await page.getByTestId("login-password-input").fill(password);

  if (rememberMe) {
    await page.getByTestId("login-remember-me-checkbox").check();
  }

  await page.getByTestId("login-submit-button").click();
  await expect(page).toHaveURL("http://localhost:5173/");
  await expect(page.getByText(tag)).toBeVisible();
}
export async function logoutUser(page: Page) {
  await page.getByTestId("user-menu-button").click();
  await page.getByTestId("user-menu-logout").click();
  await expect(page.getByTestId("header-login-button")).toBeVisible();
}
