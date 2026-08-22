(function () {
        const categoryBase = '/all-games';  
        const totalPages = 10;           
        const maxVisible = 4;          
 
        const el = document.getElementById('pagination');
 
        function detectCurrentPage() {
            const path = window.location.pathname.replace(/\/+$/, ''); // trailing slash hata do
            const segments = path.split('/').filter(Boolean);
            const last = segments[segments.length - 1];
            const num = parseInt(last, 10);
            return (!isNaN(num) && num > 0) ? num : 1;
        }
 
        const currentPage = detectCurrentPage();
 
        function pageUrl(p) {
            return p <= 1 ? `${categoryBase}/` : `${categoryBase}/${p}/`;
        }
 
        function getPageList(current, total, max) {
            if (total <= max) {
                return Array.from({ length: total }, (_, i) => i + 1);
            }
            const pages = [1];
            let start = Math.max(2, current - 1);
            let end = Math.min(total - 1, current + 1);
            const middleSlots = max - 2;
            while (end - start + 1 < middleSlots && (start > 2 || end < total - 1)) {
                if (start > 2) start--;
                else if (end < total - 1) end++;
            }
            if (start > 2) pages.push('...');
            for (let p = start; p <= end; p++) pages.push(p);
            if (end < total - 1) pages.push('...');
            pages.push(total);
            return pages;
        }
 
        function arrowSVG(dir) {
            const d = dir === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6';
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
        }
 
        function render() {
            const pages = getPageList(currentPage, totalPages, maxVisible);
            let html = '';
 
            const prevDisabled = currentPage === 1;
            html += `<a href="${prevDisabled ? '#' : pageUrl(currentPage - 1)}" class="nav-btn prev ${prevDisabled ? 'disabled' : ''}" aria-label="Previous page">${arrowSVG('left')}</a>`;
 
            pages.forEach(p => {
                if (p === '...') {
                    html += `<span class="ellipsis">...</span>`;
                } else {
                    html += `<a href="${pageUrl(p)}" class="page-num ${p === currentPage ? 'active' : ''}">${p}</a>`;
                }
            });
 
            const nextDisabled = currentPage === totalPages;
            html += `<a href="${nextDisabled ? '#' : pageUrl(currentPage + 1)}" class="nav-btn next ${nextDisabled ? 'disabled' : ''}" aria-label="Next page">${arrowSVG('right')}</a>`;
 
            el.innerHTML = html;
        }
 
        render();
    })();