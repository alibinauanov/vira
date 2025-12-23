import { prisma, resolvedDatabaseUrl } from "./client";

let schemaReady = false;

export async function ensureSchema() {
  if (schemaReady) return;
  if (!resolvedDatabaseUrl.startsWith("file:")) {
    schemaReady = true;
    return;
  }

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Reservation" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "restaurantId" INTEGER,
      "businessSlug" TEXT NOT NULL,
      "tableLabel" TEXT,
      "tableSeats" INTEGER,
      "startAt" DATETIME NOT NULL,
      "endAt" DATETIME NOT NULL,
      "partySize" INTEGER NOT NULL,
      "name" TEXT NOT NULL,
      "phone" TEXT NOT NULL,
      "comment" TEXT,
      "status" TEXT NOT NULL DEFAULT 'NEW' CHECK("status" IN ('NEW', 'CONFIRMED', 'CANCELLED')),
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const reservationColumns = (await prisma.$queryRawUnsafe<
    { name: string }[]
  >(`PRAGMA table_info("Reservation");`)).map((col) => col.name);
  if (!reservationColumns.includes("restaurantId")) {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Reservation" ADD COLUMN "restaurantId" INTEGER;
    `);
  }

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Reservation_businessSlug_idx" ON "Reservation"("businessSlug");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Reservation_businessSlug_startAt_idx" ON "Reservation"("businessSlug", "startAt");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Reservation_startAt_idx" ON "Reservation"("startAt");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Restaurant" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "slug" TEXT NOT NULL UNIQUE,
      "name" TEXT NOT NULL,
      "phone" TEXT,
      "logoAssetId" INTEGER,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "RestaurantMember" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "restaurantId" INTEGER NOT NULL,
      "clerkUserId" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'OWNER' CHECK("role" IN ('OWNER', 'ADMIN', 'STAFF')),
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "FloorPlan" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "restaurantId" INTEGER NOT NULL,
      "name" TEXT NOT NULL DEFAULT 'Default',
      "isActive" BOOLEAN NOT NULL DEFAULT 1,
      "canvasWidth" INTEGER,
      "canvasHeight" INTEGER,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Table" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "restaurantId" INTEGER NOT NULL,
      "floorPlanId" INTEGER NOT NULL,
      "number" TEXT NOT NULL,
      "label" TEXT,
      "seats" INTEGER NOT NULL DEFAULT 2,
      "x" INTEGER NOT NULL,
      "y" INTEGER NOT NULL,
      "width" INTEGER NOT NULL,
      "height" INTEGER NOT NULL,
      "rotation" INTEGER,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const tableColumns = (await prisma.$queryRawUnsafe<
    { name: string }[]
  >(`PRAGMA table_info("Table");`)).map((col) => col.name);
  if (!tableColumns.includes("seats")) {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Table" ADD COLUMN "seats" INTEGER NOT NULL DEFAULT 2;
    `);
  }

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "RestaurantInfo" (
      "restaurantId" INTEGER NOT NULL PRIMARY KEY,
      "address" TEXT,
      "workSchedule" TEXT,
      "about" TEXT,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "MenuCategory" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "restaurantId" INTEGER NOT NULL,
      "name" TEXT NOT NULL,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "isActive" BOOLEAN NOT NULL DEFAULT 1,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "MenuItem" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "restaurantId" INTEGER NOT NULL,
      "categoryId" INTEGER NOT NULL,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "price" REAL NOT NULL,
      "imageAssetId" INTEGER,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "isAvailable" BOOLEAN NOT NULL DEFAULT 1,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ClientPageConfig" (
      "restaurantId" INTEGER NOT NULL PRIMARY KEY,
      "version" INTEGER NOT NULL DEFAULT 1,
      "theme" TEXT,
      "buttons" TEXT,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Integration" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "restaurantId" INTEGER NOT NULL,
      "type" TEXT NOT NULL CHECK("type" IN ('POS_IIKO', 'POS_RKEEPER', 'WHATSAPP', 'KASPI')),
      "status" TEXT NOT NULL DEFAULT 'DISCONNECTED' CHECK("status" IN ('DISCONNECTED', 'CONFIGURED', 'ACTIVE')),
      "config" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "MediaAsset" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "restaurantId" INTEGER NOT NULL,
      "kind" TEXT NOT NULL CHECK("kind" IN ('LOGO', 'MENU_ITEM_IMAGE', 'BACKGROUND_IMAGE', 'OTHER')),
      "originalFilename" TEXT NOT NULL,
      "mimeType" TEXT NOT NULL,
      "sizeBytes" INTEGER NOT NULL,
      "width" INTEGER,
      "height" INTEGER,
      "storageProvider" TEXT NOT NULL CHECK("storageProvider" IN ('LOCAL', 'S3', 'R2', 'GCS', 'CLOUDINARY')),
      "objectKey" TEXT NOT NULL,
      "publicUrl" TEXT,
      "checksum" TEXT,
      "createdByClerkUserId" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "RestaurantMember_clerkUserId_idx" ON "RestaurantMember"("clerkUserId");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Reservation_restaurantId_idx" ON "Reservation"("restaurantId");
  `);

  schemaReady = true;
}
