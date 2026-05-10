 const menuToggle = document.getElementById('menuToggle');
    const categoryMenu = document.getElementById('categoryMenu');
    const navbar = document.getElementById('navbar');
    const overlay = document.getElementById('overlay');

    function closeMenu() {
      navbar.classList.remove('menu-open');
      overlay.classList.remove('active');
    }

    function openMenu() {
      navbar.classList.add('menu-open');
      overlay.classList.add('active');
    }

    menuToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      if (navbar.classList.contains('menu-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    overlay.addEventListener('click', () => {
      closeMenu();
    });

    document.addEventListener('click', (event) => {
      if (!navbar.contains(event.target) && navbar.classList.contains('menu-open')) {
        closeMenu();
      }
    });

    const dropdownClass = document.querySelector('.has-dropdown');
    const dropdownToggles = document.querySelectorAll('.has-dropdown > a');
    let dropdownTimer = null;

    function setDropdownOpen(open) {
      if (open) {
        dropdownClass.classList.add('open');
        dropdownClass.querySelector('a').setAttribute('aria-expanded', 'true');
        clearTimeout(dropdownTimer);
      } else {
        dropdownClass.classList.remove('open');
        dropdownClass.querySelector('a').setAttribute('aria-expanded', 'false');
      }
    }

    // mouse interactions (desktop)
    dropdownClass.addEventListener('mouseenter', () => {
      if (window.matchMedia('(min-width: 861px)').matches) {
        setDropdownOpen(true);
      }
    });

    dropdownClass.addEventListener('mouseleave', () => {
      if (window.matchMedia('(min-width: 861px)').matches) {
        dropdownTimer = setTimeout(() => setDropdownOpen(false), 1000);
      }
    });

    dropdownToggles.forEach((toggle) => {
      toggle.addEventListener('click', (event) => {
        if (window.matchMedia('(max-width: 860px)').matches) {
          event.preventDefault();
          const parent = event.currentTarget.parentElement;
          const expanded = parent.classList.toggle('open');
          parent.querySelector('a').setAttribute('aria-expanded', expanded);
        }
      });
    });