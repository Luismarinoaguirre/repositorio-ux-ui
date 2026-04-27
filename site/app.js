let data = window.UXUI_LIVE_DATA.cloneData(window.UXUI_TOOLS_DATA);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const sectionMeta = {
  info: { kicker: "Overview", description: "Contexto y puertas de entrada." },
  "cursos-a-realizar": { kicker: "Learning", description: "Tracks para seguir creciendo." },
  herramientas: { kicker: "Workflow", description: "UX tools y soporte diario." },
  brandings: { kicker: "Identity", description: "Sistemas, color y criterio visual." },
  images: { kicker: "Assets", description: "Bancos visuales y edición." },
  "front-end": { kicker: "Build", description: "Código, APIs y build." },
  elements: { kicker: "Components", description: "Iconos, kits y componentes." },
  mockups: { kicker: "Presentation", description: "Soportes para presentar ideas." },
  animaciones: { kicker: "Motion", description: "Motion, easing y 3D." },
  fonts: { kicker: "Type", description: "Tipografías y escalas." },
  references: { kicker: "Inspiration", description: "Webs y patrones para mirar fino." },
  lecturas: { kicker: "Reading", description: "Artículos, PDFs y talks." },
  libros: { kicker: "Reading", description: "Biblioteca editorial." },
};

const sectionImageMap = {
  info: "./assets/sections/info.jpg",
  "cursos-a-realizar": "./assets/sections/cursos-a-realizar.jpg",
  herramientas: "./assets/sections/herramientas.jpg",
  brandings: "./assets/sections/brandings.jpg",
  images: "./assets/sections/images.jpg",
  "front-end": "./assets/sections/front-end.jpg",
  elements: "./assets/sections/elements.jpg",
  mockups: "./assets/sections/mockups.jpg",
  animaciones: "./assets/sections/animaciones.jpg",
  fonts: "./assets/sections/fonts.jpg",
  references: "./assets/sections/references.png",
  lecturas: "./assets/sections/lecturas.jpg",
  libros: "./assets/sections/libros.jpg",
};

const sectionImagePositionMap = {
  info: "center center",
  "cursos-a-realizar": "center center",
  herramientas: "center center",
  brandings: "center center",
  images: "center center",
  "front-end": "center top",
  elements: "center center",
  mockups: "center center",
  animaciones: "center center",
  fonts: "center center",
  references: "center top",
  lecturas: "center center",
  libros: "center center",
};

const sectionColorMap = {
  info: { rgb: "171, 201, 255", tint: "rgba(171, 201, 255, 0.22)" },
  "cursos-a-realizar": { rgb: "255, 213, 188", tint: "rgba(255, 213, 188, 0.22)" },
  herramientas: { rgb: "198, 226, 203", tint: "rgba(198, 226, 203, 0.22)" },
  brandings: { rgb: "255, 206, 221", tint: "rgba(255, 206, 221, 0.22)" },
  images: { rgb: "255, 224, 209", tint: "rgba(255, 224, 209, 0.22)" },
  "front-end": { rgb: "206, 212, 255", tint: "rgba(206, 212, 255, 0.22)" },
  elements: { rgb: "212, 239, 224", tint: "rgba(212, 239, 224, 0.22)" },
  mockups: { rgb: "255, 222, 197", tint: "rgba(255, 222, 197, 0.22)" },
  animaciones: { rgb: "196, 236, 236", tint: "rgba(196, 236, 236, 0.22)" },
  fonts: { rgb: "255, 240, 201", tint: "rgba(255, 240, 201, 0.22)" },
  references: { rgb: "225, 231, 215", tint: "rgba(225, 231, 215, 0.22)" },
  lecturas: { rgb: "244, 222, 184", tint: "rgba(244, 222, 184, 0.22)" },
  libros: { rgb: "218, 223, 191", tint: "rgba(218, 223, 191, 0.22)" },
};

const mosaicThemes = [
  "theme-sand",
  "theme-night",
  "theme-ice",
  "theme-ink",
  "theme-spectrum",
  "theme-paper",
  "theme-electric",
  "theme-lime",
  "theme-night",
  "theme-sand",
  "theme-spectrum",
  "theme-paper",
];

const mosaicLayouts = ["medium", "wide", "hero", "medium", "portrait", "medium", "hero", "medium", "medium", "medium", "wide", "small"];

const mosaicLayoutOverrides = {
  info: "wide",
  "cursos-a-realizar": "medium",
  herramientas: "hero",
  brandings: "wide",
  images: "portrait",
  "front-end": "medium",
  elements: "wide",
  mockups: "medium",
  animaciones: "wide",
  fonts: "small",
  references: "wide",
  lecturas: "medium",
  libros: "wide",
};

const elements = {
  topbar: document.querySelector(".topbar"),
  heroMosaicGrid: document.querySelector("#hero-mosaic-grid"),
  heroSearchInput: document.querySelector("#hero-search-input"),
  heroSearchResults: document.querySelector("#hero-search-results"),
  heroSearchShell: document.querySelector("#hero-search-shell"),
  ambientA: document.querySelector(".ambient-a"),
  ambientB: document.querySelector(".ambient-b"),
  addModal: document.querySelector("#add-modal"),
  addForm: document.querySelector("#add-resource-form"),
  addSection: document.querySelector("#add-resource-section"),
  addGroup: document.querySelector("#add-resource-group"),
  addOutput: document.querySelector("#add-modal-output"),
  addPreview: document.querySelector("#add-resource-preview"),
  addConnectionState: document.querySelector("#add-connection-state"),
  addConnectionTitle: document.querySelector("#add-connection-title"),
  addConnectionMessage: document.querySelector("#add-connection-message"),
  addResultBox: document.querySelector("#add-result-box"),
  addResultEyebrow: document.querySelector("#add-result-eyebrow"),
  addResultTitle: document.querySelector("#add-result-title"),
  addResultMessage: document.querySelector("#add-result-message"),
};

let revealObserver;
let ticking = false;
let searchIndex = [];

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function getSectionCount(section) {
  return section.groups.reduce((sum, group) => sum + group.items.length, 0);
}

function getSectionBySlug(slug) {
  return data.sections.find((section) => section.slug === slug) || data.sections[0];
}

function getSectionCards() {
  return data.sections.map((section, index) => {
    const meta = sectionMeta[section.slug] || {};
    return {
      slug: section.slug,
      title: section.title,
      kicker: meta.kicker || "Section",
      description: meta.description || "Recursos curados para esta parte del sistema.",
      theme: mosaicThemes[index % mosaicThemes.length],
      layout: mosaicLayoutOverrides[section.slug] || mosaicLayouts[index % mosaicLayouts.length],
      image: sectionImageMap[section.slug] || "",
      imagePosition: sectionImagePositionMap[section.slug] || "center center",
      count: getSectionCount(section),
      tint: (sectionColorMap[section.slug] || {}).tint || "rgba(255, 255, 255, 0.18)",
      rgb: (sectionColorMap[section.slug] || {}).rgb || "255, 255, 255",
    };
  });
}

function getSectionUrl(slug, groupSlug) {
  const url = new URL("./section.html", window.location.href);
  url.searchParams.set("section", slug);
  if (groupSlug) url.hash = `group-${groupSlug}`;
  return url.toString();
}

function getSearchIndex() {
  const entries = [];

  data.sections.forEach((section) => {
    entries.push({
      type: "section",
      label: section.title,
      meta: `${getSectionCount(section)} recursos`,
      searchText: [section.title, section.slug].join(" "),
      href: getSectionUrl(section.slug),
    });

    section.groups.forEach((group) => {
      entries.push({
        type: "grupo",
        label: group.title,
        meta: section.title,
        searchText: [section.title, group.title, group.slug].join(" "),
        href: getSectionUrl(section.slug, group.slug),
      });

      group.items.forEach((item) => {
        entries.push({
          type: "link",
          label: item.title,
          meta: `${section.title} / ${group.title}`,
          searchText: [section.title, group.title, item.title, item.domain, item.note, item.type, Array.isArray(item.tags) ? item.tags.join(" ") : ""].join(" "),
          href: item.url,
          external: true,
        });
      });
    });
  });

  return entries;
}

function refreshSearchIndex() {
  searchIndex = getSearchIndex();
}

function renderHeroMosaic() {
  if (!elements.heroMosaicGrid) return;
  const cards = getSectionCards();
  elements.heroMosaicGrid.innerHTML = cards
    .map(
      (card, index) => `
        <a class="mosaic-card ${card.layout} ${card.theme} ${card.image ? "has-image" : ""} reveal" data-slug="${card.slug}" href="./section.html?section=${card.slug}" style="--delay:${70 + index * 28}ms; ${card.image ? `--card-image:url(${card.image}); --card-image-position:${card.imagePosition}; --section-tint:${card.tint}; --section-rgb:${card.rgb};` : `--section-tint:${card.tint}; --section-rgb:${card.rgb};`}">
          ${card.image ? `<div class="mosaic-card-media" aria-hidden="true"></div>` : ""}
          <div class="mosaic-card-overlay"></div>
          <div class="mosaic-card-inner">
            <div class="mosaic-card-top">
              <span class="mosaic-kicker">${card.kicker}</span>
              <span class="mosaic-count">${card.count} recursos</span>
            </div>
            <div class="mosaic-visual">
              <span class="shape shape-a"></span>
              <span class="shape shape-b"></span>
              <span class="shape shape-c"></span>
            </div>
            <div class="mosaic-copy">
              <h3>${card.title}</h3>
              <p>${card.description}</p>
            </div>
          </div>
        </a>
      `
    )
    .join("");

  setupRevealObserver();
}

function renderSearchResults(query) {
  const normalized = normalize(query);
  elements.heroSearchShell.classList.toggle("has-query", normalized.length > 0);

  if (normalized.length < 2) {
    elements.heroSearchResults.hidden = true;
    elements.heroSearchResults.innerHTML = "";
    return;
  }

  const matches = searchIndex
    .filter((entry) => normalize(entry.searchText).includes(normalized))
    .slice(0, 8);

  if (!matches.length) {
    elements.heroSearchResults.hidden = false;
    elements.heroSearchResults.innerHTML = `
      <div class="hero-search-empty">
        <strong>Sin coincidencias</strong>
        <span>Probá con otra palabra o una sección más general.</span>
      </div>
    `;
    return;
  }

  elements.heroSearchResults.hidden = false;
  elements.heroSearchResults.innerHTML = matches
    .map(
      (match) => `
        <a class="hero-search-result" href="${match.href}" ${match.external ? 'target="_blank" rel="noreferrer"' : ""}>
          <span class="hero-search-type">${match.type}</span>
          <span class="hero-search-main">
            <strong>${match.label}</strong>
            <small>${match.meta}</small>
          </span>
        </a>
      `
    )
    .join("");
}

function setupHeroSearch() {
  if (!elements.heroSearchInput) return;
  elements.heroSearchInput.addEventListener("input", (event) => {
    renderSearchResults(event.target.value);
  });

  elements.heroSearchInput.addEventListener("focus", (event) => {
    elements.heroSearchShell.classList.add("is-focused");
    renderSearchResults(event.target.value);
  });

  elements.heroSearchInput.addEventListener("blur", () => {
    elements.heroSearchShell.classList.remove("is-focused");
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".hero-search-shell")) {
      elements.heroSearchResults.hidden = true;
    }
  });
}

function parseTags(value) {
  return String(value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function updateGroupOptions(sectionSlug, preferredGroupSlug = "") {
  const section = getSectionBySlug(sectionSlug);
  elements.addGroup.innerHTML = section.groups
    .map(
      (group) => `<option value="${group.slug}" ${group.slug === preferredGroupSlug ? "selected" : ""}>${group.title}</option>`
    )
    .join("");
}

function populateSectionOptions(defaultSectionSlug = data.sections[0]?.slug, defaultGroupSlug = "") {
  elements.addSection.innerHTML = data.sections
    .map(
      (section) => `<option value="${section.slug}" ${section.slug === defaultSectionSlug ? "selected" : ""}>${section.title}</option>`
    )
    .join("");
  updateGroupOptions(defaultSectionSlug, defaultGroupSlug);
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
  if (!elements.addConnectionState) return;
  elements.addConnectionState.classList.remove("is-live", "is-setup", "is-syncing");
  elements.addConnectionState.classList.add(`is-${summary.mode}`);
  elements.addConnectionTitle.textContent = summary.title;
  elements.addConnectionMessage.textContent = summary.message;
}

function setModalResult(mode, title, message, payload) {
  if (!elements.addOutput) return;
  elements.addOutput.hidden = false;
  elements.addResultBox.classList.remove("is-success", "is-error", "is-info");
  elements.addResultBox.classList.add(mode === "success" ? "is-success" : mode === "error" ? "is-error" : "is-info");
  elements.addResultEyebrow.textContent = mode === "success" ? "Guardado" : mode === "error" ? "Error" : "Setup";
  elements.addResultTitle.textContent = title;
  elements.addResultMessage.textContent = message;

  if (payload) {
    elements.addPreview.hidden = false;
    elements.addPreview.textContent = JSON.stringify(toPreviewPayload(payload), null, 2);
  } else {
    elements.addPreview.hidden = true;
    elements.addPreview.textContent = "";
  }
}

function closeAddModal() {
  if (!elements.addModal) return;
  elements.addModal.hidden = true;
  document.body.classList.remove("modal-open");
}

function openAddModal() {
  if (!elements.addModal) return;
  elements.addModal.hidden = false;
  document.body.classList.add("modal-open");
}

function setupAddModal(defaultSectionSlug = data.sections[0]?.slug, defaultGroupSlug = "") {
  if (!elements.addModal || !elements.addForm) return;

  populateSectionOptions(defaultSectionSlug, defaultGroupSlug);
  setConnectionState(window.UXUI_LIVE_DATA.getStatusSummary());

  elements.addSection.addEventListener("change", (event) => {
    updateGroupOptions(event.target.value);
  });

  document.querySelectorAll("[data-open-add-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      openAddModal();
    });
  });

  document.querySelectorAll("[data-close-add-modal]").forEach((button) => {
    button.addEventListener("click", closeAddModal);
  });

  elements.addForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(elements.addForm);
    const selectedSection = getSectionBySlug(formData.get("section"));
    const selectedGroup = selectedSection.groups.find((group) => group.slug === formData.get("group")) || selectedSection.groups[0];
    const rawFile = formData.get("file");
    const activeFile = rawFile && typeof rawFile === "object" && rawFile.name ? rawFile : null;
    const payload = {
      title: String(formData.get("title") || "").trim(),
      section: selectedSection.slug,
      sectionTitle: selectedSection.title,
      group: selectedGroup.slug,
      groupTitle: selectedGroup.title,
      url: String(formData.get("url") || "").trim(),
      note: String(formData.get("note") || "").trim(),
      fileName: activeFile ? activeFile.name : "",
      file: activeFile,
      tags: parseTags(formData.get("tags")),
      createdAt: new Date().toISOString(),
    };

    if (!payload.url && !payload.file) {
      setModalResult("error", "Falta contenido", "Necesitás cargar un link o subir un archivo para guardar el recurso.", payload);
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

    const submitButton = elements.addForm.querySelector("button[type='submit']");
    const originalLabel = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Guardando...";
    setConnectionState({ mode: "syncing", title: "Guardando recurso", message: "Estamos enviando la entrada a la base remota." });

    try {
      const stored = await window.UXUI_LIVE_DATA.submitResource(payload);
      data = window.UXUI_LIVE_DATA.mergeRecords(data, [stored]);
      refreshSearchIndex();
      renderHeroMosaic();
      populateSectionOptions(selectedSection.slug, selectedGroup.slug);
      setConnectionState(window.UXUI_LIVE_DATA.getStatusSummary());
      setModalResult(
        "success",
        "Recurso guardado",
        stored.file_name
          ? "El recurso y su archivo ya quedaron persistidos en la base live. También se van a reflejar en la home y en su sección."
          : "La entrada ya quedó persistida en la base. También se va a reflejar en la home y en su sección.",
        stored
      );
      elements.addForm.reset();
      populateSectionOptions(selectedSection.slug, selectedGroup.slug);
    } catch (error) {
      setConnectionState(window.UXUI_LIVE_DATA.getStatusSummary());
      setModalResult("error", "No se pudo guardar", error.message || "Revisá la configuración de Supabase y probá de nuevo.", payload);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalLabel;
    }
  });
}

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

function applyScrollMotion() {
  const y = window.scrollY || 0;
  const progress = Math.min(y / 900, 1);

  if (elements.topbar) {
    elements.topbar.style.transform = y > 16 ? "translateY(4px)" : "translateY(0)";
  }

  if (prefersReducedMotion) return;

  if (elements.ambientA) {
    elements.ambientA.style.transform = `translate3d(${progress * 18}px, ${y * -0.026}px, 0)`;
  }

  if (elements.ambientB) {
    elements.ambientB.style.transform = `translate3d(${progress * -14}px, ${y * 0.018}px, 0)`;
  }
}

function onScroll() {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(() => {
    applyScrollMotion();
    ticking = false;
  });
}

async function hydrateRemoteCatalog() {
  try {
    const summary = window.UXUI_LIVE_DATA.getStatusSummary();
    setConnectionState(summary);
    if (!window.UXUI_LIVE_DATA.isConfigured()) return;
    const result = await window.UXUI_LIVE_DATA.fetchAndMerge(data);
    data = result.data;
    refreshSearchIndex();
    renderHeroMosaic();
    setConnectionState({ mode: "live", title: "Base conectada", message: `${result.rows.length} recursos live sincronizados desde la base.` });
  } catch (error) {
    setConnectionState({ mode: "setup", title: "Error de conexión", message: error.message || "No se pudo sincronizar la base remota." });
  }
}

async function init() {
  refreshSearchIndex();
  renderHeroMosaic();
  setupHeroSearch();
  setupAddModal();
  applyScrollMotion();
  setupRevealObserver();
  window.addEventListener("scroll", onScroll, { passive: true });
  await hydrateRemoteCatalog();
}

init();
