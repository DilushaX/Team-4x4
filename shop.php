<?php
$pageTitle = "Shop";
require_once 'includes/header.php';

// Server-side Pagination parameters
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$limit = 24;
$offset = ($page - 1) * $limit;

// Search & Filter parameters
$searchQuery = isset($_GET['q']) ? trim($_GET['q']) : '';
$selectedCatId = isset($_GET['cat']) ? intval($_GET['cat']) : 0;
$sortBy = isset($_GET['sort']) ? trim($_GET['sort']) : 'newest';

$whereClauses = [];
$params = [];

if (!empty($searchQuery)) {
    $whereClauses[] = "(title LIKE ? OR sku LIKE ? OR compatibility LIKE ? OR description LIKE ?)";
    $searchTerm = '%' . $searchQuery . '%';
    $params[] = $searchTerm;
    $params[] = $searchTerm;
    $params[] = $searchTerm;
    $params[] = $searchTerm;
}

if ($selectedCatId > 0) {
    $whereClauses[] = "category_id = ?";
    $params[] = $selectedCatId;
}

$whereSql = !empty($whereClauses) ? "WHERE " . implode(" AND ", $whereClauses) : "";

// Determine sort order
$orderBySql = "ORDER BY id DESC";
if ($sortBy === 'price_asc') {
    $orderBySql = "ORDER BY price ASC";
} elseif ($sortBy === 'price_desc') {
    $orderBySql = "ORDER BY price DESC";
} elseif ($sortBy === 'name_asc') {
    $orderBySql = "ORDER BY title ASC";
}

// Count total matching items
try {
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM products $whereSql");
    $countStmt->execute($params);
    $totalProducts = intval($countStmt->fetchColumn());
} catch (PDOException $e) {
    $totalProducts = 0;
}

$totalPages = max(1, ceil($totalProducts / $limit));

// Fetch paginated products
try {
    $productSql = "SELECT * FROM products $whereSql $orderBySql LIMIT $limit OFFSET $offset";
    $stmt = $pdo->prepare($productSql);
    $stmt->execute($params);
    $products = $stmt->fetchAll();
} catch (PDOException $e) {
    $products = [];
}

// Fetch active categories from MySQL database
try {
    $catStmt = $pdo->query("SELECT * FROM categories WHERE status = 1 ORDER BY sort_order ASC, name ASC");
    $categories = $catStmt->fetchAll();
} catch (PDOException $e) {
    $categories = [];
}
?>

<main class="shop-page">
    <section class="shop-hero">
        <div class="shop-hero-copy">
            <div>
                <span class="eyebrow">Parts Library</span>
                <h1>Parts Library</h1>
            </div>
            <p class="shop-hero-meta"><span id="product-count">Showing <?php echo count($products); ?> of <?php echo $totalProducts; ?> parts</span></p>
        </div>
    </section>

    <div class="shop-layout">
        <div class="filter-backdrop" hidden></div>
        <button class="button-secondary filter-toggle" aria-expanded="false">Filters</button>
        <aside class="shop-filters">
            <div class="filter-card">
                <h3>Category</h3>
                <div class="filter-group">
                    <?php if (!empty($categories)): ?>
                        <?php foreach ($categories as $cat): 
                            $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $cat['name']));
                            $isChecked = ($selectedCatId == $cat['id']) ? 'checked' : '';
                        ?>
                            <label class="filter-label">
                                <input class="filter-checkbox" type="checkbox" data-category="<?php echo htmlspecialchars($slug); ?>" data-cat-id="<?php echo $cat['id']; ?>" <?php echo $isChecked; ?> /> 
                                <?php echo htmlspecialchars($cat['name']); ?>
                            </label>
                        <?php endforeach; ?>
                    <?php endif; ?>
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
                <input type="text" id="search-input" class="search-bar-input" value="<?php echo htmlspecialchars($searchQuery); ?>" placeholder="Search parts by name, category, or compatibility...">
            </div>

            <div class="shop-toolbar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <div class="view-toggle" role="group" aria-label="Product view">
                    <button type="button" class="view-toggle-btn is-active" data-view="grid">Grid</button>
                    <button type="button" class="view-toggle-btn" data-view="list">List</button>
                </div>
                <div class="sort-selector" style="display: flex; align-items: center; gap: 0.5rem;">
                    <label for="shop-sort" style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">Sort By:</label>
                    <select id="shop-sort" class="sort-dropdown" style="background: #111; color: #fff; border: 1px solid rgba(255,255,255,0.2); padding: 0.4rem 0.8rem; border-radius: 6px;" onchange="location = this.value;">
                        <option value="shop.php?page=1&sort=newest<?php echo $searchQuery ? '&q='.urlencode($searchQuery) : ''; ?>" <?php echo $sortBy==='newest'?'selected':''; ?>>Newest Arrivals</option>
                        <option value="shop.php?page=1&sort=price_asc<?php echo $searchQuery ? '&q='.urlencode($searchQuery) : ''; ?>" <?php echo $sortBy==='price_asc'?'selected':''; ?>>Price: Low to High</option>
                        <option value="shop.php?page=1&sort=price_desc<?php echo $searchQuery ? '&q='.urlencode($searchQuery) : ''; ?>" <?php echo $sortBy==='price_desc'?'selected':''; ?>>Price: High to Low</option>
                        <option value="shop.php?page=1&sort=name_asc<?php echo $searchQuery ? '&q='.urlencode($searchQuery) : ''; ?>" <?php echo $sortBy==='name_asc'?'selected':''; ?>>Name: A-Z</option>
                    </select>
                </div>
            </div>

            <section class="product-grid" id="productGrid">
                <div class="empty-state <?php echo empty($products) ? '' : 'hidden'; ?>">
                    <div class="empty-state-icon">&#128269;</div>
                    <h3 class="empty-state-title">No parts match your search</h3>
                    <p class="empty-state-sub">Try different keywords or remove a filter.</p>
                    <button class="button-secondary empty-state-clear" id="emptyStateClear">Clear All Filters</button>
                </div>
                
                <?php if (!empty($products)): ?>
                    <?php foreach ($products as $p): 
                        $categoryClass = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $p['category']));
                        $stockCount = intval($p['stock'] ?? 0);
                        if ($stockCount <= 0)        { $availability = 'Out of Stock';  $availClass = 'badge-out'; }
                        elseif ($stockCount <= 3)    { $availability = 'Limited Stock'; $availClass = 'badge-limited'; }
                        else                         { $availability = 'In Stock';      $availClass = 'badge-in'; }
                        $condition = htmlspecialchars($p['condition'] ?? 'New');
                        $sku       = htmlspecialchars($p['sku'] ?: ('T4X4-' . $p['id']));

                        // Query additional product images
                        try {
                            $imgStmt = $pdo->prepare("SELECT image_path FROM product_images WHERE product_id = ?");
                            $imgStmt->execute([$p['id']]);
                            $galleryImages = $imgStmt->fetchAll(PDO::FETCH_COLUMN);
                            array_unshift($galleryImages, $p['image_path']);
                            $galleryStr = implode(',', $galleryImages);
                        } catch (PDOException $e) {
                            $galleryStr = $p['image_path'];
                        }
                    ?>
                        <article class="product-card" data-category="<?php echo htmlspecialchars($categoryClass); ?>" data-url="product.php?id=<?php echo (int)$p['id']; ?>">
                            <div class="product-card-media">
                                <span class="product-tag"><?php echo htmlspecialchars($p['category']); ?></span>
                                <img src="<?php echo htmlspecialchars($p['image_path']); ?>" alt="<?php echo htmlspecialchars($p['title']); ?>" style="position: absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; border-radius:1.75rem 1.75rem 0 0;" onerror="this.src='assets/images/fabrication.jpg';" />
                            </div>
                            <div class="product-card-body">
                                <h2><?php echo htmlspecialchars($p['title']); ?></h2>
                                <div class="product-meta-row">
                                    <span class="product-availability-badge <?php echo $availClass; ?>"><?php echo $availability; ?></span>
                                    <span class="product-condition-badge"><?php echo $condition; ?></span>
                                </div>
                                <div class="product-chip"><?php echo htmlspecialchars($p['compatibility'] ?: 'Universal Fit'); ?></div>
                                <div class="product-price-row">
                                    <p class="product-price">LKR <?php echo number_format($p['price'], 2); ?></p>
                                    <span class="product-sku">SKU: <?php echo $sku; ?></span>
                                </div>
                                <div class="product-actions">
                                    <a class="button-primary view-product"
                                       href="product.php?id=<?php echo $p['id']; ?>"
                                       data-product-id="<?php echo (int)$p['id']; ?>"
                                       data-product-name="<?php echo htmlspecialchars($p['title'], ENT_QUOTES, 'UTF-8'); ?>"
                                       data-product-price="<?php echo htmlspecialchars((string)$p['price'], ENT_QUOTES, 'UTF-8'); ?>"
                                       data-product-image="<?php echo htmlspecialchars($p['image_path'], ENT_QUOTES, 'UTF-8'); ?>"
                                       data-product-description="<?php echo htmlspecialchars($p['description'] ?? '', ENT_QUOTES, 'UTF-8'); ?>"
                                       data-product-category="<?php echo htmlspecialchars($p['category'] ?? 'General', ENT_QUOTES, 'UTF-8'); ?>"
                                       data-product-compatibility="<?php echo htmlspecialchars($p['compatibility'] ?? 'Defender 90 / 110 / 130 / Universal', ENT_QUOTES, 'UTF-8'); ?>"
                                       data-product-condition="<?php echo htmlspecialchars($p['condition'] ?? 'New', ENT_QUOTES, 'UTF-8'); ?>"
                                       style="text-align: center; text-decoration: none;">View Part</a>
                                    <a class="button-secondary" href="contact.php">Inquire</a>
                                </div>
                            </div>
                        </article>
                    <?php endforeach; ?>
                <?php endif; ?>
            </section>

            <!-- Pagination Controls -->
            <?php if ($totalPages > 1): ?>
                <div class="pagination-container" style="display: flex; justify-content: center; align-items: center; gap: 0.5rem; margin-top: 3rem;">
                    <?php if ($page > 1): ?>
                        <a href="shop.php?page=<?php echo ($page - 1); ?>&sort=<?php echo $sortBy; ?><?php echo $searchQuery ? '&q='.urlencode($searchQuery) : ''; ?>" class="button-secondary" style="padding: 0.5rem 1rem;">&laquo; Prev</a>
                    <?php endif; ?>

                    <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                        <a href="shop.php?page=<?php echo $i; ?>&sort=<?php echo $sortBy; ?><?php echo $searchQuery ? '&q='.urlencode($searchQuery) : ''; ?>" class="<?php echo ($i === $page) ? 'button-primary' : 'button-secondary'; ?>" style="padding: 0.5rem 1rem;"><?php echo $i; ?></a>
                    <?php endfor; ?>

                    <?php if ($page < $totalPages): ?>
                        <a href="shop.php?page=<?php echo ($page + 1); ?>&sort=<?php echo $sortBy; ?><?php echo $searchQuery ? '&q='.urlencode($searchQuery) : ''; ?>" class="button-secondary" style="padding: 0.5rem 1rem;">Next &raquo;</a>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        </div>
    </div>
</main>

<?php require_once 'includes/footer.php'; ?>
<script src="js/shop.js"></script>
