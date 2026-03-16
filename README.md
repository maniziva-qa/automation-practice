# Automation Practice

This repository is a sample web automation practice app that includes UI pages, a mock API server, and various interaction scenarios. It is designed for practicing end-to-end testing and browser automation.

## Project structure

- `public/` - static front-end assets (HTML/CSS/JS)
  - `pages/` - scenario pages for components, frames, shadow DOM, tables, etc.
- `data/users.json` - sample user data
- `server/` - Node.js Express server
  - `routes/api.js` - API routes
  - `controllers/userController.js` - user API logic
- `uploads/` - (for file upload tests)
- `package.json` - dependencies and scripts

## Requirements

- Node.js 16+ (or 18+) installed

## Setup

```bash
npm install
```

## Run

```bash
npm start
```

Open the app in your browser at `http://localhost:3000`.

## Available sections

- Basic elements
- Advanced elements
- Alerts & popupsss
- Frames & windows
- Iframe content
- Shadow DOM
- Tables
- Wait scenarios
- API playground
- Auth
- Complex challenges

## Notes

- For automation tests, use your preferred framework (Playwright, Selenium, Cypress) against the local server.
- Server routes in `server/routes/api.js` and controller logic in `server/controllers/userController.js`.
