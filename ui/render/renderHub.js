
import { UI, setState } from "../../core/state.js";
import { getCategoriesForMode } from "../../data/helpers.js";
import { translate } from "../utils/translate.js";
import { renderCategory } from "./renderCategory.js";
import { renderIcon } from "../components/icons.js";
import { getContext } from "../../core/context.js";

export function renderHub(){

  const menuEl = document.getElementById("hubMenu");

  const ctx = getContext();
  const mode = ctx?.anchor?.type || "table";

  const categories = getCategoriesForMode(mode);

  let panel = UI.view.panel;

  if(!categories.find(c=>c.key===panel)){
    panel = categories[0]?.key;
  }

  menuEl.innerHTML = categories.map(cat=>
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