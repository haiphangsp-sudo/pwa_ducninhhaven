// admin/admin.js

import { loadMenu } from "../core/menuStore.js";
import { loadPlaces } from "../core/placesStore.js";

import { ADMIN_SECTIONS } from "./adminSections.js";
import { renderSection } from "./adminRender.js";
import {
  buildPatchFromPath,
  resetAdminState
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
  document.getElementById("adminApp").style.display = "block";
  document.getElementById("adminLock").style.display = "none";
  document.getElementById("adminBtn").style.display = "block";
}

function hideApp() {
  document.getElementById("adminApp").style.display = "none";
  document.getElementById("adminLock").style.display = "block";
  document.getElementById("adminBtn").style.display = "none";
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
      headers: { "Content-Type": "application/json" },
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
   CORE
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
  Object.values(ADMIN_SECTIONS).forEach(renderSection);

  bindToggleEvents();
  bindStaticButtons();
}

/* =======================================================
   EVENTS - TOGGLE
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
   EVENTS - STATIC
======================================================= */

function bindStaticButtons() {

  // RESET
  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.onclick = async () => {
      const ok = confirm("Khôi phục toàn bộ Menu và Places về mặc định?");
      if (!ok) return;

      resetBtn.disabled = true;

      try {
        await resetAdminState();

        await Promise.all([
          loadMenu(),
          loadPlaces()
        ]);

        renderAll();

        alert("Đã khôi phục mặc định");

      } catch (err) {
        console.error("[Admin] Reset error:", err);

        if (err.message === "unauthorized") {
          logout();
          return;
        }

        alert("Không thể khôi phục mặc định");

      } finally {
        resetBtn.disabled = false;
      }
    };
  }

  // LOGOUT
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.onclick = logout;
  }
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
}

initAdmin();