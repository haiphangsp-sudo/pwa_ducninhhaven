// api/data/places.js
import { kv } from "@vercel/kv";

const STATE_KEY = "placesState";

export default async function handler(req, res) {
  try {
    const state = (await kv.get(STATE_KEY)) || {};
    return res.status(200).json(state);
  } catch (e) {
    console.error("[api/data/places]", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
}