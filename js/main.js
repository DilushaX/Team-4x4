// Team4x4 main JavaScript
console.log('Team4x4 main script loaded');

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.remove('fade-out');

    const pageLinks = Array.from(document.querySelectorAll('a[href]'))
        .filter(link => {
            const href = link.getAttribute('href');
            return href && !href.startsWith('tel:') && !href.startsWith('mailto:') && !href.startsWith('#') && link.target !== '_blank';
        });

    pageLinks.forEach(link => {
        link.addEventListener('click', event => {
            const href = link.getAttribute('href');
            if (!href) return;
            const url = new URL(href, window.location.href);
            if (url.origin !== window.location.origin) return;

            event.preventDefault();
            document.body.classList.add('fade-out');
            setTimeout(() => window.location.href = url.href, 240);
        });
    });
});
