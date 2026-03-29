const data = window.UXUI_TOOLS_DATA;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const sectionMeta = {
  info: {
    kicker: "Overview",
    description: "Contexto y puertas de entrada.",
  },
  "cursos-a-realizar": {
    kicker: "Learning",
    description: "Tracks para seguir creciendo.",
  },
  herramientas: {
    kicker: "Workflow",
    description: "UX tools y soporte diario.",
  },
  brandings: {
    kicker: "Identity",
    description: "Sistemas, color y criterio visual.",
  },
  images: {
    kicker: "Assets",
    description: "Bancos visuales y edición.",
  },
  "front-end": {
    kicker: "Build",
    description: "Código, APIs y build.",
  },
  elements: {
    kicker: "Components",
    description: "Iconos, kits y componentes.",
  },
  mockups: {
    kicker: "Presentation",
    description: "Soportes para presentar ideas.",
  },
  animaciones: {
    kicker: "Motion",
    description: "Motion, easing y 3D.",
  },
  fonts: {
    kicker: "Type",
    description: "Tipografías y escalas.",
  },
  references: {
    kicker: "Inspiration",
    description: "Webs y patrones para mirar fino.",
  },
  lecturas: {
    kicker: "Reading",
    description: "Artículos, PDFs y talks.",
  },
  libros: {
    kicker: "Reading",
    description: "Biblioteca editorial.",
  },
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

const mosaicLayouts = [
  "medium",
  "wide",
  "hero",
  "medium",
  "portrait",
  "medium",
  "hero",
  "medium",
  "medium",
  "medium",
  "wide",
  "small",
];

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
};

let revealObserver;
let ticking = false;

function getSectionCount(section) {
  return section.groups.reduce((sum, group) => sum + group.items.length, 0);
}

function normalize(value) {
  return String(value || "").toLowerCase().trim();
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

const searchIndex = getSearchIndex();

function renderHeroMosaic() {
  const cards = getSectionCards();

  elements.heroMosaicGrid.innerHTML = cards
    .map(
      (card, index) => `
        <a class="mosaic-card ${card.layout} ${card.theme} ${card.image ? "has-image" : ""} reveal" data-slug="${card.slug}" href="./section.html?section=${card.slug}" style="--delay:${70 + index * 28}ms; ${card.image ? `--card-image:url(${card.image}); --card-image-position:${card.imagePosition};` : ""}">
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

function getSectionBySlug(slug) {
  return data.sections.find((section) => section.slug === slug) || data.sections[0];
}

function updateGroupOptions(sectionSlug, preferredGroupSlug = "") {
  const section = getSectionBySlug(sectionSlug);
  elements.addGroup.innerHTML = section.groups
    .map(
      (group) => `<option value="${group.slug}" ${group.slug === preferredGroupSlug ? "selected" : ""}>${group.title}</option>`
    )
    .join("");
}

function setupAddModal(defaultSectionSlug = data.sections[0]?.slug, defaultGroupSlug = "") {
  if (!elements.addModal || !elements.addForm) return;

  elements.addSection.innerHTML = data.sections
    .map(
      (section) => `<option value="${section.slug}" ${section.slug === defaultSectionSlug ? "selected" : ""}>${section.title}</option>`
    )
    .join("");

  updateGroupOptions(defaultSectionSlug, defaultGroupSlug);

  elements.addSection.addEventListener("change", (event) => {
    updateGroupOptions(event.target.value);
  });

  document.querySelectorAll("[data-open-add-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      elements.addModal.hidden = false;
      document.body.classList.add("modal-open");
    });
  });

  document.querySelectorAll("[data-close-add-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      elements.addModal.hidden = true;
      document.body.classList.remove("modal-open");
    });
  });

  elements.addForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(elements.addForm);
    const draft = {
      title: formData.get("title"),
      section: formData.get("section"),
      group: formData.get("group"),
      url: formData.get("url"),
      note: formData.get("note"),
      fileName: formData.get("file") && formData.get("file").name ? formData.get("file").name : "",
      createdAt: new Date().toISOString(),
    };

    elements.addOutput.hidden = false;
    elements.addPreview.textContent = JSON.stringify(draft, null, 2);
  });
}

function setupRevealObserver() {
  if (revealObserver) {
    revealObserver.disconnect();
  }

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
    {
      threshold: 0.14,
      rootMargin: "0px 0px -6% 0px",
    }
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

function init() {
  renderHeroMosaic();
  setupHeroSearch();
  setupAddModal();
  applyScrollMotion();
  setupRevealObserver();
  window.addEventListener("scroll", onScroll, { passive: true });
}

init();
