const TOKEN_REGEX = /{{\s*(cfg|hook):([^}]+)\s*}}/g;

export function resolveContentConfigReferences(input, frameworkConfig) {
  return resolveNode(input, frameworkConfig);
}

function resolveNode(node, frameworkConfig) {
  if (Array.isArray(node)) {
    return node.map((item) => resolveNode(item, frameworkConfig));
  }

  if (node && typeof node === "object") {
    const out = {};
    for (const [key, value] of Object.entries(node)) {
      out[key] = resolveNode(value, frameworkConfig);
    }
    return out;
  }

  if (typeof node === "string") {
    return resolveString(node, frameworkConfig);
  }

  return node;
}

function resolveString(template, frameworkConfig) {
  if (!template.includes("{{")) return template;

  const tokens = [...template.matchAll(TOKEN_REGEX)];
  if (tokens.length === 0) return template;

  const onlyToken = tokens.length === 1 && tokens[0][0] === template.trim();
  if (onlyToken) {
    const value = evaluateToken(tokens[0][1], tokens[0][2], frameworkConfig);
    return value == null ? "" : value;
  }

  return template.replaceAll(TOKEN_REGEX, (_, kind, expr) => {
    const value = evaluateToken(kind, expr, frameworkConfig);
    return value == null ? "" : String(value);
  });
}

function evaluateToken(kind, expression, frameworkConfig) {
  if (kind === "cfg") {
    return getByPath(frameworkConfig, expression.trim());
  }
  if (kind === "hook") {
    return executeHook(expression.trim(), frameworkConfig);
  }
  return "";
}

function getByPath(obj, path) {
  const steps = String(path)
    .trim()
    .split(".")
    .filter(Boolean);
  let current = obj;
  for (const step of steps) {
    if (current == null) return undefined;
    const index = Number.parseInt(step, 10);
    if (!Number.isNaN(index) && Array.isArray(current)) {
      current = current[index];
      continue;
    }
    current = current[step];
  }
  return current;
}

function executeHook(rawExpression, frameworkConfig) {
  const match = rawExpression.match(/^([a-zA-Z0-9_.-]+)(?:\((.*)\))?$/);
  if (!match) return "";

  const name = match[1];
  const args = parseArgs(match[2] || "").map((arg) => coerceArg(arg, frameworkConfig));
  const hooks = buildHooks(frameworkConfig);
  const fn = hooks[name];
  if (typeof fn !== "function") return "";
  return fn(...args);
}

function parseArgs(argsRaw) {
  if (!argsRaw.trim()) return [];
  return argsRaw.split(",").map((arg) => arg.trim());
}

function coerceArg(value, frameworkConfig) {
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }
  if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith("\"") && value.endsWith("\""))) {
    return value.slice(1, -1);
  }
  if (value.startsWith("cfg.")) {
    return getByPath(frameworkConfig, value.slice(4));
  }
  return value;
}

function buildHooks(frameworkConfig) {
  const contact = frameworkConfig?.site?.contact || {};
  const coordinates = contact.coordinates || {};
  const socials = Array.isArray(contact.socials) ? contact.socials : [];

  const toPhoneRaw = (index = 0) => String((contact.phones || [])[Number(index)] || "").replace(/\s+/g, "");

  return {
    "contact.phoneDisplay": (index = 0) => String((contact.phones || [])[Number(index)] || ""),
    "contact.phoneTelUrl": (index = 0) => `tel:${toPhoneRaw(index)}`,
    "contact.whatsappUrl": (index = 0) => `https://wa.me/${toPhoneRaw(index).replace(/^\+/, "")}`,
    "contact.emailMailto": (kind = "institutional", index = 0) => {
      if (kind === "institutional") {
        return `mailto:${contact?.emails?.institutional || ""}`;
      }
      const items = contact?.emails?.[kind] || [];
      return `mailto:${items[Number(index)] || ""}`;
    },
    "contact.socialUrl": (key) => {
      const item = socials.find((it) => String(it.key) === String(key));
      return item?.url || "";
    },
    "contact.socialLabel": (key) => {
      const item = socials.find((it) => String(it.key) === String(key));
      return item?.label || "";
    },
    "contact.profileLine": () => {
      return [contact.role, contact.institution, contact.department, contact.postalAddress]
        .filter(Boolean)
        .join(", ");
    },
    "contact.officeLine": () => {
      const coords = [coordinates.latitude, coordinates.longitude].filter((v) => v !== undefined && v !== null).join(", ");
      return [contact.office, coords ? `Coordinates: ${coords}` : ""].filter(Boolean).join(". ");
    }
  };
}
