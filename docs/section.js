let data = window.UXUI_LIVE_DATA.cloneData(window.UXUI_TOOLS_DATA);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sectionRoot = document.querySelector("#section-shell");
const addModal = document.querySelector("#add-modal");
const addForm = document.querySelector("#add-resource-form");
const addSection = document.querySelector("#add-resource-section");
const addGroup = document.querySelector("#add-resource-group");
const addOutput = document.querySelector("#add-modal-output");
const addPreview = document.querySelector("#add-resource-preview");
const addConnectionState = document.querySelector("#add-connection-state");
const addConnectionTitle = document.querySelector("#add-connection-title");
const addConnectionMessage = document.querySelector("#add-connection-message");
const addResultBox = document.querySelector("#add-result-box");
const addResultEyebrow = document.querySelector("#add-result-eyebrow");
const addResultTitle = document.querySelector("#add-result-title");
const addResultMessage = document.querySelector("#add-result-message");
const addModalTitle = document.querySelector("#add-modal-title");
const addDeleteButton = document.querySelector("#add-resource-delete");
const addSecondaryLink = document.querySelector("#add-resource-secondary");

const modalState = {
  mode: "create",
  item: null,
};

function getSectionFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("section") || data.sections[0]?.slug;
  return data.sections.find((section) => section.slug === slug) || data.sections[0];
}

function getSectionBySlug(slug) {
  return data.sections.find((section) => section.slug === slug) || data.sections[0];
}

function getHostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch (error) {
    return url;
  }
}

function getSectionCount(section) {
  return section.groups.reduce((sum, group) => sum + group.items.length, 0);
}

function getActionLabel(item) {
  if (item.type === "PDF") return "read";
  if (item.type === "Video") return "watch";
  return "open";
}

function renderSidebar(currentSlug) {
  return `
    <aside class="section-sidebar reveal" style="--delay:80ms">
      <p class="eyebrow">All sections</p>
      <div class="section-sidebar-list">
        ${data.sections
          .map(
            (section) => `
              <a class="section-sidebar-link ${section.slug === currentSlug ? "is-active" : ""}" href="./section.html?section=${section.slug}">
                <span>${section.title}</span>
                <small>${getSectionCount(section)}</small>
              </a>
            `
          )
          .join("")}
      </div>
    </aside>
  `;
}

function renderItemRow(item, itemIndex, delay) {
  const line = `
    <a class="code-line" href="${item.url}" target="_blank" rel="noreferrer">
      <span class="code-line-number">${String(itemIndex + 1).padStart(2, "0")}</span>
      <span class="code-line-main">
        <span class="code-line-content">
          <span class="code-token keyword">const</span>
          <span class="code-token variable">${item.title}</span>
          <span class="code-token operator">=</span>
          <span class="code-token string">"${getHostname(item.url)}"</span>
        </span>
        ${item.note ? `<span class="code-line-meta">${item.note}</span>` : ""}
      </span>
      <span class="code-line-arrow">${getActionLabel(item)}</span>
    </a>
  `;

  return `
    <div class="code-line-shell reveal" style="--delay:${delay}ms">
      ${line}
      <button type="button" class="code-line-edit" data-edit-resource="${item.sourceKey}">Editar</button>
    </div>
  `;
}

function renderSectionPage() {
  const section = getSectionFromQuery();
  if (!section) return section;
  const hashGroup = window.location.hash.replace("#group-", "");
  document.title = `${section.title} | Repositorio UX/UI`;

  sectionRoot.innerHTML = `
    <div class="section-layout">
      ${renderSidebar(section.slug)}
      <section class="section-main">
        <header class="section-hero reveal" style="--delay:40ms">
          <p class="eyebrow">Section / ${section.slug}</p>
          <h1>${section.title}</h1>
          <p class="section-hero-copy">${getSectionCount(section)} recursos organizados en ${section.groups.length} subgrupos.</p>
        </header>

        <div class="terminal-panel reveal" style="--delay:120ms">
          <div class="terminal-topbar">
            <span></span><span></span><span></span>
          </div>
          <div class="terminal-body">
            ${section.groups
              .map((group, groupIndex) => {
                const isOpen = hashGroup ? hashGroup === group.slug : groupIndex === 0;
                return `
                  <details class="code-group group-fold reveal" id="group-${group.slug}" ${isOpen ? "open" : ""} style="--delay:${140 + groupIndex * 40}ms">
                    <summary class="code-group-summary">
                      <div>
                        <div class="code-group-header">
                          <span class="code-path">~/vault/${section.slug}/${group.slug}</span>
                          <span class="code-count">${group.items.length} recursos</span>
                        </div>
                        <h2>${group.title}</h2>
                      </div>
                      <span class="group-fold-toggle" aria-hidden="true"></span>
                    </summary>
                    <div class="code-list">
                      ${group.items.map((item, itemIndex) => renderItemRow(item, itemIndex, 170 + itemIndex * 24)).join("")}
                    </div>
                  </details>
                `;
              })
              .join("")}
          </div>
        </div>
      </section>
    </div>
  `;

  setupRevealObserver();
  return section;
}

function updateGroupOptions(sectionSlug, preferredGroupSlug = "") {
  const section = getSectionBySlug(sectionSlug);
  addGroup.innerHTML = section.groups
    .map(
      (group) => `<option value="${group.slug}" ${group.slug === preferredGroupSlug ? "selected" : ""}>${group.title}</option>`
    )
    .join("");
}

function populateSectionOptions(defaultSectionSlug, defaultGroupSlug = "") {
  addSection.innerHTML = data.sections
    .map(
      (section) => `<option value="${section.slug}" ${section.slug === defaultSectionSlug ? "selected" : ""}>${section.title}</option>`
    )
    .join("");
  updateGroupOptions(defaultSectionSlug, defaultGroupSlug);
}

function parseTags(value) {
  return String(value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function toPreviewPayload(payload) {
  if (!payload) return null;
  return {
    ...payload,
    file: payload.file && payload.file.name ? {
      name: payload.file.name,
      size: payload.file.size,
      type: payload.file.type || "application/octet-stream",
    } : null,
  };
}

function setConnectionState(summary) {
  addConnectionState.classList.remove("is-live", "is-setup", "is-syncing");
  addConnectionState.classList.add(`is-${summary.mode}`);
  addConnectionTitle.textContent = summary.title;
  addConnectionMessage.textContent = summary.message;
}

function setModalResult(mode, title, message, payload) {
  addOutput.hidden = false;
  addResultBox.classList.remove("is-success", "is-error", "is-info");
  addResultBox.classList.add(mode === "success" ? "is-success" : mode === "error" ? "is-error" : "is-info");
  addResultEyebrow.textContent = mode === "success" ? "Guardado" : mode === "error" ? "Error" : "Setup";
  addResultTitle.textContent = title;
  addResultMessage.textContent = message;
  if (payload) {
    addPreview.hidden = false;
    addPreview.textContent = JSON.stringify(toPreviewPayload(payload), null, 2);
  } else {
    addPreview.hidden = true;
    addPreview.textContent = "";
  }
}

function resetModalState(defaultSectionSlug, defaultGroupSlug = "") {
  modalState.mode = "create";
  modalState.item = null;
  addModalTitle.textContent = "Guardar recurso en la base";
  const submitButton = addForm.querySelector("button[type='submit']");
  submitButton.textContent = "Guardar en la base";
  if (addDeleteButton) addDeleteButton.hidden = true;
  if (addSecondaryLink) addSecondaryLink.hidden = false;
  addForm.reset();
  populateSectionOptions(defaultSectionSlug, defaultGroupSlug);
}

function closeAddModal() {
  addModal.hidden = true;
  document.body.classList.remove("modal-open");
  const currentSection = getSectionFromQuery();
  resetModalState(currentSection.slug, window.location.hash.replace("#group-", ""));
}

function openCreateModal(defaultSectionSlug, defaultGroupSlug = "") {
  resetModalState(defaultSectionSlug, defaultGroupSlug);
  addOutput.hidden = true;
  addModal.hidden = false;
  document.body.classList.add("modal-open");
}

function openEditModal(item) {
  modalState.mode = "edit";
  modalState.item = item;
  addOutput.hidden = true;
  addModalTitle.textContent = "Editar recurso";
  const submitButton = addForm.querySelector("button[type='submit']");
  submitButton.textContent = "Guardar cambios";
  if (addDeleteButton) addDeleteButton.hidden = !item.recordId;
  if (addSecondaryLink) addSecondaryLink.hidden = true;
  populateSectionOptions(item.sectionSlug, item.groupSlug);
  addForm.elements.title.value = item.title || "";
  addForm.elements.section.value = item.sectionSlug || "";
  updateGroupOptions(item.sectionSlug, item.groupSlug);
  addForm.elements.group.value = item.groupSlug || "";
  addForm.elements.url.value = item.url || "";
  addForm.elements.tags.value = Array.isArray(item.tags) ? item.tags.join(", ") : "";
  addForm.elements.note.value = item.note || "";
  addModal.hidden = false;
  document.body.classList.add("modal-open");
}

async function refreshSectionData(preferredGroupSlug = "") {
  const result = await window.UXUI_LIVE_DATA.fetchAndMerge(window.UXUI_LIVE_DATA.baseCatalog);
  data = result.data;
  const currentSection = renderSectionPage();
  populateSectionOptions(currentSection.slug, preferredGroupSlug || window.location.hash.replace("#group-", ""));
  setConnectionState({ mode: "live", title: "Base conectada", message: `${result.rows.length} recursos live sincronizados desde la base.` });
  return currentSection;
}

function findItemBySourceKey(sourceKey) {
  for (const section of data.sections) {
    for (const group of section.groups) {
      const item = group.items.find((entry) => entry.sourceKey === sourceKey);
      if (item) return item;
    }
  }
  return null;
}

function buildPayloadFromForm() {
  const formData = new FormData(addForm);
  const selectedSection = getSectionBySlug(formData.get("section"));
  const selectedGroup = selectedSection.groups.find((group) => group.slug === formData.get("group")) || selectedSection.groups[0];
  const title = String(formData.get("title") || "").trim();
  const url = String(formData.get("url") || "").trim();
  return {
    title,
    section: selectedSection.slug,
    sectionTitle: selectedSection.title,
    group: selectedGroup.slug,
    groupTitle: selectedGroup.title,
    url,
    note: String(formData.get("note") || "").trim(),
    fileName: modalState.item?.fileName || "",
    file: null,
    tags: parseTags(formData.get("tags")),
    createdAt: modalState.item?.date ? new Date(`${modalState.item.date}T12:00:00.000Z`).toISOString() : new Date().toISOString(),
    existingUrl: modalState.item?.url || "",
    existingFileName: modalState.item?.fileName || "",
    existingFilePath: modalState.item?.filePath || "",
    existingFilePublicUrl: modalState.item?.filePublicUrl || "",
    sourceKey: modalState.item?.sourceKey || window.UXUI_LIVE_DATA.buildSourceKey(selectedSection.slug, selectedGroup.slug, title, url || modalState.item?.url || ""),
  };
}

async function handleDeleteCurrentItem() {
  if (!modalState.item?.recordId) return;
  const confirmed = window.confirm(`¿Querés eliminar "${modalState.item.title}" de la base live?`);
  if (!confirmed) return;

  try {
    setConnectionState({ mode: "syncing", title: "Eliminando recurso", message: `Estamos eliminando "${modalState.item.title}" de la base live.` });
    await window.UXUI_LIVE_DATA.deleteResource(modalState.item.recordId);
    closeAddModal();
    await refreshSectionData(modalState.item.groupSlug);
  } catch (error) {
    setConnectionState({ mode: "setup", title: "No se pudo eliminar", message: error.message || "La base devolvió un error al eliminar el recurso." });
  }
}

function setupAddModal(defaultSectionSlug, defaultGroupSlug = "") {
  if (!addModal || !addForm) return;

  resetModalState(defaultSectionSlug, defaultGroupSlug);
  setConnectionState(window.UXUI_LIVE_DATA.getStatusSummary());

  addSection.addEventListener("change", (event) => {
    updateGroupOptions(event.target.value);
  });

  document.querySelectorAll("[data-open-add-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      const currentSection = getSectionFromQuery();
      openCreateModal(currentSection.slug, window.location.hash.replace("#group-", ""));
    });
  });

  document.querySelectorAll("[data-close-add-modal]").forEach((button) => {
    button.addEventListener("click", closeAddModal);
  });

  if (addDeleteButton) {
    addDeleteButton.addEventListener("click", handleDeleteCurrentItem);
  }

  addForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = buildPayloadFromForm();

    if (!payload.url && !payload.existingUrl) {
      setModalResult("error", "Falta contenido", "Necesitás al menos un link para guardar el recurso.", payload);
      return;
    }

    if (!window.UXUI_LIVE_DATA.isConfigured()) {
      setModalResult(
        "info",
        "Falta conectar la base",
        "Completá docs/config.js, corré los SQL de base y storage, y después este formulario va a guardar solo.",
        payload
      );
      return;
    }

    const submitButton = addForm.querySelector("button[type='submit']");
    const originalLabel = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = modalState.mode === "edit" ? "Guardando cambios..." : "Guardando...";
    setConnectionState({ mode: "syncing", title: modalState.mode === "edit" ? "Editando recurso" : "Guardando recurso", message: "Estamos enviando la entrada a la base remota." });

    try {
      const stored = modalState.item?.recordId
        ? await window.UXUI_LIVE_DATA.updateResource(modalState.item.recordId, payload)
        : await window.UXUI_LIVE_DATA.submitResource(payload);
      const currentSection = await refreshSectionData(payload.group);
      setModalResult(
        "success",
        modalState.mode === "edit" ? "Recurso actualizado" : "Recurso guardado",
        modalState.mode === "edit"
          ? "Los cambios ya quedaron persistidos en la base live y la vista se refrescó con la nueva data."
          : "El recurso ya quedó persistido en la base y esta vista ya se refrescó con la nueva data.",
        stored
      );
      addForm.reset();
      resetModalState(currentSection.slug, payload.group);
    } catch (error) {
      setConnectionState(window.UXUI_LIVE_DATA.getStatusSummary());
      setModalResult("error", modalState.mode === "edit" ? "No se pudo editar" : "No se pudo guardar", error.message || "Revisá la configuración de Supabase y probá de nuevo.", payload);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = modalState.mode === "edit" ? "Guardar cambios" : originalLabel;
    }
  });
}

function setupItemActions() {
  sectionRoot.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-resource]");
    if (!editButton) return;
    const item = findItemBySourceKey(editButton.getAttribute("data-edit-resource"));
    if (item) openEditModal(item);
  });
}

let revealObserver;

function setupRevealObserver() {
  if (revealObserver) revealObserver.disconnect();
  const revealNodes = document.querySelectorAll(".reveal");
  if (!revealNodes.length) return;

  if (prefersReducedMotion) {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
  );

  revealNodes.forEach((node) => revealObserver.observe(node));
}

async function hydrateRemoteCatalog() {
  try {
    setConnectionState(window.UXUI_LIVE_DATA.getStatusSummary());
    if (!window.UXUI_LIVE_DATA.isConfigured()) return;
    await refreshSectionData();
  } catch (error) {
    setConnectionState({ mode: "setup", title: "Error de conexión", message: error.message || "No se pudo sincronizar la base remota." });
  }
}

const currentSection = renderSectionPage();
setupAddModal(currentSection.slug, window.location.hash.replace("#group-", ""));
setupItemActions();
hydrateRemoteCatalog();
