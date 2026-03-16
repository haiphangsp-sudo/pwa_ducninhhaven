import { getOptions } from "../../core/menuQuery.js";
import { translate } from "../utils/translate.js";
import { categoryOpt } from "../components/categoryOption.js";

export function renderMenu(category){

  const type = category.ui;   // cart | instant

  return category.items.map(item => {

    const title = translate(item.label);

    const options = getOptions(category.key, item.key);

    const cards = options.map(opt =>
      categoryOpt(opt, item.key, category.key, type)
    ).join("");

    return `
      <div class="menu-group">

        <h2 class="menu-group-title">
          ${title}
        </h2>

        <div class="menu-grid grid">
          ${cards}
        </div>

      </div>
    `;

  }).join("");
}