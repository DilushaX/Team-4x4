<?php
require_once 'includes/db.php';
require_once 'includes/auth_helper.php';

$slug = trim($_GET['slug'] ?? 'restoration');

try {
    $stmt = $pdo->prepare("SELECT * FROM services WHERE slug = ? LIMIT 1");
    $stmt->execute([$slug]);
    $service = $stmt->fetch();
} catch (PDOException $e) {
    $service = null;
}

if (!$service) {
    // Fallback if requested slug not found
    try {
        $stmt = $pdo->query("SELECT * FROM services ORDER BY id ASC LIMIT 1");
        $service = $stmt->fetch();
    } catch (PDOException $e) {
        $service = null;
    }
}

$pageTitle = $service ? $service['title'] : "Workshop Service";
require_once 'includes/header.php';

if ($service):
    $features = !empty($service['features']) ? explode('|', $service['features']) : [];
    $banner = $service['hero_banner'] ?: 'assets/images/restoration.png';
    $serviceTitle = $service['title'];

    // Retrieve centralized WhatsApp number and phone from settings
    $siteSettings = getSiteSettings($pdo);
    $waNumber = preg_replace('/\D/', '', $siteSettings['whatsapp_number'] ?? $siteSettings['whatsapp'] ?? '94703939459') ?: '94703939459';
    $phoneNumber = $siteSettings['contact_phone'] ?? $siteSettings['phone'] ?? ('+' . $waNumber);
    if (!empty($phoneNumber) && $phoneNumber[0] !== '+') {
        $phoneNumber = '+' . preg_replace('/\D/', '', $phoneNumber);
    }

    // Dynamic WhatsApp pre-filled message for booking
    $bookMsg = "Hello Team 4x4,\n\nI'm interested in your " . $serviceTitle . " service.\n\nPlease provide more information about availability, pricing and booking.\n\nThank you.";
    $bookWaUrl = "https://wa.me/" . $waNumber . "?text=" . rawurlencode($bookMsg);
?>
    <main>
        <section class="service-hero">
            <div class="hero-copy">
                <span class="eyebrow"><?php echo htmlspecialchars($service['subtitle'] ?: 'Workshop Service'); ?></span>
                <h1><?php echo htmlspecialchars($service['title']); ?></h1>
                <p><?php echo htmlspecialchars($service['description']); ?></p>
                <div class="service-highlight">
                    <span>Pricing Estimate: <?php echo htmlspecialchars($service['pricing'] ?: 'Quote on Request'); ?></span>
                    <span>Duration: <?php echo htmlspecialchars($service['duration'] ?: '1-3 weeks'); ?></span>
                    <span>Compatibility: <?php echo htmlspecialchars(str_replace("\n", ", ", $service['compatibility'] ?: 'Universal 4x4')); ?></span>
                </div>

                <div class="service-summary">
                    <div class="summary-card">
                        <h3>Workshop Standard</h3>
                        <p>Our engineering team catalogs tolerances, replaces worn components, and applies high-tensile hardware for ultimate trail reliability.</p>
                    </div>
                    <?php if (!empty($features)): ?>
                        <div class="summary-card">
                            <h3>Included Upgrades</h3>
                            <ul class="detail-list">
                                <?php foreach ($features as $f): ?>
                                    <li><?php echo htmlspecialchars(trim($f)); ?></li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                    <?php endif; ?>
                    <div class="booking-actions">
                        <a href="<?php echo htmlspecialchars($bookWaUrl); ?>" target="_blank" rel="noreferrer" class="button-primary whatsapp-button">Book This Service</a>
                        <a href="tel:<?php echo htmlspecialchars($phoneNumber); ?>" class="button-secondary">Call Team 4x4</a>
                    </div>
                </div>
            </div>
            <div class="hero-image">
                <img src="<?php echo htmlspecialchars($banner); ?>" alt="<?php echo htmlspecialchars($service['title']); ?>" />
            </div>
        </section>

        <section class="service-detail-grid">
            <div class="detail-panel">
                <h2>Detailed Specifications</h2>
                <p><?php echo nl2br(htmlspecialchars($service['description'])); ?></p>
                <h2>Compatibility</h2>
                <p><?php echo nl2br(htmlspecialchars($service['compatibility'])); ?></p>
                <h2>Service Duration</h2>
                <p>This service typically takes <?php echo htmlspecialchars($service['duration'] ?: '1-3 weeks'); ?> depending on build specs.</p>
            </div>
            <div class="detail-panel">
                <h2>Workshop Showcase</h2>
                <div class="before-after-gallery">
                    <img src="<?php echo htmlspecialchars($banner); ?>" alt="Service showcase 1" />
                    <img src="assets/images/fabrication.jpg" alt="Service showcase 2" />
                </div>
                <h2>Quality Guarantee</h2>
                <p>All workshop labor and installed component packages come with full technical inspection approval and field operation support.</p>
            </div>
        </section>
    </main>
<?php else: ?>
    <main>
        <section class="service-hero">
            <div class="hero-copy">
                <h1>Service Not Found</h1>
                <p>The requested service is currently not available.</p>
                <a href="index.php" class="button-primary">← Return Home</a>
            </div>
        </section>
    </main>
<?php endif; ?>

<?php require_once 'includes/footer.php'; ?>
