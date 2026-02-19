export function initMobileNav() {
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");

  navToggle?.addEventListener("click", () => {
    const isOpen = siteNav?.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
}

export function initActiveLinks() {
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
}
