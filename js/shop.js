// Team4x4 shop page script

const VIEW_STORAGE_KEY = 'team4x4ShopView';

function initViewProductButtons() {
    const viewProductButtons = document.querySelectorAll('.view-product');
    if (!viewProductButtons.length) return;
    viewProductButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const product = {
                id: button.dataset.productId || 'product',
                name: button.dataset.productName || 'Custom 4x4 Part',
                price: Number(button.dataset.productPrice) || 0,
                image: button.dataset.productImage || 'assets/images/fabrication.jpg',
                description: button.dataset.productDescription || 'Premium 4x4 part built for extreme service and performance.',
                category: button.dataset.productCategory || 'General',
                condition: button.dataset.productCondition || 'New',
            };
            localStorage.setItem('selectedShopProduct', JSON.stringify(product));
            const productPage = button.dataset.productPage || (`product.php?id=` + product.id);
            window.location.href = productPage;
        });
    });
}

function initViewToggle() {
    const productGrid = document.getElementById('productGrid') || document.querySelector('.product-grid');
    const toggleButtons = Array.from(document.querySelectorAll('.view-toggle-btn'));
    if (!productGrid || !toggleButtons.length) return;

    const applyView = (view) => {
        const isList = view === 'list';
        productGrid.classList.toggle('product-grid--list', isList);
        toggleButtons.forEach((btn) => {
            btn.classList.toggle('is-active', btn.dataset.view === view);
        });
        sessionStorage.setItem(VIEW_STORAGE_KEY, view);
    };

    const savedView = sessionStorage.getItem(VIEW_STORAGE_KEY) || 'grid';
    applyView(savedView);

    toggleButtons.forEach((btn) => {
        btn.addEventListener('click', () => applyView(btn.dataset.view || 'grid'));
    });
}

function initFiltersAndSearch() {
    const filterCheckboxes = Array.from(document.querySelectorAll('.filter-checkbox'));
    const applyBtn = document.querySelector('.apply-filters');
    const clearBtn = document.querySelector('.clear-filters');
    const filterToggle = document.querySelector('.filter-toggle');
    const shopFilters = document.querySelector('.shop-filters');
    const filterBackdrop = document.querySelector('.filter-backdrop');
    const searchInput = document.getElementById('search-input');
    const productCards = Array.from(document.querySelectorAll('.product-card'));
    const emptyState = document.querySelector('.empty-state');
    const productCountEl = document.getElementById('product-count');

    function getSelectedCategories() {
        return filterCheckboxes.filter(cb => cb.checked).map(cb => (cb.dataset.category || '').toLowerCase());
    }

    function getSearchTerm() {
        return (searchInput?.value || '').toLowerCase().trim();
    }

    function matchesSearch(card, searchTerm) {
        if (!searchTerm) return true;
        const name = (card.querySelector('h2')?.textContent || '').toLowerCase();
        const category = (card.dataset.category || '').toLowerCase();
        const description = (card.querySelector('.product-description')?.textContent || '').toLowerCase();
        const compatibility = Array.from(card.querySelectorAll('.product-chip'))
            .map(chip => chip.textContent.toLowerCase())
            .join(' ');
        return name.includes(searchTerm) || category.includes(searchTerm) ||
            description.includes(searchTerm) || compatibility.includes(searchTerm);
    }

    function updateCounter(visibleCount, totalCount) {
        if (!productCountEl) return;
        productCountEl.textContent = `Showing ${visibleCount} of ${totalCount} products`;
    }

    function showEmptyState(show) {
        if (!emptyState) return;
        if (show) {
            emptyState.classList.remove('hidden');
            emptyState.classList.add('fade-in');
        } else {
            emptyState.classList.add('hidden');
            emptyState.classList.remove('fade-in');
        }
    }

    function applyFiltersAndSearch() {
        const selectedCategories = getSelectedCategories();
        const searchTerm = getSearchTerm();
        const total = productCards.length;
        let visible = 0;

        productCards.forEach((card) => {
            const category = (card.dataset.category || '').toLowerCase();
            const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(category);
            const searchMatch = matchesSearch(card, searchTerm);
            const shouldShow = categoryMatch && searchMatch;

            if (shouldShow) {
                visible += 1;
                card.style.display = '';
                card.classList.remove('filter-hidden', 'filter-enter');
                window.requestAnimationFrame(() => {
                    card.classList.add('filter-enter-active');
                });
            } else {
                card.style.display = 'none';
                card.classList.add('filter-hidden');
            }
        });

        updateCounter(visible, total);
        showEmptyState(visible === 0);
    }

    function clearFiltersAndSearch() {
        filterCheckboxes.forEach(cb => { cb.checked = false; });
        if (searchInput) searchInput.value = '';
        productCards.forEach(card => {
            card.style.display = '';
            card.classList.remove('filter-hidden', 'filter-enter', 'filter-enter-active');
        });
        updateCounter(productCards.length, productCards.length);
        showEmptyState(false);
    }

    function closeFilterDrawer() {
        if (!filterToggle || !shopFilters) return;
        filterToggle.setAttribute('aria-expanded', 'false');
        shopFilters.classList.remove('open');
        if (filterBackdrop) {
            filterBackdrop.classList.remove('is-visible');
            filterBackdrop.hidden = true;
        }
    }

    function openFilterDrawer() {
        if (!filterToggle || !shopFilters) return;
        filterToggle.setAttribute('aria-expanded', 'true');
        shopFilters.classList.add('open');
        if (filterBackdrop) {
            filterBackdrop.hidden = false;
            filterBackdrop.classList.add('is-visible');
        }
    }

    if (applyBtn) applyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        applyFiltersAndSearch();
        closeFilterDrawer();
    });

    if (clearBtn) clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        clearFiltersAndSearch();
    });

    if (searchInput) searchInput.addEventListener('input', applyFiltersAndSearch);

    if (filterToggle && shopFilters) {
        filterToggle.addEventListener('click', () => {
            const expanded = filterToggle.getAttribute('aria-expanded') === 'true';
            if (expanded) closeFilterDrawer();
            else openFilterDrawer();
        });
    }

    if (filterBackdrop) {
        filterBackdrop.addEventListener('click', closeFilterDrawer);
    }

    updateCounter(productCards.length, productCards.length);
    showEmptyState(false);
}

document.addEventListener('DOMContentLoaded', () => {
    initViewProductButtons();
    initViewToggle();
    initFiltersAndSearch();
});
