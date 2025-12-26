import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const loadEnvFromRoot = () => {
  if (process.env.DATABASE_URL) return;
  let current = process.cwd();

  for (let i = 0; i < 5; i += 1) {
    const envPath = path.join(current, ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      for (const rawLine of content.split("\n")) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) continue;
        const separatorIndex = line.indexOf("=");
        if (separatorIndex === -1) continue;
        const key = line.slice(0, separatorIndex).trim();
        let value = line.slice(separatorIndex + 1).trim();
        if (
          (value.startsWith("\"") && value.endsWith("\"")) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
      return;
    }
    const parent = path.dirname(current);
    if (parent === current) return;
    current = parent;
  }
};

loadEnvFromRoot();

const defaultDatabaseUrl = `file:${path.resolve(
  process.cwd(),
  "../../packages/shared/prisma/dev.db",
)}`;

const prismaClientSingleton = () => {
  const databaseUrl = process.env.DATABASE_URL ?? defaultDatabaseUrl;
  const isPostgreSQL = !databaseUrl.startsWith("file:");

  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    // Optimize for PostgreSQL connection pooling
    ...(isPostgreSQL
      ? {
          // Prisma uses connection pooling automatically, but we can hint at optimal settings
          // The connection pool size is managed by the DATABASE_URL connection string parameters
          // For Supabase/PostgreSQL: add ?connection_limit=10&pool_timeout=20 to DATABASE_URL
        }
      : {}),
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export const resolvedDatabaseUrl = process.env.DATABASE_URL ?? defaultDatabaseUrl;
