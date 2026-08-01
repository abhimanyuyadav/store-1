# Production deployment

## 1. Deploy Convex

Authenticate with Convex, select a production project, and deploy the backend:

```powershell
npx.cmd convex login
npx.cmd convex deploy
```

Copy the production `.convex.cloud` and `.convex.site` URLs from the deployment output.

## 2. Configure the Next.js host

Set these environment variables in Vercel, Render, Railway, or another Node host. Do not commit `.env.local` or the setup key.

```env
CONVEX_DEPLOYMENT=your-production-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site
ADMIN_SETUP_KEY=<long-random-secret>
```

The production build command is `npm run build`; the standalone server starts with `npm run start`.

## 3. Create the administrator

Set the same setup key in Convex, deploy, then open `/admin` once and create the administrator. After the first account exists, the setup action is disabled.

```powershell
npx.cmd convex env set ADMIN_SETUP_KEY <long-random-secret>
```

All catalog, order, customer, review, coupon, collection, settings, session, and image data remains in Convex. No browser storage or filesystem persistence is required.
