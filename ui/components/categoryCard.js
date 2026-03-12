export function categoryCard(item){

return `
<div class="menu-card"
 data-category="${item.category}"
 data-item="${item.item}"
 data-option="${item.option||""}">

 <div class="menu-info">

   <div class="menu-title">${item.title}</div>

   <div class="menu-desc">${item.desc||""}</div>

 </div>

 <div class="menu-bottom">

   <div class="menu-price">${item.price}</div>

   <button class="order-btn">Thêm</button>

 </div>

</div>
`

}