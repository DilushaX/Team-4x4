// 4x4DefenderParts shop page script — enhanced UX

const VIEW_STORAGE_KEY = '4x4defenderpartsShopView';

// ── Debounce helper ────────────────────────────────────────────────────────────
function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

// ── View Product buttons + Clickable Cards ────────────────────────────────────
function initViewProductButtons() {
    // Store product data in localStorage when "View Part" is clicked (anchor already navigates)
    document.querySelectorAll('.view-product').forEach((btn) => {
        btn.addEventListener('click', () => {
            const product = {
                id: btn.dataset.productId || 'product',
                name: btn.dataset.productName || 'Custom 4x4 Part',
                price: Number(btn.dataset.productPrice) || 0,
                image: btn.dataset.productImage || 'assets/images/fabrication.jpg',
                description: btn.dataset.productDescription || '',
                category: btn.dataset.productCategory || 'General',
                compatibility: btn.dataset.productCompatibility || 'Universal',
                condition: btn.dataset.productCondition || 'New',
            };
            localStorage.setItem('selectedShopProduct', JSON.stringify(product));
            // Let the <a href> handle navigation naturally — no preventDefault
        });
    });

    // Make the entire product card clickable
    document.querySelectorAll('.product-card[data-url]').forEach((card) => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            // If the click is on (or inside) any anchor or button, let it handle itself
            if (e.target.closest('a') || e.target.closest('button')) return;
            window.location.href = card.dataset.url;
        });
    });
}

// ── Grid / List View Toggle ───────────────────────────────────────────────────
function initViewToggle() {
    const productGrid = document.getElementById('productGrid');
    const toggleButtons = Array.from(document.querySelectorAll('.view-toggle-btn'));
    if (!productGrid || !toggleButtons.length) return;

    const applyView = (view) => {
        productGrid.classList.toggle('product-grid--list', view === 'list');
        toggleButtons.forEach(btn => btn.classList.toggle('is-active', btn.dataset.view === view));
        sessionStorage.setItem(VIEW_STORAGE_KEY, view);
    };

    applyView(sessionStorage.getItem(VIEW_STORAGE_KEY) || 'grid');
    toggleButtons.forEach(btn => btn.addEventListener('click', () => applyView(btn.dataset.view || 'grid')));
}

// ── Filters & Search ──────────────────────────────────────────────────────────
function initFiltersAndSearch() {
    // DOM refs
    const filterCheckboxes = Array.from(document.querySelectorAll('.filter-checkbox'));
    const applyBtn = document.querySelector('.apply-filters');
    const clearBtn = document.querySelector('.clear-filters');
    const filterToggleBtn = document.querySelector('.filter-toggle');   // button that opens the drawer
    const shopFiltersPanel = document.querySelector('.shop-filters');    // the aside drawer
    const filterBackdrop = document.querySelector('.filter-backdrop');
    const searchInput = document.getElementById('search-input');
    const searchClearBtn = document.getElementById('searchClearBtn');
    const activeFiltersEl = document.getElementById('activeFilters');
    const activeFilterPillsEl = document.getElementById('activeFilterPills');
    const activeFiltersClearBtn = document.getElementById('activeFiltersClear');
    const productCards = Array.from(document.querySelectorAll('.product-card'));
    const emptyState = document.querySelector('.empty-state');
    const emptyStateClearBtn = document.getElementById('emptyStateClear');
    const productCountEl = document.getElementById('product-count');

    // ── Drawer open / close ──
    function openDrawer() {
        if (!shopFiltersPanel) return;
        shopFiltersPanel.classList.add('open');
        if (filterToggleBtn) filterToggleBtn.setAttribute('aria-expanded', 'true');
        if (filterBackdrop) {
            filterBackdrop.hidden = false;
            // force reflow so the CSS transition plays
            void filterBackdrop.offsetWidth;
            filterBackdrop.classList.add('is-visible');
        }
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        if (!shopFiltersPanel) return;
        shopFiltersPanel.classList.remove('open');
        if (filterToggleBtn) filterToggleBtn.setAttribute('aria-expanded', 'false');
        if (filterBackdrop) {
            filterBackdrop.classList.remove('is-visible');
            // Hide after transition
            filterBackdrop.addEventListener('transitionend', () => {
                filterBackdrop.hidden = true;
            }, { once: true });
        }
        document.body.style.overflow = '';
    }

    if (filterToggleBtn) {
        filterToggleBtn.addEventListener('click', () => {
            const isOpen = filterToggleBtn.getAttribute('aria-expanded') === 'true';
            isOpen ? closeDrawer() : openDrawer();
        });
    }

    if (filterBackdrop) {
        filterBackdrop.addEventListener('click', closeDrawer);
    }

    // ── Helpers ──
    function getSelectedCategories() {
        return filterCheckboxes
            .filter(cb => cb.checked)
            .map(cb => ({
                id: (cb.dataset.category || '').toLowerCase(),
                name: (cb.parentElement?.textContent || '').trim(),
            }));
    }

    function getSearchTerm() {
        return (searchInput?.value || '').trim();
    }

    function matchesSearch(card, term) {
        if (!term) return true;
        const t = term.toLowerCase();
        const texts = [
            card.querySelector('h2')?.textContent || '',
            card.dataset.category || '',
            card.querySelector('.product-description')?.textContent || '',
            ...Array.from(card.querySelectorAll('.product-chip')).map(c => c.textContent),
            card.querySelector('.product-sku')?.textContent || '',
        ];
        return texts.some(s => s.toLowerCase().includes(t));
    }

    function updateCounter(visible, total) {
        if (productCountEl) productCountEl.textContent = `Showing ${visible} of ${total} parts`;
    }

    function showEmptyState(show) {
        if (!emptyState) return;
        emptyState.classList.toggle('hidden', !show);
        emptyState.classList.toggle('fade-in', show);
    }

    // ── Active pills ──
    function updateActivePills() {
        if (!activeFilterPillsEl) return;
        const cats = getSelectedCategories();
        const searchTerm = getSearchTerm();
        const hasActive = cats.length > 0 || searchTerm.length > 0;

        activeFilterPillsEl.innerHTML = '';
        if (activeFiltersEl) activeFiltersEl.hidden = !hasActive;

        // filter badge on button
        const badge = document.getElementById('filterBadge');
        if (badge) {
            const count = cats.length; // badge only counts category filters
            badge.hidden = count === 0;
            badge.textContent = count;
        }

        const makePill = (label, onRemove) => {
            const pill = document.createElement('span');
            pill.className = 'active-filter-pill';
            pill.innerHTML = `${label}<button class="active-filter-pill-remove" aria-label="Remove">&times;</button>`;
            pill.querySelector('button').addEventListener('click', onRemove);
            activeFilterPillsEl.appendChild(pill);
        };

        if (searchTerm) {
            makePill(`"${searchTerm}"`, () => {
                if (searchInput) { searchInput.value = ''; updateSearchClearBtn(); }
                applyAll();
            });
        }

        cats.forEach(cat => {
            makePill(cat.name, () => {
                const cb = filterCheckboxes.find(c => c.dataset.category === cat.id);
                if (cb) cb.checked = false;
                applyAll();
            });
        });
    }

    // ── Apply filters ──
    function applyAll() {
        const selCats = getSelectedCategories().map(c => c.id);
        const searchTerm = getSearchTerm();
        const total = productCards.length;
        let visible = 0;

        productCards.forEach(card => {
            const cat = (card.dataset.category || '').toLowerCase();
            const catOk = selCats.length === 0 || selCats.includes(cat);
            const srchOk = matchesSearch(card, searchTerm);
            const show = catOk && srchOk;

            card.style.display = show ? '' : 'none';
            card.classList.toggle('filter-hidden', !show);
            if (show) visible++;
        });

        updateCounter(visible, total);
        showEmptyState(visible === 0);
        updateActivePills();
    }

    function clearAll() {
        filterCheckboxes.forEach(cb => { cb.checked = false; });
        if (searchInput) { searchInput.value = ''; updateSearchClearBtn(); }
        productCards.forEach(card => {
            card.style.display = '';
            card.classList.remove('filter-hidden', 'filter-enter', 'filter-enter-active');
        });
        updateCounter(productCards.length, productCards.length);
        showEmptyState(false);
        updateActivePills();
    }

    function updateSearchClearBtn() {
        if (searchClearBtn && searchInput) {
            searchClearBtn.hidden = searchInput.value.trim() === '';
        }
    }

    // ── Event listeners ──
    if (applyBtn) {
        applyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            applyAll();
            closeDrawer();
            // Smooth scroll back to the grid
            document.getElementById('shopToolbar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    if (clearBtn) clearBtn.addEventListener('click', (e) => { e.preventDefault(); clearAll(); });
    if (activeFiltersClearBtn) activeFiltersClearBtn.addEventListener('click', clearAll);
    if (emptyStateClearBtn) emptyStateClearBtn.addEventListener('click', clearAll);

    if (searchInput) {
        const debouncedApply = debounce(applyAll, 250);
        searchInput.addEventListener('input', () => {
            updateSearchClearBtn();
            debouncedApply();
        });
    }

    if (searchClearBtn) {
        searchClearBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            updateSearchClearBtn();
            applyAll();
            searchInput?.focus();
        });
    }

    // ── Initial state ──
    updateSearchClearBtn();
    updateCounter(productCards.length, productCards.length);
    showEmptyState(productCards.length === 0);
    updateActivePills();
}

// ── Sticky toolbar on scroll ──────────────────────────────────────────────────
function initStickyToolbar() {
    const toolbar = document.getElementById('shopToolbar');
    if (!toolbar) return;

    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    toolbar.parentElement?.insertBefore(sentinel, toolbar);

    new IntersectionObserver(
        ([entry]) => toolbar.classList.toggle('is-sticky', !entry.isIntersecting),
        { rootMargin: '-70px 0px 0px 0px', threshold: 0 }
    ).observe(sentinel);
}

// ── Boot ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initViewProductButtons();
    initViewToggle();
    initFiltersAndSearch();
    initStickyToolbar();
});
