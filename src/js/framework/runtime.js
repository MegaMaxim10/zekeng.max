import { initThemeToggle } from "./components/theme.js";
import { initMobileNav, initActiveLinks } from "./components/navigation.js";
import { initHeaderOffset, mountPassionDecor } from "./components/layout.js";
import { initFormValidation, initFormSecurity } from "./components/forms.js";

function initFrameworkRuntime() {
  initThemeToggle();
  initMobileNav();
  initHeaderOffset();
  mountPassionDecor();
  initActiveLinks();
  initFormValidation();
  initFormSecurity();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFrameworkRuntime, { once: true });
} else {
  initFrameworkRuntime();
}
