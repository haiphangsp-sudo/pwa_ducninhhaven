// admin/admin.js

import { loadMenu } from "../core/menuStore.js";
import { loadPlaces } from "../core/placesStore.js";

import { ADMIN_SECTIONS } from "./adminSections.js";
import { renderSection } from "./adminRender.js";
import { buildPatchFromPath } from "./adminActions.js";

async function boot() {
  await Promise.all([loadMenu(), loadPlaces()]);
  renderAll();
}

function renderAll() {
  Object.values(ADMIN_SECTIONS).forEach(renderSection);
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll('[data-path]').forEach(el => {
    el.onchange = async () => {
      const kind = el.dataset.kind;
      const section = ADMIN_SECTIONS[kind];

      const patch = buildPatchFromPath(el.dataset.path, el.checked);

      await section.save(patch);
      await section.reload();

      renderSection(section);
      bindEvents();
    };
  });
}

await boot();