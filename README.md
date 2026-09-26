# Roman First Half V3.1 — backend edition

This fixes the browser CORS problem by serving the bot and a restricted API relay from the same Node.js app. GitHub Pages cannot run this backend.

## Deploy

1. Extract the ZIP. Upload `package.json`, `server.mjs` and the `public` folder to a GitHub repository, preserving the folders. These files should be at the repository root, not inside another football-backend folder.
2. On a Node.js web-service host, connect that repository. Use Node 22 or newer, build command `npm install` and start command `npm start`. The server uses the host's PORT variable.
3. Open the host's HTTPS app URL. Enter your Football-data.org token in the page and press TEST API & LOAD LEAGUES.
4. Use this new app URL instead of the GitHub Pages URL. Do not put your token in GitHub, the source files, or the URL.

The token travels through your own app server to Football-data.org. The app code does not store or log it. Avoid enabling request-header logging at the host. Do not use someone else's public proxy.

For local testing: install Node 22+, run `npm start`, then open http://localhost:3000.

## Validation and limits

The provider's live OPTIONS response on 26 September 2026 advertised `Access-Control-Allow-Origin: http://localhost` for a request from https://jtroman77.github.io. That response does not allow GitHub Pages to read the API directly.

Mocked checks cover relay routes, missing tokens, provider errors and frontend parsing. Live authenticated account access has not been tested. Free scores/schedules can be delayed. Current-season history may be insufficient early in a season; such matches return SKIP. This change fixes the connection architecture, not prediction accuracy.

Football data provided by the Football-Data.org API.
