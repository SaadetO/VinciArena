import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { loginUser } from "./utils/auth-utils";

test.describe("Client Demonstrations", () => {
  // Data for the scenario
  const tag = "Vectorr";
  const speciality = "Catalyseur";
  const invalidEmail = "lea@mail.com";
  const validEmail = faker.internet.email();
  const password = "Password123*";

  test("Demo: Sprint 1", async ({ page }) => {
    //Custom timeout
    test.setTimeout(60000);

    await page.goto("http://localhost:5173/");

    //register new member
    //go to register page
    await page.getByRole("button", { name: "S'Inscrire" }).click();

    // fill infos
    await page.getByTestId("register-email-input").fill(invalidEmail);
    await page.getByTestId("register-tag-input").fill(tag);

    const specialtyInput = page.getByTestId("register-specialty-input");
    await specialtyInput.fill(speciality.slice(0, 5));
    await page.getByRole("option", { name: speciality }).click();

    await page.getByTestId("register-submit-step-1").click();

    await page.getByPlaceholder("Mot de passe").first().fill(password);
    await page.getByPlaceholder("Confirmer le mot de passe").fill(password);
    await page.getByTestId("register-submit-step-2").click();

    await page.locator(".profile-picture-placeholder").click();
    //select avatar n° 12
    const avatarOption = page.locator('img[src*="/assets/avatars/"]').nth(12);
    await expect(avatarOption).toBeVisible();
    await avatarOption.click();
    await page.getByRole("button", { name: "Confirmer" }).click();

    //attemp registration with invalid email
    await page.getByTestId("register-submit-step-3").click();

    // verify error snackbar appeared + no navigation
    await expect(page.getByText(/email déjà utilisé/i)).toBeVisible({
      timeout: 10000,
    });
    await expect(page).toHaveURL(/.*register/);

    //change email to valid one
    //return to step 1
    await page.getByTestId("return-step-3").click();
    await page.getByTestId("return-step-2").click();

    //correct email
    const emailInput = page.getByTestId("register-email-input");
    await emailInput.clear();
    await emailInput.fill(validEmail);

    // validate
    await page.getByTestId("register-submit-step-1").click();
    await page.getByTestId("register-submit-step-2").click();
    await page.getByTestId("register-submit-step-3").click();

    // check navigation to login page
    await expect(page).toHaveURL(/.*login/);

    await loginUser(page, validEmail, password, true, tag);

    //check navigation + tag visible
    await expect(page).toHaveURL("http://localhost:5173/");
    await expect(page.getByText(tag)).toBeVisible();
  });
});
