
import { UI, setState } from "../../core/state.js";
import { getCategoriesForMode } from "../../data/helpers.js";
import { translate } from "../utils/translate.js";
import { renderCategory } from "./renderCategory.js";
import { renderIcon } from "../components/icons.js";
import { getContext } from "../../core/context.js";

export function renderHub(){

  const menuEl = document.getElementById("hubMenu");

  const ctx = getContext();
  const mode = ctx?.anchor?.type || null;

  const panels = Object.keys(MENU).filter(key => {
    const cat = MENU[key];
    if (!cat.active) return false;
    if (!cat.allow) return true;
    if (!mode) {
      return cat.allow.includes("table") || cat.allow.includes("area");
    }
    return cat.allow.includes(mode);
  });

  let panel = UI.view.panel;

  if(!panels.includes(panel)){
    panel = panels[0];
  }

  menuEl.innerHTML = panels.map(cat=>
    `<button class="hub-btn${panel===cat.key?" active":""}"
            data-key="${cat.key}">
      ${renderIcon(cat.key,"hub-icon")}
      <span class="hub-label">
        ${translate(cat.label)}
      </span>
    </button>

  `).join("");

  menuEl.querySelectorAll("button").forEach(btn=>{
    btn.onclick=()=>{
      setState({view:{panel:btn.dataset.key}});
    };
  });

  renderCategory(panel);
}