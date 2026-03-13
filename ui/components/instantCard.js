// ui/components/instantCard.js


import { translate } from "../utils/translate.js";

export function instantCard(opt,optKey,itemKey,categoryKey) {
    const title = translate(opt.label);
    const desc = opt.description ? translate(opt.description) : "";

return `
<div class="card">
    <div class="stack">
        <div class="card-title service-${optKey}">
            ${title}
        </div>
        ${desc ? `<div class="card-desc">${desc}</div>` : ""}
    </div>
    <div class="card-bottom">
        <button class="instant-btn btn btn-primary"
            data-category="${categoryKey}"
            data-item="${itemKey}"
            data-option="${optKey}">
            ${translate("send_request")}
        </button>
    </div>
</div>
`;

}