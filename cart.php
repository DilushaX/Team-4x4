<?php
$pageTitle = "Cart";
$bodyClass = "cart-page";
require_once 'includes/header.php';
?>

<main>
    <section class="cart-hero">
        <div class="cart-hero-copy">
            <span class="eyebrow">Cart</span>
            <h1>Review your gear before heading to the workshop.</h1>
            <p>Manage quantities, remove parts, and confirm your build summary in one place.</p>
        </div>
    </section>

    <section class="cart-layout">
        <div class="cart-items" id="cartItems"></div>

        <aside class="cart-summary-card">
            <h3>Order Summary</h3>
            <div class="cart-summary-list">
                <div class="cart-summary-item">
                    <span>Product Subtotal</span>
                    <span id="cartSubtotal">LKR 0</span>
                </div>
            </div>
            <div class="cart-summary-total">
                <span>Grand Total</span>
                <span id="cartTotal">LKR 0</span>
            </div>
            <div class="cart-summary-actions">
                <a href="checkout.php" class="button-primary checkout-button">CHECKOUT ➜</a>
                <button class="button-secondary buy-now-button" id="cartBuyNowButton">BUY NOW</button>
            </div>
            <p class="order-note">Secure checkout. Need help with your build? Contact us via WhatsApp.</p>
        </aside>
    </section>
</main>

<!-- Order options modal (used for Buy Now / Checkout selection) -->
<div id="orderOptionsModal" class="modal hidden">
    <div class="modal-card glass-card">
        <h3>Select Fulfillment</h3>
        <p class="summary-note">Choose how you'd like to receive your parts.</p>
        <div class="fulfillment-options">
            <div class="fulfillment-card active" data-method="pickup">
                <span class="card-icon">🏪</span>
                <h4>Garage Pickup</h4>
                <p>Customer visits Team 4x4 workshop and collects items directly.</p>
            </div>
            <div class="fulfillment-card" data-method="delivery">
                <span class="card-icon">🚚</span>
                <h4>Islandwide Delivery</h4>
                <p>Deliver parts anywhere in Sri Lanka.</p>
            </div>
        </div>
        <div class="modal-actions">
            <button id="modalCancel" class="button-secondary">Cancel</button>
            <button id="modalProceed" class="button-primary">Proceed</button>
        </div>
    </div>
</div>

<script src="js/config.js"></script>
<script src="js/cart.js"></script>

<?php require_once 'includes/footer.php'; ?>
