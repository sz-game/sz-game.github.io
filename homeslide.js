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

const cpViewArrow = document.querySelector('.cp-view-arrow');
if (cpViewArrow) {
  const cpTrack = document.querySelector('.cp-track');
  if (cpTrack) {
    cpViewArrow.addEventListener('click', () => {
      cpTrack.scrollBy({ left: cpTrack.clientWidth * 0.8, behavior: 'smooth' });
    });
  }
}

const mgTrack = document.getElementById('mgTrack');
if (mgTrack) {
  const mgWrap = mgTrack.closest('.mg-wrap');
  if (mgWrap) {
    function mgPageWidth(){
      // width of 2 columns + the gap between them = one "slide page"
      const col = mgTrack.firstElementChild.getBoundingClientRect().width;
      const gapPx = parseFloat(getComputedStyle(mgTrack).columnGap) || 0;
      return (col + gapPx) * 2;
    }

    mgWrap.querySelector('.mg-nav-next')?.addEventListener('click', () => {
      mgTrack.scrollBy({ left: mgPageWidth(), behavior: 'smooth' });
    });
    mgWrap.querySelector('.mg-nav-prev')?.addEventListener('click', () => {
      mgTrack.scrollBy({ left: -mgPageWidth(), behavior: 'smooth' });
    });
  }
}

(function(){
  const track = document.getElementById('gmTrack');
  const slider = document.getElementById('gmSlider');
  const prevBtn = document.getElementById('gmPrev');
  const nextBtn = document.getElementById('gmNext');

  if (!track || !slider || !prevBtn || !nextBtn) return;

  let pos = 0;
  let oneSetWidth = 0;
  let autoSpeed = 0.6;
  let isAuto = false;
  let isPaused = false;
  let resumeTimer = null;
  let isSliding = false;
  let ready = false; // jab tak measure() sahi width na de, kuch bhi move na ho

  const CARDS_PER_CLICK = 3;
  const SLIDE_DURATION = 450;

  function measure(){
    const w = track.scrollWidth / 3;
    if (!w || w <= 0){
      // abhi images/layout ready nahi — thodi der baad dobara try karo
      ready = false;
      setTimeout(measure, 100);
      return;
    }
    oneSetWidth = w;
    if (!ready){
      // sirf pehli dafa hi middle set pe set karo
      pos = -oneSetWidth;
      track.style.transition = 'none';
      track.style.transform = 'translateX(' + pos + 'px)';
    }
    ready = true;
  }
  window.addEventListener('load', measure);
  window.addEventListener('resize', measure);
  measure();

  // ===== SAFE wrap: infinite loop kabhi nahi (guard + max iterations) =====
  function normalizePos(){
    if (!ready || !oneSetWidth || oneSetWidth <= 0) return; // critical guard

    let guard = 0;
    while (pos <= -oneSetWidth * 2 && guard < 1000){
      pos += oneSetWidth;
      guard++;
    }
    guard = 0;
    while (pos > 0 && guard < 1000){
      pos -= oneSetWidth;
      guard++;
    }
  }

  function applyPos(){
    normalizePos();
    track.style.transform = 'translateX(' + pos + 'px)';
  }

  function tick(){
    if (isAuto && !isPaused && !isSliding && ready){
      pos -= autoSpeed;
      applyPos();
    }
    requestAnimationFrame(tick);
  }
  tick();

  setTimeout(function(){ isAuto = true; }, 1800);

  function pauseAuto(delay){
    isPaused = true;
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(function(){ isPaused = false; }, delay || 900);
  }

  function cardStep(){
    const firstCard = track.querySelector('.gm-card');
    if (!firstCard) return 260;
    const style = getComputedStyle(track);
    const gap = parseFloat(style.gap || 16);
    return firstCard.getBoundingClientRect().width + gap;
  }

  function slideBy(direction){
    if (isSliding || !ready) return; // ready na ho to kuch mat karo
    isSliding = true;
    pauseAuto(SLIDE_DURATION + 1600);

    const distance = cardStep() * CARDS_PER_CLICK * direction * -1;

    track.style.transition = 'transform ' + SLIDE_DURATION + 'ms ease';
    pos += distance;
    track.style.transform = 'translateX(' + pos + 'px)';

    function onEnd(e){
      if (e.propertyName !== 'transform') return;
      track.removeEventListener('transitionend', onEnd);
      track.style.transition = 'none';
      normalizePos();
      track.style.transform = 'translateX(' + pos + 'px)';
      isSliding = false;
    }
    track.addEventListener('transitionend', onEnd);

    setTimeout(function(){
      if (isSliding){
        track.removeEventListener('transitionend', onEnd);
        track.style.transition = 'none';
        normalizePos();
        track.style.transform = 'translateX(' + pos + 'px)';
        isSliding = false;
      }
    }, SLIDE_DURATION + 100);
  }

  nextBtn.addEventListener('click', function(){ slideBy(1); });
  prevBtn.addEventListener('click', function(){ slideBy(-1); });

  slider.addEventListener('mouseenter', function(){ pauseAuto(999999); });
  slider.addEventListener('mouseleave', function(){ pauseAuto(400); });

  let dragging = false, startX = 0, startPos = 0;

  function dragStart(x){
    if (isSliding || !ready) return;
    dragging = true;
    startX = x;
    startPos = pos;
    track.style.transition = 'none';
    pauseAuto(999999);
  }
  function dragMove(x){
    if (!dragging) return;
    pos = startPos + (x - startX);
    track.style.transform = 'translateX(' + pos + 'px)';
  }
  function dragEnd(){
    if (!dragging) return;
    dragging = false;
    applyPos();
    pauseAuto(1500);
  }

  slider.addEventListener('touchstart', function(e){ dragStart(e.touches[0].clientX); }, { passive: true });
  slider.addEventListener('touchmove', function(e){ dragMove(e.touches[0].clientX); }, { passive: true });
  slider.addEventListener('touchend', dragEnd);

  slider.addEventListener('mousedown', function(e){ e.preventDefault(); dragStart(e.clientX); });
  window.addEventListener('mousemove', function(e){ dragMove(e.clientX); });
  window.addEventListener('mouseup', dragEnd);
})();