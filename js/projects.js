let LANG = localStorage.getItem('lang') || 'en';

$('[data-lang]').on('click', function () {
  LANG = $(this).data('lang');
  localStorage.setItem('lang', LANG);

  updateStaticTexts(); // menu, hero, itp.
  closePopup();        // u Ciebie logiczne
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
          <iframe
            data-src="https://www.youtube.com/embed/${block.id}?autoplay=1&mute=1"
            frameborder="0"
            allowfullscreen>
          </iframe>
        </div>
      `);
    }

  });

  $('#projectPopup').addClass('active');
  $('body').addClass('popup-open');

  requestAnimationFrame(() => {
    $('#popupGallery iframe').each(function () {
      const src = $(this).data('src');
      if (src) $(this).attr('src', src);
    });
  });

  // =======================
  // CLOSE POPUP (X)
  // =======================
  $('.close').on('click', function () {
    closePopup();
  });

  // =======================
  // CLOSE POPUP (BACKGROUND)
  // =======================
  $('#projectPopup').on('click', function (e) {
    if (e.target === this) {
      closePopup();
    }
  });

  $('.popup-inner').on('click', function(e){
    e.stopPropagation();
  });

  // =======================
  // CLOSE FUNCTION
  // =======================
  function closePopup() {
    $('#projectPopup').removeClass('active');
    $('body').removeClass('popup-open');

    // 🔇 zatrzymanie YouTube
    $('#popupGallery').html('');
  }

});
