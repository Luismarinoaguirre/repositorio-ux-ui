const data = window.UXUI_TOOLS_DATA;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const state = {
  query: "",
  section: "all",
};

const featuredSectionSlugs = ["herramientas", "elements", "images", "references"];
const featuredVisuals = {
  herramientas: {
    description: "Maps, UX tools y flujo de trabajo.",
    background: "linear-gradient(135deg, rgba(143,179,255,0.34), rgba(110,231,216,0.16))",
    bars: [120, 94, 146],
  },
  elements: {
    description: "Iconos, componentes y piezas editables.",
    background: "linear-gradient(135deg, rgba(215,255,100,0.26), rgba(143,179,255,0.12))",
    bars: [88, 144, 118],
  },
  images: {
    description: "Bancos visuales, edición y recursos multimedia.",
    background: "linear-gradient(135deg, rgba(110,231,216,0.24), rgba(255,255,255,0.06))",
    bars: [132, 82, 126],
  },
  references: {
    description: "Inspiración, webs y patrones para mirar fino.",
    background: "linear-gradient(135deg, rgba(143,179,255,0.24), rgba(255,114,95,0.14))",
    bars: [110, 138, 92],
  },
};

const elements = {
  topbar: document.querySelector(".topbar"),
  sourceLink: document.querySelector("#source-link"),
  searchInput: document.querySelector("#search-input"),
  filterChips: document.querySelector("#filter-chips"),
  featuredSections: document.querySelector("#featured-sections"),
  sectionsRoot: document.querySelector("#sections-root"),
  ambientA: document.querySelector(".ambient-a"),
  ambientB: document.querySelector(".ambient-b"),
};

let revealObserver;
let ticking = false;

function normalize(value) {
  return value.toLowerCase().trim();
}

function getHostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch (error) {
    return url;
  }
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

function getFeaturedSections() {
  return featuredSectionSlugs
    .map((slug) => data.sections.find((section) => section.slug === slug))
    .filter(Boolean);
}

function renderFeaturedSections() {
  const featured = getFeaturedSections();
  elements.featuredSections.innerHTML = featured
    .map((section, index) => {
      const visual = featuredVisuals[section.slug];
      const count = section.groups.reduce((sum, group) => sum + group.items.length, 0);
      return `
        <a class="featured-card reveal" href="#section-${section.slug}" style="--feature-bg:${visual.background}; --delay:${80 + index * 60}ms">
          <div class="featured-card-inner">
            <div>
              <span class="group-meta">${count} recursos</span>
              <h3>${section.title}</h3>
              <p>${visual.description}</p>
            </div>
            <div class="featured-visual">
              ${visual.bars
                .map((height) => `<span class="featured-bar" style="--bar-height:${height}px"></span>`)
                .join("")}
            </div>
          </div>
        </a>
      `;
    })
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
      renderSections();
    });
  });
}

function renderSections() {
  const sections = getFilteredSections();

  if (!sections.length) {
    elements.sectionsRoot.innerHTML = `
      <div class="empty-state reveal is-visible">
        <strong>No encontre coincidencias.</strong>
        <p>Probá con otra palabra o volvé al filtro "Todo".</p>
      </div>
    `;
    setupRevealObserver();
    return;
  }

  elements.sectionsRoot.innerHTML = sections
    .map((section, sectionIndex) => {
      const count = section.groups.reduce((sum, group) => sum + group.items.length, 0);
      return `
        <article class="section-card reveal" id="section-${section.slug}" style="--delay:${sectionIndex * 60}ms">
          <header class="section-header">
            <div>
              <p class="panel-label">Section</p>
              <h3>${section.title}</h3>
            </div>
            <span class="section-count">${count} recursos</span>
          </header>
          <div class="groups-grid">
            ${section.groups
              .map(
                (group, groupIndex) => `
                  <section class="group-card reveal" style="--delay:${80 + groupIndex * 40}ms">
                    <span class="group-meta">${group.items.length} links</span>
                    <h4>${group.title}</h4>
                    <div class="item-list">
                      ${group.items
                        .map(
                          (item, itemIndex) => `
                            <a class="item-link reveal" href="${item.url}" target="_blank" rel="noreferrer" style="--delay:${100 + itemIndex * 24}ms">
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
                  </section>
                `
              )
              .join("")}
          </div>
        </article>
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
  renderFeaturedSections();
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
