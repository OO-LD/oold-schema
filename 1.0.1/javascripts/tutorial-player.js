// Tutorial episodes: theme-matched video, with a slideshow over the beat stills.
//
// The video source is swapped rather than hiding one of two <video> elements: a
// display:none video is never autoplayed, and revealing it later does not start
// it. Same reason as the landing-page hero.
//
// Stills and the beat order come from assets/tutorials/manifest.json, written by
// scripts/stage_tutorials.sh. If an episode is missing from the manifest its
// slideshow button is removed rather than left to fail.
(function () {
  var MANIFEST = 'assets/tutorials/manifest.json';

  // Asset URLs must be resolved against the site root, not the current page.
  // This page lives at /guide/tutorials/ and the site is additionally served
  // under a version prefix (/dev/, /1.0/), so neither a page-relative nor a
  // root-absolute path works. The theme publishes the way back in its config.
  function base() {
    var el = document.getElementById('__config');
    try {
      var b = JSON.parse(el.textContent).base;
      if (b) return b.replace(/\/+$/, '') + '/';
    } catch (e) { /* fall through */ }
    return '';
  }

  function scheme() {
    return document.body.getAttribute('data-md-color-scheme') === 'slate' ? 'dark' : 'light';
  }

  function setup(root, beats) {
    var ep = root.getAttribute('data-episode');
    var video = root.querySelector('.tut__video');
    var gallery = root.querySelector('.tut__gallery');
    var img = root.querySelector('.tut__slide');
    var caption = root.querySelector('.tut__caption');
    var toggle = root.querySelector('.tut__toggle');
    var prev = root.querySelector('.tut__prev');
    var next = root.querySelector('.tut__next');
    var i = 0;

    if (!beats || !beats.length) {
      if (toggle) toggle.remove();
    }

    // No autoplay here, unlike the landing-page hero. A tutorial is watched on
    // purpose: the video carries controls and does not start until asked. The
    // poster is the episode's first beat, so the block is not an empty rectangle
    // before playback.
    function applyVideo() {
      var src = base() + 'assets/tutorials/' + ep + '-' + scheme() + '.mp4';
      if (video.getAttribute('src') === src) return;
      var t = video.currentTime;
      var wasPlaying = !video.paused && !video.ended;
      video.setAttribute('src', src);
      if (beats && beats.length) {
        video.setAttribute('poster',
          base() + 'assets/tutorials/' + ep + '/' + scheme() + '/' + beats[0] + '.png');
      }
      video.load();
      if (t) video.currentTime = t;
      // Only resume if the reader had already started it.
      if (wasPlaying) {
        var p = video.play();
        if (p && p.catch) p.catch(function () {});
      }
    }

    function applySlide() {
      if (!beats || !beats.length) return;
      i = (i + beats.length) % beats.length;
      img.src = base() + 'assets/tutorials/' + ep + '/' + scheme() + '/' + beats[i] + '.png';
      img.alt = 'Episode slide ' + (i + 1) + ': ' + beats[i].replace(/^\d+-/, '').replace(/-/g, ' ');
      caption.textContent = (i + 1) + ' / ' + beats.length;
    }

    function showGallery(on) {
      root.classList.toggle('tut--slideshow', on);
      toggle.textContent = on ? 'Watch the video' : 'View as slideshow';
      toggle.setAttribute('aria-pressed', String(on));
      if (on) {
        video.pause();
        applySlide();
      } else {
        applyVideo();
      }
    }

    if (toggle) {
      toggle.addEventListener('click', function () {
        showGallery(!root.classList.contains('tut--slideshow'));
      });
      prev.addEventListener('click', function () { i -= 1; applySlide(); });
      next.addEventListener('click', function () { i += 1; applySlide(); });
      gallery.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { i -= 1; applySlide(); }
        if (e.key === 'ArrowRight') { i += 1; applySlide(); }
      });
    }

    applyVideo();

    new MutationObserver(function () {
      applyVideo();
      if (root.classList.contains('tut--slideshow')) applySlide();
    }).observe(document.body, { attributes: true, attributeFilter: ['data-md-color-scheme'] });
  }

  function start() {
    var roots = document.querySelectorAll('.tut[data-episode]');
    if (!roots.length) return;
    // The dev server answers unknown paths with its 404 page at status 200,
    // so a wrong URL yields HTML rather than an error. Check the content type
    // and say so, instead of silently ending up with no episodes.
    fetch(base() + MANIFEST)
      .then(function (r) {
        var ct = r.headers.get('content-type') || '';
        if (!r.ok || ct.indexOf('json') === -1) {
          throw new Error('manifest not JSON (' + r.status + ' ' + ct + ')');
        }
        return r.json();
      })
      .catch(function (err) {
        console.warn('tutorials: ' + err.message + '; slideshow disabled');
        return {};
      })
      .then(function (manifest) {
        Array.prototype.forEach.call(roots, function (root) {
          setup(root, manifest[root.getAttribute('data-episode')]);
        });
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
