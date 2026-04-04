// admin/admin.js

import { loadMenu, MENU } from "../core/menuStore.js";
import { loadPlaces, PLACES } from "../core/placesStore.js";



/* ===== LOGIN GATE ===== */
function hasSession(){
  const pin = localStorage.getItem("admin_pin");
  const expire = Number(localStorage.getItem("admin_pin_expire"));
  return pin && expire && Date.now() < expire;
}

function showApp(){
  document.getElementById("adminLock").style.display="none";
  document.getElementById("adminApp").style.display="";
  document.getElementById("adminBtn").style.display="";
}
function hideApp(){
  document.getElementById("adminLock").style.display="";
  document.getElementById("adminApp").style.display="none";
  document.getElementById("adminBtn").style.display="none";
}


async function doLogin(){

  const pin = prompt("Nhập mã quản trị");
  if(!pin) return;

  const r = await fetch("/api/admin/login",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ pin })
  });

  if(r.ok){
    localStorage.setItem("admin_pin",pin);
    localStorage.setItem("admin_pin_expire",Date.now()+2*60*60*1000);
    showApp();
    await loadMenu();
    await loadPlaces();
    render();
  }else{
    alert("Sai mã");
  }
}

document.getElementById("loginBtn").onclick = doLogin;


if(hasSession()){
  showApp();
  await Promise.all([loadMenu(), loadPlaces()]);
  render();
}

/* ===== UI ===== */

function render() {
  renderMenu(); 
  
  renderPlaces();

  bindEvents();
}

function renderMenu(){

  const root=document.getElementById("adminMenu");

  root.innerHTML = Object.entries(MENU).map(([catKey,cat])=>`
  
  <section class="cat">
    <label class="cat-title">
      <input type="checkbox" data-path="${catKey}.active" ${cat.active!==false?"checked":""}>
      ${cat.label.vi}
    </label>

    <div class="items">
    ${Object.entries(cat.items||{}).map(([itemKey,item])=>`

      <div class="item">
        <label>
          <input type="checkbox"
            data-path="${catKey}.items.${itemKey}.active"
            ${item.active!==false?"checked":""}>
          ${item.label.vi}
        </label>

        <div class="opts">
        ${Object.entries(item.options||{}).map(([optKey,opt])=>`
          <label class="opt">
            <input type="checkbox"
              data-path="${catKey}.items.${itemKey}.options.${optKey}.active"
              ${opt.active!==false?"checked":""}>
            ${opt.label.vi}
          </label>
        `).join("")}
        </div>

      </div>

    `).join("")}
    </div>
  </section>

  `).join("");

  bindEvents();
}

/* ===== EVENTS ===== */

function bindEvents(){

  document.querySelectorAll("input[type=checkbox]").forEach(cb=>{
   cb.onchange = async () => {
      const path = cb.dataset.path.split(".");
      const isPlace = cb.dataset.type === "place";
      const patch = {};

      // Tạo object patch theo đường dẫn (Deep Patch)
      let ref = patch;
      for (let i = 0; i < path.length - 1; i++) {
        ref[path[i]] = {};
        ref = ref[path[i]];
      }
      ref[path.at(-1)] = cb.checked;

      // Gửi đến đúng API
      if (isPlace) {
        await savePlacesState(patch);
      } else {
        await saveMenuState(patch);
      }
    };
  });

  document.getElementById("resetBtn").onclick=async()=>{
    await fetch("/api/admin/menu",{
      method:"DELETE",
      headers:{ "x-admin-pin": localStorage.getItem("admin_pin") }
    });
    location.reload();
  };
  const lo = document.getElementById("logoutBtn");
    lo.onclick = logout;
}

/* ===== API CHO PLACES ===== */
async function savePlacesState(patch) {
  const r = await fetch("/api/admin/places", { 
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-pin": localStorage.getItem("admin_pin")
    },
    body: JSON.stringify(patch)
  });

  if (r.status === 401) {
    logout();
  }
}
/* ===== API ===== */

async function saveMenuState(patch){

  const r = await fetch("/api/admin/menu",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "x-admin-pin": localStorage.getItem("admin_pin")
    },
    body:JSON.stringify(patch)
  });

  if(r.status===401){
    localStorage.removeItem("admin_pin");
    location.reload();
  }
}

function logout(){
  localStorage.removeItem("admin_pin");
  localStorage.removeItem("admin_pin_expire");
  hideApp();
  location.reload();
}


function renderPlaces() {
  const root = document.getElementById("adminPlaces");

  if (!root || !PLACES) return;

  root.innerHTML = Object.entries(PLACES).map(([typeKey, group]) => `
    <section class="cat">
      <div class="cat-header flex between">
        <label class="cat-title">
          <span class="icon">${group.meta.icon || ''}</span>
          ${group.meta.label.vi}
        </label>
        <input type="checkbox" 
               data-type="place"
               data-path="${typeKey}.meta.active" 
               ${group.meta.active !== false ? "checked" : ""}>
      </div>

      <div class="items">
        ${group.items.map((item, index) => `
          <div class="item flex between">
            <label>
              ${item.label.vi} <small>(${item.id})</small>
            </label>
            <input type="checkbox" 
                   data-type="place"
                   data-path="${typeKey}.items.${index}.active" 
                   ${item.active !== false ? "checked" : ""}>
          </div>
        `).join("")}
      </div>
    </section>
  `).join("");
}
