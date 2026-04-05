// admin/adminActions.js

function getPin() {
  return localStorage.getItem("admin_pin") || "";
}

export function buildPatchFromPath(pathStr, value) {
  const path = String(pathStr || "").split(".").filter(Boolean);
  const out = {};

  let ref = out;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    ref[key] = {};
    ref = ref[key];
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

  if (r.status === 401) throw new Error("unauthorized");
  if (!r.ok) throw new Error(await safeReadText(r) || "menu_save_failed");

  return r.json().catch(() => ({ ok: true }));
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

  if (r.status === 401) throw new Error("unauthorized");
  if (!r.ok) throw new Error(await safeReadText(r) || "places_save_failed");

  return r.json().catch(() => ({ ok: true }));
}

export async function resetMenuState() {
  const r = await fetch("/api/admin/menu", {
    method: "DELETE",
    headers: {
      "x-admin-pin": getPin()
    }
  });

  if (r.status === 401) throw new Error("unauthorized");
  if (!r.ok) throw new Error(await safeReadText(r) || "reset_menu_failed");

  return true;
}

export async function resetPlacesState() {
  const r = await fetch("/api/admin/places", {
    method: "DELETE",
    headers: {
      "x-admin-pin": getPin()
    }
  });

  if (r.status === 401) throw new Error("unauthorized");
  if (!r.ok) throw new Error(await safeReadText(r) || "reset_places_failed");

  return true;
}

async function safeReadText(res) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}