# Convex setup

1. Run `npx convex dev` from the project root and complete the one-time Convex login/project prompt.
2. Copy the generated deployment URL into `.env.local`:

   ```env
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
   ```

3. Keep the development process running while developing. For a production release, run `npx convex deploy` before deploying the Next.js app.
4. Open `/admin/migrate` once from any browser that still holds the legacy data, then use its migration button to copy it to Convex.

## First administrator

Before opening `/admin` for the first time, set a strong, private setup key in both environments. Use a value from a password manager.

```powershell
# Add this line to .env.local (do not use NEXT_PUBLIC_)
ADMIN_SETUP_KEY=your-long-random-secret

# Set the same value for the active Convex deployment
npx.cmd convex env set ADMIN_SETUP_KEY your-long-random-secret
```

Then open `/admin`, enter that setup key once, and create the first administrator. The setup action is disabled as soon as an administrator exists. Customer and administrator session tokens are stored only in HTTP-only cookies; password hashes and session token hashes are stored in Convex.

The app no longer uses Supabase, `.data` filesystem storage, `localStorage`, or `sessionStorage` as an application data store. Legacy `.data/admin-storage.json` is deliberately retained as a recovery source until its contents have been migrated and verified.
