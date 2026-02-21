const ABSOLUTE_PROTOCOL_PATTERN = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;
const UNSAFE_PROTOCOL_PATTERN = /^\s*(javascript|vbscript|data):/i;

export function isExternalUrl(url) {
  const value = String(url || "").trim();
  if (!value) return false;
  if (value.startsWith("//")) return true;
  return /^(https?:|mailto:|tel:)/i.test(value);
}

export function isRelativeUrl(url) {
  const value = String(url || "").trim();
  if (!value) return false;
  if (value.startsWith("{{")) return false;
  if (value.startsWith("//")) return false;
  if (value.startsWith("#")) return false;
  return !ABSOLUTE_PROTOCOL_PATTERN.test(value);
}

export function resolveHref(url, options = {}) {
  const {
    external = undefined,
    defaultHref = "#"
  } = options;

  const value = String(url || "").trim();
  if (!value) return defaultHref;
  if (UNSAFE_PROTOCOL_PATTERN.test(value)) return defaultHref;
  if (value.startsWith("{{")) return value;

  if (isRelativeUrl(value)) {
    if (external === true) {
      return value;
    }
    return `{{basePath}}/${value.replace(/^\/+/, "")}`;
  }

  return value;
}

export function normalizeAssetSrc(src) {
  const value = String(src || "").trim();
  if (!value) {
    return "";
  }
  if (/^(https?:\/\/|data:)/i.test(value) || value.startsWith("{{")) {
    return value;
  }

  const normalized = value.replace(/^\/+/, "").replace(/^src\//, "");
  return `{{basePath}}/${normalized}`;
}

