import { test, expect } from "@playwright/test";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

test("Instagram login and search", async ({ page }) => {
  // Navigate to Instagram
  await page.goto("https://www.instagram.com/");

  // Handle cookie consent popup if it appears
  try {
    await page
      .getByRole("button", { name: "Allow all cookies" })
      .click({ timeout: 5000 });
  } catch (e) {
    // Cookie popup didn't appear, continue with the test
  }

  // Wait for login form to be visible
  await page.waitForSelector('input[name="username"]');

  // Fill in login credentials - these should be provided via environment variables or test config
  await page.fill(
    'input[name="username"]',
    process.env.INSTAGRAM_USERNAME || ""
  );
  await page.fill(
    'input[name="password"]',
    process.env.INSTAGRAM_PASSWORD || ""
  );

  // Click login button
  await page.click('button[type="submit"]');
  await page.waitForLoadState("load");

  // You can also wait for an element that appears post-login
  try {
    await page.waitForSelector('[aria-label="Home"]', { timeout: 10000 });
  } catch (e) {
    // Element not found, but continue since we've already waited for network idle
    console.log("Navigation element not found after login, continuing anyway");
  }

  // Handle Login Save Info popup if it appears
  try {
    await page
      .getByRole("button", { name: "Save info" })
      .click({ timeout: 5000 });
  } catch (e) {
    // Login Save Info popup didn't appear, continue with the test
  }
  // Wait for GraphQL query request after login steps
  try {
    await page.waitForRequest(
      (request) =>
        request.url().includes("https://www.instagram.com/graphql/query") &&
        request.method() === "POST",
      { timeout: 10000 }
    );
  } catch (e) {
    console.log(
      "GraphQL query request not detected within timeout, continuing anyway"
    );
  }

  // Wait for search link to become visible
  await page
    .getByRole("link", { name: "Search Search" })
    .waitFor({ state: "visible" });
  await page.getByRole("link", { name: "Search Search" }).click();
  const searchText = process.env.SEARCH_TEXT || "tshirt";
  await page.getByRole("textbox", { name: "Search input" }).fill(searchText);

  // Wait for search results to appear
  await page.waitForSelector('a[role="link"]');

  // Find and click the link containing the search text
  const searchResults = await page.locator('a[role="link"]').all();
  for (const result of searchResults) {
    const text = await result.textContent();
    if (text && text.toLowerCase().includes(searchText.toLowerCase())) {
      await result.click();
      break;
    }
  }
});
