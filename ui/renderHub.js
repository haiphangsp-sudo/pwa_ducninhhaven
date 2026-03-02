import { UI } from "../core/state.js";
import { MENU } from "../core/menuStore.js";
import { setState } from "../core/state.js";
import { getContext } from "../core/context.js";
import { translate } from "./utils/translate.js";
import { renderCategory } from "./renderCategory.js";
import { ICONS } from "./icons.js";

export function renderHub(){

  const menuEl = document.getElementById("hubMenu");
  const contentEl = document.getElementById("hubContent");
  if(!menuEl || !contentEl) return;

  const ctx=getContext();

  /* ---------- FILTER PANELS BY CAPABILITY ---------- */

  const panels = Object.entries(MENU)
    .filter(([,cat])=>{
      if(cat.active===false) return false;
      if(!cat.allow) return true;
      if(!ctx) return false;
      return cat.allow.includes(ctx.type);
    })
    .map(([key])=>key);

  /* ---------- AUTO FIX PANEL ---------- */

  let panel = UI.view.panel;
  if(!panels.includes(panel)) panel = panels[0];

  /* ---------- MENU LEFT ---------- */

  menuEl.innerHTML = panels.map(key=>`
    <button class="hub-btn ${panel===key?"active":""}" data-key="${key}">
      <span class="hub-icon">${ICONS[key] || ""}</span>
      <span class="hub-label">${translate(MENU[key].label)}</span>
    </button>
  `).join("");

  menuEl.querySelectorAll("button").forEach(btn=>{
    btn.onclick = ()=>{
      setState({view:{panel:btn.dataset.key}});
    };
  });

  /* ---------- CONTENT RIGHT ---------- */

  if(panel)
    renderCategory(contentEl, panel);
  else
    contentEl.innerHTML="";
}