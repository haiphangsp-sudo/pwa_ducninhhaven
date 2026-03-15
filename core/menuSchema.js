// core/menuSchema.js
//   Định nghĩa schema cho menu, đảm bảo menu tải về có cấu trúc đúng để app hoạt động ổn định    



const VALID_UI = ["cart","instant","article"]
const VALID_UNIT = ["item","session","kg","hour","person","set","glass"]
const VALID_ALLOW = ["room","table","area"]

/* -----------------------------
NORMALIZE
----------------------------- */

export function normalizeMenu(menu){

  for(const catKey in menu){

    const cat = menu[catKey]

    if(cat.active === undefined)
      cat.active = true

    if(!cat.allow)
      cat.allow = ["room","table"]

    for(const itemKey in cat.items){

      const item = cat.items[itemKey]

      if(item.active === undefined)
        item.active = true

      if(cat.ui === "cart" || cat.ui === "instant"){

        for(const optKey in item.options){

          const opt = item.options[optKey]

          if(opt.active === undefined)
            opt.active = true

          if(opt.price === undefined)
            opt.price = 0

          if(opt.price > 0 && !opt.unit)
            opt.unit = "item"
        }

      }

    }

  }

  return menu
}


/* -----------------------------
VALIDATE
----------------------------- */

export function validateMenu(menu){

  const errors = []

  const req = (obj,key,path)=>{
    if(!(key in obj))
      errors.push(`${path}: missing ${key}`)
  }

  for(const catKey in menu){
    if(catKey === "version")
      continue

    const cat = menu[catKey]

    req(cat,"label",catKey)
    req(cat,"ui",catKey)
    req(cat,"items",catKey)

    if(!VALID_UI.includes(cat.ui))
      errors.push(`${catKey}: invalid ui ${cat.ui}`)

    if(cat.allow){

      for(const a of cat.allow){
        if(!VALID_ALLOW.includes(a))
          errors.push(`${catKey}: invalid allow ${a}`)
      }

    }

    for(const itemKey in cat.items){

      const item = cat.items[itemKey]

      req(item,"label",`${catKey}.${itemKey}`)

      if(cat.ui === "cart" || cat.ui === "instant"){

        req(item,"options",`${catKey}.${itemKey}`)

        for(const optKey in item.options){

          const opt = item.options[optKey]

          req(opt,"label",`${catKey}.${itemKey}.${optKey}`)

          if(opt.price > 0 && !opt.unit)
            errors.push(`${catKey}.${itemKey}.${optKey}: price requires unit`)

          if(opt.unit && !VALID_UNIT.includes(opt.unit))
            errors.push(`${catKey}.${itemKey}.${optKey}: invalid unit ${opt.unit}`)

        }

        if(item.recommend){

          if(Array.isArray(item.recommend)){

            for(const r of item.recommend){
              if(!item.options[r])
                errors.push(`${catKey}.${itemKey}: recommend option not found`)
            }

          }else{

            if(!item.options[item.recommend])
              errors.push(`${catKey}.${itemKey}: recommend option not found`)

          }

        }

      }

      if(cat.ui === "article"){

        req(item,"content",`${catKey}.${itemKey}`)

      }

    }

  }

  if(errors.length){

    console.error("MENU_SCHEMA_ERROR");
    console.table(errors);

    throw new Error(`Menu schema invalid: ${errors.length} errors`);

  }

  return true

}