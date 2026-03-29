const data = window.UXUI_TOOLS_DATA;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const state = {
  query: "",
  section: "all",
};

const sectionMeta = {
  info: {
    kicker: "Overview",
    description: "Contexto, notas base y links de entrada para el vault.",
  },
  "cursos-a-realizar": {
    kicker: "Learning",
    description: "Cursos, tracks y material para seguir sumando skillset.",
  },
  herramientas: {
    kicker: "Workflow",
    description: "UX tools, research y soporte de proceso para el dia a dia.",
  },
  brandings: {
    kicker: "Identity",
    description: "Guidelines, palettes, branding systems y referencias visuales.",
  },
  images: {
    kicker: "Assets",
    description: "Bancos visuales, fotografia, edicion y recursos multimedia.",
  },
  "front-end": {
    kicker: "Build",
    description: "Frontend references, snippets y recursos para implementar.",
  },
  elements: {
    kicker: "Components",
    description: "Iconos, UI kits, componentes y piezas listas para usar.",
  },
  mockups: {
    kicker: "Presentation",
    description: "Soportes para mostrar producto, interfaces y conceptos.",
  },
  animaciones: {
    kicker: "Motion",
    description: "Herramientas y referencias para movimiento e interaccion.",
  },
  fonts: {
    kicker: "Type",
    description: "Tipografias, combinaciones y criterio para sistemas tipograficos.",
  },
  references: {
    kicker: "Inspiration",
    description: "Webs, estudios y patrones para mirar fino antes de diseñar.",
  },
  libros: {
    kicker: "Reading",
    description: "Libros y material editorial para profundizar criterio y proceso.",
  },
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
  "tall",
  "wide",
  "hero",
  "portrait",
  "medium",
  "small",
  "medium",
  "tall",
  "small",
  "medium",
  "wide",
  "small",
];

const elements = {
  topbar: document.querySelector(".topbar"),
  searchInput: document.querySelector("#search-input"),
  filterChips: document.querySelector("#filter-chips"),
  heroMosaicGrid: document.querySelector("#hero-mosaic-grid"),
  sectionsRoot: document.querySelector("#sections-root"),
  ambientA: document.querySelector(".ambient-a"),
  ambientB: document.querySelector(".ambient-b"),
};

let revealObserver;
let ticking = false;

function normalize(value) {
  return String(value || "").toLowerCase().trim();
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

function getSectionCards() {
  return data.sections.map((section, index) => {
    const meta = sectionMeta[section.slug] || {};
    return {
      slug: section.slug,
      title: section.title,
      kicker: meta.kicker || "Section",
      description: meta.description || "Recursos curados para esta parte del sistema.",
      theme: mosaicThemes[index % mosaicThemes.length],
      layout: mosaicLayouts[index % mosaicLayouts.length],
      count: getSectionCount(section),
    };
  });
}

function getFilteredSections() {
  const query = normalize(state.query);

  return data.sections
    .filter((section) => state.section === "all" || section.slug === state.section)
    .map((section) => {
      const groups = section.groups
        .map((group) => {
          const items = group.items.filter((item) => {
            if (!query) return true;
            const haystack = normalize(
              [item.title, item.url, item.note, item.domain, section.title, group.title]
                .filter(Boolean)
                .join(" ")
            );
            return haystack.includes(query);
          });

          return { ...group, items };
        })
        .filter((group) => group.items.length > 0);

      return { ...section, groups };
    })
    .filter((section) => section.groups.length > 0);
}

function renderHeroMosaic() {
  const cards = getSectionCards();

  elements.heroMosaicGrid.innerHTML = cards
    .map(
      (card, index) => `
        <a class="mosaic-card ${card.layout} ${card.theme} reveal" href="#section-${card.slug}" style="--delay:${80 + index * 35}ms">
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

function renderFilters() {
  const chips = [
    { slug: "all", title: "Todo" },
    ...data.sections.map((section) => ({ slug: section.slug, title: section.title })),
  ];

  elements.filterChips.innerHTML = chips
    .map(
      (chip, index) => `
        <button
          class="filter-chip ${chip.slug === state.section ? "is-active" : ""}"
          type="button"
          data-section="${chip.slug}"
          style="--delay:${index * 24}ms"
        >
          ${chip.title}
        </button>
      `
    )
    .join("");

  elements.filterChips.querySelectorAll("[data-section]").forEach((button) => {
    button.addEventListener("click", () => {
      state.section = button.dataset.section;
      renderFilters();
      renderSections();
    });
  });
}

function renderSections() {
  const sections = getFilteredSections();
  const queryActive = Boolean(normalize(state.query));
  const filteredView = state.section !== "all";

  if (!sections.length) {
    elements.sectionsRoot.innerHTML = `
      <div class="empty-state reveal is-visible">
        <strong>No encontre coincidencias.</strong>
        <p>Proba con otra palabra o volve al filtro "Todo".</p>
      </div>
    `;
    setupRevealObserver();
    return;
  }

  elements.sectionsRoot.innerHTML = sections
    .map((section, sectionIndex) => {
      const count = getSectionCount(section);
      const sectionOpen = queryActive || filteredView || sectionIndex === 0;
      return `
        <details class="section-dropdown reveal" id="section-${section.slug}" style="--delay:${sectionIndex * 60}ms" ${sectionOpen ? "open" : ""}>
          <summary class="section-summary">
            <div class="section-summary-copy">
              <p class="panel-label">Section</p>
              <h3>${section.title}</h3>
            </div>
            <div class="section-summary-meta">
              <span class="section-count">${count} recursos</span>
              <span class="section-toggle" aria-hidden="true"></span>
            </div>
          </summary>
          <div class="section-dropdown-body">
            <div class="group-stack">
              ${section.groups
                .map((group, groupIndex) => {
                  const groupOpen = queryActive || groupIndex === 0;
                  return `
                    <details class="group-card group-dropdown reveal" style="--delay:${80 + groupIndex * 36}ms" ${groupOpen ? "open" : ""}>
                      <summary class="group-summary">
                        <div>
                          <span class="group-meta">${group.items.length} links</span>
                          <h4>${group.title}</h4>
                        </div>
                        <span class="group-toggle" aria-hidden="true"></span>
                      </summary>
                      <div class="item-list">
                        ${group.items
                          .map(
                            (item, itemIndex) => `
                              <a class="item-link reveal" href="${item.url}" target="_blank" rel="noreferrer" style="--delay:${100 + itemIndex * 22}ms">
                                <span>
                                  <span class="item-title">${item.title}</span>
                                  ${item.note ? `<span class="item-note">${item.note}</span>` : ""}
                                </span>
                                <span class="item-domain">${getHostname(item.url)}</span>
                              </a>
                            `
                          )
                          .join("")}
                      </div>
                    </details>
                  `;
                })
                .join("")}
            </div>
          </div>
        </details>
      `;
    })
    .join("");

  setupRevealObserver();
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
  renderFilters();
  renderSections();

  elements.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value;
    renderSections();
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  applyScrollMotion();
  setupRevealObserver();
}

init();
