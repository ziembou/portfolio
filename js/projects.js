let LANG = localStorage.getItem('lang') || 'en';
let popupScrollY = 0;
let activeProjectId = null;


const toggle = document.getElementById('aboutToggle');
const more = document.getElementById('aboutMore');
const skillFills = document.querySelectorAll('.skill-fill');
const form = document.getElementById('contactForm');

const notice = document.getElementById('cookieNotice');
const accept = document.getElementById('cookieAccept');


//COOKIES

if (!localStorage.getItem('cookiesAccepted')) {
  setTimeout(() => notice.classList.add('show'), 600);
}

accept.addEventListener('click', () => {
  localStorage.setItem('cookiesAccepted', 'true');
  notice.classList.remove('show');
});


if (toggle && more) {
  toggle.addEventListener('click', (e) => { 
    e.preventDefault();

    const open = more.classList.toggle('open');
    const skillCircles = document.querySelectorAll('.skill-circle');

    skillCircles.forEach(circle => {
      const percent = circle.dataset.percent;
      const progress = circle.querySelector('.progress');
      const radius = 52;
      const circumference = 2 * Math.PI * radius;

      progress.style.strokeDasharray = circumference;

      if (open) {
        // ▶️ otwieranie
        const offset = circumference - (percent / 100) * circumference;
        requestAnimationFrame(() => {
          progress.style.strokeDashoffset = offset;
        });
      } else {
        // ◀️ zamykanie
        requestAnimationFrame(() => {
          progress.style.strokeDashoffset = circumference;
        });
      }
    });


    toggle.dataset.i18n = open
      ? 'links.seeless'
      : 'links.seemore';

    toggle.setAttribute('aria-expanded', open);

    /* 🔁 TU JEST OK */
    window.applyTranslations();

    // 🔥 ANIMACJA SKILLI – tylko przy otwarciu
    if (open) {
      skillFills.forEach(bar => {
        const targetWidth = bar.dataset.level;
        bar.style.width = '0';
        setTimeout(() => {
          bar.style.width = targetWidth;
        }, 120);
      });
    }

    if (!open) {
      skillFills.forEach(bar => bar.style.width = '0');
    }

    if (open) {
      //skillsAnimated = true;

      document.querySelectorAll('.skill-circle').forEach(circle => {
        const percent = circle.dataset.percent;
        const progress = circle.querySelector('.progress');
        const radius = 52;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percent / 100) * circumference;

        progress.style.strokeDasharray = circumference;
        progress.style.strokeDashoffset = offset;
      });
    }

    
  });
}

/* zmiana języka */
$('[data-lang]').on('click', function () {
  LANG = $(this).data('lang');
  localStorage.setItem('lang', LANG);
  $('[data-lang]').removeClass('active');
  $(this).addClass('active');

  window.loadLang(LANG);

  // 🔁 aktualizacja popupu
  if (activeProjectId && PROJECTS[activeProjectId]) {
    const project = PROJECTS[activeProjectId];
    $('#popupTitle').text(t(project.title));
    $('#popupDesc').text(t(project.desc));
  }
});




const t = (obj) => {
  if (!obj) return '';
  return obj[LANG] || obj.en || obj.pl || '';
};

let PROJECTS = {};

fetch("data/projects.json")
  .then(res => res.json())
  .then(data => {
    PROJECTS = data;
    console.log("PROJECTS loaded:", PROJECTS);
  })
  .catch(err => console.error("Projects JSON error:", err));

$('.gallery').on('click', '.item', function () {

  const projectId = $(this).data('project-id');
  if (!projectId || !PROJECTS[projectId]) return;

  activeProjectId = projectId;

  const project = PROJECTS[projectId];

  console.log('OPEN PROJECT:', projectId, project);

  $('#popupTitle').text(t(project.title));
  $('#popupDesc').text(t(project.desc));
  $('#popupGallery').html('');

  project.content.forEach(block => {

    if (block.type === 'image') {
      $('#popupGallery').append(
        `<img src="${block.src}" class="popup-image">`
      );
    }

    if (block.type === 'text') {
      $('#popupGallery').append(
        `<p class="popup-text">${t(block.text)}</p>`
      );
    }

    if (block.type === 'youtube') {
      $('#popupGallery').append(`
        <div class="popup-video">
          <div class="video-placeholder" data-video-id="${block.id}">
            <img 
              src="https://img.youtube.com/vi/${block.id}/maxresdefault.jpg"
              alt=""  onerror="this.src='https://img.youtube.com/vi/${block.id}/hqdefault.jpg'">
            <button class="video-play">▶</button>
          </div>
        </div>
      `);
    }

    if (block.type === 'compare') {
      renderCompare(block);
    }


  });


function renderCompare(data) {
  const wrapper = document.createElement("div");
  wrapper.className = "compare";

  wrapper.innerHTML = `
    <img src="${data.after}" alt="">
    <img src="${data.before}" alt="" class="compare-top">
    <div class="compare-handle"></div>
  `;

  document.querySelector("#popupGallery").appendChild(wrapper);

  introAnimation(wrapper);          // auto preview
  enableCompareDrag(wrapper, "horizontal"); // lub "horizontal"
}


function enableCompareDrag(compare, axis = "horizontal") {
  const topImg = compare.querySelector(".compare-top");
  const handle = compare.querySelector(".compare-handle");

  let dragging = false;

  const update = (clientX, clientY) => {
    const rect = compare.getBoundingClientRect();
    let percent;

    if (axis === "vertical") {
      let y = clientY - rect.top;
      y = Math.max(0, Math.min(y, rect.height));
      percent = (y / rect.height) * 100;

      topImg.style.clipPath = `inset(${percent}% 0 0 0)`;
      handle.style.top = percent + "%";
    } else {
      let x = clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      percent = (x / rect.width) * 100;

      topImg.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
      handle.style.left = percent + "%";
    }
  };

  /* 🟢 HOVER FOLLOW (mouse only) */
  compare.addEventListener("pointermove", e => {
    if (
      e.pointerType === "mouse" &&
      !dragging &&
      compare.dataset.ready === "1"
    ) {
      update(e.clientX, e.clientY);
    }
  });

  /* 🟢 DRAG (mouse + touch) */
  compare.addEventListener("pointerdown", e => {
    dragging = true;
    compare.setPointerCapture(e.pointerId);
    update(e.clientX, e.clientY);
  });

  compare.addEventListener("pointerup", () => dragging = false);

  compare.addEventListener("pointerleave", () => {
   dragging = false;
   topImg.style.clipPath = `inset(0 50% 0 0)`;
   handle.style.left = "50%";
  });

  compare.addEventListener("pointercancel", () => {
    dragging = false;
  });

}


function introAnimation(compare) {
  const topImg = compare.querySelector(".compare-top");
  const handle = compare.querySelector(".compare-handle");

  let p = 10;
  const anim = setInterval(() => {
    p += 2;
    if (p > 90) {
      clearInterval(anim);
      compare.dataset.ready = "1"; // 🔓 unlock
    }

    topImg.style.clipPath = `inset(0 ${100 - p}% 0 0)`;
    handle.style.left = p + "%";
  }, 16);
}



  openPopup();

});

function openPopup() {
  popupScrollY = window.scrollY;

  if (popupScrollY > window.innerHeight * 0.6) {
    document.body.classList.add("hero-killed");
  }

  history.pushState({ popup: true }, '');

  document.body.classList.add("popup-open");
  $('#projectPopup').addClass('active');
}

function closePopup() {
  $('#projectPopup').removeClass('active');

  document.body.classList.remove('popup-open');
  document.body.classList.remove('hero-killed');

  window.scrollTo(0, popupScrollY);
  $('#popupGallery').html('');
}

$('.popup-close').on('click', closePopup);

$('#projectPopup').on('click', e => {
  if (e.target === e.currentTarget) closePopup();
});

$('.popup-inner').on('click', e => e.stopPropagation());

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && $('#projectPopup').hasClass('active')) {
    closePopup();
  }

  if (e.key === "Escape" && $('#contactPopup').hasClass('active')) {
    closeContact();
    return;
  }
});

window.addEventListener('popstate', () => {
  if ($('#projectPopup').hasClass('active')) {
    closePopup();
  }
});

function openContact() {
  resetContactForm(); // 🔥 ZAWSZE NA START
  history.pushState({ contact: true }, '');
  document.body.classList.add('popup-open');
  document.getElementById('contactPopup').classList.add('active');
}

function closeContact() {
  document.body.classList.remove('popup-open');
  document.getElementById('contactPopup').classList.remove('active');

  if (history.state?.contact) {
    history.back();
  }

  resetContactForm();
}

function resetContactForm() {
  const popup = document.getElementById('contactPopup');
  const form = document.getElementById('contactForm');

  if (!popup || !form) return;

  popup.classList.remove('sent'); // 🔥 KLUCZ
  form.reset();
}

form.addEventListener('submit', async e => {
  e.preventDefault();

  const res = await fetch(form.action, {
    method: 'POST',
    body: new FormData(form),
    headers: { Accept: 'application/json' }
  });

  if (res.ok) {
    const popup = document.getElementById('contactPopup');

    popup.classList.add('sent');
    form.reset();

    // ⏳ auto-close po 2.8s
    setTimeout(() => {
      closeContact();
    }, 2800);
  }
});

document.querySelector('.nav-contact').addEventListener('click', e => {
  e.preventDefault();
  openContact();
});

document
  .querySelector('#contactPopup .popup-close')
  .addEventListener('click', closeContact);

document.querySelector('#contactPopup').addEventListener('click', e => {
  if (e.target.id === 'contactPopup') closeContact();
});

window.addEventListener('popstate', () => {
  if (document.getElementById('contactPopup').classList.contains('active')) {
    closeContact();
  }
});

$('#popupGallery').on('click', '.video-placeholder', function (e) {
  e.preventDefault();
  e.stopPropagation();

  const id = $(this).data('video-id');
  console.log('PLAY VIDEO:', id);

  $(this).replaceWith(`
    <iframe
      src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&playsinline=1"
      frameborder="0"
      allow="autoplay; encrypted-media; picture-in-picture"
      allowfullscreen
    ></iframe>
  `);
});




