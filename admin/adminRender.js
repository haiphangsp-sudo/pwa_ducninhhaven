// admin/adminRender.js

export function renderSection(section) {
  const root = document.getElementById(section.rootId);
  if (!root) return;

  const nodes = section.buildNodes(section.getData());
  root.innerHTML = nodes.map(renderNode).join("");
}

function renderNode(node) {
  const children = (node.children || []).map(renderNode).join("");

  if (node.variant === "group-header") {
    return `
      <section class="cat">
        <div class="cat-header flex between">
          <label class="cat-title">
            ${node.icon ? `<span class="icon">${node.icon}</span>` : ""}
            ${node.label}
          </label>
          ${
            node.path
              ? `<input type="checkbox"
                  data-kind="${node.kind}"
                  data-path="${node.path}"
                  ${node.checked ? "checked" : ""}>`
              : ""
          }
        </div>
        <div class="items">${children}</div>
      </section>
    `;
  }

  if (node.variant === "item-with-children") {
    return `
      <div class="item">
        <div class="item-product flex between">
          <label>${node.label}</label>
          <input type="checkbox"
            data-kind="${node.kind}"
            data-path="${node.path}"
            ${node.checked ? "checked" : ""}>
        </div>
        <div class="opts">${children}</div>
      </div>
    `;
  }

  return `
    <div class="item-product flex between">
      <label>
        ${node.label}
        ${node.meta || ""}
      </label>
      <input type="checkbox"
        data-kind="${node.kind}"
        data-path="${node.path}"
        ${node.checked ? "checked" : ""}>
    </div>
  `;
}