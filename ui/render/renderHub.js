// ui/renderHub.js

import { UI, setState } from "../../core/state.js";
import { MENU } from "../../core/menuStore.js";
import { translate } from "../utils/translate.js";
import { renderCategory } from "./renderCategory.js";
import { getContext } from "../../core/context.js";
import { getCategories } from "../../core/menuQuery.js";


export function renderHub(){

  const menuEl = document.getElementById("hubMenu");
  const ctx = getContext();

  const anchorType = ctx?.anchor?.type || null;

  /* =======================================================
     LỌC CATEGORY THEO allow + active
  ======================================================= */

  const panels = getCategories();
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
  //${renderIcon(key,"hub-icon")}
  menuEl.innerHTML = panels.map(key=>`

    <button class="hub-btn btn center${panel===key ? " is-active" : ""}"
      data-key="${key}">
      <span class="hub-icon">
        <img src="/icons/${key}.svg">
      </span>
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

      if(btn.classList.contains("is-active")) return;

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