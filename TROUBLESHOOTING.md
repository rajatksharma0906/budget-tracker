# Troubleshooting

## Port in use

Next.js dev server defaults to port 3000. To use another port:

```bash
PORT=3001 npm run dev
```

Then open http://localhost:3001

## API / login fails

- Ensure `NEXT_PUBLIC_API_URL` in `.env.local` is correct and has no trailing slash.
- Check the API is up: open `https://budget-api.rajatsharmajsdev.com/health/db` in the browser.
- See [API Swagger](https://budget-api.rajatsharmajsdev.com/api-docs) for request/response formats.

## CORS

If the backend blocks requests from your frontend origin, configure CORS on the API server to allow your app's origin (e.g. `http://localhost:3000`).

---

## Hostinger / shared hosting

Next.js on shared hosting (e.g. Hostinger Node.js) can show **blank screens** or **ChunkLoadError / 400 Bad Request** for `_next/static/chunks/*.js` after you redeploy. That happens when the browser or a proxy serves **old cached HTML** that points to JavaScript chunk files from a previous build; those files no longer exist after a new build.

### What we do in the app

- **Cache headers** (in `next.config.js`): HTML/document requests use `Cache-Control: no-cache, must-revalidate` so the browser revalidates after a deploy. Static assets under `/_next/static/` use long-lived cache (they are content-hashed).
- **Auto-reload on chunk errors** (`app/global-error.tsx`): If a chunk fails to load (e.g. ChunkLoadError), the app tries one full page reload so the user gets the latest HTML and chunks.

### What you can do

1. **After each deploy**  
   Ask users (or do yourself) a **hard refresh**: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac). Or open the site in a private/incognito window to bypass cache.

2. **Hostinger / proxy caching**  
   If your host or a CDN caches HTML in front of Node, disable or shorten that cache for page requests (e.g. for `/*` or `/`), or exclude your app's domain from aggressive caching. Caching of `/_next/static/*` is fine and recommended.

3. **Always build before start**  
   On the server, run `npm run build` then `npm start`. Don't reuse an old `.next` folder from a previous deploy; upload a fresh build or run `npm run build` in the deploy step.

4. **Node version**  
   Set Node to **20+** in the Hostinger panel and ensure the start command is `npm start` (which runs `npx next start`).
