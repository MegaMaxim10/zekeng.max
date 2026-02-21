export function initContentCollections() {
  document.querySelectorAll("[data-content-collection]").forEach((collection) => {
    const grid = collection.querySelector("[data-collection-grid]");
    if (!grid) return;

    const items = Array.from(grid.querySelectorAll("[data-collection-item]"));
    if (items.length === 0) return;

    const sortSelect = collection.querySelector("[data-collection-sort]");
    const searchInput = collection.querySelector("[data-collection-search]");
    const tagInputs = Array.from(collection.querySelectorAll("[data-collection-tags] input[type='checkbox']"));
    const tagCounter = collection.querySelector(".content-collection-tags-count");
    const defaultSort = collection.getAttribute("data-default-sort") || "date-desc";

    function applyState() {
      const query = (searchInput?.value || "").trim().toLowerCase();
      const selectedTags = tagInputs.filter((input) => input.checked).map((input) => input.value.toLowerCase());
      const activeSort = normalizeSort(sortSelect?.value || defaultSort);
      const sorted = [...items].sort((a, b) => compareItems(a, b, activeSort));
      let visibleCount = 0;

      const fragment = document.createDocumentFragment();
      sorted.forEach((item) => {
        const haystack = item.dataset.search || "";
        const itemTags = (item.dataset.tags || "").split("|").filter(Boolean);
        const queryMatch = !query || haystack.includes(query);
        const tagMatch = selectedTags.length === 0 || selectedTags.every((tag) => itemTags.includes(tag));
        const isVisible = queryMatch && tagMatch;
        item.hidden = !isVisible;
        if (isVisible) visibleCount += 1;
        fragment.append(item);
      });

      grid.append(fragment);
      collection.classList.toggle("is-empty-filtered", visibleCount === 0);
      if (tagCounter) {
        tagCounter.textContent = selectedTags.length > 0 ? `${selectedTags.length}` : `${tagInputs.length}`;
      }
    }

    sortSelect?.addEventListener("change", applyState);
    searchInput?.addEventListener("input", applyState);
    tagInputs.forEach((input) => input.addEventListener("change", applyState));
    applyState();
  });

  bindCollectionDropdownDismiss();
}

export function initContentCarousels() {
  document.querySelectorAll("[data-content-carousel]").forEach((root) => {
    const track = root.querySelector("[data-carousel-track]");
    const previous = root.querySelector("[data-carousel-prev]");
    const next = root.querySelector("[data-carousel-next]");
    if (!track || !previous || !next) return;

    const cardWidth = () => track.clientWidth * 0.9;
    const updateState = () => {
      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      previous.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft >= maxScroll - 4;
    };

    previous.addEventListener("click", () => {
      track.scrollBy({ left: -cardWidth(), behavior: "smooth" });
    });
    next.addEventListener("click", () => {
      track.scrollBy({ left: cardWidth(), behavior: "smooth" });
    });
    track.addEventListener("scroll", updateState, { passive: true });
    addEventListener("resize", updateState);
    updateState();
  });
}

export function initMediaLightbox() {
  const triggers = Array.from(document.querySelectorAll("[data-lightbox-group][data-lightbox-src]"));
  if (triggers.length === 0) return;

  const overlay = ensureLightboxOverlay();
  const imageNode = overlay.querySelector("[data-lightbox-image]");
  const captionNode = overlay.querySelector("[data-lightbox-caption]");
  const prevButton = overlay.querySelector("[data-lightbox-prev]");
  const nextButton = overlay.querySelector("[data-lightbox-next]");
  const closeButtons = overlay.querySelectorAll("[data-lightbox-close]");

  const state = { group: "", index: 0, items: [] };

  function open(group, index) {
    state.group = group;
    state.items = triggers.filter((node) => node.dataset.lightboxGroup === group);
    state.index = Math.max(0, Math.min(index, state.items.length - 1));
    renderCurrent();
    overlay.removeAttribute("hidden");
    document.body.classList.add("lightbox-open");
  }

  function close() {
    overlay.setAttribute("hidden", "hidden");
    document.body.classList.remove("lightbox-open");
  }

  function navigate(direction) {
    if (state.items.length <= 1) return;
    const nextIndex = (state.index + direction + state.items.length) % state.items.length;
    state.index = nextIndex;
    renderCurrent();
  }

  function renderCurrent() {
    const current = state.items[state.index];
    if (!current) return;

    const src = current.dataset.lightboxSrc || "";
    const alt = current.dataset.lightboxAlt || "";
    const caption = current.dataset.lightboxCaption || "";
    imageNode.setAttribute("src", src);
    imageNode.setAttribute("alt", alt);
    captionNode.textContent = caption;
    captionNode.hidden = !caption;

    const hasCarousel = state.items.length > 1;
    prevButton.hidden = !hasCarousel;
    nextButton.hidden = !hasCarousel;
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const group = trigger.dataset.lightboxGroup || "";
      const index = Number.parseInt(trigger.dataset.lightboxIndex || "0", 10);
      open(group, Number.isNaN(index) ? 0 : index);
    });
  });

  prevButton?.addEventListener("click", () => navigate(-1));
  nextButton?.addEventListener("click", () => navigate(1));
  closeButtons.forEach((button) => button.addEventListener("click", close));

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });

  document.addEventListener("keydown", (event) => {
    if (overlay.hasAttribute("hidden")) return;
    if (event.key === "Escape") close();
    if (event.key === "ArrowLeft") navigate(-1);
    if (event.key === "ArrowRight") navigate(1);
  });
}

function ensureLightboxOverlay() {
  let overlay = document.getElementById("content-lightbox-overlay");
  if (overlay) return overlay;

  overlay = document.createElement("div");
  overlay.id = "content-lightbox-overlay";
  overlay.className = "content-lightbox";
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="content-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Image preview">
      <button type="button" class="content-lightbox-close" data-lightbox-close aria-label="Close preview">Close</button>
      <button type="button" class="content-lightbox-nav is-prev" data-lightbox-prev aria-label="Previous image">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 5.3a1 1 0 0 1 0 1.4L10.41 11l4.3 4.3a1 1 0 0 1-1.42 1.4l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.4 0z"/></svg>
      </button>
      <figure class="content-lightbox-figure">
        <img data-lightbox-image alt="" />
        <figcaption data-lightbox-caption hidden></figcaption>
      </figure>
      <button type="button" class="content-lightbox-nav is-next" data-lightbox-next aria-label="Next image">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.29 18.7a1 1 0 0 1 0-1.41L13.58 13l-4.3-4.29a1 1 0 1 1 1.42-1.42l5 5a1 1 0 0 1 0 1.42l-5 5a1 1 0 0 1-1.41 0z"/></svg>
      </button>
    </div>
  `;

  document.body.append(overlay);
  return overlay;
}

function normalizeSort(sort) {
  const key = String(sort || "").toLowerCase();
  if (["date-desc", "date-asc", "title-asc", "title-desc"].includes(key)) {
    return key;
  }
  return "date-desc";
}

function compareItems(a, b, sort) {
  const titleA = a.dataset.title || "";
  const titleB = b.dataset.title || "";
  const dateA = Number.parseInt(a.dataset.dateOrder || "0", 10) || 0;
  const dateB = Number.parseInt(b.dataset.dateOrder || "0", 10) || 0;

  if (sort === "title-asc") {
    return titleA.localeCompare(titleB, undefined, { sensitivity: "base", numeric: true });
  }
  if (sort === "title-desc") {
    return titleB.localeCompare(titleA, undefined, { sensitivity: "base", numeric: true });
  }
  if (sort === "date-asc") {
    return dateA - dateB || titleA.localeCompare(titleB, undefined, { sensitivity: "base", numeric: true });
  }
  return dateB - dateA || titleA.localeCompare(titleB, undefined, { sensitivity: "base", numeric: true });
}

function bindCollectionDropdownDismiss() {
  if (window.__contentCollectionDropdownDismissBound) return;
  window.__contentCollectionDropdownDismissBound = true;

  document.addEventListener("pointerdown", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    document.querySelectorAll(".content-collection-tags-dropdown[open]").forEach((dropdown) => {
      if (!dropdown.contains(target)) {
        dropdown.removeAttribute("open");
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    document.querySelectorAll(".content-collection-tags-dropdown[open]").forEach((dropdown) => {
      dropdown.removeAttribute("open");
    });
  });
}
