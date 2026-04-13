import { test, expect } from "@playwright/test";
import {
  gotoProfilePage,
  loginUser,
  logoutUser,
  sendJoinRequest,
} from "./utils/auth-utils";

test("test", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  // check tournament info
  await expect(page.locator(".MuiBox-root.css-1bg6rai")).toBeVisible();
  await page.getByRole("link", { name: "Vinci Easter Cup 2026 7 / 8" }).click();
  await expect(page.getByTestId("tournament-banner-name")).toBeVisible();
  await expect(page.getByText("Jeudi 15 Avr. - Dimanche 25")).toBeVisible();
  await expect(
    page.getByTestId("tournament-banner-deadline").getByText("avr."),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Tournoi de Pâques ouvert à" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "TEAM_GHOST_4TEAM_IOTATEAM_OMEGATEAM_GHOST_5TEAM_GHOST_1TEAM_GHOST_3TEAM_GHOST_2",
    ),
  ).toBeVisible();
  await expect(page.getByTestId("tournament-capacity-display")).toBeVisible();
  await page.getByTestId("nav-tournaments-tab").click();
  await page.getByText("À venirEn coursPassés").click();
  await page.getByRole("button", { name: "Passés" }).click();
  await page.getByRole("link", { name: "Spring Arena Cup 2025 7 / 8" }).click();
  // test create tournament
  await page.getByTestId("header-login-button").click();
  await page.getByTestId("login-email-input").click();
  await page.getByTestId("login-email-input").fill("tibo@mail.com");
  await page.getByTestId("login-password-input").click();
  await page.getByTestId("login-password-input").fill("Password1!");
  await page.getByTestId("login-submit-button").click();
  await page.getByTestId("admin-create-tournament-button").click();
  await page.getByRole("textbox", { name: "ex: Worlds" }).click();
  await page
    .getByRole("textbox", { name: "ex: Worlds" })
    .fill("Nebula Nexus Invitational");
  await page.getByRole("textbox", { name: "Décrivez votre tournoi" }).click();
  await page
    .getByRole("textbox", { name: "Décrivez votre tournoi" })
    .fill(
      "Tournoi expérimental dans l’arène Vinci où stratégie et coordination\nseront poussées à l’extrême, dans une ambiance futuriste inspirée des combats\ninterstellaires",
    );
  await page.getByRole("button", { name: "Suivant" }).click();
  await page.getByText("23").click();
  await page.getByText("23").fill("1");
  await page
    .getByRole("group")
    .filter({ hasText: "01/04/" })
    .getByLabel("Month")
    .fill("1");
  await page.getByRole("button", { name: "Créer" }).click();
  await expect(
    page
      .getByRole("dialog", { name: "Créer un Tournoi" })
      .getByTestId("ErrorOutlineIcon"),
  ).toBeVisible();
  await page
    .getByRole("group")
    .filter({ hasText: "01/01/" })
    .getByLabel("Day")
    .click();
  await page
    .getByRole("group")
    .filter({ hasText: "01/01/" })
    .getByLabel("Day")
    .fill("3");
  await page.getByText("MM").fill("6");
  await page.getByText("YYYY").fill("6");
  await page.getByText("07/").click();
  await page.getByText("07").fill("1");
  await page.getByText("01").fill("4");
  await page.getByText("05").fill("6");
  await page
    .getByRole("group")
    .filter({ hasText: "/04/2026 20:00" })
    .getByLabel("Day")
    .click();
  await page
    .getByRole("group")
    .filter({ hasText: "/04/2026 20:00" })
    .getByLabel("Day")
    .fill("0");
  await page.getByText("04").fill("5");
  await page.getByRole("button", { name: "Créer" }).click();
  await page.getByTestId("user-menu-button").click();
  await page.getByRole("heading", { name: "Mon Profil" }).click();
  await page.getByTestId("team-quit-button").click();
  await page.getByTestId("modal-confirm-button").click();
  await page.getByTestId("team-join-button").click();
  await page.getByTestId("join-team-autocomplete-input").click();
  await page.getByTestId("join-team-autocomplete-input").fill("te");
  await page.getByRole("option", { name: "TEAM_ALPHA" }).click();
  await page.getByTestId("modal-confirm-button").click();
  await page.getByTestId("user-menu-button").click();
  await page.getByRole("heading", { name: "Se Déconnecter" }).click();
  //test tournament modification and publish + registeration to tournament
  await page.getByTestId("header-login-button").click();
  await page.getByTestId("login-email-input").click();
  await page.getByTestId("login-email-input").fill("lea@mail.com");
  await page.getByTestId("login-password-input").click();
  await page.getByTestId("login-password-input").fill("Password1!");
  await page.getByTestId("login-submit-button").click();
  await expect(page.locator(".MuiBox-root.css-1bg6rai")).toBeVisible();
  await page.getByRole("link", { name: "Vinci Easter Cup 2026 7 / 8" }).click();
  await page.getByRole("link", { name: "logo Vinci Arena" }).click();
  await page.getByRole("link", { name: "Nebula Nexus Invitational 0" }).click();
  await page.getByTestId("tournament-edit-button").click();
  await page.getByRole("textbox", { name: "ex: Worlds" }).click();
  await page.getByRole("textbox", { name: "ex: Worlds" }).fill("Nebula Nexus");
  await page.getByRole("button", { name: "Détails" }).click();
  await page.getByRole("button").nth(5).click();
  await page.getByRole("button").nth(5).click();
  await page.getByRole("button").nth(5).click();
  await page.getByRole("button").nth(5).click();
  await page.getByRole("button", { name: "Modifier" }).click();
  await expect(page.getByTestId("tournament-banner-name")).toBeVisible();
  await page.getByTestId("tournament-primary-action-button").click();
  await page.getByTestId("modal-confirm-button").click();
  await expect(page.getByText("Inscriptions")).toBeVisible();
  await page.getByTestId("tournament-register-button").click();
  await page.getByTestId("modal-confirm-button").click();
  await expect(page.getByTestId("ErrorOutlineIcon")).toBeVisible();
  await page.getByTestId("notification-menu-button").click();
  await page
    .getByRole("listitem")
    .filter({ hasText: "Iron souhaite rejoindre" })
    .click();
  await page.locator(".MuiBackdrop-root").click();
  await page.getByTestId("join-request-accept-button").click();
  await page.getByTestId("nav-tournaments-tab").click();
  await page
    .getByRole("link", { name: "Nebula Nexus 0 / 12 Mer. 3 -" })
    .click();
  await page.getByTestId("tournament-register-button").click();
  await page.getByTestId("modal-confirm-button").click();
  await expect(page.getByRole("alert").getByRole("img")).toBeVisible();
  await page.getByRole("link", { name: "TEAM_ALPHA" }).click();
  await expect(
    page.getByRole("link", { name: "Nebula Nexus 1 / 12 Mer. 3 -" }),
  ).toBeVisible();
  await page.getByTestId("nav-tournaments-tab").click();
  await page.getByRole("link", { name: "Vinci Easter Cup 2026 7 / 8" }).click();
  await page.getByTestId("tournament-register-button").click();
  await page.getByTestId("modal-confirm-button").click();
  await expect(
    page.locator("span").filter({ hasText: "Inscriptions closes" }),
  ).toBeVisible();
  await page.getByTestId("user-menu-button").click();
  await page.getByRole("heading", { name: "Mon Profil" }).click();
  await page.getByTestId("team-view-button").click();
  await expect(
    page.getByRole("link", { name: "Vinci Easter Cup 2026 8 / 8" }),
  ).toBeVisible();
  await page.getByTestId("user-menu-button").click();
  await page.getByRole("heading", { name: "Se Déconnecter" }).click();
});
