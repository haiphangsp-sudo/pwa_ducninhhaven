
import { validateMenu, normalizeMenu } from "./menuSchema.js";
import { setState } from "./state.js";
import { deepMerge } from "../data/helpers.js";


export let MENU = {};

export async function loadMenu() {
  const base = await fetch("/data/menu.json", { cache: "no-store" }).then(r => r.json());

  normalizeMenu(base);
  validateMenu(base);

  let state = {};
  try {
    state = await fetch("/api/data/menu", { cache: "no-store" }).then(r => r.json());
  } catch {
    console.warn("Không thể tải trạng thái menu từ API");
  }

  MENU = deepMerge(base, state);

  setState({ 
    menu: { 
      data: MENU, 
      status: "ready",
      updatedAt: Date.now() 
    } 
  });
}
