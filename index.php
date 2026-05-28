<?php
$pageTitle = "Home";
require_once 'includes/header.php';
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
    <p>Six core specialisms. One mission: build the most capable 4x4 in Sri Lanka.</p>
</div>

<!-- Services Cards Grid -->
<section class="services" style="margin-top: 0;">
    <!-- Card 1: Restoration -->
    <article class="service-card">
        <div class="service-card-media">
            <img src="assets/images/restoration.png" alt="Restoration service" />
            <span class="service-card-badge">🛠️ Restoration</span>
        </div>
        <h2>Frame-Off Restoration</h2>
        <p>Comprehensive rebuilds returning classic hardware to factory-plus specifications, incorporating modern materials while preserving original tactical aesthetics.</p>
        <div class="service-badges">
            <span>Classic Cooling</span>
            <span>Engine Rebuild</span>
        </div>
        <div class="service-actions" style="margin-top: auto; padding: 0;">
            <a href="restoration.php" class="button-book-service">Explore</a>
        </div>
    </article>

    <!-- Card 2: Suspension -->
    <article class="service-card">
        <div class="service-card-media">
            <img src="assets/images/suspension.png" alt="Suspension service" />
            <span class="service-card-badge">🔩 Suspension</span>
        </div>
        <h2>Tactical Suspension</h2>
        <p>Advanced damping systems and geometry correction for extreme terrain dominance. Engineered for payload capacity and high-speed stability.</p>
        <div class="service-badges">
            <span>Coilover Kits</span>
            <span>Long Travel</span>
        </div>
        <div class="service-actions" style="margin-top: auto; padding: 0;">
            <a href="suspension.php" class="button-book-service">Explore</a>
        </div>
    </article>

    <!-- Card 3: Fabrication -->
    <article class="service-card">
        <div class="service-card-media">
            <img src="assets/images/fabrication.jpg" alt="Fabrication service" />
            <span class="service-card-badge">🏗️ Fabrication</span>
        </div>
        <h2>Armor & Fabrication</h2>
        <p>Bespoke rock sliders, bumpers, and skid plates TIG welded from high-tensile steel and aluminium. Maximum protection with zero compromise.</p>
        <div class="service-badges">
            <span>Tubular Bumpers</span>
            <span>Roll Cages</span>
        </div>
        <div class="service-actions" style="margin-top: auto; padding: 0;">
            <a href="fabrication.php" class="button-book-service">Explore</a>
        </div>
    </article>

    <!-- Card 4: Lighting -->
    <article class="service-card">
        <div class="service-card-media">
            <img src="assets/images/lighting.jpg" alt="Lighting service" />
            <span class="service-card-badge">🪔 Lighting</span>
        </div>
        <h2>High-Output Lumens</h2>
        <p>Surgical illumination for zero-light environments. Military-grade LED systems designed for maximum visibility and long-range beam projection.</p>
        <div class="service-badges">
            <span>Light Bars</span>
            <span>Bucket Lights</span>
        </div>
        <div class="service-actions" style="margin-top: auto; padding: 0;">
            <a href="lighting.php" class="button-book-service">Explore</a>
        </div>
    </article>

    <!-- Card 5: Recovery -->
    <article class="service-card">
        <div class="service-card-media">
            <img src="assets/images/recovery.jpg" alt="Recovery service" />
            <span class="service-card-badge">🛞 Recovery</span>
        </div>
        <h2>Winch Systems & Recovery</h2>
        <p>Extreme-duty winching solutions for self-recovery in the most hostile environments. Built for reliability when everything else fails.</p>
        <div class="service-badges">
            <span>12,000lb Winch</span>
            <span>Snatch Blocks</span>
        </div>
        <div class="service-actions" style="margin-top: auto; padding: 0;">
            <a href="recovery.php" class="button-book-service">Explore</a>
        </div>
    </article>

    <!-- Card 6: Intake -->
    <article class="service-card">
        <div class="service-card-media">
            <img src="assets/images/intake.png" alt="Intake service" />
            <span class="service-card-badge">⚙️ Intake</span>
        </div>
        <h2>Elevated Air Intakes</h2>
        <p>Deep-water fording and dust filtration systems. Ensure your engine breathes clean, cool air regardless of the terrain conditions.</p>
        <div class="service-badges">
            <span>Snorkel Systems</span>
            <span>High-Flow Filters</span>
        </div>
        <div class="service-actions" style="margin-top: auto; padding: 0;">
            <a href="intake.php" class="button-book-service">Explore</a>
        </div>
    </article>
</section>

<?php
require_once 'includes/footer.php';
?>
