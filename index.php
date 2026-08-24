<?php
$pageTitle = "Home";
require_once 'includes/header.php';

try {
    $svcStmt = $pdo->query("SELECT * FROM services ORDER BY id ASC LIMIT 6");
    $homeServices = $svcStmt->fetchAll();
} catch (PDOException $e) {
    $homeServices = [];
}

if (empty($homeServices)) {
    $homeServices = [
        [
            'title' => 'Defender Restoration',
            'subtitle' => 'Restoration',
            'description' => 'Frame-off rebuilds, corrosion control and drivetrain restoration for heritage Defenders built for long-haul durability.',
            'hero_banner' => 'assets/images/restoration.png',
            'features' => 'Full-strip restoration|Corrosion control|Heritage fitment',
            'slug' => 'restoration'
        ],
        [
            'title' => 'Suspension Upgrades',
            'subtitle' => 'Suspension',
            'description' => 'Off-road geometry tuning and long-travel suspension upgrades built to handle heavy loads and rough terrain.',
            'hero_banner' => 'assets/images/suspension.png',
            'features' => 'Long-travel setup|Payload tuning|Terrain control',
            'slug' => 'suspension'
        ],
        [
            'title' => 'Fabrication',
            'subtitle' => 'Fabrication',
            'description' => 'Custom bumpers, sliders, armor and protection systems engineered for maximum capability without sacrificing finish.',
            'hero_banner' => 'assets/images/fabrication.jpg',
            'features' => 'Bespoke armor|Custom mounts|Heavy-duty protection',
            'slug' => 'fabrication'
        ],
        [
            'title' => 'Recovery Systems',
            'subtitle' => 'Recovery',
            'description' => 'Winches, recovery gear and integrated accessory setups to keep your expedition moving in even the toughest conditions.',
            'hero_banner' => 'assets/images/recovery.jpg',
            'features' => 'Winch kits|Recovery gear|Secure mounting',
            'slug' => 'recovery'
        ],
        [
            'title' => 'Lighting Upgrades',
            'subtitle' => 'Lighting',
            'description' => 'High-output LED packages and premium lighting systems engineered for night driving, work sites and trail expeditions.',
            'hero_banner' => 'assets/images/lighting.jpg',
            'features' => 'LED lighting|Wiring kits|Off-road visibility',
            'slug' => 'lighting'
        ],
        [
            'title' => 'Performance & Intake',
            'subtitle' => 'Performance',
            'description' => 'Air intake, filtration and performance upgrades built to improve engine efficiency, torque delivery and overall response.',
            'hero_banner' => 'assets/images/intake.png',
            'features' => 'Air intake|Efficiency gains|Power delivery',
            'slug' => 'intake'
        ]
    ];
}
?>

<section class="hero">
    <div class="hero-overlay"></div>
    <div class="hero-copy">
        <span class="eyebrow">
            <span class="eyebrow-line"></span>
            DEFENDER ENGINEERING / OFF-ROAD SPECIALISTS
            <span class="eyebrow-line"></span>
        </span>
        <h1>BUILT FOR THE DEFENDER.<br>BUILT FOR ADVENTURE.</h1>
        <p>Premium Defender parts, restoration, fabrication and off-road upgrades engineered for performance, durability and adventure.</p>
        <div class="hero-actions">
            <a href="shop.php" class="button-primary">Shop Defender Parts</a>
            <a href="gallery.php" class="button-secondary">Explore Our Builds</a>
        </div>
    </div>

    <div class="hero-scroll-indicator">
        <span class="eyebrow">DETAILS</span>
        <div class="scroll-line"></div>
    </div>
</section>

<div class="services-heading">
    <span class="eyebrow">
        <span class="eyebrow-line"></span>
        Our Services
        <span class="eyebrow-line"></span>
    </span>
    <h2>What We Do Best.</h2>
    <p>Core specialisms. One mission: build the most capable Defender build in Sri Lanka.</p>
</div>

<section class="services">
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
            <div class="service-actions">
                <a href="service.php?slug=<?php echo htmlspecialchars($svc['slug']); ?>" class="button-book-service">Explore</a>
            </div>
        </article>
    <?php endforeach; ?>
</section>

<?php require_once 'includes/footer.php'; ?>
