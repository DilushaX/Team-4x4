<?php
require_once 'includes/db.php';
require_once 'includes/auth_helper.php';

$waNumber = getWhatsAppNumber($pdo);
$siteSettings = getSiteSettings($pdo);
$phoneDisplay = $siteSettings['contact_phone'] ?? $siteSettings['phone'] ?? ('+' . $waNumber);
if (!empty($phoneDisplay) && $phoneDisplay[0] !== '+') {
    $phoneDisplay = '+' . preg_replace('/\D/', '', $phoneDisplay);
}

$product = null;
$galleryImages = [];
$featuresList = ["Premium raw materials", "Maximum trail durability", "Corrosion-resistant matte finish", "Engineered for harsh environments"];

// Check if dynamic ID or slug is requested, else fetch default first product from DB
if (isset($_GET['id'])) {
    $prodId = intval($_GET['id']);
    try {
        $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->execute([$prodId]);
        $product = $stmt->fetch();
    } catch (PDOException $e) {
        $product = null;
    }
} elseif (isset($_GET['slug'])) {
    $slug = trim($_GET['slug']);
    try {
        $stmt = $pdo->prepare("SELECT * FROM products WHERE slug = ?");
        $stmt->execute([$slug]);
        $product = $stmt->fetch();
    } catch (PDOException $e) {
        $product = null;
    }
} else {
    try {
        $stmt = $pdo->query("SELECT * FROM products ORDER BY id ASC LIMIT 1");
        $product = $stmt->fetch();
    } catch (PDOException $e) {
        $product = null;
    }
}

if ($product) {
    // Load supplementary images
    try {
        $imgStmt = $pdo->prepare("SELECT image_path FROM product_images WHERE product_id = ?");
        $imgStmt->execute([$product['id']]);
        $galleryImages = $imgStmt->fetchAll(PDO::FETCH_COLUMN);
        array_unshift($galleryImages, $product['image_path']);
    } catch (PDOException $e) {
        $galleryImages = [$product['image_path']];
    }
}

$pageTitle = $product ? htmlspecialchars($product['title']) : "Product Overview";
require_once 'includes/header.php';
?>

<?php if ($product): 
    // Format pricing (Single source of truth)
    $priceVal = floatval($product['price']);
    $availability = $product['stock'] > 0 ? "In Stock" : "Out of Stock";
    
    // Generate feature list array from database description or fallback
    $desc = $product['description'] ? htmlspecialchars($product['description']) : "No description available.";
?>
    <!-- Server-Side Dynamic Render Mode -->
    <main>
        <section class="product-hero">
            <div class="product-hero-copy">
                <span class="eyebrow">Premium Product Summary</span>
                <h1 id="productName"><?php echo htmlspecialchars($product['title']); ?></h1>
                <p id="productOverview"><?php echo substr($desc, 0, 160); ?>...</p>
                <div class="product-hero-tags">
                    <span class="product-chip" id="productCategory"><?php echo htmlspecialchars($product['category'] ?: 'General'); ?></span>
                    <span class="product-chip" id="productAvailability" style="color: <?php echo $product['stock'] > 0 ? '#55ff55' : '#ff5555'; ?>; border-color: <?php echo $product['stock'] > 0 ? 'rgba(85,255,85,0.3)' : 'rgba(255,85,85,0.3)'; ?>;">
                        <?php echo $availability; ?>
                    </span>
                </div>
                <div class="product-hero-pricing">
                    <div>
                        <span class="eyebrow">Price</span>
                        <div class="product-price-row">
                            <span class="product-price" id="productDiscountPrice">LKR <?php echo number_format($priceVal, 2); ?></span>
                        </div>
                    </div>
                    <div class="product-hero-meta">
                        <span><strong>SKU</strong> <span id="productSKU"><?php echo htmlspecialchars($product['sku'] ?: ('T4X4-SKU' . $product['id'])); ?></span></span>
                        <span><strong>Brand</strong> <span id="productBrand">Team 4x4</span></span>
                    </div>
                </div>
            </div>
            <div class="product-hero-visual">
                <div class="product-hero-frame">
                    <img id="productImage" src="<?php echo htmlspecialchars($product['image_path']); ?>" alt="<?php echo htmlspecialchars($product['title']); ?>" />
                </div>
            </div>
        </section>

        <section class="product-main-grid">
            <div class="gallery-panel glass-card">
                <div class="gallery-main">
                    <img id="galleryMainImage" src="<?php echo htmlspecialchars($product['image_path']); ?>" alt="<?php echo htmlspecialchars($product['title']); ?>" />
                </div>
                <div class="product-gallery" id="productGallery">
                    <?php foreach ($galleryImages as $img): ?>
                        <img class="gallery-thumb" src="<?php echo htmlspecialchars($img); ?>" alt="Gallery image" onclick="document.getElementById('galleryMainImage').src=this.src;" style="cursor:pointer;" />
                    <?php endforeach; ?>
                </div>
            </div>

            <aside class="details-panel glass-card">
                <div class="product-summary-card">
                    <div class="summary-row">
                        <div>
                            <span class="eyebrow">Compatibility</span>
                            <p id="productCompatibility">Defender 90 / 110 / 130 / Universal</p>
                        </div>
                        <div>
                            <span class="eyebrow">Condition</span>
                            <p id="productCondition">New</p>
                        </div>
                    </div>
                    <div class="summary-row">
                        <div>
                            <span class="eyebrow">Installation</span>
                            <p id="productInstallation">Bolt-on fitment; professional installation by certified technicians recommended.</p>
                        </div>
                    </div>
                    <div class="summary-body">
                        <h3>Overview</h3>
                        <p id="productDescription"><?php echo $desc; ?></p>
                    </div>
                </div>

                <div class="product-purchase-card glass-card">
                    <div class="product-quantity">
                        <label for="productQuantity">Quantity</label>
                        <div class="quantity-control">
                            <button type="button" class="quantity-button" id="quantityMinus">−</button>
                            <input type="text" id="productQuantity" value="1" readonly aria-label="Quantity" />
                            <button type="button" class="quantity-button" id="quantityPlus">+</button>
                        </div>
                    </div>
                    <div class="product-price-detail total-line">
                        <span>Grand Total</span>
                        <span id="productTotal">LKR <?php echo number_format($priceVal, 2); ?></span>
                    </div>
                    <div class="product-actions">
                        <button class="button-primary" id="addToCartButton">Add to Cart</button>
                        <button class="button-secondary" id="buyNowButton">Buy Now</button>
                        
                        <?php 
                        $whatsappMsg = rawurlencode("Hi Team 4x4! I am interested in inquiring about the " . $product['title'] . " (SKU: T4X4-SKU" . $product['id'] . ") priced at LKR " . number_format($priceVal, 2) . ". Please provide more details on availability and fitment.");
                        $whatsappUrl = "https://api.whatsapp.com/send?phone=" . $waNumber . "&text=" . $whatsappMsg;
                        ?>
                        <a class="button-secondary whatsapp-button" id="whatsappLink" href="<?php echo $whatsappUrl; ?>" target="_blank" rel="noreferrer">WhatsApp Inquiry</a>
                        <a class="button-secondary" href="tel:<?php echo htmlspecialchars($phoneDisplay); ?>">Call Team 4x4</a>
                    </div>
                </div>
            </aside>
        </section>

        <section class="product-detail-grid">
            <div class="product-info-block glass-card">
                <h3>Full Description</h3>
                <p id="productFullDescription"><?php echo $desc; ?> Engineered with robust tactical utility and absolute off-road strength to keep you dominant on any terrain.</p>
            </div>
            <div class="product-info-block glass-card">
                <h3>Features</h3>
                <ul class="feature-list" id="featureList">
                    <?php foreach ($featuresList as $feat): ?>
                        <li><?php echo htmlspecialchars($feat); ?></li>
                    <?php endforeach; ?>
                </ul>
            </div>
        </section>

        <!-- Inject dynamic JSON data for the clientside AddToCart script to bind on -->
        <script>
            window.activeDbProduct = {
                id: "<?php echo $product['id']; ?>",
                name: <?php echo json_encode($product['title']); ?>,
                price: <?php echo $product['price']; ?>,
                image: <?php echo json_encode($product['image_path']); ?>,
                description: <?php echo json_encode($product['description']); ?>,
                category: <?php echo json_encode($product['category']); ?>,
                condition: "New"
            };
        </script>
    </main>

<?php else: ?>
    <!-- Clientside Fallback Mode (For links bypassing dynamic query parameters) -->
    <main>
        <section class="product-hero">
            <div class="product-hero-copy">
                <span class="eyebrow">Premium Product Summary</span>
                <h1 id="productName">Team 4x4 Signature Part</h1>
                <p id="productOverview">Precision-engineered part tailored for luxury off-road builds with unmatched visual impact and trail-ready strength.</p>
                <div class="product-hero-tags">
                    <span class="product-chip" id="productCategory">Category</span>
                    <span class="product-chip" id="productAvailability">Availability</span>
                </div>
                <div class="product-hero-pricing">
                    <div>
                        <span class="eyebrow">Price</span>
                        <div class="product-price-row">
                            <span class="product-price" id="productDiscountPrice">LKR 0</span>
                            <span class="product-original-price" id="productOriginalPrice">LKR 0</span>
                        </div>
                    </div>
                    <div class="product-hero-meta">
                        <span><strong>SKU</strong> <span id="productSKU">T4X4-000</span></span>
                        <span><strong>Brand</strong> <span id="productBrand">Team 4x4</span></span>
                    </div>
                </div>
            </div>
            <div class="product-hero-visual">
                <div class="product-hero-frame">
                    <img id="productImage" src="assets/images/fabrication.jpg" alt="Product image" />
                </div>
            </div>
        </section>

        <section class="product-main-grid">
            <div class="gallery-panel glass-card">
                <div class="gallery-main">
                    <img id="galleryMainImage" src="assets/images/fabrication.jpg" alt="Product gallery image" />
                </div>
                <div class="product-gallery" id="productGallery"></div>
            </div>

            <aside class="details-panel glass-card">
                <div class="product-summary-card">
                    <div class="summary-row">
                        <div>
                            <span class="eyebrow">Compatibility</span>
                            <p id="productCompatibility">Defender 90 / 110 / 130</p>
                        </div>
                        <div>
                            <span class="eyebrow">Condition</span>
                            <p id="productCondition">New</p>
                        </div>
                    </div>
                    <div class="summary-row">
                        <div>
                            <span class="eyebrow">Installation</span>
                            <p id="productInstallation">Professional install recommended.</p>
                        </div>
                    </div>
                    <div class="summary-body">
                        <h3>Overview</h3>
                        <p id="productDescription">Full description of the product and how it enhances your build.</p>
                    </div>
                </div>

                <div class="product-purchase-card glass-card">
                    <div class="product-quantity">
                        <label for="productQuantity">Quantity</label>
                        <div class="quantity-control">
                            <button type="button" class="quantity-button" id="quantityMinus">−</button>
                            <input type="text" id="productQuantity" value="1" readonly aria-label="Quantity" />
                            <button type="button" class="quantity-button" id="quantityPlus">+</button>
                        </div>
                    </div>
                    <div class="product-price-detail total-line">
                        <span>Grand Total</span>
                        <span id="productTotal">LKR 0</span>
                    </div>
                    <div class="product-actions">
                        <button class="button-primary" id="addToCartButton">Add to Cart</button>
                        <button class="button-secondary" id="buyNowButton">Buy Now</button>
                        <a class="button-secondary whatsapp-button" id="whatsappLink" target="_blank" rel="noreferrer">WhatsApp Inquiry</a>
                        <a class="button-secondary" href="tel:<?php echo htmlspecialchars($phoneDisplay); ?>">Call Team 4x4</a>
                    </div>
                </div>
            </aside>
        </section>

        <section class="product-detail-grid">
            <div class="product-info-block glass-card">
                <h3>Full Description</h3>
                <p id="productFullDescription">The complete product story, engineered for luxury trail performance and confident on-road presence.</p>
            </div>
            <div class="product-info-block glass-card">
                <h3>Features</h3>
                <ul class="feature-list" id="featureList"></ul>
            </div>
        </section>
    </main>
<?php endif; ?>

<script src="js/config.js"></script>
<script src="js/product.js"></script>
<?php
require_once 'includes/footer.php';
?>
