const defaultLang = 'pl';

async function loadLang(lang) {
  const res = await fetch(`lang/${lang}.json`);
  const translations = await res.json();

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n.split('.');
    let value = translations;

    key.forEach(k => value = value[k]);
    if (value) el.textContent = value;
  });

  localStorage.setItem('lang', lang);
}

document.querySelectorAll('[data-lang]').forEach(btn => {
  btn.addEventListener('click', () => loadLang(btn.dataset.lang));
});

loadLang(localStorage.getItem('lang') || defaultLang);
