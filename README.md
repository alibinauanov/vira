# Vira

Vira is a monorepo for the restaurant SaaS:

- Taplink client page: `apps/taplink`
- Admin panel: `apps/admin`
- Shared DB + API helpers: `packages/shared`

## Prerequisites

- Node.js 20+
- PostgreSQL

## Environment variables

Create `.env` in the repo root:

```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Optional local file storage path (defaults to ./storage/uploads)
MEDIA_UPLOAD_DIR=/absolute/path/to/uploads
```

Clerk authentication is configured in the Clerk dashboard. Set the instance to email + password only (disable phone numbers) so sign-up and sign-in never ask for a phone. On first admin sign-in, the app links the Clerk user to Supabase data by creating a `restaurant_members` row and storing `restaurantId`/`restaurantSlug` in Clerk private metadata.

## Install

```
npm install
```

## Database setup

Prisma schema lives in `packages/shared/prisma/schema.prisma`.

```
cd packages/shared
npx prisma generate
npx prisma migrate dev --name multi-tenant
cd ../..

# Backfill existing reservations with restaurant_id
npm run db:backfill-reservations
```

## Development

```
# Taplink client page
npm run dev:taplink

# Admin panel
npm run dev:admin
```

## Media uploads

Uploads are stored on disk (local) and served via `/api/media/...` in both apps. The default directory is `storage/uploads` at the repo root. Override with `MEDIA_UPLOAD_DIR`.

## Smoke tests

1. Open `http://localhost:3000/{slug}` (taplink) and create a booking.
2. Sign in to Clerk and open `http://localhost:3001/{slug}/admin` to see bookings.
3. In admin: configure seating map, update menu items, and upload images.
4. Customize client page buttons/background and confirm changes appear on taplink home.
5. Configure integrations and verify ORDER/WHATSAPP/KASPI buttons behave as placeholders.
