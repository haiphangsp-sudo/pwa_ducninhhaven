// ui/components/navBar.js

import { UI } from "../../core/state.js";
import { translate } from "../utils/translate.js";
import { initLangSwitch } from "../langController.js";
import { getContext } from "../core/context.js";
import { PLACES } from "../data/places.js";
import { t } from "../data/i18n.js";

export function renderNavBar(){

  const el = document.getElementById("contextBar");
  if(!el) return;

    const isHome = UI.view.screen==="home";

  
el.innerHTML = `
  <div class="nav">
    <div class="nav-bar nav-left"> Duc Ninh Haven </div>
    <div class="nav-bar nav-center">${getContext()}</div>
    <div class="nav-bar nav-right">
      <div id="langSwitch" class="lang-switch">
        <button data-lang="vi">VI</button> <button data-lang="en">EN</button>
      </div>
    </div>
  </div>`;
  initLangSwitch();
  renderContextBar();
  document.querySelector(".nav-center").onclick=openPlacePicker;
};

/* ---------- helpers ---------- */



function renderContextBar(){

  const el=document.querySelector(".nav-center");
  if(!el) return;

  const ctx=getContext();

  if(!ctx){
    el.innerHTML=`<span class="no-context">${t("choose_place")}</span>`;
    return;
  }

  const label = PLACES[ctx.type+"s"][ctx.id].label;

  el.innerHTML=`
    <span class="ctx-icon">${icon(ctx.type)}</span>
    <span class="ctx-label">${t(label)}</span>
  `;
}

function icon(type){
  if(type==="room") return "🛏";
  if(type==="table") return "🍽";
  return "📍";
}