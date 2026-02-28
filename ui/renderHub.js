// ui/renderHub.js

import { UI } from "../core/state.js";
import { MENU } from "../core/menuStore.js";
import { dispatch } from "../core/events.js";
import { translate } from "./utils/translate.js";
import { renderCategory } from "./renderCategory.js";
import { ICONS } from "./icons.js";
export function renderHub(){

  const menuEl = document.getElementById("hubMenu");
  const contentEl = document.getElementById("hubContent");

  if(!menuEl || !contentEl) return;

  /* ----- MENU LEFT ----- */

  const panels = Object.keys(MENU);
menuEl.innerHTML = panels.map(key=>`
  <button class="hub-btn ${UI.view.panel===key?"active":""}"
    data-key="${key}">
    <span class="hub-icon">${ICONS[key] || ""}</span>
    <span class="hub-label">${translate(MENU[key].label)}</span>
  </button>
`).join("");

  menuEl.querySelectorAll("button").forEach(btn=>{
    btn.onclick = ()=>dispatch("SET_PANEL",{ panel:btn.dataset.key });
  });

  /* ----- CONTENT RIGHT ----- */

  renderCategory(contentEl, UI.view.panel);
}
