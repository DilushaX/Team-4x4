<?php
$pageTitle = "Home";
require_once 'includes/header.php';

// Fetch dynamic Workshop Services from MySQL
try {
    $svcStmt = $pdo->query("SELECT * FROM services ORDER BY id ASC");
    $homeServices = $svcStmt->fetchAll();
} catch (PDOException $e) {
    $homeServices = [];
}
?>

<!-- Hero Section -->
<section class="hero" style="background: url('assets/images/hero-bg.jpeg') no-repeat center center/cover;">
    <div class="hero-overlay"></div>
    <div class="hero-copy">
        <span class="eyebrow" style="display: inline-flex; align-items: center; gap: 0.5rem; justify-content: center;">
            <span style="width: 20px; height: 1px; background: #ffce2e;"></span>
            Tactical Utility
            <span style="width: 20px; height: 1px; background: #ffce2e;"></span>
        </span>
        <h1>Engineering Excellence.</h1>
        <p>From precision restorations to hardcore off-road modifications, our technical team delivers unparalleled tactical utility and performance upgrades for the elite.</p>
    </div>

    <!-- Dynamic Scroll Details Indicator -->
    <div class="hero-scroll-indicator">
        <span class="eyebrow" style="font-size: 0.72rem; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.35em;">DETAILS</span>
        <div class="scroll-line" style="width: 1px; height: 45px; background: linear-gradient(to bottom, #ffce2e, transparent); margin-top: 0.5rem;"></div>
    </div>
</section>

<!-- Centered Section Heading -->
<div class="services-heading">
    <span class="eyebrow" style="display: inline-flex; align-items: center; gap: 0.5rem;">
        <span style="width: 15px; height: 1px; background: #ffce2e;"></span>
        Our Services
        <span style="width: 15px; height: 1px; background: #ffce2e;"></span>
    </span>
    <h2 style="font-size: clamp(2rem, 4.5vw, 3.2rem);">What We Do Best.</h2>
    <p>Core specialisms. One mission: build the most capable 4x4 in Sri Lanka.</p>
</div>

<!-- Dynamic Database Services Cards Grid -->
<section class="services" style="margin-top: 0;">
    <?php if (!empty($homeServices)): ?>
        <?php foreach ($homeServices as $svc): 
            $banner = $svc['hero_banner'] ?: 'assets/images/fabrication.jpg';
            $features = array_filter(explode('|', $svc['features'] ?? ''));
            $badgeList = array_slice($features, 0, 2);
        ?>
            <article class="service-card">
                <div class="service-card-media">
                    <img src="<?php echo htmlspecialchars($banner); ?>" alt="<?php echo htmlspecialchars($svc['title']); ?>" onerror="this.src='assets/images/fabrication.jpg';" />
                    <span class="service-card-badge">🛠️ <?php echo htmlspecialchars($svc['subtitle'] ?: 'Service'); ?></span>
                </div>
                <h2><?php echo htmlspecialchars($svc['title']); ?></h2>
                <p><?php echo htmlspecialchars(substr($svc['description'] ?? '', 0, 160)); ?>...</p>
                <div class="service-badges">
                    <?php if (!empty($badgeList)): ?>
                        <?php foreach ($badgeList as $badge): ?>
                            <span><?php echo htmlspecialchars($badge); ?></span>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <span>Custom Build</span>
                        <span>Tactical Utility</span>
                    <?php endif; ?>
                </div>
                <div class="service-actions" style="margin-top: auto; padding: 0;">
                    <a href="service.php?slug=<?php echo htmlspecialchars($svc['slug']); ?>" class="button-book-service">Explore</a>
                </div>
            </article>
        <?php endforeach; ?>
    <?php else: ?>
        <p style="grid-column: 1/-1; text-align: center; color: rgba(255,255,255,0.6);">No workshop services configured in database.</p>
    <?php endif; ?>
</section>

<?php require_once 'includes/footer.php'; ?>
