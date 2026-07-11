  const carousel = document.getElementById('carousel');
  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');

  function scrollAmount(){
    return carousel.clientWidth * 0.85;
  }

  nextBtn.addEventListener('click', () => {
    carousel.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
  });
  prevBtn.addEventListener('click', () => {
    carousel.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
  });

    const rcTrack = document.getElementById('rc-track');
  const rcNextBtn = document.getElementById('rcNextBtn');
  const rcPrevBtn = document.getElementById('rcPrevBtn');

  function rcScrollAmount(){
    return rcTrack.clientWidth * 0.8;
  }

  rcNextBtn.addEventListener('click', () => {
    rcTrack.scrollBy({ left: rcScrollAmount(), behavior: 'smooth' });
  });
  rcPrevBtn.addEventListener('click', () => {
    rcTrack.scrollBy({ left: -rcScrollAmount(), behavior: 'smooth' });
  });

    const scTrack = document.getElementById('sc-track');
  const scNextBtn = document.getElementById('scNextBtn');
  const scPrevBtn = document.getElementById('scPrevBtn');

  function scScrollAmount(){
    return scTrack.clientWidth * 0.85;
  }

  scNextBtn.addEventListener('click', () => {
    scTrack.scrollBy({ left: scScrollAmount(), behavior: 'smooth' });
  });
  scPrevBtn.addEventListener('click', () => {
    scTrack.scrollBy({ left: -scScrollAmount(), behavior: 'smooth' });
  });