(function () {
  const STORAGE_KEY = 'unblockedgames_recent_games';
  const MAX_RECENT = 12;
  const FALLBACK_CATEGORIES = [
    ['New', '/c/new/', '/assest/icon/new-spark.svg'],
    ['Popular', '/c/popular/', '/assest/icon/popular.svg'],
    ['Action', '/c/action/', '/assest/icon/flash-filled-svgrepo-com.svg'],
    ['Adventure', '/c/adventure/', '/assest/icon/adventure-colour-svgrepo-com.svg'],
    ['Arcade', '/c/arcade/', '/assest/icon/gamer-joystick-controller-svgrepo-com.svg'],
    ['Multiplayer', '/c/multiplayer/', '/assest/icon/group-filled-persons-svgrepo-com.svg'],
    ['Puzzle', '/c/puzzle/', '/assest/icon/puzzle-svgrepo-com.svg'],
    ['Racing', '/c/racing/', '/assest/icon/racing-flag-svgrepo-com.svg']
  ];

  function readRecent() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      return [];
    }
  }

  function writeRecent(games) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(games.slice(0, MAX_RECENT)));
    } catch (error) {
      // Storage can be unavailable in private browsing; the page still works.
    }
  }

  function recordCurrentGame() {
    const match = window.location.pathname.match(/^\/g\/([^/]+)\/?$/);
    const title = document.querySelector('h1');
    if (!match || !title) return;

    const game = {
      slug: match[1],
      title: title.textContent.trim(),
      image: '/assest/images/' + match[1] + '.webp',
      category: 'Games',
      url: '/g/' + match[1] + '/'
    };

    try {
      const structuredData = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .map((script) => JSON.parse(script.textContent))
        .find((data) => data && data.applicationSubCategory);
      if (structuredData?.applicationSubCategory) game.category = structuredData.applicationSubCategory;
    } catch (error) {
      // Some pages contain JSON-LD that is not valid JSON.
    }

    const games = readRecent().filter((item) => item.slug !== game.slug);
    games.unshift(game);
    writeRecent(games);
  }

  function createCard(game) {
    const card = document.createElement('div');
    card.className = 'recent-game-card';
    card.tabIndex = 0;
    card.innerHTML = '<img src="' + game.image + '" alt="' + game.title.replace(/"/g, '&quot;') + '" loading="lazy">' +
      '<span class="recent-game-card-title">' + game.title + '</span>' +
      '<span class="recent-game-card-category">' + game.category + '</span>' +
      '<button class="recent-game-remove" type="button" aria-label="Remove ' + game.title.replace(/"/g, '&quot;') + '">×</button>';
    const openGame = () => { window.location.href = game.url; };
    card.addEventListener('click', (event) => {
      if (!event.target.closest('.recent-game-remove')) openGame();
    });
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') openGame();
    });
    card.querySelector('.recent-game-remove').addEventListener('click', (event) => {
      event.stopPropagation();
      writeRecent(readRecent().filter((item) => item.slug !== game.slug));
      renderAll();
    });
    return card;
  }

  function createCategoryCard(category) {
    const card = document.createElement('a');
    card.className = 'recent-category-card';
    card.href = category[1];
    card.innerHTML = '<img src="' + category[2] + '" alt="" loading="lazy"><span>' + category[0] + '</span>';
    return card;
  }

  function renderRecent(container, emptyText) {
    const games = readRecent();
    const grid = container.querySelector('.recent-games-grid');
    const empty = container.querySelector('.recent-games-empty');
    const fallback = container.querySelector('.recent-categories-grid');
    if (!grid || !empty || !fallback) return;

    grid.replaceChildren(...games.map(createCard));
    fallback.replaceChildren(...FALLBACK_CATEGORIES.map(createCategoryCard));
    container.classList.toggle('has-recent-games', games.length > 0);
    grid.hidden = games.length === 0;
    fallback.hidden = games.length > 0;
    empty.textContent = games.length ? '' : emptyText;
    empty.hidden = true;
    container.hidden = false;
  }

  function setupSlider(container) {
    const track = container.querySelector('.recent-games-grid');
    const fallback = container.querySelector('.recent-categories-grid');
    const previous = container.querySelector('.recent-games-prev');
    const next = container.querySelector('.recent-games-next');
    if (!track || !fallback || !previous || !next) return;

    const updateControls = () => {
      const slider = track.hidden ? fallback : track;
      const canScroll = slider.scrollWidth > slider.clientWidth + 1;
      container.classList.toggle('has-overflow', canScroll);
      previous.hidden = false;
      next.hidden = false;
    };

    previous.addEventListener('click', () => {
      const slider = track.hidden ? fallback : track;
      slider.scrollBy({ left: -slider.clientWidth * 0.75, behavior: 'smooth' });
    });
    next.addEventListener('click', () => {
      const slider = track.hidden ? fallback : track;
      slider.scrollBy({ left: slider.clientWidth * 0.75, behavior: 'smooth' });
    });
    container.addEventListener('scroll', updateControls, true);
    window.addEventListener('resize', updateControls);
    updateControls();
  }

  function renderAll() {
    const recentPage = document.getElementById('recent-games-page');
    const homeRecent = document.getElementById('home-recent-games');
    if (recentPage) renderRecent(recentPage, '');
    if (homeRecent) renderRecent(homeRecent, '');
  }

  function init() {
    recordCurrentGame();
    renderAll();
    document.querySelectorAll('.recent-games-section').forEach(setupSlider);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
