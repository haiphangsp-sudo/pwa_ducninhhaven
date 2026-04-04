// admin/admin.js

import { loadMenu } from "../core/menuStore.js";
import { loadPlaces } from "../core/placesStore.js";

import { ADMIN_SECTIONS } from "./adminSections.js";
import { renderSection } from "./adminRender.js";
import { buildPatchFromPath } from "./adminActions.js";

<<<<<<< HEAD
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
=======
async function boot() {
>>>>>>> 3046edf (1z)
  await Promise.all([loadMenu(), loadPlaces()]);
  renderAll();
}

<<<<<<< HEAD
async function doLogin() {
  const pin = prompt("Nhập mã quản trị");
  if (!pin) return;

<<<<<<< HEAD
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
=======
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin })
  });
>>>>>>> 2dc6523 (s)

  if (!res.ok) {
    alert("Sai mã");
    return;
  }

  saveSession(pin);
  showApp();
  await bootAdmin();
}

<<<<<<< HEAD
const loginBtn = document.getElementById("loginBtn");
if (loginBtn) loginBtn.onclick = doLogin;
=======
document.getElementById("loginBtn")?.addEventListener("click", doLogin);
>>>>>>> 2dc6523 (s)

if (hasSession()) {
  showApp();
  await bootAdmin();
} else {
  hideApp();
}

/* ======================================================
   ADMIN CONFIG
====================================================== */

const ADMIN_SECTIONS = {
  menu: {
    rootId: "adminMenu",
    getData: () => MENU,
    buildNodes: buildMenuNodes,
    save: saveMenuState,
    reload: loadMenu
  },
  place: {
    rootId: "adminPlaces",
    getData: () => PLACES,
    buildNodes: buildPlaceNodes,
    save: savePlacesState,
    reload: loadPlaces
  }
};

/* ======================================================
   RENDER ENGINE
====================================================== */

=======
>>>>>>> 3046edf (1z)
function renderAll() {
  Object.values(ADMIN_SECTIONS).forEach(renderSection);
  bindEvents();
}

<<<<<<< HEAD
<<<<<<< HEAD
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

=======
function renderSection(kind) {
  const section = ADMIN_SECTIONS[kind];
  const root = document.getElementById(section.rootId);
  if (!root) return;

  const nodes = section.buildNodes(section.getData());
  root.innerHTML = nodes.map(renderNode).join("");
}

function renderNode(node) {
  const childrenHtml = (node.children || []).map(renderNode).join("");

  if (node.variant === "group-header") {
    return `
      <section class="cat">
        <div class="cat-header flex between">
          <label class="cat-title">
            ${node.icon ? `<span class="icon">${node.icon}</span>` : ""}
            ${node.label}
          </label>
          ${
            node.path
              ? `
              <input
                type="checkbox"
                data-kind="${node.kind}"
                data-path="${node.path}"
                ${node.checked ? "checked" : ""}>
            `
              : ""
          }
        </div>
        <div class="items">${childrenHtml}</div>
      </section>
    `;
  }

  if (node.variant === "item-with-children") {
    return `
      <div class="item">
        <label>
          <input
            type="checkbox"
            data-kind="${node.kind}"
            data-path="${node.path}"
            ${node.checked ? "checked" : ""}>
          ${node.label}
        </label>
        <div class="opts">${childrenHtml}</div>
      </div>
    `;
  }

  return `
    <div class="item flex between">
      <label>
        ${node.label}
        ${node.meta ? ` <small>${node.meta}</small>` : ""}
      </label>
      <input
        type="checkbox"
        data-kind="${node.kind}"
        data-path="${node.path}"
        ${node.checked ? "checked" : ""}>
    </div>
  `;
}

/* ======================================================
   NODE BUILDERS
====================================================== */

function buildMenuNodes(menu) {
  return Object.entries(menu || {}).map(([catKey, cat]) => ({
    kind: "menu",
    variant: "group-header",
    label: cat?.label?.vi || catKey,
    path: `${catKey}.active`,
    checked: cat?.active !== false,
    children: Object.entries(cat?.products || {}).map(([productKey, product]) => ({
      kind: "menu",
      variant: cat?.ui === "article" ? "simple-item" : "item-with-children",
      label: product?.label?.vi || productKey,
      path: `${catKey}.products.${productKey}.active`,
      checked: product?.active !== false,
      children:
        cat?.ui === "article"
          ? []
          : Object.entries(product?.variants || {}).map(([variantKey, variant]) => ({
              kind: "menu",
              variant: "simple-item",
              label: variant?.label?.vi || variantKey,
              path: `${catKey}.products.${productKey}.variants.${variantKey}.active`,
              checked: variant?.active !== false,
              children: []
            }))
    }))
  }));
}

function buildPlaceNodes(places) {
  return Object.entries(places || {}).map(([typeKey, group]) => ({
    kind: "place",
    variant: "group-header",
    icon: group?.meta?.icon || "",
    label: group?.meta?.label?.vi || typeKey,
    path: `${typeKey}.meta.active`,
    checked: group?.meta?.active !== false,
    children: (group?.items || []).map(item => ({
      kind: "place",
      variant: "simple-item",
      label: item?.label?.vi || item?.id || "",
      meta: item?.id ? `(${item.id})` : "",
      path: `${typeKey}.itemsById.${item.id}.active`,
      checked: item?.active !== false,
      children: []
    }))
  }));
}

>>>>>>> 2dc6523 (s)
/* ======================================================
   EVENTS
====================================================== */

=======
>>>>>>> 3046edf (1z)
function bindEvents() {
  document.querySelectorAll('[data-path]').forEach(el => {
    el.onchange = async () => {
      const kind = el.dataset.kind;
      const section = ADMIN_SECTIONS[kind];

<<<<<<< HEAD
<<<<<<< HEAD
      try {
        if (kind === "place") {
          await savePlacesState(patch);
          await loadPlaces();
        } else {
          await saveMenuState(patch);
          await loadMenu();
        }

        render();
=======
      if (!section) return;

      try {
        await section.save(patch);
        await section.reload();
        renderSection(kind);
        bindEvents();
>>>>>>> 2dc6523 (s)
      } catch (err) {
        console.error("[Admin] Save error:", err);
        alert("Không thể lưu thay đổi");
      }
    };
  });

<<<<<<< HEAD
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
=======
  document.getElementById("resetBtn")?.addEventListener("click", async () => {
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
  });
>>>>>>> 2dc6523 (s)

  document.getElementById("logoutBtn")?.addEventListener("click", logout);
}

/* ======================================================
<<<<<<< HEAD
   PATCH BUILDER
=======
   PATCH
>>>>>>> 2dc6523 (s)
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
=======
      const patch = buildPatchFromPath(el.dataset.path, el.checked);

      await section.save(patch);
      await section.reload();

      renderSection(section);
      bindEvents();
    };
  });
}

await boot();
>>>>>>> 3046edf (1z)
