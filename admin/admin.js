// admin/admin.js

import { loadMenu } from "../core/menuStore.js";
import { loadPlaces } from "../core/placesStore.js";

import { ADMIN_SECTIONS } from "./adminSections.js";
import { renderSection } from "./adminRender.js";
import { buildPatchFromPath } from "./adminActions.js";

/* =========================
   AUTH
========================= */

function hasSession() {
  return localStorage.getItem("admin") === "1";
}

function setSession() {
  localStorage.setItem("admin", "1");
}

function clearSession() {
  localStorage.removeItem("admin");
}

/* =========================
   UI
========================= */

function showApp() {
  document.getElementById("adminApp").style.display = "block";
  document.getElementById("adminLock").style.display = "none";
  document.getElementById("adminBtn").style.display = "block";
}

function hideApp() {
  document.getElementById("adminApp").style.display = "none";
  document.getElementById("adminLock").style.display = "block";
  document.getElementById("adminBtn").style.display = "none";
}

/* =========================
   LOGIN
========================= */

async function doLogin() {
  const pin = prompt("Nhập mã quản trị:");
  if (!pin) return;

  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin })
  });

  if (res.ok) {
    setSession();
    showApp();
    await boot();
  } else {
    alert("Sai mã");
  }
}

/* =========================
   CORE
========================= */

async function boot() {
  try {
    await Promise.all([loadMenu(), loadPlaces()]);
    renderAll();
  } catch (e) {
    console.error("Admin boot error:", e);
  }
}

function renderAll() {
  Object.values(ADMIN_SECTIONS).forEach(renderSection);
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll('[data-path]').forEach(el => {
    el.onchange = async () => {
      const kind = el.dataset.kind;
      const section = ADMIN_SECTIONS[kind];

      const patch = buildPatchFromPath(el.dataset.path, el.checked);

      await section.save(patch);
      await section.reload();

      renderSection(section);
      bindEvents();
    };
  });
}

/* =========================
   INIT
========================= */

async function initAdmin() {
  console.log("ADMIN INIT");

  document.getElementById("loginBtn")?.addEventListener("click", doLogin);

  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    clearSession();
    location.reload();
  });

  if (hasSession()) {
    showApp();
    await boot();
  } else {
    hideApp();
  }
}

initAdmin();