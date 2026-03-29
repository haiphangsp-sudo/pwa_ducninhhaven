// ui/render/renderStatusBar.js
import { getState, setState } from '../../core/state.js';
import { translate } from '../utils/translate.js';

// ui/render/renderStatusBar.js
export function renderStatusBar(state) {
  const bar = document.getElementById("orderStatusBar");
  const text = document.getElementById("orderStatusText");
  if (!bar || !text) return;

  const { status, msg } = state.order;

  // 1. Ẩn nếu không có gì để nói
  if (status === "idle" || !status) {
    bar.classList.add("hidden");
    return;
  }

  // 2. Hiển thị và đổi màu sắc dựa trên status (Wellness Palette)
  bar.classList.remove("hidden");
  bar.className = `status-bar is-${status}`; // CSS sẽ lo việc đổi màu cát, xanh lá, hoặc đỏ

  // 3. Hiển thị nội dung
  text.textContent = msg || translate(`status.${status}`);
}