// Swaps the landing-page explainer between its light and dark cut.
//
// Two <video> elements with one hidden by CSS does not work: a display:none
// video is not autoplayed by browsers, and making it visible later does not
// start it, so the dark cut would sit there as an empty frame. One element with
// a swapped source avoids that, and downloads one video instead of two.
(function () {
  var CUTS = {
    default: 'assets/video/oold-explainer.mp4',
    slate: 'assets/video/oold-explainer-dark.mp4',
  };

  function apply() {
    var video = document.querySelector('.oold-hero__video');
    if (!video) return;

    var scheme = document.body.getAttribute('data-md-color-scheme') || 'default';
    var src = CUTS[scheme] || CUTS.default;
    if (video.getAttribute('src') === src) return;

    video.setAttribute('src', src);
    video.load();
    // Muted autoplay can still be refused; ignore the rejection rather than
    // throwing on a decorative element.
    var played = video.play();
    if (played && played.catch) played.catch(function () {});
  }

  function start() {
    apply();
    new MutationObserver(apply).observe(document.body, {
      attributes: true,
      attributeFilter: ['data-md-color-scheme'],
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
