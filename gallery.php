<?php
$pageTitle = "Gallery";
require_once 'includes/header.php';
?>

<section class="gallery-hero">
    <div class="gallery-hero-copy">
        <span class="eyebrow">Our Work</span>
        <h1>Build Gallery</h1>
        <p>Explore our latest automotive restorations and custom 4x4 engineering projects. Each build is a testament to heritage, power, and precision.</p>
    </div>
</section>

<section class="gallery-filters" id="galleryFilters">
    <button class="filter-btn active" data-filter="all">All Builds</button>
    <button class="filter-btn" data-filter="restoration">Restorations</button>
    <button class="filter-btn" data-filter="suspension">Suspension</button>
    <button class="filter-btn" data-filter="fabrication">Fabrication</button>
    <button class="filter-btn" data-filter="recovery">Recovery</button>
    <button class="filter-btn" data-filter="lighting">Lighting</button>
</section>

<section class="gallery-grid" id="galleryGrid">
    <!-- Dynamic project cards will be injected here by gallery.js -->
    <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-muted);">
        <p>Loading the elite Team 4x4 builds...</p>
    </div>
</section>

<script src="js/projects-db.js"></script>
<script src="js/gallery.js"></script>

<?php
require_once 'includes/footer.php';
?>
