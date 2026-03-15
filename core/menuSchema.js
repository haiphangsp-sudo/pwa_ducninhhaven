// core/menuSchema.js
//   Định nghĩa schema cho menu, đảm bảo menu tải về có cấu trúc đúng để app hoạt động ổn định    



/* ------------------------------------------------
MENU SCHEMA
------------------------------------------------ */

const VALID_UI = ["cart","instant","article"];
const VALID_UNIT = ["item","session","kg","hour","person"];
const VALID_ALLOW = ["room","table","area"];


/* ------------------------------------------------
NORMALIZE
------------------------------------------------ */

export function normalizeMenu(menu){

  for(const catKey in menu){

    if(catKey === "version") continue;

    const cat = menu[catKey];

    if(typeof cat !== "object" || cat === null) continue;

    if(cat.active === undefined)
      cat.active = true;

    if(!cat.allow)
      cat.allow = ["room","table"];

    if(!cat.items) continue;

    for(const itemKey in cat.items){

      const item = cat.items[itemKey];

      if(typeof item !== "object") continue;

      if(item.active === undefined)
        item.active = true;

      if(cat.ui === "cart" || cat.ui === "instant"){

        if(item.options){

          for(const optKey in item.options){

            const opt = item.options[optKey];

            if(typeof opt !== "object") continue;

            if(opt.active === undefined)
              opt.active = true;
          }

        }

      }

    }

  }

  return menu;
}


/* ------------------------------------------------
VALIDATE
------------------------------------------------ */

export function validateMenu(menu){

  const errors = [];

  const req = (obj,key,path)=>{

    if(!obj || typeof obj !== "object"){
      errors.push(`${path}: not an object`);
      return;
    }

    if(!(key in obj)){
      errors.push(`${path}: missing ${key}`);
    }

  };

  for(const catKey in menu){

    if(catKey === "version") continue;

    const cat = menu[catKey];

    if(typeof cat !== "object"){
      errors.push(`${catKey}: category must be object`);
      continue;
    }

    req(cat,"label",catKey);
    req(cat,"ui",catKey);
    req(cat,"items",catKey);

    if(cat.ui && !VALID_UI.includes(cat.ui)){
      errors.push(`${catKey}: invalid ui ${cat.ui}`);
    }

    if(cat.allow){

      for(const a of cat.allow){
        if(!VALID_ALLOW.includes(a))
          errors.push(`${catKey}: invalid allow ${a}`);
      }

    }

    if(!cat.items) continue;

    for(const itemKey in cat.items){

      const item = cat.items[itemKey];

      const path = `${catKey}.${itemKey}`;

      if(typeof item !== "object"){
        errors.push(`${path}: item must be object`);
        continue;
      }

      req(item,"label",path);

      if(cat.ui === "cart" || cat.ui === "instant"){

        req(item,"price",path);
        req(item,"unit",path);

        if(item.unit && !VALID_UNIT.includes(item.unit)){
          errors.push(`${path}: invalid unit ${item.unit}`);
        }

      }

    }

  }

  if(errors.length){

    console.error("MENU_SCHEMA_ERROR");
    console.table(errors);

    throw new Error(`Menu schema invalid (${errors.length} errors)`);

  }

  return true;

}