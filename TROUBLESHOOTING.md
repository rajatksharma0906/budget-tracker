# Troubleshooting Guide

## Server Won't Start - Port Permission Error

If you see `EPERM: operation not permitted` when starting the dev server:

### Solution 1: Use a Different Port (Easiest)

The app is configured to run on port 3001. Start it with:

```bash
npm run dev
```

Then open: http://localhost:3001

### Solution 2: Check if Port 3000 is in Use

```bash
# Check what's using port 3000
lsof -ti:3000

# If something is using it, kill it:
kill -9 $(lsof -ti:3000)
```

Then try again:
```bash
npm run dev
```

### Solution 3: Use a Custom Port

You can specify any port:

```bash
PORT=4000 npm run dev
```

Then open: http://localhost:4000

### Solution 4: Check macOS Firewall

1. Go to System Settings → Network → Firewall
2. Make sure it's not blocking Node.js
3. Or temporarily disable firewall to test

## Other Common Issues

### Dependencies Not Installed

```bash
npm install
```

### Database Connection Fails

- Ensure MySQL is running and credentials in `.env.local` are correct.
- Run `npm run db:test` to verify the connection.
- See README for Hostinger MySQL and Remote MySQL setup.

## Still Having Issues?

1. Check the terminal output for specific error messages
2. Make sure Node.js version is 18+ (`node --version`)
3. Try deleting `node_modules` and `.next` folder, then reinstall:
   ```bash
   rm -rf node_modules .next
   npm install
   npm run dev
   ```
