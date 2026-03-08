// renderHub.js
// Chịu trách nhiệm render menu và nội dung của hub

import { UI } from "../core/state.js";
import { MENU } from "../core/menuStore.js";
import { setState } from "../core/state.js";
import { translate } from "./utils/translate.js";
import { renderCategory } from "./renderCategory.js";
import { ICONS } from "./icons.js";
import { getContext } from "../core/context.js";

export function renderHub(){

  const menuEl = document.getElementById("hubMenu");
  const contentEl = document.getElementById("hubContent");
  if(!menuEl || !contentEl) return;

  const ctx = getContext();

  // ---- QUYỀN DỰA TRÊN ANCHOR, fallback sang ACTIVE ----

  const anchorType = ctx?.anchor?.type || null;

  const panels = Object.keys(MENU).filter(key=>{
  const cat = MENU[key];

  if(!cat.active) return false;

  if(!cat.allow) return true;

  if(!anchorType){
    // visitor mặc định chỉ xem được table/area
    return cat.allow.includes("table") || cat.allow.includes("area");
  }

  return cat.allow.includes(anchorType);
});

  // fallback nếu vẫn rỗng (an toàn tuyệt đối)
  if(!panels.length){
    contentEl.innerHTML = "";
    menuEl.innerHTML = "";
    return;
  }

  let panel = UI.view.panel;
  if(!panels.includes(panel)) panel = panels[0];

  menuEl.innerHTML = panels.map(key=>`
    <button class="hub-btn ${panel===key?"active":""}"
            data-key="${key}"
            data-type=${cat.type}>
      <span class="hub-icon">${ICONS[key] || ""}</span>
      <span class="hub-label">${translate(MENU[key].label)}</span>
    </button>
  `).join("");

  menuEl.querySelectorAll("button").forEach(btn=>{
    btn.onclick=()=>{
      setState({view:{panel:btn.dataset.key}});
    };
  });

  renderCategory(contentEl, panel);
}