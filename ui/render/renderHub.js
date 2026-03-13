// ui/renderHub.js

import { UI, setState } from "../../core/state.js";
import { MENU } from "../../core/menuStore.js";
import { translate } from "../utils/translate.js";
import { renderCategory } from "./renderCategory.js";
import { renderIcon } from "../components/icons.js";
import { getContext } from "../../core/context.js";

export function renderHub(){

  const menuEl = document.getElementById("hubMenu");
  const ctx = getContext();

  const anchorType = ctx?.anchor?.type || null;

  /* =======================================================
     LỌC CATEGORY THEO allow + active
  ======================================================= */

  const panels = Object.keys(MENU).filter(key=>{

    const cat = MENU[key];

    if(!cat.active) return false;

    if(!cat.allow) return true;

    if(!anchorType){
      return cat.allow.includes("table") || cat.allow.includes("area");
    }

    return cat.allow.includes(anchorType);

  });

  /* =======================================================
     PANEL ACTIVE
  ======================================================= */

  let panel = UI.view.panel;

  if(!panels.includes(panel)){
    panel = panels[0];
  }

  /* =======================================================
     RENDER MENU
  ======================================================= */

  menuEl.innerHTML = panels.map(key=>`

    <button class="hub-btn btn center${panel===key ? " active" : ""}"
      data-key="${key}">
      ${renderIcon(key,"hub-icon")}
      <span class="hub-label">
        ${translate(MENU[key].label)}
      </span>
    </button>

  `).join("");

  /* =======================================================
     CLICK EVENT
  ======================================================= */

  menuEl.querySelectorAll(".hub-btn").forEach(btn=>{

    btn.onclick = ()=>{

      const key = btn.dataset.key;

      setState({
        view:{ panel:key }
      });

      renderCategory(key);

    };

  });

  /* =======================================================
     RENDER CATEGORY
  ======================================================= */

  renderCategory(panel);

}