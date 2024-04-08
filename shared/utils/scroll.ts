export async function scrollToElementById(id: string) {
  setTimeout(() => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, 0);
}
