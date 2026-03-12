// ui/components/instantCard.js


import { translate } from "../utils/translate.js";

export function instantCard(service,itemKey,categoryKey) {
    const title = translate(service.label);
    const desc  = service.description ? translate(service.description) : "";

return `
<div class="instant-card card">
    <div class="instant-info">
        <div class="card-title service-${itemKey}">
            ${title}
        </div>
        ${desc ? `<div class="card-desc">${desc}</div>` : ""}
    </div>
    <div class="card-bottom">
        <button class="instant-btn btn btn-primary"
            data-category="${categoryKey}"
            data-item="${itemKey}">
            ${translate("send_request")}
        </button>
    </div>
</div>
`;

}