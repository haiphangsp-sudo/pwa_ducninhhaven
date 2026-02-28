import { loadMenu, MENU } from "../core/menuStore.js";

async function boot(){
  await loadMenu();
  renderAdmin();
}

function renderAdmin(){

  const el = document.getElementById("adminMenu");

  el.innerHTML = Object.entries(MENU).map(([catKey,cat])=>`
    <div class="admin-category">
      <h3>
        ${cat.label.vi}
        <input type="checkbox"
          ${cat.active!==false?"checked":""}
          data-type="category"
          data-key="${catKey}">
      </h3>

      ${Object.entries(cat.items || {}).map(([itemKey,item])=>`
        <div class="admin-item">
          ${item.label.vi}
          <input type="checkbox"
            ${item.active!==false?"checked":""}
            data-type="item"
            data-category="${catKey}"
            data-key="${itemKey}">
        </div>
      `).join("")}

    </div>
  `).join("");
}