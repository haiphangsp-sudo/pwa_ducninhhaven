export function instantCard(service){

return `
<div class="instant-card">

 <div class="instant-info">

   <div class="instant-title">${service.title}</div>

   <div class="instant-desc">${service.desc}</div>

 </div>

 <button class="instant-btn"
  data-category="${service.category}"
  data-item="${service.item}">
  ${service.label}
 </button>

</div>
`
}