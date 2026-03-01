import { getContext } from "../core/context.js";
import { PLACES } from "../data/places.js";
import { t } from "../data/i18n.js";

export function renderContextBar(){

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