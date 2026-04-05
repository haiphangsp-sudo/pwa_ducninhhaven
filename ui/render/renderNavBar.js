// ui/components/navBar.js

import { translate } from "../utils/translate.js";
import { getAnchorDisplay, getLocationInfo } from "../../core/placesQuery.js";

const refs = {
  identityIcon: null,
  identityLabel: null,
  locLabel: null,
  langButtons: null
};

export function renderNavBar(state) {
  cacheElements();
  updateNavBar(state);
}

function updateNavBar(state) {
  const currentLang = state.lang.current;
  const {placeName} = getLocationInfo();

  if (refs.identityIcon) refs.identityIcon.textContent = getAnchorDisplay(state).icon;
  if (refs.identityLabel) refs.identityLabel.textContent = getAnchorDisplay(state).label;
  if (refs.locLabel) refs.locLabel.textContent = placeName;

  if (refs.langButtons) {
    refs.langButtons.querySelectorAll("button").forEach(btn => {
      btn.classList.toggle("is-active", btn.dataset.value === currentLang);
    });
  }

  if (!document.body.classList.contains(currentLang)) {
    document.body.classList.remove('vi', 'en');
    document.body.classList.add(currentLang);
  }
}

function cacheElements() {
  refs.identityIcon = document.querySelector(".identity-icon");
  refs.identityLabel = document.querySelector(".identity-label");
  refs.locLabel = document.querySelector(".loc-label");
  refs.langButtons = document.getElementById("langSwitch");
  refs.pickerButton = document.getElementById("pickerNav");
}
// ui/events/scrollBehavior.js

let lastScrollTop = 0;
const threshold = 10; // Khoảng cách cuộn tối thiểu để kích hoạt (tránh rung lắc)

export function initSmartHeader() {
    const contextBar = document.getElementById('contextBar');
    if (!contextBar) return;

    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Bỏ qua nếu cuộn quá ít
        if (Math.abs(lastScrollTop - scrollTop) <= threshold) return;

        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // CUỘN XUỐNG: Ẩn thanh bar
            contextBar.classList.add('context-bar--hidden');
        } else {
            // CUỘN LÊN: Hiện thanh bar
            contextBar.classList.remove('context-bar--hidden');
        }

        lastScrollTop = scrollTop;
    }, { passive: true }); // Tối ưu hiệu suất cuộn
}

