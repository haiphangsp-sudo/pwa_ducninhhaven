// api/admin/places.js
import { kv } from "@vercel/kv";

const STATE_KEY = "placesState";

export default async function handler(req, res) {
  if (req.headers["x-admin-pin"] !== process.env.ADMIN_PIN) {
    return res.status(401).json({ ok: false, message: "unauthorized" });
  }

  try {
    if (req.method === "POST") {
      const patch = req.body || {};
      const current = (await kv.get(STATE_KEY)) || {};
      const next = mergePatch(current, patch);

      await kv.set(STATE_KEY, next);
      return res.status(200).json({ ok: true, data: next });
    }

    if (req.method === "DELETE") {
      await kv.del(STATE_KEY);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false, message: "method_not_allowed" });
  } catch (e) {
    console.error("[api/admin/places]", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
}

function mergePatch(target, source) {
  const out = Array.isArray(target) ? [...target] : { ...(target || {}) };

  for (const key of Object.keys(source || {})) {
    const sv = source[key];
    const tv = out[key];

    if (sv && typeof sv === "object" && !Array.isArray(sv)) {
      out[key] = mergePatch(tv || {}, sv);
    } else {
      out[key] = sv;
    }
  }

  return out;
}