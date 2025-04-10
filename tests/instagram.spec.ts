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
  await page.waitForTimeout(3000); // Wait for the page to load
  await page
    .getByRole("link", { name: "Search Search" })
    .waitFor({ state: "visible" });
  await page.getByRole("link", { name: "Search Search" }).click();
  await page.waitForTimeout(2000); // Wait for search page to load
  const searchText = process.env.SEARCH_TEXT || "tshirt";
  await page.getByRole("textbox", { name: "Search input" }).fill(searchText);
  await page.getByRole("textbox", { name: "Search input" }).press("Enter");
  await page.waitForTimeout(2000); // Wait for search results to load

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

  // Wait for posts to load
  await page.waitForSelector('section a[role="link"][href*="/p/"]');

  // Get all post links
  const postLinks = await page
    .locator('section a[role="link"][href*="/p/"]')
    .all();

  // Click through each post link
  for (let i = 0; i < postLinks.length; i++) {
    try {
      const postLink = postLinks[i];
      // Get the href before clicking
      const href = await postLink.getAttribute("href");
      console.log(`Processing post: ${href}`);

      if (i === 0) {
        // Only click the first post
        await postLink.click();
        // Wait for the first post dialog to load
        await page.waitForSelector('div[role="dialog"]', { timeout: 5000 });
        await page
          .getByRole("textbox", { name: "Add a comment…" })
          .fill("Nice post!");
        await page.keyboard.press("Enter"); // Submit the comment
        await page.waitForTimeout(2000);
      }

      // Wait a moment to view the post
      await page.waitForTimeout(2000);
    } catch (error) {
      console.log(`Error handling post: ${error.message}`);
      continue; // Continue with next post if there's an error
    }
  }

  for (let i = 0; i < parseInt(process.env.NO_OF_POSTS || "3", 10); i++) {
    // For all posts except the last one, press arrow right to go to next post
    await page.keyboard.press("ArrowRight");
    // Wait for the next post to load
    await page.waitForTimeout(1000);
    await page
      .getByRole("textbox", { name: "Add a comment…" })
      .fill("Nice post!");
    await page.keyboard.press("Enter"); // Submit the comment
    await page.waitForTimeout(2000); // Wait for the next post to load
  }

  // After viewing all posts, close the dialog
  await page.keyboard.press("Escape");
  // Wait for dialog to close
  await page.waitForSelector('div[role="dialog"]', {
    state: "hidden",
    timeout: 5000,
  });
});

// Function to scroll and wait for new posts to load
async function scrollAndWaitForPosts(page) {
  // Scroll to bottom
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  try {
    // Wait for loading indicator to appear
    await page
      .getByRole("img", { name: "Loading..." })
      .waitFor({ state: "visible", timeout: 3000 });

    // Wait for loading indicator to disappear
    await page
      .getByRole("img", { name: "Loading..." })
      .waitFor({ state: "hidden", timeout: 5000 });
  } catch (e) {
    // Loading indicator might not appear if all content is already loaded
    console.log("No loading indicator found or content already loaded");
  }

  // Wait a moment for posts to render
  await page.waitForTimeout(1000);
}
