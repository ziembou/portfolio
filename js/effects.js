const watcher = document.querySelector(".scroll-watcher");

window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const progress = scrollTop / docHeight;

  watcher.style.transform = `scaleX(${progress})`;
});
