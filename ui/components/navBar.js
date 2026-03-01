// ui/components/navBar.js

import { initLangSwitch } from "../langController.js";
import { renderContextBar } from "../ui/renderContextBar.js";

export function renderNavBar(){

  const el = document.getElementById("contextBar");

  
el.innerHTML = `
  <div class="nav">
    <div class="nav-bar nav-left"> Duc Ninh Haven </div>
    <div class="nav-bar nav-center"></div>
    <div class="nav-bar nav-right">
      <div id="langSwitch" class="lang-switch">
        <button data-lang="vi">VI</button> <button data-lang="en">EN</button>
      </div>
    </div>
  </div>`;
  initLangSwitch();
  renderContextBar();
  
};

/* ---------- helpers ---------- */

