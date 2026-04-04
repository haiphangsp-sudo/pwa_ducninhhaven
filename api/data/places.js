// api/data/places.js

import fs from "fs/promises";
import path from "path";

const PATCH_FILE = path.join(process.cwd(), "data", "places.state.json");

async function readPatchFile() {
  try {
    const raw = await fs.readFile(PATCH_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  const patch = await readPatchFile();
  return res.status(200).json(patch);
}