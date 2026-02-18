(function () {
  const root = document.documentElement;

  // Theme
  const toggle = document.getElementById("theme-toggle");
  const saved = localStorage.getItem("theme");
  const prefersDark = matchMedia("(prefers-color-scheme: dark)").matches;

  function updateThemeToggleLabel() {
    if (!toggle) return;
    const isDark = root.dataset.theme === "dark";
    toggle.textContent = isDark ? "Light" : "Dark";
    toggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
  }

  root.dataset.theme = saved || (prefersDark ? "dark" : "light");
  updateThemeToggleLabel();

  toggle?.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", root.dataset.theme);
    updateThemeToggleLabel();
  });

  // Mobile nav
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");
  navToggle?.addEventListener("click", () => {
    const isOpen = siteNav?.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // Fixed header offset
  const siteHeader = document.querySelector(".site-header");
  function syncHeaderOffset() {
    if (!siteHeader) return;
    root.style.setProperty("--header-offset", `${siteHeader.offsetHeight}px`);
  }
  syncHeaderOffset();
  addEventListener("resize", syncHeaderOffset);

  // Active links (menu + breadcrumb)
  function normalizePath(path) {
    if (!path) return "/";
    const [pathname] = path.split("#");
    const [cleanPath] = pathname.split("?");
    if (cleanPath === "/") return "/";
    return cleanPath.replace(/\/index\.html$/i, "/").replace(/\/+$/, "") || "/";
  }

  const currentPath = normalizePath(window.location.pathname);

  document.querySelectorAll(".site-nav a, .breadcrumb-nav a").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;

    const url = new URL(href, window.location.origin);
    const linkPath = normalizePath(url.pathname);

    if (linkPath === currentPath) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
      link.closest(".menu-item")?.classList.add("is-active-ancestor");
      link.closest(".submenu-item")?.closest(".menu-item")?.classList.add("is-active-ancestor");
    }
  });
})();
