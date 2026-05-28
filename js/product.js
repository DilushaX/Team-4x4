const storageKey = 'team4x4Cart';
const selectedKey = 'selectedShopProduct';
const checkoutKey = 'selectedCheckoutProduct';
const discountRate = 0.12;

const elements = {
    productImage: document.getElementById('productImage'),
    galleryMainImage: document.getElementById('galleryMainImage'),
    productName: document.getElementById('productName'),
    productOverview: document.getElementById('productOverview'),
    productCategory: document.getElementById('productCategory'),
    productCondition: document.getElementById('productCondition'),
    productAvailability: document.getElementById('productAvailability'),
    productSKU: document.getElementById('productSKU'),
    productBrand: document.getElementById('productBrand'),
    productCompatibility: document.getElementById('productCompatibility'),
    productInstallation: document.getElementById('productInstallation'),
    productDescription: document.getElementById('productDescription'),
    productFullDescription: document.getElementById('productFullDescription'),
    featureList: document.getElementById('featureList'),
    productGallery: document.getElementById('productGallery'),
    productOriginalPrice: document.getElementById('productOriginalPrice'),
    productDiscountPrice: document.getElementById('productDiscountPrice'),
    productLabour: document.getElementById('productLabour'),
    productTotal: document.getElementById('productTotal'),
    quantityInput: document.getElementById('productQuantity'),
    quantityMinus: document.getElementById('quantityMinus'),
    quantityPlus: document.getElementById('quantityPlus'),
    addToCartButton: document.getElementById('addToCartButton'),
    buyNowButton: document.getElementById('buyNowButton'),
    whatsappLink: document.getElementById('whatsappLink'),
};

const cartFromStorage = () => {
    try {
        return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch {
        return [];
    }
};

const saveCart = (cart) => {
    localStorage.setItem(storageKey, JSON.stringify(cart));
};

const getProductFromStorage = () => {
    try {
        return JSON.parse(localStorage.getItem(selectedKey));
    } catch {
        return null;
    }
};

const formatCurrency = (value) => `LKR ${value.toLocaleString('en-US')}`;

const parseList = (value) => {
    if (!value) return [];
    return value.split('|').map((item) => item.trim()).filter(Boolean);
};

const loadProduct = () => {
    if (window.activeDbProduct) {
        const stored = window.activeDbProduct;
        return {
            id: stored.id || 'custom-part',
            name: stored.name || 'Custom 4x4 Part',
            overview: stored.description ? stored.description.substring(0, 160) + '...' : 'Premium automotive upgrade.',
            description: stored.description || 'Premium 4x4 part.',
            fullDescription: stored.description || 'Premium 4x4 part story.',
            category: stored.category || 'General',
            condition: stored.condition || 'New',
            availability: 'In Stock',
            compatibility: 'Defender 90 / 110 / 130 / Universal',
            sku: 'T4X4-SKU' + stored.id,
            brand: 'Team 4x4',
            installation: 'Professional installation recommended.',
            image: stored.image || 'assets/images/fabrication.jpg',
            price: Number(stored.price) || 0,
            gallery: [stored.image || 'assets/images/fabrication.jpg'],
            features: ['Precision engineering', 'Premium matte finish', 'Trail-ready durability']
        };
    }
    const stored = getProductFromStorage();
    if (!stored) {
        window.location.href = 'shop.php';
        return null;
    }

    return {
        id: stored.id || 'custom-part',
        name: stored.name || 'Custom 4x4 Part',
        overview: stored.productOverview || stored.overview || 'Premium automotive upgrade engineered for strength and performance.',
        description: stored.productDescription || stored.description || 'Premium 4x4 part built to order for high performance and fitment.',
        fullDescription: stored.productFullDescription || stored.description || 'The ultimate product story for a custom automotive build designed to impress on every journey.',
        category: stored.category || 'General',
        condition: stored.condition || 'New',
        availability: stored.productAvailability || stored.availability || 'Available',
        compatibility: stored.productCompatibility || stored.compatibility || 'Defender 90 / 110 / 130',
        sku: stored.productSku || stored.sku || stored.productSKU || 'T4X4-000',
        brand: stored.productBrand || stored.brand || 'Team 4x4',
        installation: stored.productInstallation || stored.installation || 'Professional installation recommended.',
        image: stored.image || 'assets/images/fabrication.jpg',
        price: Number(stored.price) || 0,
        gallery: stored.productGallery
            ? stored.productGallery.split(',').map((src) => src.trim()).filter(Boolean)
            : [stored.image || 'assets/images/fabrication.jpg'],
        features: parseList(stored.productFeatures || stored.features),
    };
};

const setItemText = (element, text) => {
    if (element) element.textContent = text;
};

const renderGallery = (gallery) => {
    if (!elements.productGallery || !elements.galleryMainImage) return;
    elements.productGallery.innerHTML = gallery
        .map((src, index) => `
            <button type="button" class="product-thumb${index === 0 ? ' active' : ''}" data-src="${src}">
                <img src="${src}" alt="Gallery ${index + 1}" />
            </button>
        `)
        .join('');

    elements.galleryMainImage.src = gallery[0];
    elements.galleryMainImage.alt = `Gallery image 1`;
};

const calculateTotal = (price, qty) => {
    const subtotal = price * qty;
    const discount = Math.round(subtotal * discountRate);
    const total = subtotal - discount;
    return {
        subtotal,
        discount,
        total,
    };
};

const renderProduct = (product) => {
    if (!product) return;
    setItemText(elements.productName, product.name);
    setItemText(elements.productOverview, product.overview);
    setItemText(elements.productCategory, product.category);
    setItemText(elements.productCondition, product.condition);
    setItemText(elements.productAvailability, product.availability);
    setItemText(elements.productCompatibility, product.compatibility);
    setItemText(elements.productSKU, product.sku);
    setItemText(elements.productBrand, product.brand);
    setItemText(elements.productInstallation, product.installation);
    setItemText(elements.productDescription, product.description);
    setItemText(elements.productFullDescription, product.fullDescription);
    if (elements.productImage) {
        elements.productImage.src = product.image;
        elements.productImage.alt = product.name;
    }
    if (elements.galleryMainImage) {
        elements.galleryMainImage.src = product.gallery[0];
        elements.galleryMainImage.alt = product.name;
    }

    const { subtotal, discount, total } = calculateTotal(product.price, Number(elements.quantityInput?.value || 1));
    setItemText(elements.productOriginalPrice, formatCurrency(product.price));
    setItemText(elements.productDiscountPrice, formatCurrency(product.price - Math.round(product.price * discountRate)));
    setItemText(elements.productTotal, formatCurrency(total));

    if (elements.whatsappLink) {
        elements.whatsappLink.href = `https://wa.me/94703939459?text=${encodeURIComponent(`Hello Team 4x4, I’m interested in the ${product.name}.`)}`;
    }

    const features = product.features.length ? product.features : ['Precision engineering', 'Premium matte finish', 'Trail-ready durability', 'Luxury garage fitment'];
    if (elements.featureList) {
        elements.featureList.innerHTML = features.map((feature) => `<li>${feature}</li>`).join('');
    }

    renderGallery(product.gallery);
};

const updateTotalForQuantity = (product) => {
    const qty = Number(elements.quantityInput.value) || 1;
    const { total } = calculateTotal(product.price, qty);
    setItemText(elements.productTotal, formatCurrency(total));
};

const addProductToCart = (product, quantity) => {
    const cart = cartFromStorage();
    const existing = cart.find((item) => item.id === product.id);
    const cartItem = {
        id: product.id,
        tag: product.category.toUpperCase(),
        title: product.name,
        description: product.description,
        category: product.category,
        condition: product.condition,
        image: product.image,
        price: product.price,
        quantity,
    };

    if (existing) {
        cart.forEach((item) => {
            if (item.id === product.id) {
                item.quantity = Math.max(1, item.quantity + quantity);
            }
        });
    } else {
        cart.unshift(cartItem);
    }

    saveCart(cart);
};

const saveCheckoutProduct = (product, quantity) => {
    const checkoutItem = { ...product, quantity };
    localStorage.setItem(checkoutKey, JSON.stringify(checkoutItem));
};

const product = loadProduct();
if (!product) {
    throw new Error('No product found in storage. Redirecting to shop.');
}

renderProduct(product);

if (elements.productGallery) {
    elements.productGallery.addEventListener('click', (event) => {
        const button = event.target.closest('[data-src]');
        if (!button) return;
        const src = button.dataset.src;
        if (elements.galleryMainImage) {
            elements.galleryMainImage.src = src;
            elements.galleryMainImage.alt = product.name;
        }
        elements.productGallery.querySelectorAll('.product-thumb').forEach((thumb) => thumb.classList.remove('active'));
        button.classList.add('active');
    });
}

if (elements.quantityMinus) {
    elements.quantityMinus.addEventListener('click', () => {
        const currentQty = Math.max(1, Number(elements.quantityInput.value) || 1);
        elements.quantityInput.value = Math.max(1, currentQty - 1);
        updateTotalForQuantity(product);
    });
}

if (elements.quantityPlus) {
    elements.quantityPlus.addEventListener('click', () => {
        const currentQty = Math.max(1, Number(elements.quantityInput.value) || 1);
        elements.quantityInput.value = currentQty + 1;
        updateTotalForQuantity(product);
    });
}

if (elements.addToCartButton) {
    elements.addToCartButton.addEventListener('click', () => {
        const qty = Math.max(1, Number(elements.quantityInput.value) || 1);
        addProductToCart(product, qty);
        saveCheckoutProduct(product, qty);
        elements.addToCartButton.textContent = 'Added to Cart';
        elements.addToCartButton.classList.add('button-success');
        setTimeout(() => {
            elements.addToCartButton.textContent = 'Add to Cart';
            elements.addToCartButton.classList.remove('button-success');
        }, 1400);
    });
}

if (elements.buyNowButton) {
    elements.buyNowButton.addEventListener('click', () => {
        const qty = Math.max(1, Number(elements.quantityInput.value) || 1);
        addProductToCart(product, qty);
        saveCheckoutProduct(product, qty);
        window.location.href = 'checkout.php';
    });
}

