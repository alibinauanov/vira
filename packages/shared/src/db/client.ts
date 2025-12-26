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

const prismaClientSingleton = () =>
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL ?? defaultDatabaseUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    // Optimize connection pooling for better performance
    ...(process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("file:")
      ? {
          // For PostgreSQL and other remote databases, use connection pooling
          // Prisma automatically manages connection pooling, but we can optimize
        }
      : {
          // For SQLite, enable WAL mode for better concurrent performance
          // This is handled at the database level, not Prisma level
        }),
  });

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export const resolvedDatabaseUrl = process.env.DATABASE_URL ?? defaultDatabaseUrl;
