// admin/admin.js

import { loadMenu, MENU } from "../core/menuStore.js";
import { loadPlaces, PLACES } from "../core/placesStore.js";

/* ======================================================
   SESSION / AUTH
====================================================== */

function hasSession() {
  const pin = localStorage.getItem("admin_pin");
  const expire = Number(localStorage.getItem("admin_pin_expire"));
  return !!pin && !!expire && Date.now() < expire;
}

function getAdminPin() {
  return localStorage.getItem("admin_pin") || "";
}

function saveSession(pin) {
  localStorage.setItem("admin_pin", pin);
  localStorage.setItem("admin_pin_expire", String(Date.now() + 2 * 60 * 60 * 1000));
}

function clearSession() {
  localStorage.removeItem("admin_pin");
  localStorage.removeItem("admin_pin_expire");
}

function showApp() {
  const lock = document.getElementById("adminLock");
  const app = document.getElementById("adminApp");
  const btn = document.getElementById("adminBtn");

  if (lock) lock.style.display = "none";
  if (app) app.style.display = "";
  if (btn) btn.style.display = "";
}

function hideApp() {
  const lock = document.getElementById("adminLock");
  const app = document.getElementById("adminApp");
  const btn = document.getElementById("adminBtn");

  if (lock) lock.style.display = "";
  if (app) app.style.display = "none";
  if (btn) btn.style.display = "none";
}

function logout() {
  clearSession();
  hideApp();
  location.reload();
}

/* ======================================================
   BOOT
====================================================== */

async function bootAdmin() {
  await Promise.all([loadMenu(), loadPlaces()]);
  render();
}

async function doLogin() {
  const pin = prompt("Nhập mã quản trị");
  if (!pin) return;

  let res;
  try {
    res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin })
    });
  } catch {
    alert("Không thể kết nối máy chủ");
    return;
  }

  if (!res.ok) {
    alert("Sai mã");
    return;
  }

  saveSession(pin);
  showApp();
  await bootAdmin();
}

const loginBtn = document.getElementById("loginBtn");
if (loginBtn) loginBtn.onclick = doLogin;

if (hasSession()) {
  showApp();
  await bootAdmin();
} else {
  hideApp();
}

/* ======================================================
   RENDER
====================================================== */

function render() {
  renderMenu();
  renderPlaces();
  bindEvents();
}

function renderMenu() {
  const root = document.getElementById("adminMenu");
  if (!root) return;

  root.innerHTML = Object.entries(MENU || {})
    .map(([catKey, cat]) => `
      <section class="cat">
        <label class="cat-title">
          <input
            type="checkbox"
            data-kind="menu"
            data-path="${catKey}.active"
            ${cat?.active !== false ? "checked" : ""}>
          ${cat?.label?.vi || catKey}
        </label>

        <div class="items">
          ${Object.entries(cat?.products || {})
            .map(([productKey, product]) => `
              <div class="item">
                <label>
                  <input
                    type="checkbox"
                    data-kind="menu"
                    data-path="${catKey}.products.${productKey}.active"
                    ${product?.active !== false ? "checked" : ""}>
                  ${product?.label?.vi || productKey}
                </label>

                ${
                  cat?.ui === "article"
                    ? ""
                    : `
                      <div class="opts">
                        ${Object.entries(product?.variants || {})
                          .map(([variantKey, variant]) => `
                            <label class="opt">
                              <input
                                type="checkbox"
                                data-kind="menu"
                                data-path="${catKey}.products.${productKey}.variants.${variantKey}.active"
                                ${variant?.active !== false ? "checked" : ""}>
                              ${variant?.label?.vi || variantKey}
                            </label>
                          `)
                          .join("")}
                      </div>
                    `
                }
              </div>
            `)
            .join("")}
        </div>
      </section>
    `)
    .join("");
}

function renderPlaces() {
  const root = document.getElementById("adminPlaces");
  if (!root) return;

  root.innerHTML = Object.entries(PLACES || {})
    .map(([typeKey, group]) => `
      <section class="cat">
        <div class="cat-header flex between">
          <label class="cat-title">
            <span class="icon">${group?.meta?.icon || ""}</span>
            ${group?.meta?.label?.vi || typeKey}
          </label>
          <input
            type="checkbox"
            data-kind="place"
            data-path="${typeKey}.meta.active"
            ${group?.meta?.active !== false ? "checked" : ""}>
        </div>

        <div class="items">
          ${(group?.items || [])
            .map(item => `
              <div class="item flex between">
                <label>
                  ${item?.label?.vi || item?.id || ""}
                  <small>(${item?.id || ""})</small>
                </label>
                <input
                  type="checkbox"
                  data-kind="place"
                  data-path="${typeKey}.itemsById.${item.id}.active"
                  ${item?.active !== false ? "checked" : ""}>
              </div>
            `)
            .join("")}
        </div>
      </section>
    `)
    .join("");
}

/* ======================================================
   EVENTS
====================================================== */

function bindEvents() {
  document.querySelectorAll('input[type="checkbox"][data-path]').forEach(cb => {
    cb.onchange = async () => {
      const patch = buildPatchFromPath(cb.dataset.path, cb.checked);
      const kind = cb.dataset.kind;

      try {
        if (kind === "place") {
          await savePlacesState(patch);
          await loadPlaces();
        } else {
          await saveMenuState(patch);
          await loadMenu();
        }

        render();
      } catch (err) {
        console.error("[Admin] Save error:", err);
        alert("Không thể lưu thay đổi");
      }
    };
  });

  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.onclick = async () => {
      try {
        await Promise.all([
          fetch("/api/admin/menu", {
            method: "DELETE",
            headers: { "x-admin-pin": getAdminPin() }
          }),
          fetch("/api/admin/places", {
            method: "DELETE",
            headers: { "x-admin-pin": getAdminPin() }
          })
        ]);

        await bootAdmin();
      } catch (err) {
        console.error("[Admin] Reset error:", err);
        alert("Không thể reset dữ liệu");
      }
    };
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.onclick = logout;
  }
}

/* ======================================================
   PATCH BUILDER
====================================================== */

function buildPatchFromPath(pathStr, value) {
  const path = String(pathStr || "").split(".").filter(Boolean);
  const patch = {};

  let ref = patch;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    ref[key] = {};
    ref = ref[key];
  }

  ref[path[path.length - 1]] = value;
  return patch;
}

/* ======================================================
   API
====================================================== */

async function saveMenuState(patch) {
  const r = await fetch("/api/admin/menu", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-pin": getAdminPin()
    },
    body: JSON.stringify(patch)
  });

  if (r.status === 401) {
    logout();
    return;
  }

  if (!r.ok) {
    throw new Error("save_menu_failed");
  }
}

async function savePlacesState(patch) {
  const r = await fetch("/api/admin/places", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-pin": getAdminPin()
    },
    body: JSON.stringify(patch)
  });

  if (r.status === 401) {
    logout();
    return;
  }

  if (!r.ok) {
    throw new Error("save_places_failed");
  }
}