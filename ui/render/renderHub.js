import { UI, setState } from "../../core/state.js";
import { getContext } from "../../core/context.js";

import { getCategoriesForMode } from "../../data/helpers.js";

import { ICONS } from "../components/icons.js";
import { translate } from "../utils/translate.js";

import { renderCategory } from "./renderCategory.js";


export function renderHub(){

  const hubMenu = document.getElementById("hubMenu");

  if(!hubMenu) return;

  const ctx = getContext();
  const mode = ctx?.anchor?.type || "table";

  const categories = getCategoriesForMode(mode);

  let active = UI.view.panel;

  if(!categories.find(c=>c.key===active)){
    active = categories[0]?.key;
  }

  hubMenu.innerHTML = `
  <div class="container grid grid-3">

    ${categories.map(cat=>`

      <button
        class="card hub-btn ${active===cat.key?"active":""}"
        data-key="${cat.key}">

        <div class="row gap-m">

          <div class="icon">
            ${ICONS[cat.key] || ""}
          </div>

          <div class="card-title">
            ${translate(cat.label)}
          </div>

        </div>

      </button>

    `).join("")}

  </div>
  `;


  hubMenu.querySelectorAll(".hub-btn").forEach(btn=>{

    btn.onclick=()=>{

      const key = btn.dataset.key;

      setState({
        view:{panel:key}
      });

      renderCategory(key);

    };

  });

}