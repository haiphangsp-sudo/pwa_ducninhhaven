//
//

import { MENU } from "./menuStore.js";
import { getContext } from "./context.js";


function getPlaceType() {
    const ctx = getContext();
    const anchor=ctx?.anchor;
    if(!anchor) return "room";
    return anchor.type;
}
export function getCategories() {
    const placeType = getPlaceType();
    const out = [];
    for (const [key, cat] of Object.entries(MENU)) {
        const cat = MENU[key];
        if (typeof cat.allow === "object") continue
        if (cat.active === false) continue;
        if (!cat.allow.includes(placeType)) continue;
        out.push({
            key,
            label: cat.label,
            ui: cat.ui,
            icon: cat.icon
        });
    
    }
return out;

}
export function getCategory(catKey) {
    const cat = MENU[catKey];
    if (!cat) return null;
    return {
        key: catKey,
        label: cat.label,
        ui: cat.ui,
        items: getItems(catKey)
    };
}
export function getItems(catKey) {
    const cat = MENU[catKey];
    if (!cat) return [];
    const out = [];
    for (const [key, item] of Object.entries(cat.items)) {
        if (item.active === false) continue;
        out.push({
            key: itemKey,
            label: item.label,
            price: item.price,
            unit: item.unit,
            image: item.image,
            options: getOptions(catKey, itemKey)
        });
    
    }
    return out;

}
export function getOptions(catKey, itemKey) {
    const cat = MENU[catKey];
    if (!cat) return [];
    const item = MENU?.[catKey]?.items?.[itemKey];
        if (!item?.options) return [];
        const out = [];
        for (const [key, opt] of Object.entries(item.options)) {
            if (opt.active === false) continue;
            out.push({
                key: optKey,
                label: opt.label,
                price: opt.price,
                unit: opt.unit
            });
        }
        return out;
}