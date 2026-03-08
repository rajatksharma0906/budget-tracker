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

If the backend blocks requests from your frontend origin, configure CORS on the API server to allow your app’s origin (e.g. `http://localhost:3000`).
