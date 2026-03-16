// ui/renderHub.js

import { UI, setState } from "../../core/state.js";
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
  menuEl.innerHTML = panels.map(cat=>`

    <button class="hub-btn btn center${panel===cat.key ? " is-active" : ""}"
      data-key="${cat.key}">
      <span class="hub-icon">
        <img src="/icons/${cat.key}.svg">
      </span>
      <span class="hub-label">
        ${translate(cat.label)}
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