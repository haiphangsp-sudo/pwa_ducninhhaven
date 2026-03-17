// ui/renderHub.js

import { UI, setState } from "../../core/state.js";
import { translate } from "../utils/translate.js";
import { renderPanel } from "./renderPanel.js";
import { getCategories } from "../../core/menuQuery.js";

export function renderHub(){

  const menuEl = document.getElementById("hubMenu");

  const panels = getCategories();
  /* =======================================================
     PANEL ACTIVE
  ======================================================= */

  let panel = UI.view.panel;

  if(!panels.find(p => p.key === panel)){
    panel = panels[0]?.key || "intro";
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

      renderPanel(key);

    };

  });

  /* =======================================================
     RENDER CATEGORY
  ======================================================= */

  renderPanel(panel);

}