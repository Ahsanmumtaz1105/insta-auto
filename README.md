# Instagram Automation Tool

This project is a Playwright-based automation tool for Instagram that demonstrates automated login, search, and post interaction capabilities.

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)
- A valid Instagram account

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Install Playwright browsers:

```bash
npx playwright install
```

## Configuration

1. Create a `.env` file in the root directory with your Instagram credentials:

```
INSTAGRAM_USERNAME=your_username
INSTAGRAM_PASSWORD=your_password
SEARCH_TEXT=your_search_query
```

## Project Structure

```
├── tests/
│   ├── instagram.spec.ts    # Main Instagram automation test
│   └── example.spec.ts      # Example Playwright test
├── playwright.config.ts     # Playwright configuration
├── package.json            # Project dependencies
└── .env                    # Environment variables (create this)
```

## Features

- Automated Instagram login
- Search functionality
- Post interaction (viewing posts, navigating between posts)
- Handles various UI states and popups
- Waits for content loading
- Error handling for various scenarios

## Running the Tests

To run all tests:

```bash
npx playwright test
```

To run only Instagram tests:

```bash
npx playwright test instagram.spec.ts
```

To run tests with UI:

```bash
npx playwright test --headed
```

To view test report:

```bash
npx playwright show-report
```

## Important Notes

- The tool includes appropriate waiting mechanisms for Instagram's dynamic content loading
- Handles cookie consent and login info popups automatically
- Includes error handling for various scenarios
- Rate limiting: Be mindful of Instagram's rate limits and terms of service

## Troubleshooting

1. If tests fail due to timeouts, try increasing the timeout values in the test file
2. Make sure your Instagram credentials are correct in the .env file
3. Check if Instagram is blocking automated access (you might need to verify your account)
