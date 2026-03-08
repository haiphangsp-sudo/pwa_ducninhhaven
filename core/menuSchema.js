// core/menuSchema.js
//   Định nghĩa schema cho menu, đảm bảo menu tải về có cấu trúc đúng để app hoạt động ổn định    



export function validateMenu(menu){

  const errors=[];

  for(const [catKey,cat] of Object.entries(menu)){

    req(cat,"label",catKey);
    req(cat,"ui",catKey);
    req(cat,"active",catKey);
    req(cat,"items",catKey);

    if(!["article","cart","instant"].includes(cat.type))
      errors.push(`${catKey}: invalid type`);

    for(const [itemKey,item] of Object.entries(cat.items||{})){

      req(item,"label",`${catKey}.${itemKey}`);
      req(item,"active",`${catKey}.${itemKey}`);

      if(cat.type==="cart"){
        req(item,"options",`${catKey}.${itemKey}`);
        req(item,"defaultOption",`${catKey}.${itemKey}`);

        if(!item.options[item.defaultOption])
          errors.push(`${catKey}.${itemKey}: defaultOption not exists`);

        for(const [optKey,opt] of Object.entries(item.options||{})){
          req(opt,"label",`${catKey}.${itemKey}.${optKey}`);
          req(opt,"active",`${catKey}.${itemKey}.${optKey}`);
        }
      }

      if(cat.type==="article"){
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