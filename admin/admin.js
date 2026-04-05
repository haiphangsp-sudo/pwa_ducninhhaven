// admin/admin.js

import { loadMenu } from "../core/menuStore.js";
import { loadPlaces } from "../core/placesStore.js";

import { ADMIN_SECTIONS } from "./adminSections.js";
import { renderSection } from "./adminRender.js";
import {
  buildPatchFromPath,
  resetMenuState,
  resetPlacesState
} from "./adminActions.js";

/* =======================================================
   AUTH
======================================================= */

function getPin() {
  return localStorage.getItem("admin_pin") || "";
}

function hasSession() {
  return !!getPin();
}

function setSession(pin) {
  localStorage.setItem("admin_pin", pin);
}

function clearSession() {
  localStorage.removeItem("admin_pin");
}

/* =======================================================
   UI
======================================================= */

function showApp() {
  const app = document.getElementById("adminApp");
  const lock = document.getElementById("adminLock");
  const btn = document.getElementById("adminBtn");

  if (app) app.style.display = "block";
  if (lock) lock.style.display = "none";
  if (btn) btn.style.display = "block";
}

function hideApp() {
  const app = document.getElementById("adminApp");
  const lock = document.getElementById("adminLock");
  const btn = document.getElementById("adminBtn");

  if (app) app.style.display = "none";
  if (lock) lock.style.display = "block";
  if (btn) btn.style.display = "none";
}

function activateTab(tabName) {
  document.querySelectorAll("[data-tab]").forEach(btn => {
    btn.classList.toggle("is-active", btn.dataset.tab === tabName);
  });

  document.getElementById("tab-menu")?.classList.toggle("hidden", tabName !== "menu");
  document.getElementById("tab-place")?.classList.toggle("hidden", tabName !== "place");
}

/* =======================================================
   LOGIN
======================================================= */

async function doLogin() {
  const pin = prompt("Nhập mã quản trị:");
  if (!pin) return;

  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ pin })
    });

    if (!res.ok) {
      alert("Sai mã");
      return;
    }

    setSession(pin);
    showApp();
    await boot();
  } catch (err) {
    console.error("[Admin] Login error:", err);
    alert("Không thể đăng nhập");
  }
}

function logout() {
  clearSession();
  location.reload();
}

/* =======================================================
   BOOT / RENDER
======================================================= */

async function boot() {
  try {
    await Promise.all([
      loadMenu(),
      loadPlaces()
    ]);

    renderAll();
  } catch (err) {
    console.error("[Admin] Boot error:", err);
    alert("Không thể tải dữ liệu admin");
  }
}

function renderAll() {
  renderSection(ADMIN_SECTIONS.menu);
  renderSection(ADMIN_SECTIONS.place);

  bindToggleEvents();
  bindStaticButtons();
  bindTabs();
}

/* =======================================================
   TOGGLE EVENTS
======================================================= */

function bindToggleEvents() {
  document.querySelectorAll("[data-path]").forEach(el => {
    el.onchange = async () => {
      const kind = el.dataset.kind;
      const section = ADMIN_SECTIONS[kind];
      if (!section) return;

      const patch = buildPatchFromPath(el.dataset.path, el.checked);

      try {
        await section.save(patch);
        await section.reload();

        renderSection(section);
        bindToggleEvents();
      } catch (err) {
        console.error("[Admin] Save error:", err);

        if (err.message === "unauthorized") {
          logout();
          return;
        }

        alert("Không thể lưu thay đổi");
      }
    };
  });
}

/* =======================================================
   STATIC BUTTONS
======================================================= */

function bindStaticButtons() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.onclick = logout;
  }

  const resetMenuBtn = document.getElementById("resetMenuBtn");
  if (resetMenuBtn) {
    resetMenuBtn.onclick = async () => {
      const ok = confirm("Khôi phục toàn bộ Menu về mặc định?");
      if (!ok) return;

      resetMenuBtn.disabled = true;

      try {
        await resetMenuState();
        await loadMenu();

        renderSection(ADMIN_SECTIONS.menu);
        bindToggleEvents();

        alert("Đã khôi phục Menu");
      } catch (err) {
        console.error("[Admin] Reset menu error:", err);

        if (err.message === "unauthorized") {
          logout();
          return;
        }

        alert("Không thể khôi phục Menu");
      } finally {
        resetMenuBtn.disabled = false;
      }
    };
  }

  const resetPlacesBtn = document.getElementById("resetPlacesBtn");
  if (resetPlacesBtn) {
    resetPlacesBtn.onclick = async () => {
      const ok = confirm("Khôi phục toàn bộ Places về mặc định?");
      if (!ok) return;

      resetPlacesBtn.disabled = true;

      try {
        await resetPlacesState();
        await loadPlaces();

        renderSection(ADMIN_SECTIONS.place);
        bindToggleEvents();

        alert("Đã khôi phục Places");
      } catch (err) {
        console.error("[Admin] Reset places error:", err);

        if (err.message === "unauthorized") {
          logout();
          return;
        }

        alert("Không thể khôi phục Places");
      } finally {
        resetPlacesBtn.disabled = false;
      }
    };
  }
}

/* =======================================================
   TABS
======================================================= */

function bindTabs() {
  document.querySelectorAll("[data-tab]").forEach(btn => {
    btn.onclick = () => {
      activateTab(btn.dataset.tab);
    };
  });
}

/* =======================================================
   INIT
======================================================= */

async function initAdmin() {
  console.log("[Admin] Init");

  document.getElementById("loginBtn")?.addEventListener("click", doLogin);

  if (hasSession()) {
    showApp();
    await boot();
  } else {
    hideApp();
  }

  activateTab("menu");
}

initAdmin();