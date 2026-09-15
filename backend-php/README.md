# MultiArt AI Backend (PHP)

PHP + MySQL port of the Node/Express backend in `../backend`. It's plain PHP
(no framework) with PDO, mirroring the same `/api/*` routes and JSON response
shapes so the mobile app and admin dashboard don't need any changes — just
point them at this backend's URL instead.

## Why MySQL instead of MongoDB

The original backend uses MongoDB (Mongoose). This port uses MySQL because
it's the standard PHP-hosting database. IDs are generated as 24-char hex
strings shaped like MongoDB ObjectIds, and responses use the same field names
(`_id`, `createdAt`, populated `category` objects, etc.) as the Node API.

## Setup

1. `composer install`
2. Copy `.env.example` to `.env` and fill in DB credentials, `JWT_SECRET`,
   Cloudinary keys, and optional Pexels/Unsplash keys.
3. Create the database and load the schema:
   ```
   mysql -u root -p -e "CREATE DATABASE multiart_ai CHARACTER SET utf8mb4"
   mysql -u root -p multiart_ai < database/schema.sql
   ```
4. Point your webserver's document root at `public/`, or for local dev:
   ```
   php -S 0.0.0.0:5000 -t public
   ```
5. Create the first admin account: `POST /api/auth/setup` with
   `{ "email": "...", "password": "..." }` (blocked once any admin exists).

## Deploying behind Apache without changing the doc root

If your host's doc root must stay at the project root (not `public/`), the
top-level `.htaccess` rewrites everything into `public/`. For nginx, point
`root` directly at `public/` and add a `try_files $uri /index.php?$args;`
rule.

## Data migration from MongoDB

This port ships with a fresh schema only — it does not migrate existing
MongoDB data. If you need to move production data over, write a one-off
script that reads each Mongo collection and inserts matching rows here
(keep the existing Mongo `_id` hex strings as the new `id` values so
`dedupeKey`/foreign keys/URLs already embedding those IDs stay valid).

## What changed vs. the Node backend

- `tags` are stored as a comma-separated string column instead of a Mongo
  array, converted to/from a JSON array at the API boundary.
- Full-text search (`GET /api/wallpapers?search=`) uses MySQL `FULLTEXT`
  instead of Mongo's `$text` index.
- Cloudinary calls use a small hand-rolled signed-upload client (cURL) instead
  of the `cloudinary` Node SDK — no behavior difference from the API's POV.
- Everything else (routes, validation rules, business logic, quota/AI-review
  workflow, content filter keyword list) is a direct line-by-line port.
