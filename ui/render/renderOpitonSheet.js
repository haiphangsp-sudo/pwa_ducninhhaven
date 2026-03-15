

import { MENU } from "../../core/menuStore.js";
import { translate } from "../utils/translate.js";
import { addToCart } from "../../core/events.js";
import { showOverlay, closeOverlay } from "../interactions/overlayManager.js";

let currentCategory = null;
let currentItem = null;
let selectedOption = 0;

export function openOptionSheet(category,item){

  currentCategory = category;
  currentItem = item;
  selectedOption = 0;

  const sheet = document.getElementById("optionSheet");

  const data = MENU[category].items[item];

  sheet.innerHTML = `

    <div class="option-sheet__handle"></div>

    <div class="option-sheet__header">

      <div class="option-sheet__title">
        ${translate(data.label)}
      </div>

      <div class="option-sheet__desc">
        ${translate(data.desc)}
      </div>

    </div>

    <div class="option-sheet__options">

      ${data.options.map((opt,i)=>`

        <button
          class="option-row ${i===0?'is-active':''}"
          data-option="${i}"
        >

          <span class="option-row__label">
            ${translate(opt.label)}
          </span>

          <span class="option-row__price">
            ${opt.price}
          </span>

        </button>

      `).join("")}

    </div>

    <div class="option-sheet__footer">

      <button class="button-primary option-add">
        ${translate("add_to_cart")}
      </button>

    </div>

  `;

  showOverlay("optionSheet");

}

document.addEventListener("click",e=>{

  if(e.target.classList.contains("option-row")){

    document
      .querySelectorAll(".option-row")
      .forEach(el=>el.classList.remove("is-active"));

    e.target.classList.add("is-active");

    selectedOption = Number(e.target.dataset.option);

  }

  if(e.target.classList.contains("option-add")){

    addToCart(
      currentCategory,
      currentItem,
      selectedOption
    );

    closeOverlay();

  }

});