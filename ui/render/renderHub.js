
import { UI, setState } from "../../core/state.js";
import { MENU } from "../../core/menuStore.js";
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

  menuEl.innerHTML = panels.map(key=>
    `<button class="hub-btn${panel===key?" active":""}"
            data-key="${key}">
      ${renderIcon(key,"hub-icon")}
      <span class="hub-label">
        ${translate(MENU[key].label)}
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