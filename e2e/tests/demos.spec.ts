import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import {
  gotoProfilePage,
  loginUser,
  logoutUser,
  sendJoinRequest,
} from "./utils/auth-utils";

test.describe("Client Demonstrations", () => {
  interface UserInfo {
    tag: string;
    specialty?: string;
    email: string;
    password: string;
    team?: string;
  }
  // Data for the scenario
  const invalidEmail = "lea@mail.com";
  const validEmail = faker.internet.email();
  const vectorr: UserInfo = {
    tag: "Vectorr",
    specialty: "Catalyseur",
    email: invalidEmail,
    password: "Password123*",
    team: "TEAM_ALPHA",
  };

  const lynx: UserInfo = {
    tag: "Lynx",
    email: "lea@mail.com",
    password: "Password1!",
  };

  const iron: UserInfo = {
    tag: "Iron",
    email: "tibo@mail.com",
    password: "Password1!",
  };

  test("Demo: Sprint 1", async ({ page, context }) => {
    //Custom timeout
    test.setTimeout(1200000);

    await page.goto("http://localhost:5173/");

    //register new member
    //go to register page
    await page.getByRole("button", { name: "S'Inscrire" }).click();

    // fill infos
    await page.getByTestId("register-email-input").fill(vectorr.email);
    await page.getByTestId("register-tag-input").fill(vectorr.tag);

    const specialtyInput = page.getByTestId("register-specialty-input");
    await specialtyInput.fill(vectorr.specialty!.slice(0, 5));
    await page.getByRole("option", { name: vectorr.specialty }).click();

    await page.getByTestId("register-submit-step-1").click();

    await page.getByPlaceholder("Mot de passe").first().fill(vectorr.password);
    await page
      .getByPlaceholder("Confirmer le mot de passe")
      .fill(vectorr.password);
    await page.getByTestId("register-submit-step-2").click();

    await page.locator(".profile-picture-placeholder").click();
    //select avatar n° 12
    const avatarOption = page.locator('img[src*="/assets/avatars/"]').nth(12);
    await expect(avatarOption).toBeVisible();
    await avatarOption.click();
    await page.getByRole("button", { name: "Confirmer" }).click();

    //attempt registration with invalid email
    const [response] = await Promise.all([
      // We listen for the POST request to your registration endpoint
      page.waitForResponse(
        (res) => res.url().includes("/register") && res.status() === 409,
      ),
      // The action that triggers the 409
      page.getByTestId("register-submit-step-3").click(),
    ]);

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
    vectorr.email = validEmail;
    await emailInput.fill(vectorr.email);

    // validate
    await page.getByTestId("register-submit-step-1").click();
    await page.getByTestId("register-submit-step-2").click();
    await page.getByTestId("register-submit-step-3").click();

    // check navigation to login page
    await expect(page).toHaveURL(/.*login/);

    await loginUser(page, vectorr.email, vectorr.password, true, vectorr.tag);

    //go to profile page
    gotoProfilePage(page);
    // send join request
    sendJoinRequest(page, vectorr.team!);

    await logoutUser(page);

    // login as lynx
    await loginUser(page, lynx.email, lynx.password, true, lynx.tag);

    //TEST NOTIFICATIONS
    // open menu
    await page.getByTestId("notification-menu-button").click();

    // Click "Voir Tout"
    const seeAllButton = page.getByTestId("notification-view-all-button");
    await expect(seeAllButton).toBeVisible();
    await seeAllButton.click();

    await expect(page).toHaveURL(/.*notifications/);

    // find row containing user tag and team requested
    const notificationRow = page
      .getByRole("listitem")
      .filter({
        hasText: new RegExp(`(?=.*${vectorr.tag})(?=.*${vectorr.team})`, "i"),
      })
      .first();

    await expect(notificationRow).toBeVisible({ timeout: 10000 });

    // Mark as Read
    const markAsReadBtn = notificationRow.getByTestId(
      "notification-mark-as-read",
    );
    await markAsReadBtn.click();

    // verify mark-as-read button is hidden after click
    await expect(markAsReadBtn).toBeHidden();
    // click notification
    await notificationRow.click();
    await expect(page).toHaveURL(/.*teams/);
    await expect(page.getByText(vectorr.team!)).toBeVisible();

    // TEST ACCEPT REQUEST
    const vectorrRequest = page.getByTestId(`join-request-item-${vectorr.tag}`);
    await expect(vectorrRequest).toBeVisible({ timeout: 10000 });
    await vectorrRequest.getByTestId("join-request-accept-button").click();
    await expect(vectorrRequest).toBeHidden();

    // TEST PROMOTE MANAGER
    await await page.getByTestId("team-promote-button").click();
    await expect(page.getByTestId("manager-selection-input")).toBeVisible();
    await page.getByTestId("manager-selection-input").fill(vectorr.tag);
    await page.getByTestId(`manager-option-${vectorr.tag}`).click();
    await page.getByTestId("modal-confirm-button").click();

    await logoutUser(page);

    // TEST LOGIN WITH WRONG PASSWORD
    await page.goto("http://localhost:5173/auth/login");
    await page.getByTestId("login-email-input").fill(vectorr.email);
    await page.getByTestId("login-password-input").fill("wrong password");
    await page.getByTestId("login-submit-button").click();
    await expect(page).toHaveURL("http://localhost:5173/auth/login");
    await expect(page.getByText("Identifiants invalides")).toBeVisible();

    await loginUser(page, vectorr.email, vectorr.password, true, vectorr.tag);

    //TEST TEAM JOIN/LEAVE
    gotoProfilePage(page);
    // check vectorr is in team_alpha now
    await expect(page.getByText(vectorr.team!)).toBeVisible();
    // leave team
    await page.getByTestId("team-quit-button").click();
    //check no longer in team alpha
    await expect(page.getByText(vectorr.team!)).not.toBeVisible();
    //send request to team_omega
    vectorr.team = "TEAM_OMEGA";
    await sendJoinRequest(page, vectorr.team);

    await logoutUser(page);

    // TEST REFUSE JOIN REQUEST
    await loginUser(page, iron.email, iron.password, true, iron.tag);
    await gotoProfilePage(page);
    await page.getByTestId("team-view-button").click();
    await expect(page.getByAltText(vectorr.team!)).toBeVisible();
    //reject
    await page.getByTestId("join-request-deny-button").click();
    // fill rejection reason
    const reasonInput = page.getByTestId("reject-reason-input");
    await expect(reasonInput).toBeVisible();
    const refusalReason = "Désolé, l'équipe est déjà complète.";
    await reasonInput.fill(refusalReason);
    await page.getByTestId("modal-confirm-button").click();
    await expect(
      page.getByTestId(`join-request-item-${vectorr.tag}`),
    ).toBeHidden();

    // TEST UNAVAILIBILITIES
    await gotoProfilePage(page);

    /** 
    // test remember-me
    //close browser
    await context.storageState({ path: "state.json" });
    await context.close();
    const newContext = await page
      .context()
      .browser()!
      .newContext({ storageState: "state.json" });
    const newPage = await newContext.newPage();

    // reopen page
    await newPage.goto("http://localhost:5173/");
    //verify its still logged in
    await expect(newPage.getByTestId("user-menu-button")).toBeVisible();
    await expect(newPage.getByText(lynx.tag)).toBeVisible();

    await newContext.close();
    */
  });

  test("Demo: Sprint 2", async ({ page }) => {});
});
