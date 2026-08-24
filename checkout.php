<?php
$pageTitle = "Checkout";
$bodyClass = "checkout-page";
require_once 'includes/header.php';
?>

<main>
    <section class="checkout-hero">
        <div class="checkout-hero-copy">
            <span class="eyebrow">Order Checkout</span>
            <h1>Complete your premium build with one secure checkout.</h1>
            <p>Confirm your details, choose a fulfillment method, and generate your order invoice instantly.</p>
        </div>
    </section>

    <div class="checkout-layout">
        <article class="form-card glass-card">
            <div class="fulfillment-panel" id="fulfillmentPanel">
                <h4>Fulfillment Option</h4>
                <div class="fulfillment-options">
                    <div class="fulfillment-card active" data-method="pickup">
                        <span class="card-icon">🏪</span>
                        <h4>Garage Pickup</h4>
                        <p>Customer visits 4x4 Defender Parts workshop and collects items directly.</p>
                    </div>
                    <div class="fulfillment-card" data-method="delivery">
                        <span class="card-icon">🚚</span>
                        <h4>Islandwide Delivery</h4>
                        <p>Deliver parts anywhere in Sri Lanka (LKR 2,500 standard delivery fee).</p>
                    </div>
                </div>
            </div>
            <h3>Customer Details</h3>
            <form id="checkoutForm" class="checkout-form">
                <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>" />
                
                <!-- Common Fields Row 1 -->
                <div class="form-row">
                    <label>
                        Full Name *
                        <input type="text" id="fullName" name="fullName" required placeholder="e.g. Kasun Silva" value="<?php echo htmlspecialchars($_SESSION['user_name'] ?? ''); ?>" />
                    </label>
                    <label>
                        Phone Number *
                        <input type="tel" id="phoneNumber" name="phoneNumber" required placeholder="e.g. +94 70 393 9459" />
                    </label>
                </div>

                <!-- Common Fields Row 2 -->
                <div class="form-row">
                    <label>
                        Vehicle Model *
                        <input type="text" id="vehicleModel" name="vehicleModel" required placeholder="e.g. Defender 110 / Land Cruiser 79" />
                    </label>
                </div>

                <!-- Pickup Specific Fields (Visible by default) -->
                <div id="pickupFieldsGroup">
                    <div class="form-row">
                        <label>
                            Pickup Date *
                            <input type="date" id="pickupDate" name="pickupDate" value="<?php echo date('Y-m-d'); ?>" required />
                        </label>
                    </div>
                </div>

                <!-- Delivery Specific Fields (Hidden by default) -->
                <div id="deliveryFieldsGroup" class="hidden">
                    <div class="form-row">
                        <label>
                            Email Address *
                            <input type="email" id="email" name="email" placeholder="e.g. kasun@4x4defenderparts.lk" value="<?php echo htmlspecialchars($_SESSION['user_email'] ?? ''); ?>" />
                        </label>
                        <label>
                            Postal Code *
                            <input type="text" id="postalCode" name="postalCode" placeholder="e.g. 00300" />
                        </label>
                    </div>
                    <div class="form-row">
                        <label>
                            Full Address *
                            <input type="text" id="address" name="address" placeholder="123 Garage Lane, Colombo" />
                        </label>
                        <label>
                            District (All 25 Sri Lankan Districts) *
                            <select id="district" name="district">
                                <option value="" disabled selected>Select District…</option>
                                <option value="Ampara">Ampara</option>
                                <option value="Anuradhapura">Anuradhapura</option>
                                <option value="Badulla">Badulla</option>
                                <option value="Batticaloa">Batticaloa</option>
                                <option value="Colombo">Colombo</option>
                                <option value="Galle">Galle</option>
                                <option value="Gampaha">Gampaha</option>
                                <option value="Hambantota">Hambantota</option>
                                <option value="Jaffna">Jaffna</option>
                                <option value="Kalutara">Kalutara</option>
                                <option value="Kandy">Kandy</option>
                                <option value="Kegalle">Kegalle</option>
                                <option value="Kilinochchi">Kilinochchi</option>
                                <option value="Kurunegala">Kurunegala</option>
                                <option value="Mannar">Mannar</option>
                                <option value="Matale">Matale</option>
                                <option value="Matara">Matara</option>
                                <option value="Monaragala">Monaragala</option>
                                <option value="Mullaitivu">Mullaitivu</option>
                                <option value="Nuwara Eliya">Nuwara Eliya</option>
                                <option value="Polonnaruwa">Polonnaruwa</option>
                                <option value="Puttalam">Puttalam</option>
                                <option value="Ratnapura">Ratnapura</option>
                                <option value="Trincomalee">Trincomalee</option>
                                <option value="Vavuniya">Vavuniya</option>
                            </select>
                        </label>
                    </div>
                </div>

                <!-- Common Notes -->
                <label>
                    Notes
                    <textarea id="notes" name="notes" placeholder="Tell us about your build, delivery preferences, or special requirements"></textarea>
                </label>
            </form>

            <div class="payment-panel">
                <h3>Payment Method</h3>
                <div class="payment-options" id="paymentOptions">
                    <button type="button" class="payment-option active" data-method="Cash on Delivery">Cash on Delivery</button>
                    <button type="button" class="payment-option" data-method="Bank Transfer">Bank Transfer</button>
                    <button type="button" class="payment-option" data-method="Cash at Garage">Cash at Garage</button>
                </div>
            </div>

            <div class="checkout-actions">
                <button type="button" class="button-primary" id="confirmOrderButton">Confirm Order & Save</button>
                <button type="button" class="button-secondary" id="downloadInvoiceButton">Print Invoice</button>
            </div>
            <div id="checkoutMessage" style="margin-top:1rem;font-weight:600;font-size:0.9rem;"></div>
        </article>

        <article class="summary-card glass-card">
            <h3>Order Summary</h3>
            <div class="summary-items-list" id="summaryItemsList">
                <!-- Dynamic product list rendered here -->
            </div>

            <div class="summary-divider"></div>

            <div class="summary-item" id="summarySubtotalRow">
                <span>Product Subtotal</span>
                <span id="summarySubtotal">LKR 0</span>
            </div>
            <div class="summary-item hidden" id="summaryDeliveryRow">
                <span>Delivery Fee</span>
                <span id="summaryDelivery">LKR 0</span>
            </div>
            <div class="summary-item summary-total">
                <span>Grand Total</span>
                <span id="summaryTotal">LKR 0</span>
            </div>

            <div class="summary-actions">
                <button type="button" class="button-primary" id="sidebarConfirmOrderButton">Confirm Order & Save</button>
                <button type="button" class="button-secondary" id="sidebarDownloadInvoiceButton">Print Invoice</button>
            </div>

            <div class="invoice-panel hidden" id="invoicePanel">
                <div class="invoice-header">
                    <div>
                        <p class="eyebrow">Invoice</p>
                        <h3 id="invoiceNumber">INV-00000000</h3>
                    </div>
                    <div class="invoice-date" id="invoiceDate">Date</div>
                </div>
                <div class="invoice-customer">
                    <p><strong id="invoiceName">Customer Name</strong></p>
                    <p id="invoiceAddress">Address line</p>
                    <p id="invoiceVehicle">Vehicle Model</p>
                </div>
                <div class="invoice-items" id="invoiceItems"></div>
                <div class="invoice-totals">
                    <div class="summary-item">
                        <span>Product Subtotal</span>
                        <span id="invoiceSubtotal">LKR 0</span>
                    </div>
                    <div class="summary-item hidden" id="invoiceDeliveryRow">
                        <span>Delivery Fee</span>
                        <span id="invoiceDelivery">LKR 0</span>
                    </div>
                    <div class="summary-item">
                        <span>Grand Total</span>
                        <span id="invoiceTotal">LKR 0</span>
                    </div>
                </div>
                <div class="qr-block">
                    <div class="qr-placeholder">4X4 DEFENDER PARTS</div>
                    <p>Order verified and saved to database.</p>
                </div>
            </div>
        </article>
    </div>
</main>

<script src="js/config.js"></script>
<script src="js/checkout.js"></script>
<?php require_once 'includes/footer.php'; ?>