


const ICONS = {

intro: `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
stroke-linecap="round" stroke-linejoin="round">
<circle cx="12" cy="12" r="9"/>
<line x1="12" y1="10" x2="12" y2="16"/>
<circle cx="12" cy="7" r="1"/>
</svg>`,

food: `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
stroke-linecap="round" stroke-linejoin="round">
<path d="M6 2v10"/>
<path d="M10 2v10"/>
<path d="M8 2v20"/>
<path d="M16 2v20"/>
</svg>`,

drink: `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
stroke-linecap="round" stroke-linejoin="round">
<path d="M5 3h14l-2 8a5 5 0 0 1-10 0L5 3z"/>
<line x1="12" y1="11" x2="12" y2="21"/>
</svg>`,

service: `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
stroke-linecap="round" stroke-linejoin="round">
<circle cx="12" cy="7" r="4"/>
<path d="M4 11h16"/>
<path d="M5 11l1 8h12l1-8"/>
</svg>`,

help: `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
stroke-linecap="round" stroke-linejoin="round">
<circle cx="12" cy="12" r="10"/>
<path d="M9 9a3 3 0 1 1 5 2c-1 1-2 1.5-2 3"/>
<circle cx="12" cy="17" r="1"/>
</svg>`,

relax: `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
stroke-linecap="round" stroke-linejoin="round">
<path d="M4 15c3 0 4-2 8-2s5 2 8 2"/>
<path d="M6 12c2-2 4-3 6-3s4 1 6 3"/>
<path d="M8 9c0-2 1.5-3 4-3s4 1 4 3"/>
</svg>`,

room: `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
stroke-linecap="round" stroke-linejoin="round">
<rect x="3" y="10" width="18" height="7"/>
<path d="M7 10V7a3 3 0 0 1 6 0v3"/>
</svg>`,

table: `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
stroke-linecap="round" stroke-linejoin="round">
<rect x="3" y="6" width="18" height="4"/>
<line x1="6" y1="10" x2="6" y2="20"/>
<line x1="18" y1="10" x2="18" y2="20"/>
</svg>`,

area: `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
stroke-linecap="round" stroke-linejoin="round">
<path d="M3 21V3h18"/>
<path d="M7 17l4-4 3 3 5-5"/>
</svg>`

};
export function icon(name){
    return ICONS[name] || ICONS.help
}
export function renderIcon(name,cls="icon"){

  return `<span class="${cls}">
           ${icon(name)}
         </span>`
}