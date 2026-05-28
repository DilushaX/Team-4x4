// Team4x4 shop page script

// Preserve existing 'View Part' behavior
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
            window.location.href = 'product.html';
        });
    });
}

// Filtering and search logic
function initFiltersAndSearch() {
    const filterCheckboxes = Array.from(document.querySelectorAll('.filter-checkbox'));
    const applyBtn = document.querySelector('.apply-filters');
    const clearBtn = document.querySelector('.clear-filters');
    const filterToggle = document.querySelector('.filter-toggle');
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

        productCards.forEach((card, idx) => {
            const category = (card.dataset.category || '').toLowerCase();
            const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(category);
            const searchMatch = matchesSearch(card, searchTerm);
            const shouldShow = categoryMatch && searchMatch;

            if (shouldShow) {
                visible += 1;
                card.style.display = 'block';
                // remove filter animations
                card.classList.remove('filter-hidden', 'filter-enter');
                // add entrance animation
                window.requestAnimationFrame(() => {
                    card.classList.add('filter-enter-active');
                });
            } else {
                card.style.display = 'none';
                card.classList.add('filter-hidden');
            }
        });

        // update counter & empty state
        updateCounter(visible, total);
        showEmptyState(visible === 0);
    }

    function clearFiltersAndSearch() {
        // uncheck all filters
        filterCheckboxes.forEach(cb => cb.checked = false);
        // clear search
        if (searchInput) searchInput.value = '';
        // show all products
        productCards.forEach(card => {
            card.style.display = 'block';
            card.classList.remove('filter-hidden', 'filter-enter', 'filter-enter-active');
        });
        updateCounter(productCards.length, productCards.length);
        showEmptyState(false);
    }

    // Wire buttons
    if (applyBtn) applyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        applyFiltersAndSearch();
    });
    if (clearBtn) clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        clearFiltersAndSearch();
    });

    // live search on input
    if (searchInput) searchInput.addEventListener('input', () => {
        applyFiltersAndSearch();
    });

    // mobile drawer toggle
    if (filterToggle) {
        filterToggle.addEventListener('click', () => {
            const expanded = filterToggle.getAttribute('aria-expanded') === 'true';
            filterToggle.setAttribute('aria-expanded', String(!expanded));
            document.querySelector('.shop-filters').classList.toggle('open');
        });
    }

    // initialize state
    updateCounter(productCards.length, productCards.length);
    showEmptyState(false);
}

document.addEventListener('DOMContentLoaded', () => {
    initViewProductButtons();
    initFiltersAndSearch();
});
