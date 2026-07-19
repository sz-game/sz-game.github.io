// Works no matter how many times each slider is repeated on the page.
// No ids needed — each wrapper finds its OWN track + arrows using
// querySelector scoped to that wrapper, so duplicated ids can never
// break other copies again.

function setupSliders(wrapSelector, trackSelector, arrowSelector, ratio){
  document.querySelectorAll(wrapSelector).forEach((wrap) => {
    const track = wrap.querySelector(trackSelector);
    const nextBtn = wrap.querySelector(arrowSelector + ':not(.left)');
    const prevBtn = wrap.querySelector(arrowSelector + '.left');
    if (!track || !nextBtn || !prevBtn) return;

    function amount(){
      return track.clientWidth * ratio;
    }

    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: amount(), behavior: 'smooth' });
    });
    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -amount(), behavior: 'smooth' });
    });
  });
}

// fg- uses separate .fg-nav-next / .fg-nav-prev classes instead of a
// shared class + .left modifier, so it needs its own tiny variant —
// same wrap-scoped pattern, just different selectors.
function setupFgSlider(ratio){
  document.querySelectorAll('.fg-wrap').forEach((wrap) => {
    const track = wrap.querySelector('.fg-track');
    const nextBtn = wrap.querySelector('.fg-nav-next');
    const prevBtn = wrap.querySelector('.fg-nav-prev');
    if (!track || !nextBtn || !prevBtn) return;

    function amount(){
      return track.clientWidth * ratio;
    }

    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: amount(), behavior: 'smooth' });
    });
    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -amount(), behavior: 'smooth' });
    });
  });
}

// SLIDER 1 — featured + small square grid
setupSliders('.carousel-wrap', '.carousel', '.nav-arrow', 0.85);

// SLIDER 2 — single row rectangular cards
setupSliders('.rc-wrap', '.rc-track', '.rc-nav-arrow', 0.8);

// SLIDER 3 — portrait cards
setupSliders('.sc-wrap', '.sc-track', '.sc-nav-arrow', 0.85);

// SLIDER 4 — wide landscape cards
setupSliders('.wc-wrap', '.wc-track', '.wc-nav-arrow', 0.85);

// SLIDER 5 — featured grid (fg-)
setupFgSlider(0.85);

document.querySelector('.cp-view-arrow').addEventListener('click', () => {
    const track = document.querySelector('.cp-track');
    track.scrollBy({ left: track.clientWidth * 0.8, behavior: 'smooth' });
  });


   const mgTrack = document.getElementById('mgTrack');
  const mgWrap = mgTrack.closest('.mg-wrap');

  function mgPageWidth(){
    // width of 2 columns + the gap between them = one "slide page"
    const col = mgTrack.firstElementChild.getBoundingClientRect().width;
    const gapPx = parseFloat(getComputedStyle(mgTrack).columnGap) || 0;
    return (col + gapPx) * 2;
  }

  mgWrap.querySelector('.mg-nav-next').addEventListener('click', () => {
    mgTrack.scrollBy({ left: mgPageWidth(), behavior: 'smooth' });
  });
  mgWrap.querySelector('.mg-nav-prev').addEventListener('click', () => {
    mgTrack.scrollBy({ left: -mgPageWidth(), behavior: 'smooth' });
  });