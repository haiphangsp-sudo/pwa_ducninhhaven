// ui/render/renderPanel.js
export function renderPanel(state) {
  const categoryKey = state.panel.view; 
  

  const ui = state.panel.option;
  // Lấy đúng đường dẫn theo state.js
  const nextPanelId = state.panel.view; 
  const container = document.querySelector(".page-container");
  
  if (!container || !nextPanelId) return;

  // 1. Tìm hoặc tạo element cho panel nếu chưa có
  let panelEl = document.getElementById(nextPanelId);
  if (!panelEl) {
    container.insertAdjacentHTML(
      "beforeend",
      `<div id="${nextPanelId}" class="category-panel hidden"></div>`
    );
    panelEl = document.getElementById(nextPanelId);
  }

  // 2. Chỉ vẽ lại nội dung khi panel còn trống (tránh render thừa)
  if (panelEl.innerHTML === "") {
    if (categoryKey) {
      panelEl.innerHTML = (nextPanelId === "intro") 
        ? renderArticle(categoryKey) 
        : renderMenu(categoryKey,ui);
    }
  }

  // 3. Điều phối hiển thị (Toggle Visibility)
  document.querySelectorAll(".category-panel").forEach(el => {
    if (el.id === nextPanelId) {
      el.classList.remove("hidden");
      el.classList.add("animate-fade-in");
    } else {
      el.classList.add("hidden");
      el.classList.remove("animate-fade-in");
    }
  });
}