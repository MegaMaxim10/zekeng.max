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
  const body = document.body;

  function applyPassionTheme(path) {
    if (!body) return;

    const themeClasses = [
      "theme-science",
      "theme-teaching",
      "theme-music",
      "theme-football"
    ];
    body.classList.remove(...themeClasses);

    const nextClasses = [];
    if (path === "/") {
      nextClasses.push(...themeClasses);
    }
    if (path.startsWith("/3-research")) {
      nextClasses.push("theme-science");
    }
    if (path.startsWith("/2-teaching")) {
      nextClasses.push("theme-teaching");
    }
    if (path.includes("/5-other-activities/2-singing")) {
      nextClasses.push("theme-music");
    }
    if (path.includes("football") || path.includes("sport")) {
      nextClasses.push("theme-football");
    }

    if (nextClasses.length > 0) {
      body.classList.add(...nextClasses);
    }
  }

  function mountPassionDecor() {
    if (!body || body.querySelector(".passion-atmosphere")) return;

    const decor = document.createElement("div");
    decor.className = "passion-atmosphere";
    decor.setAttribute("aria-hidden", "true");
    decor.innerHTML = `
      <span class="passion-motif motif-science"></span>
      <span class="passion-motif motif-teaching"></span>
      <span class="passion-motif motif-music"></span>
      <span class="passion-motif motif-football"></span>
    `;

    body.prepend(decor);
  }

  applyPassionTheme(currentPath);
  mountPassionDecor();

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
