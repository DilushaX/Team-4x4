    </main>

    <?php
    $footerCategories = [];
    $footerSettings = [];
    try {
        $footerCatStmt = $pdo->query("SELECT id, name FROM categories WHERE status = 1 ORDER BY sort_order ASC, name ASC LIMIT 5");
        $footerCategories = $footerCatStmt->fetchAll();
    } catch (PDOException $e) {
        $footerCategories = [];
    }
    try {
        $footerSettingsStmt = $pdo->query("SELECT `key`, `value` FROM settings");
        foreach ($footerSettingsStmt->fetchAll() as $footerSettingRow) {
            $footerSettings[$footerSettingRow['key']] = $footerSettingRow['value'];
        }
    } catch (PDOException $e) {
        $footerSettings = [];
    }

    $footerPhoneDisplay = $footerSettings['contact_phone'] ?? $footerSettings['phone'] ?? '+94 70 393 9459';
    $footerPhoneDigits = preg_replace('/\D/', '', $footerSettings['whatsapp_number'] ?? $footerSettings['whatsapp'] ?? $footerPhoneDisplay) ?: '94703939459';
    $footerEmail = $footerSettings['contact_email'] ?? $footerSettings['email'] ?? 'info@4x4defenderparts.com';
    $footerAddress = $footerSettings['workshop_address'] ?? $footerSettings['address'] ?? 'Colombo, Sri Lanka';
    $footerFacebook = $footerSettings['facebook'] ?? '';
    $footerInstagram = $footerSettings['instagram'] ?? '';
    ?>

    <footer class="site-footer">
        <div class="footer-newsletter">
            <div class="footer-newsletter-copy">
                <h3>Join the Workshop List</h3>
                <p>New arrivals, build features, and off-road tips — no spam.</p>
            </div>
            <form id="newsletter-form" class="newsletter-form" novalidate>
                <input type="email" name="email" id="newsletter-email" placeholder="you@email.com" required aria-label="Email address" />
                <button type="submit">Subscribe</button>
            </form>
            <p class="newsletter-feedback" id="newsletter-feedback" role="status" aria-live="polite"></p>
        </div>

        <div class="footer-grid">
            <div class="footer-brand">
                <img src="assets/images/logo.jpg" alt="4X4 DEFENDER PARTS Logo" />
                <p class="footer-tagline">QUALITY PARTS. BUILT FOR ADVENTURE.</p>
                <p class="footer-copy">© <?php echo date('Y'); ?> 4X4 DEFENDER PARTS. All rights reserved.</p>
            </div>

            <div class="footer-column">
                <h3>Navigation</h3>
                <a href="index.php">Home</a>
                <a href="shop.php">Shop</a>
                <a href="gallery.php">Gallery</a>
                <a href="contact.php">Contact</a>
                <a href="cart.php">Cart</a>
            </div>

            <div class="footer-column">
                <h3>Shop</h3>
                <?php if (!empty($footerCategories)): ?>
                    <?php foreach ($footerCategories as $footerCat): ?>
                        <a href="shop.php?cat=<?php echo (int) $footerCat['id']; ?>"><?php echo htmlspecialchars($footerCat['name']); ?></a>
                    <?php endforeach; ?>
                <?php else: ?>
                    <a href="shop.php">All Products</a>
                <?php endif; ?>
            </div>

            <div class="footer-column">
                <h3>Legal</h3>
                <a href="privacy.php">Privacy Policy</a>
                <a href="terms.php">Terms of Service</a>
                <a href="shipping.php">Shipping Info</a>
            </div>

            <div class="footer-column footer-contact">
                <h3>Contact</h3>
                <a href="tel:+<?php echo htmlspecialchars($footerPhoneDigits); ?>">📞 <?php echo htmlspecialchars($footerPhoneDisplay); ?></a>
                <a href="mailto:<?php echo htmlspecialchars($footerEmail); ?>">📧 <?php echo htmlspecialchars($footerEmail); ?></a>
                <p>📍 <?php echo htmlspecialchars($footerAddress); ?></p>
                <div class="social-actions">
                    <a class="social-button" href="https://wa.me/<?php echo htmlspecialchars($footerPhoneDigits); ?>" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 1.67c2.2 0 4.26.86 5.82 2.42a8.2 8.2 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.24 8.24a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24m-4.53 4.7c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02s.87 2.35.99 2.51c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.1.16 1.52.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.46-.39-.4-.54-.4h-.02" />
                        </svg>
                    </a>
                    <?php if (!empty($footerFacebook)): ?>
                    <a class="social-button" href="<?php echo htmlspecialchars($footerFacebook); ?>" target="_blank" rel="noopener noreferrer" aria-label="Follow on Facebook">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.87.24-1.46 1.49-1.46H16.5V4.36C16.24 4.32 15.36 4.25 14.33 4.25c-2.15 0-3.62 1.31-3.62 3.72V10.5H8.5v3h2.21V21h2.79z" />
                        </svg>
                    </a>
                    <?php endif; ?>
                    <?php if (!empty($footerInstagram)): ?>
                    <a class="social-button" href="<?php echo htmlspecialchars($footerInstagram); ?>" target="_blank" rel="noopener noreferrer" aria-label="Follow on Instagram">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="5"></rect>
                            <circle cx="12" cy="12" r="3.5"></circle>
                            <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"></circle>
                        </svg>
                    </a>
                    <?php endif; ?>
                    <button class="social-button" id="share-button" type="button" aria-label="Share this page">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="18" cy="5" r="3"></circle>
                            <circle cx="6" cy="12" r="3"></circle>
                            <circle cx="18" cy="19" r="3"></circle>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </footer>

    <button type="button" id="back-to-top" class="back-to-top" aria-label="Back to top">↑</button>

    <script src="js/main.js"></script>
</body>
</html>
