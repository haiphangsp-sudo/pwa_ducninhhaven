// core/menuSchema.js
//   Định nghĩa schema cho menu, đảm bảo menu tải về có cấu trúc đúng để app hoạt động ổn định    



export function validateMenu(menu){

  const errors=[];

  for(const [catKey,cat] of Object.entries(menu)){

    req(cat,"label",catKey);
    req(cat,"ui",catKey);
    req(cat,"active",catKey);
    req(cat,"items",catKey);

    if(!["article","cart","instant"].includes(cat.ui))
      errors.push(`${catKey}: invalid ui`);

    for(const [itemKey,item] of Object.entries(cat.items||{})){

      req(item,"label",`${catKey}.${itemKey}`);
      req(item,"active",`${catKey}.${itemKey}`);

      if(cat.ui==="cart"){
        req(item,"options",`${catKey}.${itemKey}`);
        req(item,"recommend",`${catKey}.${itemKey}`);

        if(!item.options[item.recommend])
          errors.push(`${catKey}.${itemKey}: recommend not exists`);

        for(const [optKey,opt] of Object.entries(item.options||{})){
          req(opt,"label",`${catKey}.${itemKey}.${optKey}`);
          req(opt,"active",`${catKey}.${itemKey}.${optKey}`);
        }
      }

      if(cat.ui==="article"){
        req(item,"content",`${catKey}.${itemKey}`);
      }
    }
  }

  if(errors.length)
    throw new Error("MENU_SCHEMA_ERROR\n"+errors.join("\n"));
}

function req(obj,key,path){
  if(obj[key]===undefined)
    throw new Error(`Missing ${path}.${key}`);
}