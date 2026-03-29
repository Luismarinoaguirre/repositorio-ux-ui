const data = window.UXUI_TOOLS_DATA;
const sectionRoot = document.querySelector("#section-shell");

function getSectionFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("section") || data.sections[0]?.slug;
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

function renderSectionPage() {
  const section = getSectionFromQuery();
  if (!section) return;

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
                          <span class="code-count">${group.items.length} links</span>
                        </div>
                        <h2>${group.title}</h2>
                      </div>
                      <span class="group-fold-toggle" aria-hidden="true"></span>
                    </summary>
                    <div class="code-list">
                      ${group.items
                        .map(
                          (item, itemIndex) => `
                            <a class="code-line reveal" href="${item.url}" target="_blank" rel="noreferrer" style="--delay:${170 + itemIndex * 24}ms">
                              <span class="code-line-number">${String(itemIndex + 1).padStart(2, "0")}</span>
                              <span class="code-line-content">
                                <span class="code-token keyword">const</span>
                                <span class="code-token variable">${item.title}</span>
                                <span class="code-token operator">=</span>
                                <span class="code-token string">\"${getHostname(item.url)}\"</span>
                              </span>
                              <span class="code-line-arrow">open</span>
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
      </section>
    </div>
  `;

  setupRevealObserver();
}

let revealObserver;

function setupRevealObserver() {
  if (revealObserver) revealObserver.disconnect();
  const revealNodes = document.querySelectorAll(".reveal");
  if (!revealNodes.length) return;

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

renderSectionPage();
