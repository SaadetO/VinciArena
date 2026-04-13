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
});
