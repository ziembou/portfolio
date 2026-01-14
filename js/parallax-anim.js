const parallaxItems = document.querySelectorAll('[data-parallax]');
const activeItems = new Set();
const isMobile = window.innerWidth < 768;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const aboutImgs = document.querySelectorAll('.about-image img');





let lastScrollY = window.scrollY;
let scrollDir = 1; // 1 = down, -1 = up



const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      activeItems.add(entry.target);
    } else {
      activeItems.delete(entry.target);
    }
  });
}, {
  threshold: 0
});

parallaxItems.forEach(el => observer.observe(el));


function lerp(a, b, n) {
  return (1 - n) * a + n * b;
}

function peak(t) {
  return 1 - Math.abs(2 * t - 1);
}

function updateParallax() {
  if (reduceMotion || isMobile) return;

  const windowH = window.innerHeight;
  const ease = scrollDir === 1 ? 0.08 : 0.12;

  let globalPeak = 0;

  activeItems.forEach(el => {
    const rect = el.getBoundingClientRect();

    const start = windowH * 0.9;
    const end   = windowH * 0.2;

    let progress = (start - rect.top) / (start - end);
    progress = Math.min(1, Math.max(0, progress));

    const peakValue = peak(progress);
    globalPeak = Math.max(globalPeak, peakValue); // ⬅️ najaktywniejszy

    /* ===== GENERIC PARALLAX ===== */
    el._parallax ??= { x: 0, y: 0, scale: 1, opacity: 1 };

    const target = {
      x: parseFloat(el.dataset.x || 0) * progress,
      y: parseFloat(el.dataset.y || 0) * progress,
      scale: 1 - (parseFloat(el.dataset.scale || 0) * progress),
      opacity: 1 - (parseFloat(el.dataset.opacity || 0) * progress)
    };

    el._parallax.x = lerp(el._parallax.x, target.x, ease);
    el._parallax.y = lerp(el._parallax.y, target.y, ease);
    el._parallax.scale = lerp(el._parallax.scale, target.scale, ease);
    el._parallax.opacity = lerp(el._parallax.opacity, target.opacity, ease);

    el.style.transform =
      `translate(${el._parallax.x}px, ${el._parallax.y}px) scale(${el._parallax.scale})`;

    el.style.opacity = el._parallax.opacity;
  });

  /* ===== IMAGE SATURATION (ONCE) ===== */
  const saturation = 0.2 + globalPeak * 0.6;

  aboutImgs.forEach(img => {
    img.style.filter = `saturate(${saturation})`;
  });
}


let ticking = false;

window.addEventListener('scroll', () => {
  scrollDir = window.scrollY > lastScrollY ? 1 : -1;
  lastScrollY = window.scrollY;

  if (!ticking) {
    requestAnimationFrame(() => {
      updateParallax();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });


// init
requestAnimationFrame(updateParallax);
//updateParallax();

//console.log('scrollDir:', scrollDir);