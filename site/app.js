const data = window.UXUI_TOOLS_DATA;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  heroMosaicGrid: document.querySelector("#hero-mosaic-grid"),
  heroSearchInput: document.querySelector("#hero-search-input"),
  heroSearchResults: document.querySelector("#hero-search-results"),
  ambientA: document.querySelector(".ambient-a"),
  ambientB: document.querySelector(".ambient-b"),
};

let revealObserver;
let ticking = false;

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

function normalize(value) {
  return String(value || "").toLowerCase().trim();
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
          searchText: [section.title, group.title, item.title, item.domain, item.note].join(" "),
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
        <a class="mosaic-card ${card.layout} ${card.theme} reveal" href="./section.html?section=${card.slug}" style="--delay:${70 + index * 28}ms">
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
    renderSearchResults(event.target.value);
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".hero-search-shell")) {
      elements.heroSearchResults.hidden = true;
    }
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
  applyScrollMotion();
  setupRevealObserver();
  window.addEventListener("scroll", onScroll, { passive: true });
}

init();
