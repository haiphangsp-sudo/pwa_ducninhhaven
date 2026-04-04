
// ui/render/renderHub.js

import { translate } from "../utils/translate.js";
import { getCategoriesForCurrentPlace } from "../../core/menuQuery.js";

export function renderHub(state) {
  const categories = getCategoriesForCurrentPlace();
  const menuEl = document.getElementById("hub-container");
  if (!menuEl) return;
  const currentPanel = state.panel.view;
  menuEl.innerHTML = categories.map(cat => {
    const isActive = cat.key === currentPanel ? "is-active" : "";
    return `
    <button class="hub-btn btn center ${isActive}"
      data-action="open-panel"
      data-option="${cat.ui}"
      data-value="${cat.key}">
      <span class="hub-icon">
        <img src="/icons/${cat.key}.svg" alt="">
      </span>
      <span class="hub-label">
        ${translate(cat.label)}
      </span>
    </button>
  `}).join("");
}
export function eventHub(state) {
  const menuEl = document.getElementById("hub-container");
  menuEl.querySelectorAll("button").forEach(btn => {
    btn.classList.toggle("is-active", btn.getAttribute("data-value") === state.panel.view);
  });

  const hub = document.getElementById('hub-container');
  const wrapper = document.getElementById('hubMenu');

  if (!hub || !wrapper) return;

  hub.addEventListener('scroll', () => {
      // Kiểm tra xem khoảng cách cuộn + chiều rộng màn hình có bằng chiều rộng thực tế của list không
      const isEnd = hub.scrollLeft + hub.offsetWidth >= hub.scrollWidth - 10;

      if (isEnd) {
          wrapper.classList.add('is-at-end');
      } else {
          wrapper.classList.remove('is-at-end');
      }
  });
}