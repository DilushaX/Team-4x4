<?php
$pageTitle = "Shop";
require_once 'includes/header.php';

// Fetch all products from MySQL database
try {
    $stmt = $pdo->query("SELECT * FROM products ORDER BY id DESC");
    $products = $stmt->fetchAll();
} catch (PDOException $e) {
    $products = [];
}
?>

<main class="shop-page">
    <section class="shop-hero">
        <div class="shop-hero-copy">
            <div>
                <span class="eyebrow">Parts Library</span>
                <h1>Parts Library</h1>
            </div>
            <p class="shop-hero-meta"><span id="product-count">Showing <?php echo count($products); ?> items</span></p>
        </div>
    </section>

    <div class="shop-layout">
        <button class="button-secondary filter-toggle" aria-expanded="false">Filters</button>
        <aside class="shop-filters">
            <div class="filter-card">
                <h3>Category</h3>
                <div class="filter-group">
                    <label class="filter-label"><input class="filter-checkbox" type="checkbox" data-category="performance" /> Performance</label>
                    <label class="filter-label"><input class="filter-checkbox" type="checkbox" data-category="exterior" /> Exterior</label>
                    <label class="filter-label"><input class="filter-checkbox" type="checkbox" data-category="interior" /> Interior</label>
                    <label class="filter-label"><input class="filter-checkbox" type="checkbox" data-category="lighting" /> Lighting</label>
                    <label class="filter-label"><input class="filter-checkbox" type="checkbox" data-category="recovery" /> Recovery</label>
                    <label class="filter-label"><input class="filter-checkbox" type="checkbox" data-category="intake" /> Intake</label>
                </div>
            </div>
            <div class="filter-actions">
                <button class="button-secondary apply-filters">Apply Filters</button>
                <button class="button-secondary clear-filters">Clear Filters</button>
            </div>
        </aside>

        <div class="shop-content">
            <div class="search-bar-container">
                <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input type="text" id="search-input" class="search-bar-input" placeholder="Search parts by name, category, or compatibility...">
            </div>

            <section class="product-grid" id="productGrid">
                <div class="empty-state hidden">No matching parts found.</div>
                
                <?php if (empty($products)): ?>
                    <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-muted);">
                        <p>No products available in the shop catalog at this time.</p>
                    </div>
                <?php else: ?>
                    <?php foreach ($products as $p): 
                        $categoryClass = strtolower($p['category']);
                        // Determine stock status text
                        $availability = $p['stock'] > 0 ? ($p['stock'] <= 3 ? "Limited Stock" : "In Stock") : "Out of Stock";
                        
                        // Query additional product images
                        $imgStmt = $pdo->prepare("SELECT image_path FROM product_images WHERE product_id = ?");
                        $imgStmt->execute([$p['id']]);
                        $galleryImages = $imgStmt->fetchAll(PDO::FETCH_COLUMN);
                        // Add main image to gallery list
                        array_unshift($galleryImages, $p['image_path']);
                        $galleryStr = implode(',', $galleryImages);
                    ?>
                        <article class="product-card" data-category="<?php echo htmlspecialchars($categoryClass); ?>">
                            <div class="product-card-media">
                                <span class="product-tag"><?php echo htmlspecialchars($p['category']); ?></span>
                                <div class="product-image-icon">🚙</div>
                                <img src="<?php echo htmlspecialchars($p['image_path']); ?>" alt="<?php echo htmlspecialchars($p['title']); ?>" style="position: absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; border-radius:1.75rem 1.75rem 0 0;" onerror="this.style.display='none';" />
                            </div>
                            <div class="product-card-body">
                                <h2><?php echo htmlspecialchars($p['title']); ?></h2>
                                <div class="product-chip">Universal Fit</div>
                                <div class="product-chip">Defender 90/110/130</div>
                                <p class="product-price">LKR <?php echo number_format($p['price'], 2); ?></p>
                                <div class="product-actions">
                                    <button class="button-primary view-product"
                                        data-product-id="<?php echo htmlspecialchars($p['id']); ?>"
                                        data-product-name="<?php echo htmlspecialchars($p['title']); ?>"
                                        data-product-price="<?php echo htmlspecialchars($p['price']); ?>"
                                        data-product-image="<?php echo htmlspecialchars($p['image_path']); ?>"
                                        data-product-description="<?php echo htmlspecialchars($p['description']); ?>"
                                        data-product-category="<?php echo htmlspecialchars($p['category']); ?>"
                                        data-product-condition="New"
                                        data-product-sku="T4X4-SKU<?php echo $p['id']; ?>"
                                        data-product-brand="Team 4x4"
                                        data-product-availability="<?php echo $p['stock'] > 0 ? 'In Stock' : 'Out of Stock'; ?>"
                                        data-product-compatibility="Defender 90 / 110 / 130 / Universal"
                                        data-product-installation="Bolt-on fitment; professional installation by certified technicians recommended."
                                        data-product-overview="<?php echo htmlspecialchars(substr($p['description'], 0, 80)); ?>..."
                                        data-product-features="Premium raw materials|Maximum trail durability|Corrosion-resistant matte finish"
                                        data-product-gallery="<?php echo htmlspecialchars($galleryStr); ?>"
                                    >View Part</button>
                                    <a class="button-secondary" href="contact.php">Inquire</a>
                                </div>
                            </div>
                        </article>
                    <?php endforeach; ?>
                <?php endif; ?>
            </section>
        </div>
    </div>
</main>

<?php
require_once 'includes/footer.php';
?>
