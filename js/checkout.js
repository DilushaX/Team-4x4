const cartKey = 'team4x4Cart';
const checkoutCartKey = 'selectedCheckoutCart';

const elements = {
    fulfillmentCards: document.querySelectorAll('.fulfillment-card'),
    pickupFieldsGroup: document.getElementById('pickupFieldsGroup'),
    deliveryFieldsGroup: document.getElementById('deliveryFieldsGroup'),
    checkoutForm: document.getElementById('checkoutForm'),
    
    // Form inputs
    fullName: document.getElementById('fullName'),
    phoneNumber: document.getElementById('phoneNumber'),
    email: document.getElementById('email'),
    vehicleModel: document.getElementById('vehicleModel'),
    address: document.getElementById('address'),
    district: document.getElementById('district'),
    postalCode: document.getElementById('postalCode'),
    pickupDate: document.getElementById('pickupDate'),
    notes: document.getElementById('notes'),

    // Payment
    paymentOptions: document.querySelectorAll('.payment-option'),

    // Order Summary
    summaryItemsList: document.getElementById('summaryItemsList'),
    summarySubtotal: document.getElementById('summarySubtotal'),
    summaryDeliveryRow: document.getElementById('summaryDeliveryRow'),
    summaryDelivery: document.getElementById('summaryDelivery'),
    summaryTotal: document.getElementById('summaryTotal'),

    // Buttons
    confirmOrderButton: document.getElementById('confirmOrderButton'),
    sidebarConfirmOrderButton: document.getElementById('sidebarConfirmOrderButton'),
    downloadInvoiceButton: document.getElementById('downloadInvoiceButton'),
    sidebarDownloadInvoiceButton: document.getElementById('sidebarDownloadInvoiceButton'),

    // Invoice Panel
    invoicePanel: document.getElementById('invoicePanel'),
    invoiceNumber: document.getElementById('invoiceNumber'),
    invoiceDate: document.getElementById('invoiceDate'),
    invoiceName: document.getElementById('invoiceName'),
    invoiceAddress: document.getElementById('invoiceAddress'),
    invoiceVehicle: document.getElementById('invoiceVehicle'),
    invoiceItems: document.getElementById('invoiceItems'),
    invoiceSubtotal: document.getElementById('invoiceSubtotal'),
    invoiceDeliveryRow: document.getElementById('invoiceDeliveryRow'),
    invoiceDelivery: document.getElementById('invoiceDelivery'),
    invoiceTotal: document.getElementById('invoiceTotal'),
};

const deliveryCharges = {
    'Colombo': 2500,
    'Gampaha': 3000,
    'Kandy': 4500,
    'Matara': 5000,
    'Jaffna': 7500
};

const currency = (value) => `LKR ${value.toLocaleString('en-US')}`;

let currentFulfillment = 'pickup';

// Retrieve checkout items
const getCheckoutItems = () => {
    try {
        const stored = JSON.parse(localStorage.getItem(checkoutCartKey));
        if (Array.isArray(stored) && stored.length) return stored;
        if (stored && typeof stored === 'object') return [stored];
    } catch {}
    try {
        const cartStored = JSON.parse(localStorage.getItem(cartKey));
        return Array.isArray(cartStored) ? cartStored : [];
    } catch {
        return [];
    }
};

const items = getCheckoutItems();

// Calculate total product cost
const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
};

// Retrieve selected delivery charge
const getDeliveryCharge = () => {
    if (currentFulfillment !== 'delivery') return 0;
    const selectedDistrict = elements.district?.value;
    return deliveryCharges[selectedDistrict] || 0;
};

// Toggle form fields visually and dynamically manage 'required' attributes
const updateFulfillmentFields = (method) => {
    currentFulfillment = method;
    
    // Toggle active state on selection cards
    elements.fulfillmentCards.forEach(card => {
        if (card.dataset.method === method) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });

    if (method === 'pickup') {
        elements.pickupFieldsGroup?.classList.remove('hidden');
        elements.deliveryFieldsGroup?.classList.add('hidden');

        // Manage required fields
        if (elements.pickupDate) elements.pickupDate.required = true;
        if (elements.email) elements.email.required = false;
        if (elements.address) elements.address.required = false;
        if (elements.district) elements.district.required = false;
        if (elements.postalCode) elements.postalCode.required = false;

        // Hide delivery fee row in summary
        elements.summaryDeliveryRow?.classList.add('hidden');
        
        // Filter payment options
        elements.paymentOptions.forEach(opt => {
            if (opt.dataset.method === 'Cash on Delivery') {
                opt.style.display = 'none';
                opt.classList.remove('active');
            } else {
                opt.style.display = 'block';
            }
        });
        
        // Default to 'Cash at Garage' if the active one was COD
        const activePayment = document.querySelector('.payment-option.active');
        if (!activePayment || activePayment.dataset.method === 'Cash on Delivery') {
            const garagePay = Array.from(elements.paymentOptions).find(o => o.dataset.method === 'Cash at Garage');
            if (garagePay) setActivePayment(garagePay);
        }

    } else {
        elements.pickupFieldsGroup?.classList.add('hidden');
        elements.deliveryFieldsGroup?.classList.remove('hidden');

        // Manage required fields
        if (elements.pickupDate) elements.pickupDate.required = false;
        if (elements.email) elements.email.required = true;
        if (elements.address) elements.address.required = true;
        if (elements.district) elements.district.required = true;
        if (elements.postalCode) elements.postalCode.required = true;

        // Show/hide delivery fee row based on if a district is chosen
        if (elements.district && elements.district.value) {
            elements.summaryDeliveryRow?.classList.remove('hidden');
        } else {
            elements.summaryDeliveryRow?.classList.add('hidden');
        }

        // Filter payment options
        elements.paymentOptions.forEach(opt => {
            if (opt.dataset.method === 'Cash at Garage') {
                opt.style.display = 'none';
                opt.classList.remove('active');
            } else {
                opt.style.display = 'block';
            }
        });

        // Default to 'Cash on Delivery' if active was Cash at Garage
        const activePayment = document.querySelector('.payment-option.active');
        if (!activePayment || activePayment.dataset.method === 'Cash at Garage') {
            const codPay = Array.from(elements.paymentOptions).find(o => o.dataset.method === 'Cash on Delivery');
            if (codPay) setActivePayment(codPay);
        }
    }

    updateTotals();
};

// Recalculate and update all total displays
const updateTotals = () => {
    const subtotal = calculateSubtotal();
    const deliveryFee = getDeliveryCharge();
    const grandTotal = subtotal + deliveryFee;

    if (elements.summarySubtotal) elements.summarySubtotal.textContent = currency(subtotal);
    
    if (elements.summaryDelivery) {
        if (currentFulfillment === 'delivery' && elements.district?.value) {
            elements.summaryDelivery.textContent = currency(deliveryFee);
            elements.summaryDeliveryRow?.classList.remove('hidden');
        } else {
            elements.summaryDeliveryRow?.classList.add('hidden');
        }
    }

    if (elements.summaryTotal) elements.summaryTotal.textContent = currency(grandTotal);
};

// Render the Product Order Summary side-panel list
const renderSummaryList = () => {
    if (!elements.summaryItemsList) return;

    if (items.length === 0) {
        elements.summaryItemsList.innerHTML = '<div class="empty-cart-message">Your cart is currently empty.</div>';
        updateTotals();
        elements.confirmOrderButton && (elements.confirmOrderButton.style.display = 'none');
        elements.sidebarConfirmOrderButton && (elements.sidebarConfirmOrderButton.style.display = 'none');
        elements.downloadInvoiceButton && (elements.downloadInvoiceButton.style.display = 'none');
        elements.sidebarDownloadInvoiceButton && (elements.sidebarDownloadInvoiceButton.style.display = 'none');
        return;
    }

    elements.summaryItemsList.innerHTML = items
        .map(item => {
            const itemSubtotal = (item.price || 0) * (item.quantity || 1);
            return `
                <div class="summary-product-item">
                    <div class="summary-product-image">
                        <img src="${item.image || 'assets/images/fabrication.jpg'}" alt="${item.title || 'Product'}" />
                    </div>
                    <div class="summary-product-details">
                        <h4>${item.title || item.name || 'Product'}</h4>
                        <div class="summary-product-meta">
                            <span>Qty: ${item.quantity || 1}</span>
                            <span>${currency(item.price || 0)}</span>
                        </div>
                    </div>
                    <div class="summary-product-subtotal">
                        ${currency(itemSubtotal)}
                    </div>
                </div>
            `;
        })
        .join('');

    updateTotals();
};

const getPaymentMethod = () => {
    const activeOpt = document.querySelector('.payment-option.active');
    return activeOpt ? activeOpt.dataset.method : 'Bank Transfer';
};

const setActivePayment = (btn) => {
    elements.paymentOptions.forEach(opt => opt.classList.remove('active'));
    btn.classList.add('active');
};

const generateInvoiceNumber = () => `INV-${Date.now().toString().slice(-10)}`;

// Populate printable dynamic Invoice layout
const fillInvoice = (customer) => {
    if (!elements.invoicePanel) return;

    elements.invoicePanel.classList.remove('hidden');
    if (elements.invoiceNumber) elements.invoiceNumber.textContent = generateInvoiceNumber();
    if (elements.invoiceDate) elements.invoiceDate.textContent = new Date().toLocaleDateString('en-GB');
    if (elements.invoiceName) elements.invoiceName.textContent = customer.fullName;

    if (elements.invoiceAddress) {
        if (currentFulfillment === 'pickup') {
            elements.invoiceAddress.innerHTML = `🏪 <strong>Garage Pickup</strong><br>Scheduled Date: ${customer.pickupDate}`;
        } else {
            elements.invoiceAddress.innerHTML = `🚚 <strong>Islandwide Delivery</strong><br>${customer.address}, ${customer.district}<br>Postal: ${customer.postalCode}`;
        }
    }

    if (elements.invoiceVehicle) elements.invoiceVehicle.textContent = `Vehicle: ${customer.vehicleModel}`;

    if (elements.invoiceItems) {
        elements.invoiceItems.innerHTML = items
            .map(item => {
                const itemSubtotal = (item.price || 0) * (item.quantity || 1);
                return `
                    <div class="invoice-item-row">
                        <strong>${item.title || item.name}</strong>
                        <span>Qty ${item.quantity || 1}</span>
                        <span>${currency(itemSubtotal)}</span>
                    </div>
                `;
            })
            .join('');
    }

    const subtotal = calculateSubtotal();
    const deliveryFee = getDeliveryCharge();
    const grandTotal = subtotal + deliveryFee;

    if (elements.invoiceSubtotal) elements.invoiceSubtotal.textContent = currency(subtotal);

    if (elements.invoiceDelivery) {
        if (currentFulfillment === 'delivery') {
            elements.invoiceDelivery.textContent = currency(deliveryFee);
            elements.invoiceDeliveryRow?.classList.remove('hidden');
        } else {
            elements.invoiceDeliveryRow?.classList.add('hidden');
        }
    }

    if (elements.invoiceTotal) elements.invoiceTotal.textContent = currency(grandTotal);
};

// Form submission handler
const handleConfirmOrder = () => {
    // Perform browser validation check manually on the form
    if (!elements.checkoutForm.checkValidity()) {
        elements.checkoutForm.reportValidity();
        return;
    }

    if (!items.length) {
        window.alert('Your cart is empty. Add parts before checkout.');
        window.location.href = 'cart.php';
        return;
    }

    const customer = {
        fullName: elements.fullName?.value.trim(),
        phoneNumber: elements.phoneNumber?.value.trim(),
        vehicleModel: elements.vehicleModel?.value.trim(),
        notes: elements.notes?.value.trim(),
        pickupDate: elements.pickupDate?.value,
        email: elements.email?.value.trim(),
        address: elements.address?.value.trim(),
        district: elements.district?.value,
        postalCode: elements.postalCode?.value.trim(),
    };

    const confirmBtns = [elements.confirmOrderButton, elements.sidebarConfirmOrderButton].filter(Boolean);
    confirmBtns.forEach(btn => {
        btn.disabled = true;
        btn.textContent = 'Saving Order…';
    });

    const checkoutData = {
        fullName: customer.fullName,
        phoneNumber: customer.phoneNumber,
        vehicleModel: customer.vehicleModel,
        notes: customer.notes,
        pickupDate: customer.pickupDate,
        email: customer.email,
        address: customer.address,
        district: customer.district,
        postalCode: customer.postalCode,
        fulfillmentType: currentFulfillment,
        deliveryFee: getDeliveryCharge(),
        paymentMethod: getPaymentMethod(),
        items: items
    };

    fetch('backend/checkout.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutData)
    })
    .then(res => res.json())
    .then(res => {
        confirmBtns.forEach(btn => {
            btn.disabled = false;
            btn.textContent = 'Confirm Order & Save';
        });

        if (res.status === 'success') {
            fillInvoice(customer);
            if (elements.invoiceNumber && res.order_number) {
                elements.invoiceNumber.textContent = res.order_number;
            }

            // Clear local storage cart
            localStorage.removeItem(cartKey);
            localStorage.removeItem(checkoutCartKey);

            // Open WhatsApp link
            const waUrl = res.whatsapp_url;
            if (waUrl) {
                const waAnchor = document.createElement('a');
                waAnchor.href = waUrl;
                waAnchor.target = '_blank';
                waAnchor.rel = 'noreferrer';
                document.body.appendChild(waAnchor);
                waAnchor.click();
                document.body.removeChild(waAnchor);
            }

            const msgEl = document.getElementById('checkoutMessage');
            if (msgEl) {
                msgEl.style.color = '#4ade80';
                msgEl.textContent = `✅ Order ${res.order_number || ('#' + res.order_id)} saved to MySQL database successfully! WhatsApp chat opened.`;
            }

            if (elements.invoicePanel) {
                window.scrollTo({ top: elements.invoicePanel.offsetTop - 100, behavior: 'smooth' });
            }
        } else {
            alert('⚠️ Unable to save order: ' + (res.message || 'Server error'));
        }
    })
    .catch(err => {
        confirmBtns.forEach(btn => {
            btn.disabled = false;
            btn.textContent = 'Confirm Order & Save';
        });
        alert('⚠️ Network error while registering order to database.');
    });
};

const handleDownloadInvoice = () => {
    if (!elements.invoicePanel || elements.invoicePanel.classList.contains('hidden')) {
        window.alert('Please confirm your order to generate the invoice preview first.');
        return;
    }
    window.print();
};

const initialize = () => {
    // Render the order items
    renderSummaryList();

    if (items.length === 0) {
        setTimeout(() => {
            window.location.href = 'cart.php';
        }, 2000);
        return;
    }

    // Set active payment method listeners
    elements.paymentOptions.forEach(btn => {
        btn.addEventListener('click', () => setActivePayment(btn));
    });

    // Wire fulfillment selector cards click actions
    elements.fulfillmentCards.forEach(card => {
        card.addEventListener('click', () => {
            const method = card.dataset.method;
            updateFulfillmentFields(method);
        });
    });

    // Hook up district selection change rate updates
    if (elements.district) {
        elements.district.addEventListener('change', () => {
            updateTotals();
        });
    }

    // Bind all CTA buttons
    if (elements.confirmOrderButton) elements.confirmOrderButton.addEventListener('click', handleConfirmOrder);
    if (elements.sidebarConfirmOrderButton) elements.sidebarConfirmOrderButton.addEventListener('click', handleConfirmOrder);
    if (elements.downloadInvoiceButton) elements.downloadInvoiceButton.addEventListener('click', handleDownloadInvoice);
    if (elements.sidebarDownloadInvoiceButton) elements.sidebarDownloadInvoiceButton.addEventListener('click', handleDownloadInvoice);

    // Load method preselected from Cart, fallback to pickup
    let preselectedMethod = 'pickup';
    try {
        const storedShipping = JSON.parse(localStorage.getItem('checkoutShipping'));
        if (storedShipping && storedShipping.method) {
            preselectedMethod = storedShipping.method;
        }
    } catch {}

    updateFulfillmentFields(preselectedMethod);
};

document.addEventListener('DOMContentLoaded', () => {
    initialize();
});
