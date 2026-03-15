


/* EXTERNAL REFRESH */

export function updateNavContext(){
  
  if(!identityIcon || !identityLabel || !locLabel) return;

  const ctx = getContext();
  const anchor = ctx?.anchor;
  const active = ctx?.active;
  let labelLeft="haven"; 
  if(anchor?.type==="room") {
    labelLeft=anchor.id;
  }else if(anchor?.type==="table") {
    labelLeft="table_guest";
  }else if(anchor?.type==="area") {
    labelLeft="area_guest";
  }
  identityIcon.textContent = getIcon(anchor?.type);
  identityLabel.textContent = translate(labelLeft);
  //identityLabel.textContent = translate(anchor?.type === "room" ? anchor.id : anchor?.type === "table" ? "table_guest" : "area_guest");
  if(!ctx){
    locLabel.textContent = translate("select_place");
  }else{
    locLabel.textContent = formatLocation(ctx);
  }
}
window.addEventListener("contextchange", updateNavContext);