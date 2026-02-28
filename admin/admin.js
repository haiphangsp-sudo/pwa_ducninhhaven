import { loadMenu, MENU } from "../core/menuStore.js";

/* ===== LOGIN GATE ===== */

async function ensureLogin(){

  let pin = localStorage.getItem("admin_pin");
  if(pin) return;

  pin = prompt("Nhập mã quản trị");

  const r = await fetch("/api/admin/login",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({pin})
  });

  if(r.ok){
    localStorage.setItem("admin_pin",pin);
  }else{
    alert("Sai mã");
    location.reload();
  }
}

await ensureLogin();

/* ===== LOAD ===== */

await loadMenu();
render();

/* ===== UI ===== */

function render(){

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