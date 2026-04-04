import { kv } from "@vercel/kv";

export default async function handler(req, res) {

  if (req.headers["x-admin-pin"] !== process.env.ADMIN_PIN)
    return res.status(401).end();

  try {

    if (req.method === "POST") {
      const patch = req.body || {};
      let state = await kv.get("menuState") || {};

      state = mergePatch(state, patch);
      await kv.set("menuState", state);

      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      await kv.del("menuState");
      return res.status(200).json({ ok: true });
    }

    return res.status(405).end();

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}

function mergePatch(base, patch) {
  for (const k in patch) {
    if (
      typeof patch[k] === "object" &&
      patch[k] !== null &&
      !Array.isArray(patch[k])
    ) {
      base[k] = mergePatch(base[k] || {}, patch[k]);
    } else {
      base[k] = patch[k];
    }
  }
  return base;
}