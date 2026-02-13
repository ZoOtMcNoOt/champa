import { expect, test } from "@playwright/test";

test("lock screen rejects wrong password and accepts correct password", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Champa's Valentine Scrapbook/i })).toBeVisible();

  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: /open my envelope/i }).click();
  await expect(page.getByText(/not quite right/i)).toBeVisible();

  await page.getByLabel("Password").fill("champaisthebest");
  await page.getByRole("button", { name: /open my envelope/i }).click();

  await expect(page).toHaveURL(/\/home/);
  await expect(page.getByText(/Mewmory Vault/i)).toBeVisible();
});
