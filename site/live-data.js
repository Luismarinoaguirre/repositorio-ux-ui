(function () {
  const baseCatalog = window.UXUI_TOOLS_DATA || { metadata: {}, sections: [] };
  const config = window.UXUI_DB_CONFIG || {};

  function cloneData(data) {
    return JSON.parse(JSON.stringify(data));
  }

  function normalizeSlug(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function slugToTitle(slug) {
    return String(slug || "")
      .split("-")
      .filter(Boolean)
      .map((part) => (part.length <= 2 ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1)))
      .join(" ");
  }

  function inferType(url, fileName) {
    const lowered = String(fileName || url || "").toLowerCase();
    if (lowered.endsWith(".pdf")) return "PDF";
    if (lowered.includes("youtube.com") || lowered.includes("youtu.be") || lowered.includes("vimeo.com")) return "Video";
    return "Link";
  }

  function getDomain(url) {
    try {
      return new URL(url).hostname;
    } catch (error) {
      return url || "";
    }
  }

  function buildNote(record, type) {
    if (record.note) return record.note;
    const bits = [type];
    if (record.file_name) bits.push(`Archivo: ${record.file_name}`);
    if (Array.isArray(record.tags) && record.tags.length) bits.push(`Tags: ${record.tags.join(", ")}`);
    if (record.created_at) {
      const date = new Date(record.created_at);
      if (!Number.isNaN(date.getTime())) {
        bits.push(`Cargado el ${date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`);
      }
    }
    return bits.join(" · ");
  }

  function updateMetadata(data) {
    const items = [];
    data.sections.forEach((section) => {
      section.groups.forEach((group) => {
        group.items.forEach((item) => items.push(item));
      });
    });

    const domainCounts = items.reduce((accumulator, item) => {
      if (!item.domain) return accumulator;
      accumulator[item.domain] = (accumulator[item.domain] || 0) + 1;
      return accumulator;
    }, {});

    data.metadata.itemCount = items.length;
    data.metadata.sectionCount = data.sections.length;
    data.metadata.topDomains = Object.entries(domainCounts)
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .slice(0, 10)
      .map(([domain, count]) => ({ domain, count }));
  }

  function ensureSection(data, slug, title) {
    let section = data.sections.find((entry) => entry.slug === slug);
    if (!section) {
      section = {
        title: title || slugToTitle(slug),
        slug,
        groups: [],
      };
      data.sections.push(section);
    }
    return section;
  }

  function ensureGroup(section, slug, title) {
    let group = section.groups.find((entry) => entry.slug === slug);
    if (!group) {
      group = {
        title: title || slugToTitle(slug),
        slug,
        items: [],
      };
      section.groups.push(group);
    }
    return group;
  }

  function toCatalogItem(record) {
    const type = inferType(record.url, record.file_name);
    return {
      title: record.title,
      url: record.url,
      note: buildNote(record, type),
      domain: getDomain(record.url),
      type,
      tags: Array.isArray(record.tags) ? record.tags : [],
      date: record.created_at ? String(record.created_at).slice(0, 10) : "",
    };
  }

  function mergeRecords(sourceData, records) {
    const next = cloneData(sourceData);

    records.forEach((record) => {
      if (!record || !record.title || !record.url) return;

      const sectionSlug = normalizeSlug(record.section);
      const groupSlug = normalizeSlug(record.group_slug || record.group || "general");
      if (!sectionSlug || !groupSlug) return;

      const section = ensureSection(next, sectionSlug, record.section_title || slugToTitle(sectionSlug));
      const group = ensureGroup(section, groupSlug, record.group_title || slugToTitle(groupSlug));
      const nextItem = toCatalogItem(record);

      const existing = group.items.find((item) => item.url === nextItem.url || item.title === nextItem.title);
      if (existing) {
        Object.assign(existing, nextItem);
      } else {
        group.items.push(nextItem);
      }
    });

    updateMetadata(next);
    return next;
  }

  function isConfigured() {
    return Boolean(
      config.enabled &&
        config.provider === "supabase" &&
        config.supabaseUrl &&
        config.supabaseKey &&
        config.table
    );
  }

  function getBaseUrl() {
    return String(config.supabaseUrl || "").replace(/\/$/, "");
  }

  function getHeaders() {
    return {
      apikey: config.supabaseKey,
      Authorization: `Bearer ${config.supabaseKey}`,
      "Content-Type": "application/json",
    };
  }

  function encodeStoragePath(bucket, filePath) {
    const encodedBucket = encodeURIComponent(bucket);
    const encodedPath = String(filePath || "")
      .split("/")
      .filter(Boolean)
      .map((part) => encodeURIComponent(part))
      .join("/");
    return `${encodedBucket}/${encodedPath}`;
  }

  function buildPublicFileUrl(bucket, filePath) {
    if (!config.storagePublic || !bucket || !filePath) return "";
    return `${getBaseUrl()}/storage/v1/object/public/${encodeStoragePath(bucket, filePath)}`;
  }

  function sanitizeFileName(fileName) {
    const raw = String(fileName || "").trim();
    const parts = raw.split(".");
    const extension = parts.length > 1 ? parts.pop() : "";
    const stem = parts.join(".") || raw;
    const safeStem = normalizeSlug(stem) || "file";
    const safeExtension = String(extension || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 12);
    return safeExtension ? `${safeStem}.${safeExtension}` : safeStem;
  }

  function getStoragePath(file, payload) {
    const prefix = normalizeSlug(config.uploadsPrefix || "uploads") || "uploads";
    const section = normalizeSlug(payload.section) || "general";
    const group = normalizeSlug(payload.group) || "general";
    const safeName = sanitizeFileName(file && file.name ? file.name : payload.fileName || "file");
    const timestamp = new Date(payload.createdAt || Date.now()).toISOString().replace(/[:.]/g, "-");
    return [prefix, section, group, `${timestamp}-${safeName}`].join("/");
  }

  async function uploadFile(file, payload) {
    const bucket = String(config.storageBucket || "").trim();
    if (!bucket) {
      throw new Error("Falta definir storageBucket en config.js.");
    }

    const filePath = getStoragePath(file, payload);
    const endpoint = `${getBaseUrl()}/storage/v1/object/${encodeStoragePath(bucket, filePath)}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: config.supabaseKey,
        Authorization: `Bearer ${config.supabaseKey}`,
        "x-upsert": "false",
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "No se pudo subir el archivo a Supabase Storage.");
    }

    return {
      fileName: file.name || payload.fileName || "",
      filePath,
      publicUrl: buildPublicFileUrl(bucket, filePath),
    };
  }

  async function fetchRows() {
    if (!isConfigured()) return [];

    const params = new URLSearchParams();
    params.set(
      "select",
      "title,section,section_title,group_slug,group_title,url,note,file_name,file_path,file_public_url,tags,created_at,status"
    );
    if (config.statusColumn && config.publishedValue) {
      params.set(config.statusColumn, `eq.${config.publishedValue}`);
    }
    params.set("order", "created_at.desc");

    const endpoint = `${getBaseUrl()}/rest/v1/${config.table}?${params.toString()}`;
    const response = await fetch(endpoint, { headers: getHeaders() });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "No se pudo leer la base remota.");
    }
    return response.json();
  }

  async function fetchAndMerge(sourceData) {
    const rows = await fetchRows();
    return {
      rows,
      data: mergeRecords(sourceData, rows),
    };
  }

  async function submitResource(payload) {
    if (!isConfigured()) {
      throw new Error("La base no esta configurada todavia.");
    }

    const activeFile = payload.file && payload.file.name ? payload.file : null;
    const uploadedFile = activeFile ? await uploadFile(activeFile, payload) : null;
    const resolvedUrl = String(payload.url || uploadedFile?.publicUrl || "").trim();

    if (!resolvedUrl) {
      throw new Error("Necesitás cargar un link o subir un archivo.");
    }

    const body = {
      title: payload.title,
      section: payload.section,
      section_title: payload.sectionTitle,
      group_slug: payload.group,
      group_title: payload.groupTitle,
      url: resolvedUrl,
      note: payload.note || "",
      file_name: uploadedFile?.fileName || payload.fileName || "",
      file_path: uploadedFile?.filePath || "",
      file_public_url: uploadedFile?.publicUrl || "",
      tags: Array.isArray(payload.tags) ? payload.tags : [],
      status: config.publishedValue || "published",
      created_at: payload.createdAt || new Date().toISOString(),
    };

    const endpoint = `${getBaseUrl()}/rest/v1/${config.table}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        ...getHeaders(),
        Prefer: "return=representation",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "No se pudo guardar el recurso en la base.");
    }

    const rows = await response.json();
    return Array.isArray(rows) && rows[0] ? rows[0] : body;
  }

  function getStatusSummary() {
    if (!isConfigured()) {
      return {
        mode: "setup",
        title: "Base no conectada",
        message: "Completá config.js y el setup SQL de Storage para guardar links, PDFs y archivos desde la web.",
      };
    }

    return {
      mode: "live",
      title: "Base conectada",
      message: "La web puede leer recursos live y subir archivos reales a Supabase Storage.",
    };
  }

  window.UXUI_LIVE_DATA = {
    baseCatalog,
    config,
    cloneData,
    normalizeSlug,
    slugToTitle,
    mergeRecords,
    isConfigured,
    fetchRows,
    fetchAndMerge,
    submitResource,
    getStatusSummary,
  };
})();
