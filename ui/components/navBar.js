// ui/components/navBar.js

import { UI } from "../../core/state.js";
import { dispatch } from "../../core/events.js";
import { MENU } from "../../data/menu.js";
import { translate } from "../utils/translate.js";
import { initLangSwitch } from "../langController.js";

export function renderNavBar(){

  const el = document.getElementById("contextBar");
  if(!el) return;

    const isHome = UI.view.screen==="home";

  
el.innerHTML = `
  <div class="nav">

    <div class="nav-left">
      <button id="navBack" class="nav-back">Haven</button>
    </div>

    <div class="nav-center">
      ${getContext()}
    </div>

    <div class="nav-right">
      <div class="nav-sub">${getTitle()}</div>

      <div id="langSwitch" class="lang-switch">
        <button data-lang="vi">VI</button>
        <button data-lang="en">EN</button>
      </div>
    </div>

  </div>`
  attachNavEvents();
};

/* ---------- helpers ---------- */

function getTitle(){

  if(UI.view.screen==="home")
    return "Duc Ninh Haven";

  if(UI.view.screen==="category")
    return translate(MENU[UI.view.category].label);

  return "";
}


function getContext(){
  const key = UI.context.mode==="room" ? "context_room" : "context_table";
  return `${translate(key)} ${UI.context.place}`;
}

function attachNavEvents(){

  const back = document.getElementById("navBack");
  if(back){
    back.onclick = ()=>dispatch("GO_HOME");
  }

  initLangSwitch();
}