export async function stickyPinned() {
  setTimeout(() => {
    const elements = document.querySelectorAll(".sticky-can-pin");
    elements.forEach((el) => {
      const observer = new IntersectionObserver(
        ([e]) => {
          e.target.classList.toggle("sticky-is-pinned", e.intersectionRatio < 1);
        },
        { threshold: [1] }
      );

      observer.observe(el);
    });
  }, 500);
}
