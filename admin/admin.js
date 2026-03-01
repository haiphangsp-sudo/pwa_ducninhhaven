import { loadMenu, MENU } from "../core/menuStore.js";

/* ===== LOGIN GATE ===== */
function hasSession(){
  const pin = localStorage.getItem("admin_pin");
  const expire = Number(localStorage.getItem("admin_pin_expire"));
  return pin && expire && Date.now() < expire;
}

function showApp(){
  document.getElementById("adminLock").style.display="none";
  document.getElementById("adminApp").style.display="";
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
    render();
  }else{
    alert("Sai mã");
  }
}

document.getElementById("loginBtn").onclick = doLogin;

if(hasSession()){
  showApp();
  await loadMenu();
  render();
}
/* ===== LOAD ===== */

await loadMenu();
render();

/* ===== UI ===== */

function render(){

  const root=document.getElementById("adminApp");

  root.innerHTML = Object.entries(MENU).map(([catKey,cat])=>`
  <button class="btn" id="resetBtn">Khôi phục mặc định</button>
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
    cb.onchange = async ()=>{

      const path = cb.dataset.path.split(".");
      const patch = {};

      let ref = patch;
      for(let i=0;i<path.length-1;i++){
        ref[path[i]]={};
        ref=ref[path[i]];
      }

      ref[path.at(-1)] = cb.checked;

      await saveState(patch);
    };
  });

  document.getElementById("resetBtn").onclick=async()=>{
    await fetch("/api/menu/state",{
      method:"DELETE",
      headers:{ "x-admin-pin": localStorage.getItem("admin_pin") }
    });
    location.reload();
  };
  const lo = document.getElementById("logoutBtn");
  if(lo){
    lo.onclick = logout;
  }
}

/* ===== API ===== */

async function saveState(patch){

  const r = await fetch("/api/menu/state",{
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
  location.reload();
}