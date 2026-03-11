import { getItems, getCategoryType } from "../../data/helpers.js";

import { translate } from "../utils/translate.js";

import { ICONS } from "../components/icons.js";


export function renderCategory(category){

  const hubContent = document.getElementById("hubContent");

  if(!hubContent) return;

  const type = getCategoryType(category);

  const items = getItems(category);

  if(!items.length){

    hubContent.innerHTML = `
      <div class="container">
        <div class="card">
          <div class="card-desc">No items available</div>
        </div>
      </div>
    `;

    return;
  }


  let html = `<div class="container">`;


  // ARTICLE (intro)

  if(type==="article"){

    html+=`

      <div class="stack">

        ${items.map(item=>`

          <div class="card">

            <div class="card-title">
              ${translate(item.label)}
            </div>

            <div class="card-desc">
              ${translate(item.content)}
            </div>

          </div>

        `).join("")}

      </div>

    `;

  }


  // CART (food / drink / relax)

  if(type==="cart"){

    html+=`

      <div class="grid grid-2">

        ${items.map(item=>`

          <div class="card menu-item"
            data-category="${category}"
            data-item="${item.key}">

            <div class="card-title">
              ${translate(item.label)}
            </div>

            ${item.description?`
              <div class="card-desc">
                ${translate(item.description)}
              </div>
            `:""}

            <div class="card-bottom">

              <button
                class="btn btn-primary add-cart"
                data-category="${category}"
                data-item="${item.key}">

                Add
              </button>

            </div>

          </div>

        `).join("")}

      </div>

    `;

  }


  // INSTANT (service / help)

  if(type==="instant"){

    html+=`

      <div class="stack">

        ${items.map(item=>`

          <div class="card">

            <div class="card-title">
              ${translate(item.label)}
            </div>

            ${item.description?`
              <div class="card-desc">
                ${translate(item.description)}
              </div>
            `:""}

            <div class="card-bottom">

              <button
                class="btn btn-secondary instant-btn"
                data-category="${category}"
                data-item="${item.key}">

                Request

              </button>

            </div>

          </div>

        `).join("")}

      </div>

    `;

  }


  html+=`</div>`;

  hubContent.innerHTML = html;

}