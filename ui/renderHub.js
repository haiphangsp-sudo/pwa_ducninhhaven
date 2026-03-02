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

  const panels = Object.keys(MENU);

  

  /* ---------- AUTO FIX PANEL ---------- */

  let panel = UI.view.panel;
  if(!panels.includes(panel)) panel = panels[0];

  /* ---------- MENU LEFT ---------- */
menuEl.innerHTML = panels.map(key=>{

  const cat = MENU[key];
  const enabled = allowed(cat);

  return `
    <button class="hub-btn ${panel===key?"active":""} ${enabled?"":"disabled"}"
            data-key="${key}">
      <span class="hub-icon">${ICONS[key] || ""}</span>
      <span class="hub-label">${translate(cat.label)}</span>
    </button>
  `;
}).join("");

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
function allowed(node){
  if(!node.allow) return true;
  const ctx=getContext();
  if(!ctx) return false;
  return node.allow.includes(ctx.type);
}