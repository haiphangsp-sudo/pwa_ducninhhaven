// ui/renderHub.js
// Điều khiển hiển thị hub (menu + content) 


import { UI } from "../core/state.js";
import { MENU } from "../core/menuStore.js";
import { setState } from "../core/state.js";
import { translate } from "./utils/translate.js";
import { renderCategory } from "./renderCategory.js";
import { ICONS } from "./icons.js";

export function renderHub(){

  const menuEl = document.getElementById("hubMenu");
  const contentEl = document.getElementById("hubContent");
  if(!menuEl || !contentEl) return;

  const panels = Object.keys(MENU);

  let panel = UI.view.panel;
  if(!panels.includes(panel)) panel = panels[0];

  /* ---------- MENU ---------- */

  menuEl.innerHTML = panels.map(key=>`
    <button class="hub-btn ${panel===key?"active":""}"
            data-key="${key}">
      <span class="hub-icon">${ICONS[key] || ""}</span>
      <span class="hub-label">${translate(MENU[key].label)}</span>
    </button>
  `).join("");

  menuEl.querySelectorAll("button").forEach(btn=>{
    btn.onclick=()=>{
      setState({view:{panel:btn.dataset.key}});
    };
  });

  /* ---------- CONTENT ---------- */

  renderCategory(contentEl, panel);
}