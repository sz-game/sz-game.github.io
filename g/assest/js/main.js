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

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Pehli baar animation chalao
                playAnimation();

                // Agar pehle se interval chal raha ho to usko clear karo
                if (intervalId) clearInterval(intervalId);

                // Har 10 second baad repeat karo
                intervalId = setInterval(playAnimation, 10000);
            } else {
                // Jab element screen se bahar chala jaye to interval band kar do
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
            }
        });
    }, {
        threshold: 0.3 // 30% element visible hote hi trigger hoga
    });

    observer.observe(icon);
})();