export function scrollToSection(targetIdOrHref: string) {
  if (typeof window === "undefined") return;

  const id = targetIdOrHref.replace(/^#/, "").replace(/^\//, "").replace(/^#/, "");

  if (window.location.pathname !== "/") {
    window.location.href = `/#${id}`;
    return;
  }

  if (id === "home" || !id) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname);
    }
    return;
  }

  const el = document.getElementById(id);
  if (!el) return;

  // The sticky header sits at top-4 (16px) with height 48px -> bottom edge is 64px.
  // Scrolling to rect.top - 68px places the top of the section directly beneath
  // the sticky header pill, perfectly framing the section title and ensuring
  // no content from the previous section peeks above the navbar.
  const rect = el.getBoundingClientRect();
  const headerOffset = 68;
  const currentY = window.scrollY !== undefined ? window.scrollY : window.pageYOffset;
  const targetY = currentY + rect.top - headerOffset;

  window.scrollTo({
    top: Math.max(0, targetY),
    behavior: "smooth",
  });

  if (window.location.hash) {
    history.replaceState(null, "", window.location.pathname);
  }
}
