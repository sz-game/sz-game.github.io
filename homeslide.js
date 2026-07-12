// Works no matter how many times each slider is repeated on the page.
// No ids needed — each wrapper finds its OWN track + arrows using
// querySelector scoped to that wrapper (via closest/child lookup),
// so duplicated ids can never break other copies again.

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

// SLIDER 1 — featured + small square grid
setupSliders('.carousel-wrap', '.carousel', '.nav-arrow', 0.85);

// SLIDER 2 — single row rectangular cards
setupSliders('.rc-wrap', '.rc-track', '.rc-nav-arrow', 0.8);

// SLIDER 3 — portrait cards
setupSliders('.sc-wrap', '.sc-track', '.sc-nav-arrow', 0.85);

// SLIDER 4 — wide landscape cards
setupSliders('.wc-wrap', '.wc-track', '.wc-nav-arrow', 0.85);