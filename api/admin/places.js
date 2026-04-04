// api/admin/places.js

import fs from "fs/promises";
import path from "path";

const PATCH_FILE = path.join(process.cwd(), "data", "places.state.json");
const ADMIN_PIN = process.env.ADMIN_PIN || "123456";

function isAuthorized(req) {
  return req.headers["x-admin-pin"] === ADMIN_PIN;
}

async function readPatchFile() {
  try {
    const raw = await fs.readFile(PATCH_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writePatchFile(data) {
  await fs.writeFile(PATCH_FILE, JSON.stringify(data, null, 2), "utf8");
}

function deepMergePatch(target, source) {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return source;
  }

  const out = Array.isArray(target) ? [...target] : { ...(target || {}) };

  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = out[key];

    if (sv && typeof sv === "object" && !Array.isArray(sv)) {
      out[key] = deepMergePatch(tv || {}, sv);
    } else {
      out[key] = sv;
    }
  }

  return out;
}

export default async function handler(req, res) {
  if (!isAuthorized(req)) {
    return res.status(401).json({ ok: false, message: "unauthorized" });
  }

  if (req.method === "POST") {
    const current = await readPatchFile();
    const incoming = req.body || {};
    const next = deepMergePatch(current, incoming);

    await writePatchFile(next);
    return res.status(200).json({ ok: true, data: next });
  }

  if (req.method === "DELETE") {
    await writePatchFile({});
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ ok: false, message: "method_not_allowed" });
}