// admin/adminActions.js

function getPin() {
  return localStorage.getItem("admin_pin") || "";
}

export function buildPatchFromPath(pathStr, value) {
  const path = pathStr.split(".");
  const out = {};

  let ref = out;
  for (let i = 0; i < path.length - 1; i++) {
    ref[path[i]] = {};
    ref = ref[path[i]];
  }

  ref[path[path.length - 1]] = value;
  return out;
}

export async function saveMenuState(patch) {
  const r = await fetch("/api/admin/menu", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-pin": getPin()
    },
    body: JSON.stringify(patch)
  });

  if (!r.ok) throw new Error("menu_save_failed");
}

export async function savePlacesState(patch) {
  const r = await fetch("/api/admin/places", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-pin": getPin()
    },
    body: JSON.stringify(patch)
  });

  if (!r.ok) throw new Error("places_save_failed");
}