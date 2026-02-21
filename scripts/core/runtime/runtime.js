import { initFormValidation, initFormSecurity } from "./components/forms.js";
import { initContentCollections, initContentCarousels, initMediaLightbox } from "./components/content.js";

function initCoreRuntime() {
  initFormValidation();
  initFormSecurity();
  initContentCollections();
  initContentCarousels();
  initMediaLightbox();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCoreRuntime, { once: true });
} else {
  initCoreRuntime();
}
