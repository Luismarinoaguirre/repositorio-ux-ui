const data = window.UXUI_TOOLS_DATA;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const state = {
  query: "",
  section: "all",
};

const elements = {
  body: document.body,
  topbar: document.querySelector(".topbar"),
  heroCopy: document.querySelector(".hero-copy"),
  commandShell: document.querySelector(".command-shell"),
  sourceLink: document.querySelector("#source-link"),
  searchInput: document.querySelector("#search-input"),
  filterChips: document.querySelector("#filter-chips"),
  commandPreviewList: document.querySelector("#command-preview-list"),
  previewCount: document.querySelector("#preview-count"),
  heroMetrics: document.querySelector("#hero-metrics"),
  sectionNav: document.querySelector("#section-nav"),
  summaryGrid: document.querySelector("#summary-grid"),
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
              [
                item.title,
                item.url,
                item.note,
                item.domain,
                section.title,
                group.title,
              ]
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

function flattenItems(sections) {
  return sections.flatMap((section) =>
    section.groups.flatMap((group) =>
      group.items.map((item) => ({
        ...item,
        section: section.title,
        sectionSlug: section.slug,
        group: group.title,
      }))
    )
  );
}

function renderHeroMetrics(items) {
  const metrics = [
    { value: data.metadata.itemCount, label: "resources mapped" },
    { value: data.metadata.sectionCount, label: "primary sections" },
    { value: items.length, label: "live matches" },
  ];

  elements.heroMetrics.innerHTML = metrics
    .map(
      (metric, index) => `
        <div class="metric-card reveal" style="--delay:${120 + index * 70}ms">
          <strong>${metric.value}</strong>
          <span>${metric.label}</span>
        </div>
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
          class="filter-chip reveal ${chip.slug === state.section ? "is-active" : ""}"
          type="button"
          data-section="${chip.slug}"
          style="--delay:${index * 36}ms"
        >
          ${chip.title}
        </button>
      `
    )
    .join("");

  elements.filterChips.querySelectorAll("[data-section]").forEach((button) => {
    button.addEventListener("click", () => {
      state.section = button.dataset.section;
      render();
    });
  });
}

function renderPreview(items) {
  const previewItems = items.slice(0, 6);
  elements.previewCount.textContent = `${items.length} matches`;

  if (!previewItems.length) {
    elements.commandPreviewList.innerHTML = `
      <div class="empty-state reveal is-visible">
        <strong>No encontre resultados.</strong>
        <p>Proba con otra palabra o cambia el filtro de seccion.</p>
      </div>
    `;
    return;
  }

  elements.commandPreviewList.innerHTML = previewItems
    .map(
      (item, index) => `
        <a class="preview-link reveal" href="${item.url}" target="_blank" rel="noreferrer" style="--delay:${90 + index * 55}ms">
          <strong>${item.title}</strong>
          <span class="preview-meta">${item.section} / ${item.group} / ${getHostname(item.url)}</span>
        </a>
      `
    )
    .join("");
}

function renderNav(sections) {
  elements.sectionNav.innerHTML = sections
    .map((section, index) => {
      const count = section.groups.reduce((sum, group) => sum + group.items.length, 0);
      return `
        <a class="nav-link reveal reveal-left" href="#section-${section.slug}" style="--delay:${index * 40}ms">
          <span>${section.title}</span>
          <span class="nav-count">${count}</span>
        </a>
      `;
    })
    .join("");
}

function renderSummary(items) {
  const domains = {};
  const groups = {};

  items.forEach((item) => {
    domains[item.domain] = (domains[item.domain] || 0) + 1;
    groups[item.group] = (groups[item.group] || 0) + 1;
  });

  const topDomains = Object.entries(domains)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const topGroups = Object.entries(groups)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  elements.summaryGrid.innerHTML = `
    <article class="summary-card reveal reveal-left" style="--delay:40ms">
      <p class="panel-label">Status</p>
      <h3>Catalogo activo</h3>
      <p>${items.length} recursos visibles en esta vista.</p>
    </article>
    <article class="summary-card reveal reveal-left" style="--delay:90ms">
      <p class="panel-label">Top domains</p>
      <div class="summary-list">
        ${topDomains
          .map(
            ([domain, count]) =>
              `<span class="summary-badge"><strong>${count}</strong> ${domain.replace(/^www\./, "")}</span>`
          )
          .join("")}
      </div>
    </article>
    <article class="summary-card reveal reveal-left" style="--delay:140ms">
      <p class="panel-label">Dense groups</p>
      <div class="summary-list">
        ${topGroups
          .map(
            ([group, count]) =>
              `<span class="summary-badge"><strong>${count}</strong> ${group}</span>`
          )
          .join("")}
      </div>
    </article>
  `;
}

function renderSections(sections) {
  if (!sections.length) {
    elements.sectionsRoot.innerHTML = `
      <div class="empty-state reveal is-visible">
        <strong>Esta vista quedo vacia.</strong>
        <p>Volve a \"Todo\" o usa otro termino de busqueda.</p>
      </div>
    `;
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
            <span class="section-count">${count} resources</span>
          </header>
          <div class="groups-grid">
            ${section.groups
              .map(
                (group, groupIndex) => `
                  <section class="group-card reveal" style="--delay:${100 + groupIndex * 45}ms">
                    <h4>${group.title}</h4>
                    <div class="item-list">
                      ${group.items
                        .map(
                          (item, itemIndex) => `
                            <a class="item-link reveal" href="${item.url}" target="_blank" rel="noreferrer" style="--delay:${120 + itemIndex * 28}ms">
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

function setupInteractiveSurface() {
  if (!elements.commandShell || prefersReducedMotion) return;

  elements.commandShell.addEventListener("pointermove", (event) => {
    const rect = elements.commandShell.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    elements.commandShell.style.setProperty("--mx", `${x}%`);
    elements.commandShell.style.setProperty("--my", `${y}%`);
    elements.commandShell.classList.add("is-active");
  });

  elements.commandShell.addEventListener("pointerleave", () => {
    elements.commandShell.classList.remove("is-active");
  });
}

function applyScrollMotion() {
  const y = window.scrollY || 0;
  const progress = Math.min(y / 900, 1);

  elements.topbar.classList.toggle("is-scrolled", y > 16);

  if (prefersReducedMotion) return;

  if (elements.heroCopy) {
    elements.heroCopy.style.transform = `translate3d(0, ${y * -0.035}px, 0)`;
  }

  if (elements.commandShell) {
    elements.commandShell.style.transform = `translate3d(0, ${y * -0.02}px, 0)`;
  }

  if (elements.ambientA) {
    elements.ambientA.style.transform = `translate3d(${progress * 24}px, ${y * -0.03}px, 0)`;
  }

  if (elements.ambientB) {
    elements.ambientB.style.transform = `translate3d(${progress * -16}px, ${y * 0.02}px, 0)`;
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

function render() {
  const filteredSections = getFilteredSections();
  const items = flattenItems(filteredSections);
  renderHeroMetrics(items);
  renderFilters();
  renderPreview(items);
  renderNav(filteredSections);
  renderSummary(items);
  renderSections(filteredSections);
  setupRevealObserver();
}

function init() {
  elements.sourceLink.href = data.metadata.sourceUrl;
  elements.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value;
    render();
  });

  setupInteractiveSurface();
  window.addEventListener("scroll", onScroll, { passive: true });
  render();
  applyScrollMotion();
}

init();
