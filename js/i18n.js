const defaultLang = 'pl';

let currentTranslations = {};
let currentLang = localStorage.getItem('lang') || defaultLang;

async function loadLang(lang) {
  const res = await fetch(`lang/${lang}.json`);
  currentTranslations = await res.json();
  currentLang = lang;

  applyTranslations();
  localStorage.setItem('lang', lang);
  
  if (activeProjectId && PROJECTS[activeProjectId]) {
  const project = PROJECTS[activeProjectId];

  $('#popupTitle').text(t(project.title));
  $('#popupDesc').text(t(project.desc));
}

}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const keys = el.dataset.i18n.split('.');
    let value = currentTranslations;

    keys.forEach(k => value = value?.[k]);

    if (!value) return;

    if (el.hasAttribute('data-i18n-html')) {
      el.innerHTML = value; // 🔥 HTML allowed
    } else {
      el.textContent = value; // 🔒 safe text
    }
  });
}


/* 🔥 KLUCZOWE */
window.loadLang = loadLang;
window.applyTranslations = applyTranslations;

/* init */
loadLang(currentLang);
