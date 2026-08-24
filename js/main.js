// 4x4DefenderParts main JavaScript
console.log('4x4DefenderParts main script loaded');

function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const closeBtn = document.querySelector('.nav-close');
    const menu = document.querySelector('.header-menu');
    const overlay = document.querySelector('.nav-overlay');
    const header = document.querySelector('.site-header');
    const mobileQuery = window.matchMedia('(max-width: 1023px)');

    if (!toggle || !menu || !header) return;
    if (toggle.dataset.navInit === 'true') return;
    toggle.dataset.navInit = 'true';

    const placeNavElements = () => {
        if (mobileQuery.matches) {
            if (overlay && overlay.parentElement !== document.body) {
                document.body.appendChild(overlay);
            }
            if (menu.parentElement !== document.body) {
                document.body.appendChild(menu);
            }
        } else {
            if (overlay && overlay.parentElement !== header) {
                header.appendChild(overlay);
            }
            if (menu.parentElement !== header) {
                header.appendChild(menu);
            }
            closeNav();
        }
    };

    const openNav = () => {
        toggle.setAttribute('aria-expanded', 'true');
        menu.classList.add('is-open');
        menu.setAttribute('aria-hidden', 'false');
        document.body.classList.add('nav-open');
        if (overlay) {
            overlay.hidden = false;
            overlay.classList.add('is-visible');
        }
    };

    const closeNav = () => {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
        menu.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('nav-open');
        if (overlay) {
            overlay.classList.remove('is-visible');
            overlay.hidden = true;
        }
    };

    toggle.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';
        if (isOpen) closeNav();
        else openNav();
    });

    if (closeBtn) closeBtn.addEventListener('click', closeNav);
    if (overlay) overlay.addEventListener('click', closeNav);

    menu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
            closeNav();
        }
    });

    placeNavElements();
    mobileQuery.addEventListener('change', placeNavElements);
}

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.remove('fade-out');
    initMobileNav();

    // Wire up header search icon
    document.querySelectorAll('.search-icon').forEach(icon => {
        icon.addEventListener('click', () => {
            const shopSearch = document.getElementById('search-input');
            if (shopSearch) {
                shopSearch.focus();
                shopSearch.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                window.location.href = 'shop.php';
            }
        });
    });

    // Wire up social sharing button
    document.querySelectorAll('.social-button').forEach(btn => {
        btn.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: '4x4 Defender Parts — Tactical Engineering & Off-Road Upgrades',
                    url: window.location.href
                }).catch(() => {});
            } else {
                navigator.clipboard.writeText(window.location.href);
                btn.title = 'Link copied!';
            }
        });
    });
});

