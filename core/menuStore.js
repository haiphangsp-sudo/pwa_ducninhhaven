
import { validateMenu, normalizeMenu } from "./menuSchema.js";

export let MENU = {};

export async function loadMenu() {
  const base = await fetch("/data/menu.json", { cache: "no-store" }).then(r => r.json());

  normalizeMenu(base);
  validateMenu(base);

  let state = {};
  try {
    state = await fetch("/api/menu/state", { cache: "no-store" }).then(r => r.json());
  } catch {
    console.warn("Không thể tải trạng thái menu từ API");
  }

  MENU = deepMerge(base, state);

  setState({ 
      menu: { 
        data: rawMenu,
        status: "ready" 
      } 
  });
}

function deepMerge(base, patch) {
  const out = structuredClone(base);

  for (const k in patch) {
    if (
      typeof patch[k] === "object" &&
      patch[k] !== null &&
      !Array.isArray(patch[k]) &&
      typeof out[k] === "object"
    ) {
      out[k] = deepMerge(out[k] || {}, patch[k]);
    } else {
      out[k] = patch[k];
    }
  }

  return out;
}