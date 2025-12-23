import crypto from "node:crypto";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";

const resolveUploadsRoot = () => {
  if (process.env.MEDIA_UPLOAD_DIR) {
    return process.env.MEDIA_UPLOAD_DIR;
  }
  let current = process.cwd();
  for (let i = 0; i < 5; i += 1) {
    const packagePath = path.join(current, "package.json");
    if (fs.existsSync(packagePath)) {
      try {
        const raw = fs.readFileSync(packagePath, "utf8");
        const parsed = JSON.parse(raw) as { workspaces?: string[] };
        if (parsed.workspaces) {
          return path.resolve(current, "storage", "uploads");
        }
      } catch {
        // ignore parsing errors
      }
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return path.resolve(process.cwd(), "storage", "uploads");
};

export const uploadsRoot = resolveUploadsRoot();

export async function ensureUploadsDir() {
  await fsPromises.mkdir(uploadsRoot, { recursive: true });
}

export function buildObjectKey(
  restaurantId: number,
  filename: string,
  folder?: string,
) {
  const extension = path.extname(filename) || ".bin";
  const base = path
    .basename(filename, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  const safeName = base || "asset";
  const token = crypto.randomUUID();
  const parts = [
    `restaurant-${restaurantId}`,
    folder?.trim() || "assets",
    `${safeName}-${token}${extension}`,
  ].filter(Boolean);
  return parts.join("/");
}

export async function writeUploadFile(
  objectKey: string,
  buffer: Buffer,
) {
  await ensureUploadsDir();
  const safeKey = objectKey.replace(/^\/*/, "");
  const destination = path.join(uploadsRoot, safeKey);
  const dir = path.dirname(destination);
  await fsPromises.mkdir(dir, { recursive: true });
  await fsPromises.writeFile(destination, buffer);
  return destination;
}

export async function readUploadFile(objectKey: string) {
  const safeKey = objectKey.replace(/^\/*/, "");
  if (safeKey.includes("..")) {
    throw new Error("Некорректный путь к файлу.");
  }
  const filePath = path.join(uploadsRoot, safeKey);
  const buffer = await fsPromises.readFile(filePath);
  return { filePath, buffer };
}

export const createChecksum = (buffer: Buffer) =>
  crypto.createHash("sha256").update(buffer).digest("hex");
