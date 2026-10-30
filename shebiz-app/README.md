# SheBiz

Women's empowerment platform: opportunities, mentors, learning, a business manager, an AI assistant and a profile.
React 18 + Vite + Firebase, with 3D hero spheres (Three.js).

**Real data only.** There is no demo mode, no demo login and no sample data. Every account starts empty, and everything a user sees is something they entered or something you published in Firestore.

## 1. Set up Firebase: FREE route (no card, Spark plan)

1. Create a project at https://console.firebase.google.com. Stay on the free **Spark** plan.
2. Enable **Authentication** (Email/Password, plus Google if you want it) and create a **Firestore** database. Skip Storage.
3. Add a Web app and copy its config. `cp .env.example .env` and fill in the `VITE_FIREBASE_*` values. Keep `VITE_USE_CLOUD_FUNCTIONS=false`.
4. Get a free Gemini key at https://aistudio.google.com and put it in `VITE_GEMINI_API_KEY`. It is visible in the site's code, so restrict it to your site's address in Google Cloud > APIs & Services > Credentials.
5. `npm i -g firebase-tools && firebase login && firebase use --add`, then `firebase deploy --only firestore:rules` (and later `--only hosting`).

What the free route does differently: sign-up emails Firebase's own verification **link** instead of a 6-digit code; photos are shrunk in the browser and saved in Firestore instead of Cloud Storage; the AI is called straight from the browser.

## 1b. Optional paid route (Blaze plan, card required)
Gives emailed 6-digit codes and a server-side AI key.
1. Upgrade to **Blaze**, enable Storage, set `VITE_USE_CLOUD_FUNCTIONS=true`.
2. Install the **Trigger Email from Firestore** extension (collection `mail`) with your SMTP details.
3. `firebase functions:secrets:set GEMINI_API_KEY`, then `cd functions && npm install && cd .. && firebase deploy --only firestore:rules,storage,functions`.

## 2. Run it

```bash
npm install
npm run dev     # http://localhost:5173
```
Without a valid `.env` the app shows a setup screen instead of starting.

Deploy the site with `npm run build && firebase deploy --only hosting`.

## 3. Add real listings

Opportunities and mentors are **not** bundled. Add only real, verified ones:

1. Fill in `content/opportunities.json` and `content/mentors.json` (see `content/README.md` for the fields). Mentors must have agreed to be listed. Each opportunity needs its real `applyUrl`.
2. In Firebase console: Project settings > Service accounts > Generate new private key. Then:
   ```bash
   cd functions && npm install && cd ..
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json npm run import-content
   ```
Until you do, those pages show an empty state. The four learning courses are bundled lesson content and need no setup.

## How things work with real data
- **Sign-up:** free route emails Firebase's verification link. Paid route emails a 6-digit code (hashed, 10 min expiry, 5 tries, rate limited).
- **Applying:** "Apply on their website" opens the employer's real advert. SheBiz only keeps a record in your applications list; it does not submit anything for you.
- **Mentors:** a request is saved with status `Requested`. A real mentor must accept it, and you set `status` to `Connected` in the console (see `content/README.md`). Messages are stored; replies come from the mentor, not the app. There is no video calling.
- **Business:** products, sales, expenses and customers are whatever the user records. Sales reduce stock; profit = sales - expenses.
- **AI assistant:** answers come from Gemini (browser key on the free route, `askAI` Cloud Function on the paid route). If it is unavailable the app says so instead of faking an answer.
- **Security:** `firestore.rules` and `storage.rules` keep each user's data private, stop users approving their own mentorship, and keep verification codes server-only.

## Tests
`npm test` runs the business-logic tests (profit, margin, stock status, match score, progress). They use fixtures in `tests/fixtures`, which are never shipped in the app.

## Layout
`src/pages` screens, `src/components` UI and charts, `src/lib/metrics.js` business maths, `src/lib/firebaseBackend.js` all data access, `functions/` Cloud Functions, `content/` real listings to import, `scripts/import-content.mjs` importer.

## Design tokens
Purple `#6938FF`, coral `#F0527D`, gold `#F7BB43`, green `#1F9D6B`, red `#D93F4B`, sidebar `#15131A`, background `#FAF8FC`. Font: Plus Jakarta Sans.

## October 2026 redesign

- New purple/pink theme (`src/theme.css`) and public site styles (`src/site/site.css`). Floating balls were removed.
- 3D collaboration scene: `src/components/CollabScene.jsx` (Three.js, procedural, no external assets; SVG fallback when WebGL is missing; respects reduced motion).
- Public pages live in `src/site/pages/` (Home, Opportunities hub, Mentorship, Directory, Learning hub, Community, Membership plans, Partners, About, Contact). Their sample content is in `src/site/data.js` and is always labelled "Sample". Replace it with real content when you have it.
- Membership plans, commissions, partner listings and payments (`src/pages/Payments.jsx`) are PREVIEW ONLY: no payment provider, no card details, prices are proposed. Plan choice, saved items, mentor requests, community posts and the AI daily counter are stored in the browser (`shebiz.demo.*` in localStorage), not on a server.
- AI daily allowance (5 prompt cycles on Free) is a browser-side preview counter, not server enforced.
- `vite.visual.config.js` and `tests/fixtures/stubBackend.js` are only for screenshot testing; you do not need them to run the app.
