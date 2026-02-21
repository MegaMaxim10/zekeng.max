import { initThemeToggle } from "./components/theme.js";
import { initMobileNav, initActiveLinks } from "./components/navigation.js";
import { initHeaderOffset, mountPassionDecor } from "./components/layout.js";

function initTemplateRuntime() {
  initThemeToggle();
  initMobileNav();
  initHeaderOffset();
  mountPassionDecor();
  initActiveLinks();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTemplateRuntime, { once: true });
} else {
  initTemplateRuntime();
}
