# MultiArt AI — Website + Super Admin (PHP)

This one plain-PHP app (no framework, no JS build step) serves two things
under different URL namespaces:

- **`/` and everything not under `/admin`** — the public wallpapers website
  (home, `/wallpapers`, `/wallpapers/:id`, `/categories`, `/categories/:slug`,
  `/privacy-policy`, `/terms`, `/sitemap.xml`, `/robots.txt`). No login. A
  direct port of the old Next.js `website/` app — same routes, same copy,
  same SEO metadata, same visual language (see `src/Controllers/Public/` and
  `src/Views/site/`).
- **`/admin/*`** — the super-admin panel (see below).

Both are a thin backend-for-frontend: the browser only ever talks to this
app, which relays requests to `../backend-php`'s `/api/*` routes over HTTP
(so it works identically against a remotely-hosted backend too).

## Concept: one admin, many apps

`/admin/` is a grid of every app registered in the backend's `apps` table
(see `backend-php/database/schema.sql`). Today `MultiArt AI / Wallverse` is
the only one with a real admin module (`/admin/wallpapers/...`) wired up —
it's a straight port of the old Next.js dashboard's
categories/wallpapers/upload/AI review-queue screens (and its public-facing
half is the website routes above). Every other app (Phone Activity App,
MultiStocks AI, …) shows as a placeholder card until it gets its own admin
module.

**To add a new app's admin module later:**
1. Register it in the `apps` table (or via the "Register a new app" form on
   `/admin/` as a super admin) with a unique `key`.
2. Build its controllers/views the same way `src/Controllers/Wallpapers/*`
   and `src/Views/wallpapers/*` are structured, and give it an `admin_module`
   value the router recognizes (see `HomeController::show()` — currently only
   `'wallpapers'` redirects into a real module).
3. Add its routes to `public/index.php`, under `/admin/...`.

If the new app has its own separate backend, set the app's `apiBaseUrl` in
the registry and point that app's `ApiClient` at it instead of
`BACKEND_API_URL`.

## Roles

Reuses the backend's `admins` table (`super` | `editor`, same as before).
Only `super` admins can register/edit/remove apps in the registry; both roles
can manage wallpapers/categories/AI review, matching the old dashboard.

## Setup

1. `composer install`
2. Copy `.env.example` to `.env` and set `BACKEND_API_URL` to where
   `backend-php` is running.
3. For local dev, use PHP's built-in server **with `public/index.php` passed
   as the router script** (its own routing handles every path regardless of
   what triggered it, the same way `.htaccess` does in production — without
   this, the built-in server 404s on extension-like paths such as
   `/sitemap.xml` before your router ever sees them):
   ```
   php -S 0.0.0.0:5001 -t public public/index.php
   ```
   For a real webserver, point its doc root at `public/` (see the top-level
   `.htaccess` if it must stay at the project root instead).
4. Visit `/` for the public site. Go to `/admin/login` and sign in with the
   admin account created via the backend's `POST /api/auth/setup`.
