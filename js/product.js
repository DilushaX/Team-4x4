/* product.js — Redesigned product page controller */
'use strict';

const storageKey   = '4x4defenderpartsCart';
const selectedKey  = 'selectedShopProduct';
const checkoutKey  = 'selectedCheckoutCart';

/* ── Helpers ── */
const $ = (id) => document.getElementById(id);
const cartFromStorage = () => { try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch { return []; } };
const saveCart = (c) => localStorage.setItem(storageKey, JSON.stringify(c));
const getProductFromStorage = () => { try { return JSON.parse(localStorage.getItem(selectedKey)); } catch { return null; } };
const fmt = (v) => `LKR ${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ── WhatsApp URL ── */
const buildWaUrl = (number, message) => {
    const base = number ? `https://api.whatsapp.com/send?phone=${number}&text=` : 'https://wa.me/94703939459?text=';
    return base + encodeURIComponent(message);
};

const buildOrderMessage = (product, qty) => {
    const total = Number(product.price) * Number(qty);
    return `Hello 4x4 Defender Parts,\n\nI would like to order the following item:\n\nProduct: ${product.name}\nSKU: ${product.sku || ''}\nCategory: ${product.category || 'General'}\nCompatibility: ${product.compatibility || 'Universal'}\nCondition: ${product.condition || 'New'}\nUnit Price: LKR ${Number(product.price).toLocaleString('en-US')}\nQuantity: ${qty}\nTotal: LKR ${total.toLocaleString('en-US')}\n\nPlease contact me regarding availability, fitment, and delivery.\n\nThank you.`;
};

/* ── Demo fallback product ── */
const DEMO_PRODUCT = {
    id: 'demo-bull-bar', name: 'Tactical Bull Bar V2',
    overview: 'Heavy-duty exterior bull bar engineered for unmatched protection and aggressive stance on extreme terrain.',
    description: 'Heavy-duty exterior bull bar with integrated mounting points and rugged front protection designed for extreme terrain applications.',
    category: 'Exterior', condition: 'New', availability: 'In Stock',
    compatibility: 'Defender 90 / 110 / 130', sku: 'T4X4-BBV2', brand: '4x4 Defender Parts',
    installation: 'Bolt-on fitment with integrated light mount. Professional installation recommended.',
    image: 'assets/images/fabrication.jpg', price: 125000, waNumber: '94703939459',
    gallery: ['assets/images/fabrication.jpg', 'assets/images/recovery.jpg'],
    features: ['Premium steel construction', 'Integrated winch/light compatibility', 'Powder-coated matte finish', 'Trail-ready durability', 'Corrosion-resistant coating'],
};

/* ── Load product ── */
const parseList = (v) => v ? v.split('|').map(s => s.trim()).filter(Boolean) : [];

const loadProduct = () => {
    if (window.activeDbProduct) {
        const d = window.activeDbProduct;
        return {
            id: d.id, name: d.name, price: Number(d.price) || 0,
            image: d.image, description: d.description || '',
            category: d.category || 'General', condition: d.condition || 'New',
            compatibility: d.compatibility || 'Defender 90 / 110 / 130 / Universal',
            sku: d.sku || ('T4X4-SKU' + d.id), brand: '4x4 Defender Parts',
            installation: 'Bolt-on fitment; professional installation recommended.',
            overview: d.description ? d.description.substring(0, 200) + '...' : 'Premium 4x4 automotive upgrade.',
            gallery: [d.image], waNumber: d.waNumber || '94703939459',
            features: ['Precision engineering', 'Premium matte finish', 'Trail-ready durability'],
            availability: 'In Stock',
        };
    }
    const stored = getProductFromStorage();
    if (!stored) return DEMO_PRODUCT;
    return {
        id: stored.id, name: stored.name, price: Number(stored.price) || 0,
        image: stored.image, description: stored.productDescription || stored.description || '',
        category: stored.category || 'General', condition: stored.condition || 'New',
        compatibility: stored.productCompatibility || stored.compatibility || 'Defender 90 / 110 / 130',
        sku: stored.productSku || stored.sku || stored.productSKU || 'T4X4-000',
        brand: stored.brand || '4x4 Defender Parts',
        installation: stored.productInstallation || stored.installation || 'Professional installation recommended.',
        overview: stored.productOverview || stored.overview || 'Premium automotive upgrade.',
        gallery: stored.productGallery ? stored.productGallery.split(',').map(s => s.trim()) : [stored.image],
        waNumber: '94703939459', availability: stored.availability || 'In Stock',
        features: parseList(stored.productFeatures || stored.features),
    };
};

/* ── Cart operations ── */
const addToCart = (product, qty) => {
    const cart = cartFromStorage();
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
        cart.forEach(i => { if (i.id === product.id) i.quantity = Math.max(1, i.quantity + qty); });
    } else {
        cart.unshift({
            id: product.id, tag: (product.category || 'PART').toUpperCase(),
            title: product.name, description: product.description,
            category: product.category, compatibility: product.compatibility || 'Universal',
            condition: product.condition || 'New', image: product.image,
            price: product.price, quantity: qty,
        });
    }
    saveCart(cart);
};

const saveCheckout = (product, qty) => {
    localStorage.setItem(checkoutKey, JSON.stringify([{
        id: product.id, name: product.name, title: product.name,
        category: product.category, compatibility: product.compatibility || 'Universal',
        condition: product.condition || 'New', image: product.image,
        price: product.price, quantity: qty, total: product.price * qty,
    }]));
};

/* ── Toast ── */
const showToast = (msg, duration = 2200) => {
    const el = $('pdToast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), duration);
};

/* ── Gallery / Lightbox ── */
const initGallery = (product) => {
    const galleryEl = $('productGallery');
    const mainImg   = $('galleryMainImage');
    const mainWrap  = $('galleryMainWrap');

    // If the gallery was rendered server-side, wire thumbnail clicks
    if (galleryEl) {
        // Build thumbnails if gallery is empty (JS-only mode)
        if (galleryEl.children.length === 0 && product.gallery && product.gallery.length > 1) {
            galleryEl.innerHTML = product.gallery.map((src, i) =>
                `<button type="button" class="pd-thumb${i === 0 ? ' active' : ''}" data-src="${src}" aria-label="Gallery image ${i + 1}">
                    <img src="${src}" alt="View ${i + 1}" />
                </button>`
            ).join('');
        }

        galleryEl.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-src]');
            if (!btn) return;
            if (mainImg) mainImg.src = btn.dataset.src;
            galleryEl.querySelectorAll('.pd-thumb').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
        });
    }

    // Lightbox
    const lightbox  = $('pdLightbox');
    const lbImg     = $('pdLightboxImg');
    const lbClose   = $('pdLightboxClose');

    if (mainWrap && lightbox && lbImg) {
        mainWrap.addEventListener('click', () => {
            lbImg.src = (mainImg ? mainImg.src : product.image);
            lightbox.classList.add('active');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        });
        const closeLb = () => {
            lightbox.classList.remove('active');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        };
        if (lbClose) lbClose.addEventListener('click', closeLb);
        lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLb(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLb(); });
    }
};

/* ── Tabs ── */
const initTabs = (product) => {
    const tabs    = document.querySelectorAll('.pd-tab');
    const panels  = document.querySelectorAll('.pd-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
            panels.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            const panel = document.getElementById(`tab-${target}`);
            if (panel) panel.classList.add('active');

            // Populate features lazily when tab is opened
            if (target === 'features') {
                const fl = $('featureList');
                if (fl && fl.children.length === 0 && product.features && product.features.length) {
                    fl.innerHTML = product.features.map(f => `<li><span class="pd-feat-icon">&#10003;</span>${f}</li>`).join('');
                }
            }
        });
    });
};

/* ── Quantity ── */
const initQuantity = (product) => {
    const qtyInput = $('productQuantity');
    const minus    = $('quantityMinus');
    const plus     = $('quantityPlus');
    const totalEl  = $('productTotal');
    const waLink   = $('whatsappLink');

    const updateTotal = () => {
        const qty = Math.max(1, parseInt(qtyInput?.value) || 1);
        if (totalEl) totalEl.textContent = fmt(product.price * qty);
        // Re-build WhatsApp link
        if (waLink) {
            waLink.href = buildWaUrl(product.waNumber, buildOrderMessage(product, qty));
        }
    };

    if (minus) minus.addEventListener('click', () => {
        if (!qtyInput) return;
        qtyInput.value = Math.max(1, parseInt(qtyInput.value) - 1);
        updateTotal();
    });
    if (plus) plus.addEventListener('click', () => {
        if (!qtyInput) return;
        qtyInput.value = parseInt(qtyInput.value) + 1;
        updateTotal();
    });

    return { getQty: () => Math.max(1, parseInt(qtyInput?.value) || 1) };
};

/* ── Main init ── */
const product = loadProduct();

/* Render dynamic fields (in fallback JS-only mode) */
if (!window.activeDbProduct) {
    const setText = (id, val) => { const el = $(id); if (el && val !== undefined) el.textContent = val; };
    setText('productName', product.name);
    setText('productNameBc', product.name);
    setText('productOverview', product.overview);
    setText('productCategory', product.category);
    setText('productAvailability', product.availability);
    setText('productSKU', product.sku);
    setText('productBrand', product.brand);
    setText('productCondition', product.condition);
    setText('productCompatibility', product.compatibility);
    setText('productCompatibility2', product.compatibility);
    setText('productInstallation', product.installation);
    setText('productDescription', product.description);
    setText('productDiscountPrice', fmt(product.price));
    setText('productTotal', fmt(product.price));
    const mainImg = $('galleryMainImage');
    if (mainImg) { mainImg.src = product.image; mainImg.alt = product.name; }
    const fl = $('featureList');
    if (fl && product.features.length) {
        fl.innerHTML = product.features.map(f => `<li><span class="pd-feat-icon">&#10003;</span>${f}</li>`).join('');
    }
}

/* Init initial WhatsApp inquiry link */
const waLink = $('whatsappLink');
if (waLink && !waLink.href.includes('api.whatsapp')) {
    waLink.href = buildWaUrl(product.waNumber, buildOrderMessage(product, 1));
}

/* Init subsystems */
initGallery(product);
initTabs(product);
const { getQty } = initQuantity(product);

/* Add to Cart */
const addBtn = $('addToCartButton');
if (addBtn) {
    addBtn.addEventListener('click', () => {
        const qty = getQty();
        addToCart(product, qty);
        saveCheckout(product, qty);
        addBtn.textContent = '✓ Added to Cart';
        addBtn.classList.add('pd-success');
        showToast('✓ Added to cart successfully!');
        setTimeout(() => {
            addBtn.innerHTML = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>Add to Cart`;
            addBtn.classList.remove('pd-success');
        }, 2000);
    });
}

/* Buy Now → WhatsApp order */
const buyBtn = $('buyNowButton');
if (buyBtn) {
    buyBtn.addEventListener('click', () => {
        const qty = getQty();
        const msg = buildOrderMessage(product, qty);
        window.open(buildWaUrl(product.waNumber, msg), '_blank', 'noreferrer');
    });
}
