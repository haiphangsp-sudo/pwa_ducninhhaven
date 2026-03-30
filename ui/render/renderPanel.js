// ui/render/renderPanel.js

import { renderArticle } from "./renderArticle.js";
import { renderMenu } from "./renderCategory.js";

/* =========================
   PUBLIC
========================= */

export function renderPanel(state) {
  const panel = state.panel; 

  const container = document.querySelector(".category-panel");
  
  if (!container || !panel.view) return;

  switch (panel.type) {
    case "article":
      container.innerHTML = renderArticle(panel.view);
      break;
  
    default:
      container.innerHTML = renderMenu( panel.view, panel.type );
      break;
 
  }
}


