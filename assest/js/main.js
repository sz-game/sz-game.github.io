  (function () {
        function toggleSidebar() {
            const btn = document.querySelector('.sidebar-toggle-btn');
            const nav = document.getElementById('mainNav');
            if (!btn || !nav) return;
            // initialize aria state
            btn.setAttribute('aria-expanded', nav.classList.contains('hidden') ? 'false' : 'true');
            btn.addEventListener('click', function () {
                const hidden = nav.classList.toggle('hidden');
                // Also toggle body class so layout CSS can respond and reclaim space
                document.body.classList.toggle('sidebar-hidden', hidden);
                btn.setAttribute('aria-expanded', hidden ? 'false' : 'true');
            });
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', toggleSidebar);
        } else {
            toggleSidebar();
        }
    })();

    (function() {
    const icon = document.querySelector('.category-info-icon');
    let intervalId = null;

    function playAnimation() {
        icon.classList.remove('animate');
        // Force reflow taake animation dobara trigger ho sake
        void icon.offsetWidth;
        icon.classList.add('animate');
    }

    if (icon) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    playAnimation();
                    if (intervalId) clearInterval(intervalId);
                    intervalId = setInterval(playAnimation, 10000);
                } else {
                    if (intervalId) {
                        clearInterval(intervalId);
                        intervalId = null;
                    }
                }
            });
        }, {
            threshold: 0.3
        });

        observer.observe(icon);
    }
})();

    if (!document.querySelector('script[data-recent-games]')) {
        const recentScript = document.createElement('script');
        recentScript.src = '/assest/js/recent.js';
        recentScript.dataset.recentGames = 'true';
        document.head.appendChild(recentScript);
    }