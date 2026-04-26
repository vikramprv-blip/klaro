import crypto from "crypto";
import fs from "fs";

export function generateFileHash(path) {
  const file = fs.readFileSync(path);
  return crypto.createHash("sha256").update(file).digest("hex");
}
