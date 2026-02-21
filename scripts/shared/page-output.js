export function resolveOutputBasename(page) {
  const defaultBase = stripExtension(page?.name || "page");
  const meta = page?.json?.meta || {};
  if (meta.slugFromTitle !== true) {
    return defaultBase;
  }

  const title = String(meta.title || page?.json?.header?.title || defaultBase).trim();
  const slug = slugifyTitle(title);
  return slug || defaultBase;
}

export function slugifyTitle(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripExtension(filename) {
  return String(filename || "").replace(/\.[^.]+$/, "");
}

