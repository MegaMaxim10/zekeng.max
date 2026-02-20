export function initHeaderOffset() {
  const root = document.documentElement;
  const siteHeader = document.querySelector(".site-header");

  function syncHeaderOffset() {
    if (!siteHeader) return;
    root.style.setProperty("--header-offset", `${siteHeader.offsetHeight}px`);
  }

  syncHeaderOffset();
  addEventListener("resize", syncHeaderOffset);
}

export function mountPassionDecor() {
  const body = document.body;
  if (!body || body.querySelector(".passion-atmosphere")) return;

  const decor = document.createElement("div");
  decor.className = "passion-atmosphere";
  decor.setAttribute("aria-hidden", "true");
  decor.innerHTML = `
    <div class="passion-cluster">
      <span class="passion-motif motif-science"></span>
      <span class="passion-motif motif-teaching"></span>
      <span class="passion-motif motif-music"></span>
      <span class="passion-motif motif-football"></span>
    </div>
  `;

  body.prepend(decor);
}
