import * as fs from "node:fs";

export const FRAMEWORK_CONFIG_PATH = "framework.config.json";
export const DEFAULT_TEMPLATE_PATH = "src/templates/page.html";

export const DEFAULT_FRAMEWORK_CONFIG = {
  site: {
    title: "My Static Site",
    description: "",
    author: "",
    keywords: [],
    contact: {
      fullName: "",
      role: "",
      institution: "",
      department: "",
      postalAddress: "",
      office: "",
      coordinates: {
        latitude: 0,
        longitude: 0
      },
      phones: [],
      emails: {
        institutional: "",
        personal: [],
        professional: []
      },
      socials: []
    }
  },
  templates: {
    default: DEFAULT_TEMPLATE_PATH,
    entries: {
      default: DEFAULT_TEMPLATE_PATH
    }
  },
  styles: {
    defaultProfile: "default",
    profiles: {
      default: [
        "assets/css/main.css",
        "assets/css/components.css"
      ]
    }
  },
  scripts: {
    default: [
      { src: "assets/js/framework/runtime.js", module: true },
      "assets/js/custom/global.js"
    ]
  },
  seo: {
    siteUrl: "",
    defaultLocale: "en_US",
    defaultType: "website",
    defaultRobots: "index,follow",
    defaultImage: "",
    twitterHandle: "",
    organizationName: "",
    sameAs: []
  }
};

export function readFrameworkConfig() {
  if (!fs.existsSync(FRAMEWORK_CONFIG_PATH)) {
    return DEFAULT_FRAMEWORK_CONFIG;
  }

  const userConfig = JSON.parse(fs.readFileSync(FRAMEWORK_CONFIG_PATH, "utf-8"));
  const defaultSite = DEFAULT_FRAMEWORK_CONFIG.site;
  const userSite = userConfig.site || {};
  const defaultContact = defaultSite.contact || {};
  const userContact = userSite.contact || {};
  const defaultEmails = defaultContact.emails || {};
  const userEmails = userContact.emails || {};
  const defaultCoordinates = defaultContact.coordinates || {};
  const userCoordinates = userContact.coordinates || {};

  return {
    ...DEFAULT_FRAMEWORK_CONFIG,
    ...userConfig,
    site: {
      ...defaultSite,
      ...userSite,
      contact: {
        ...defaultContact,
        ...userContact,
        coordinates: {
          ...defaultCoordinates,
          ...userCoordinates
        },
        emails: {
          ...defaultEmails,
          ...userEmails
        }
      }
    },
    templates: {
      ...DEFAULT_FRAMEWORK_CONFIG.templates,
      ...(userConfig.templates || {}),
      entries: {
        ...DEFAULT_FRAMEWORK_CONFIG.templates.entries,
        ...(userConfig.templates?.entries || {})
      }
    },
    styles: {
      ...DEFAULT_FRAMEWORK_CONFIG.styles,
      ...(userConfig.styles || {}),
      profiles: {
        ...DEFAULT_FRAMEWORK_CONFIG.styles.profiles,
        ...(userConfig.styles?.profiles || {})
      }
    },
    scripts: {
      ...DEFAULT_FRAMEWORK_CONFIG.scripts,
      ...(userConfig.scripts || {})
    },
    seo: {
      ...DEFAULT_FRAMEWORK_CONFIG.seo,
      ...(userConfig.seo || {})
    }
  };
}
