const cartItemsEl = document.getElementById('cartItems');
const subtotalEl = document.getElementById('cartSubtotal');
const totalEl = document.getElementById('cartTotal');
const cartBuyNowButton = document.getElementById('cartBuyNowButton');

const storageKey = 'team4x4Cart';
const checkoutCartKey = 'selectedCheckoutCart';


const getCartItems = () => {
    try {
        const stored = JSON.parse(localStorage.getItem(storageKey));
        return Array.isArray(stored) ? stored : [];
    } catch {
        return [];
    }
};

const saveCartItems = (items) => {
    localStorage.setItem(storageKey, JSON.stringify(items));
};

let cartItems = getCartItems();


const formatLKR = (value) => `LKR ${value.toLocaleString('en-US')}`;

const calculateSummary = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal; // no labour/taxes

    if (subtotalEl) subtotalEl.textContent = formatLKR(subtotal);
    if (totalEl) totalEl.textContent = formatLKR(total);
};

const buildCartWhatsAppMessage = (items) => {
    const itemDetails = items.map((item) => {
        return `Product: ${item.title}\nPrice: LKR ${item.price.toLocaleString('en-US')}\nQuantity: ${item.quantity}\nTotal: LKR ${(item.price * item.quantity).toLocaleString('en-US')}`;
    }).join('\n\n');

    return `Hello Team 4x4,\n\nI would like to order the following item(s):\n\n${itemDetails}\n\nPlease contact me regarding availability and delivery.\n\nThank you.`;
};

const openWhatsAppForCart = () => {
    if (!cartItems.length) {
        window.alert('Your cart is empty. Add parts before using Buy Now.');
        return;
    }

    const message = buildCartWhatsAppMessage(cartItems);
    if (typeof window.team4x4OpenWhatsApp === 'function') {
        window.team4x4OpenWhatsApp(message);
    } else {
        window.location.href = `https://wa.me/94703939459?text=${encodeURIComponent(message)}`;
    }
};

const renderCartItems = () => {
    if (!cartItemsEl) return;

    if (cartItems.length === 0) {
        cartItemsEl.innerHTML = '<div class="cart-empty">Your cart is empty. Browse the shop to add custom parts.</div>';
        calculateSummary();
        return;
    }

    cartItemsEl.innerHTML = cartItems
        .map((item) => `
            <article class="cart-item-card" data-id="${item.id}">
                <div class="cart-item-media">
                    <img src="${item.image}" alt="${item.title}" />
                </div>
                <div class="cart-item-body">
                    <div class="cart-item-header">
                        <div>
                            <span class="cart-item-tag">${item.tag}</span>
                            <h3>${item.title}</h3>
                        </div>
                        <button class="remove-item" data-action="remove" data-id="${item.id}" aria-label="Remove item">🗑️</button>
                    </div>
                    <p class="cart-item-description">${item.description}</p>
                    <div class="cart-item-meta">
                        <span>${item.category}</span>
                        <span>${item.condition}</span>
                    </div>
                    <div class="cart-item-bottom">
                        <div class="quantity-control">
                            <button class="quantity-button" data-action="decrease" data-id="${item.id}">−</button>
                            <input type="text" value="${item.quantity}" readonly aria-label="Quantity" />
                            <button class="quantity-button" data-action="increase" data-id="${item.id}">+</button>
                        </div>
                        <div class="cart-item-price">${formatLKR(item.price * item.quantity)}</div>
                    </div>
                </div>
            </article>
        `)
        .join('');

    calculateSummary();
};

const updateQuantity = (id, delta) => {
    cartItems = cartItems.map((item) => {
        if (item.id !== id) return item;
        const nextQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: nextQty };
    });
    saveCartItems(cartItems);
    renderCartItems();
};

const removeItem = (id) => {
    cartItems = cartItems.filter((item) => item.id !== id);
    saveCartItems(cartItems);
    renderCartItems();
};

const saveCheckoutCart = (items) => {
    localStorage.setItem(checkoutCartKey, JSON.stringify(items));
};

const handleCartClick = (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    const id = button.dataset.id;
    if (!id) return;

    if (action === 'increase') updateQuantity(id, 1);
    if (action === 'decrease') updateQuantity(id, -1);
    if (action === 'remove') removeItem(id);
};

// Show order options modal when user clicks Buy Now or Checkout
const openOrderOptionsModal = (e) => {
    e && e.preventDefault();
    const modal = document.getElementById('orderOptionsModal');
    if (!modal) return;
    modal.classList.remove('hidden');

    // remember which button opened it (optional)
    modal.dataset.source = 'cart';
};

const closeOrderOptionsModal = () => {
    const modal = document.getElementById('orderOptionsModal');
    if (!modal) return;
    modal.classList.add('hidden');
};

const proceedFromModal = (method) => {
    // save checkout cart and selected method then go to checkout page
    saveCheckoutCart(cartItems);
    localStorage.setItem('checkoutShipping', JSON.stringify({ method }));
    window.location.href = 'checkout.html';
};

const wireOrderModal = () => {
    const modal = document.getElementById('orderOptionsModal');
    if (!modal) return;
    modal.addEventListener('click', (ev) => {
        if (ev.target === modal) closeOrderOptionsModal();
    });
    
    // Set default selection state on modal element
    modal.dataset.method = 'pickup';

    const options = modal.querySelectorAll('.fulfillment-card');
    options.forEach((btn) => btn.addEventListener('click', () => {
        options.forEach(o => o.classList.remove('active'));
        btn.classList.add('active');
        modal.dataset.method = btn.dataset.method;
    }));
    const proceed = document.getElementById('modalProceed');
    const cancel = document.getElementById('modalCancel');
    if (proceed) proceed.addEventListener('click', () => {
        const method = modal.dataset.method || 'pickup';
        proceedFromModal(method);
    });
    if (cancel) cancel.addEventListener('click', closeOrderOptionsModal);
};

const handleBuyNow = () => openWhatsAppForCart();

renderCartItems();

if (cartBuyNowButton) {
    cartBuyNowButton.addEventListener('click', handleBuyNow);
}

if (cartItemsEl) {
    cartItemsEl.addEventListener('click', handleCartClick);
}

// wire modal and checkout button
wireOrderModal();
const checkoutBtn = document.querySelector('.checkout-button');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openOrderOptionsModal(e);
    });
}
