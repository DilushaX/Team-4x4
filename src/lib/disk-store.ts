import fs from "fs";
import path from "path";

const LOCAL_STORE_PATH = path.join(process.cwd(), "data", "store.json");
const VERCEL_STORE_PATH = path.join("/tmp", "team4x4_store.json");

export function getDiskStore(): any {
  try {
    const targetPath = process.env.VERCEL ? VERCEL_STORE_PATH : LOCAL_STORE_PATH;
    if (fs.existsSync(targetPath)) {
      const raw = fs.readFileSync(targetPath, "utf-8");
      return JSON.parse(raw);
    }
    if (fs.existsSync(LOCAL_STORE_PATH)) {
      const raw = fs.readFileSync(LOCAL_STORE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch {
    /* Safe ignore */
  }
  return null;
}

export function saveDiskStore(data: any): void {
  try {
    const targetPath = process.env.VERCEL ? VERCEL_STORE_PATH : LOCAL_STORE_PATH;
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    /* Safe ignore */
  }
}
