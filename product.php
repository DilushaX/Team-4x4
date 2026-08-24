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

if (isset($_GET['id'])) {
    $requestedId = trim((string) $_GET['id']);
    if ($requestedId !== '' && ctype_digit($requestedId)) {
        $prodId = (int) $requestedId;
        try {
            $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
            $stmt->execute([$prodId]);
            $product = $stmt->fetch();
        } catch (PDOException $e) { $product = null; }
    }
    if (!$product) {
        try {
            $stmt = $pdo->query("SELECT * FROM products ORDER BY id ASC LIMIT 1");
            $product = $stmt->fetch();
        } catch (PDOException $e) { $product = null; }
    }
} elseif (isset($_GET['slug'])) {
    $slug = trim($_GET['slug']);
    try {
        $stmt = $pdo->prepare("SELECT * FROM products WHERE slug = ?");
        $stmt->execute([$slug]);
        $product = $stmt->fetch();
    } catch (PDOException $e) { $product = null; }
} else {
    try {
        $stmt = $pdo->query("SELECT * FROM products ORDER BY id ASC LIMIT 1");
        $product = $stmt->fetch();
    } catch (PDOException $e) { $product = null; }
}

if ($product) {
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
    $priceVal     = floatval($product['price']);
    $isInStock    = $product['stock'] > 0;
    $availability = $isInStock ? "In Stock" : "Out of Stock";
    $desc         = $product['description'] ? htmlspecialchars($product['description']) : "No description available.";
    $sku          = htmlspecialchars($product['sku'] ?: ('T4X4-SKU' . $product['id']));
    $category     = htmlspecialchars($product['category'] ?: 'General');
    $compatStr    = htmlspecialchars($product['compatibility'] ?? 'Defender 90 / 110 / 130 / Universal');
    $condStr      = htmlspecialchars($product['condition'] ?? 'New');
    $whatsappMsg  = rawurlencode("Hi 4x4 Defender Parts! I'm interested in the " . $product['title'] . " (SKU: " . ($product['sku'] ?: 'T4X4-SKU'.$product['id']) . ") priced at LKR " . number_format($priceVal, 2) . ". Please provide more details.");
    $whatsappUrl  = "https://api.whatsapp.com/send?phone=" . $waNumber . "&text=" . $whatsappMsg;
?>

<main class="pd-page">

    <!-- Breadcrumb -->
    <nav class="pd-breadcrumb" aria-label="Breadcrumb">
        <a href="index.php">Home</a>
        <span class="pd-bc-sep">&#8250;</span>
        <a href="shop.php">Shop</a>
        <span class="pd-bc-sep">&#8250;</span>
        <span><?php echo htmlspecialchars($product['title']); ?></span>
    </nav>

    <!-- Main Product Section -->
    <section class="pd-main">

        <!-- LEFT: Gallery -->
        <div class="pd-gallery">
            <div class="pd-gallery-main" id="galleryMainWrap">
                <img id="galleryMainImage"
                     src="<?php echo htmlspecialchars($product['image_path']); ?>"
                     alt="<?php echo htmlspecialchars($product['title']); ?>"
                     class="pd-gallery-img" />
                <div class="pd-gallery-zoom-hint">&#128269; Click to enlarge</div>
            </div>
            <?php if (count($galleryImages) > 1): ?>
            <div class="pd-thumbs" id="productGallery">
                <?php foreach ($galleryImages as $i => $img): ?>
                <button type="button"
                        class="pd-thumb<?php echo $i === 0 ? ' active' : ''; ?>"
                        data-src="<?php echo htmlspecialchars($img); ?>"
                        aria-label="Gallery image <?php echo $i + 1; ?>">
                    <img src="<?php echo htmlspecialchars($img); ?>" alt="View <?php echo $i + 1; ?>" />
                </button>
                <?php endforeach; ?>
            </div>
            <?php else: ?>
            <div class="pd-thumbs" id="productGallery"></div>
            <?php endif; ?>
        </div>

        <!-- RIGHT: Product Info -->
        <div class="pd-info">

            <div class="pd-info-head">
                <div class="pd-badges">
                    <span class="pd-badge pd-badge-cat" id="productCategory"><?php echo $category; ?></span>
                    <span class="pd-badge <?php echo $isInStock ? 'pd-badge-stock' : 'pd-badge-oos'; ?>" id="productAvailability">
                        <?php echo $isInStock ? '&#10003; In Stock' : '&#10007; Out of Stock'; ?>
                    </span>
                </div>
                <h1 id="productName"><?php echo htmlspecialchars($product['title']); ?></h1>
                <p id="productOverview" class="pd-overview"><?php echo mb_substr(strip_tags($desc), 0, 200); ?>...</p>
            </div>

            <div class="pd-meta-row">
                <div class="pd-meta-item">
                    <span class="pd-meta-label">SKU</span>
                    <span class="pd-meta-val" id="productSKU"><?php echo $sku; ?></span>
                </div>
                <div class="pd-meta-item">
                    <span class="pd-meta-label">Brand</span>
                    <span class="pd-meta-val" id="productBrand">4x4 Defender Parts</span>
                </div>
                <div class="pd-meta-item">
                    <span class="pd-meta-label">Condition</span>
                    <span class="pd-meta-val" id="productCondition"><?php echo $condStr; ?></span>
                </div>
                <div class="pd-meta-item">
                    <span class="pd-meta-label">Fitment</span>
                    <span class="pd-meta-val" id="productCompatibility"><?php echo $compatStr; ?></span>
                </div>
            </div>

            <div class="pd-price-block">
                <div class="pd-price-unit">
                    <span class="pd-price-label">Unit Price</span>
                    <div class="pd-price" id="productDiscountPrice">LKR <?php echo number_format($priceVal, 2); ?></div>
                </div>
                <div class="pd-divider-v"></div>
                <div class="pd-price-total">
                    <span class="pd-price-label">Grand Total</span>
                    <div class="pd-total" id="productTotal">LKR <?php echo number_format($priceVal, 2); ?></div>
                </div>
            </div>

            <div class="pd-qty-row">
                <span class="pd-qty-label">Quantity</span>
                <div class="pd-qty-ctrl">
                    <button type="button" id="quantityMinus" class="pd-qty-btn" aria-label="Decrease quantity">&#8722;</button>
                    <input type="text" id="productQuantity" value="1" readonly class="pd-qty-input" aria-label="Quantity" />
                    <button type="button" id="quantityPlus" class="pd-qty-btn" aria-label="Increase quantity">&#43;</button>
                </div>
            </div>

            <div class="pd-actions">
                <button type="button" class="pd-btn pd-btn-primary" id="addToCartButton">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    Add to Cart
                </button>
                <button type="button" class="pd-btn pd-btn-secondary" id="buyNowButton">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                    Order via WhatsApp
                </button>
            </div>

            <div class="pd-links">
                <a class="pd-link pd-link-wa" id="whatsappLink"
                   href="<?php echo $whatsappUrl; ?>"
                   target="_blank" rel="noreferrer">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                    WhatsApp Inquiry
                </a>
                <a class="pd-link" href="tel:<?php echo htmlspecialchars($phoneDisplay); ?>">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.24h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.08-1.08a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    Call Us
                </a>
            </div>

        </div>
    </section>

    <!-- Details Tabs -->
    <section class="pd-details">
        <div class="pd-tabs-nav" role="tablist">
            <button class="pd-tab active" data-tab="description">Description</button>
            <button class="pd-tab" data-tab="features">Features</button>
            <button class="pd-tab" data-tab="fitment">Fitment &amp; Install</button>
        </div>

        <div class="pd-tab-content active" id="tab-description">
            <p id="productDescription"><?php echo $desc; ?></p>
        </div>

        <div class="pd-tab-content" id="tab-features">
            <ul class="pd-feature-list" id="featureList">
                <?php foreach ($featuresList as $feat): ?>
                <li><span class="pd-feat-icon">&#10003;</span><?php echo htmlspecialchars($feat); ?></li>
                <?php endforeach; ?>
            </ul>
        </div>

        <div class="pd-tab-content" id="tab-fitment">
            <div class="pd-fitment-grid">
                <div class="pd-fitment-item">
                    <span class="pd-fitment-label">Compatible With</span>
                    <span class="pd-fitment-val" id="productCompatibility2"><?php echo $compatStr; ?></span>
                </div>
                <div class="pd-fitment-item">
                    <span class="pd-fitment-label">Installation</span>
                    <span class="pd-fitment-val" id="productInstallation">Bolt-on fitment; professional installation by certified technicians recommended.</span>
                </div>
                <div class="pd-fitment-item">
                    <span class="pd-fitment-label">Condition</span>
                    <span class="pd-fitment-val"><?php echo $condStr; ?></span>
                </div>
            </div>
        </div>
    </section>

</main>

<!-- Lightbox -->
<div class="pd-lightbox" id="pdLightbox" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Image preview">
    <button class="pd-lightbox-close" id="pdLightboxClose" aria-label="Close lightbox">&times;</button>
    <img src="" alt="Enlarged product view" id="pdLightboxImg" />
</div>

<!-- Toast notification -->
<div class="pd-toast" id="pdToast" role="alert" aria-live="polite"></div>

<script>
window.activeDbProduct = {
    id:            "<?php echo $product['id']; ?>",
    name:          <?php echo json_encode($product['title']); ?>,
    price:         <?php echo $product['price']; ?>,
    image:         <?php echo json_encode($product['image_path']); ?>,
    description:   <?php echo json_encode($product['description']); ?>,
    category:      <?php echo json_encode($product['category']); ?>,
    compatibility: <?php echo json_encode($product['compatibility'] ?? 'Defender 90 / 110 / 130 / Universal'); ?>,
    condition:     <?php echo json_encode($product['condition'] ?? 'New'); ?>,
    sku:           <?php echo json_encode($product['sku'] ?: ('T4X4-SKU' . $product['id'])); ?>,
    waNumber:      "<?php echo $waNumber; ?>"
};
</script>

<?php else: ?>

<!-- Fallback: no DB product -->
<main class="pd-page">
    <nav class="pd-breadcrumb">
        <a href="index.php">Home</a><span class="pd-bc-sep">&#8250;</span>
        <a href="shop.php">Shop</a><span class="pd-bc-sep">&#8250;</span>
        <span id="productNameBc">Product</span>
    </nav>

    <section class="pd-main">
        <div class="pd-gallery">
            <div class="pd-gallery-main" id="galleryMainWrap">
                <img id="galleryMainImage" src="assets/images/fabrication.jpg" alt="Product" class="pd-gallery-img" />
                <div class="pd-gallery-zoom-hint">&#128269; Click to enlarge</div>
            </div>
            <div class="pd-thumbs" id="productGallery"></div>
        </div>

        <div class="pd-info">
            <div class="pd-info-head">
                <div class="pd-badges">
                    <span class="pd-badge pd-badge-cat" id="productCategory">General</span>
                    <span class="pd-badge pd-badge-stock" id="productAvailability">&#10003; In Stock</span>
                </div>
                <h1 id="productName">4x4 Defender Parts — Signature Part</h1>
                <p id="productOverview" class="pd-overview">Precision-engineered part tailored for luxury off-road builds.</p>
            </div>
            <div class="pd-meta-row">
                <div class="pd-meta-item"><span class="pd-meta-label">SKU</span><span class="pd-meta-val" id="productSKU">T4X4-000</span></div>
                <div class="pd-meta-item"><span class="pd-meta-label">Brand</span><span class="pd-meta-val" id="productBrand">4x4 Defender Parts</span></div>
                <div class="pd-meta-item"><span class="pd-meta-label">Condition</span><span class="pd-meta-val" id="productCondition">New</span></div>
                <div class="pd-meta-item"><span class="pd-meta-label">Fitment</span><span class="pd-meta-val" id="productCompatibility">Defender 90 / 110 / 130</span></div>
            </div>
            <div class="pd-price-block">
                <div class="pd-price-unit">
                    <span class="pd-price-label">Unit Price</span>
                    <div class="pd-price" id="productDiscountPrice">LKR 0</div>
                </div>
                <div class="pd-divider-v"></div>
                <div class="pd-price-total">
                    <span class="pd-price-label">Grand Total</span>
                    <div class="pd-total" id="productTotal">LKR 0</div>
                </div>
            </div>
            <div class="pd-qty-row">
                <span class="pd-qty-label">Quantity</span>
                <div class="pd-qty-ctrl">
                    <button type="button" id="quantityMinus" class="pd-qty-btn">&#8722;</button>
                    <input type="text" id="productQuantity" value="1" readonly class="pd-qty-input" aria-label="Quantity" />
                    <button type="button" id="quantityPlus" class="pd-qty-btn">&#43;</button>
                </div>
            </div>
            <div class="pd-actions">
                <button type="button" class="pd-btn pd-btn-primary" id="addToCartButton">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    Add to Cart
                </button>
                <button type="button" class="pd-btn pd-btn-secondary" id="buyNowButton">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                    Order via WhatsApp
                </button>
            </div>
            <div class="pd-links">
                <a class="pd-link pd-link-wa" id="whatsappLink" href="#" target="_blank" rel="noreferrer">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                    WhatsApp Inquiry
                </a>
                <a class="pd-link" href="tel:<?php echo htmlspecialchars($phoneDisplay); ?>">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.24h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.08-1.08a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    Call Us
                </a>
            </div>
        </div>
    </section>

    <section class="pd-details">
        <div class="pd-tabs-nav" role="tablist">
            <button class="pd-tab active" data-tab="description">Description</button>
            <button class="pd-tab" data-tab="features">Features</button>
            <button class="pd-tab" data-tab="fitment">Fitment &amp; Install</button>
        </div>
        <div class="pd-tab-content active" id="tab-description">
            <p id="productDescription">Full product description will be displayed here.</p>
        </div>
        <div class="pd-tab-content" id="tab-features">
            <ul class="pd-feature-list" id="featureList"></ul>
        </div>
        <div class="pd-tab-content" id="tab-fitment">
            <div class="pd-fitment-grid">
                <div class="pd-fitment-item">
                    <span class="pd-fitment-label">Compatible With</span>
                    <span class="pd-fitment-val" id="productCompatibility">Defender 90 / 110 / 130</span>
                </div>
                <div class="pd-fitment-item">
                    <span class="pd-fitment-label">Installation</span>
                    <span class="pd-fitment-val" id="productInstallation">Professional installation recommended.</span>
                </div>
            </div>
        </div>
    </section>
</main>

<div class="pd-lightbox" id="pdLightbox" aria-hidden="true">
    <button class="pd-lightbox-close" id="pdLightboxClose" aria-label="Close">&times;</button>
    <img src="" alt="Enlarged product view" id="pdLightboxImg" />
</div>
<div class="pd-toast" id="pdToast" aria-live="polite"></div>

<?php endif; ?>

<script src="js/config.js"></script>
<script src="js/product.js"></script>
<?php require_once 'includes/footer.php'; ?>
