(function() {
    const includeElements = Array.from(document.querySelectorAll('[data-include]'));

    if (!includeElements.length) {
        document.dispatchEvent(new CustomEvent('includes:loaded'));
        return;
    }

    const requests = includeElements.map((element) => {
        const file = element.getAttribute('data-include');
        if (!file) {
            element.parentNode.removeChild(element);
            return Promise.resolve();
        }

        return fetch(file)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to load include: ' + file);
                }
                return response.text();
            })
            .then((html) => {
                const wrapper = document.createElement('div');
                wrapper.innerHTML = html;
                const parent = element.parentNode;
                while (wrapper.firstChild) {
                    parent.insertBefore(wrapper.firstChild, element);
                }
                parent.removeChild(element);
            })
            .catch((error) => {
                console.error(error);
            });
    });

    Promise.all(requests).then(() => {
        highlightActiveNav();
        document.dispatchEvent(new CustomEvent('includes:loaded'));
    });

    function highlightActiveNav() {
        const nav = document.getElementById('nav');
        if (!nav) {
            return;
        }

        const path = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

        nav.querySelectorAll('li').forEach((item) => {
            item.classList.remove('current');
        });

        const links = nav.querySelectorAll('a[href]');
        links.forEach((link) => {
            const href = (link.getAttribute('href') || '').trim();
            if (!href || href.startsWith('http') || href.startsWith('#')) {
                return;
            }

            const normalized = href.replace(/^\.\//, '').toLowerCase();
            const target = normalized || 'index.html';
            if (target === path) {
                let item = link.closest('li');
                while (item) {
                    item.classList.add('current');
                    item = item.parentElement && item.parentElement.closest('li');
                }
            }
        });
    }
})();
