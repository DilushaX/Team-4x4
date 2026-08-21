<?php
$pageTitle = "Gallery";
$bodyClass = "gallery-page";
require_once 'includes/header.php';

$projects = [];
$categories = [];
try {
    $stmt = $pdo->query("SELECT p.*, (SELECT COUNT(1) FROM project_images WHERE project_id = p.id) AS image_count FROM projects p ORDER BY p.project_order ASC, p.created_at DESC");
    $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($projects as $project) {
        $categories[] = $project['category'];
    }
    $categories = array_values(array_unique($categories));
} catch (Throwable $e) {
    // Silent failover: page will render with no projects.
}
?>

<section class="gallery-hero">
    <div class="gallery-hero-copy">
        <span class="eyebrow">Our Work</span>
        <h1>Build Gallery</h1>
        <p>Explore our latest automotive restorations and custom 4x4 engineering projects. Each build is a testament to heritage, power, and precision.</p>
    </div>
</section>

<?php if (!empty($categories)): ?>
<section class="gallery-filters" id="galleryFilters">
    <button class="filter-btn active" data-filter="all">All Builds</button>
    <?php foreach ($categories as $category): ?>
        <button class="filter-btn" data-filter="<?php echo htmlspecialchars(strtolower(preg_replace('/[^a-z0-9]+/i', '-', $category))); ?>"><?php echo htmlspecialchars($category); ?></button>
    <?php endforeach; ?>
</section>
<?php endif; ?>

<section class="gallery-grid" id="galleryGrid">
    <?php if (empty($projects)): ?>
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-muted);">
            <p>No gallery projects are available yet.</p>
        </div>
    <?php else: ?>
        <?php foreach ($projects as $project): ?>
            <?php
                $cardCategory = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $project['category']));
                $imageSrc = $project['featured_image'] ?: 'assets/images/fabrication.jpg';
                $projectUrl = 'project.php?slug=' . urlencode($project['slug']);
            ?>
            <article class="gallery-card" data-category="<?php echo htmlspecialchars($cardCategory); ?>">
                <div class="gallery-card-media">
                    <img src="<?php echo htmlspecialchars($imageSrc); ?>" alt="<?php echo htmlspecialchars($project['title']); ?>" />
                </div>
                <div class="gallery-card-body">
                    <h2><?php echo htmlspecialchars($project['title']); ?></h2>
                    <p><?php echo htmlspecialchars(substr($project['description'], 0, 120)); ?><?php echo strlen($project['description']) > 120 ? '…' : ''; ?></p>
                    <div class="gallery-card-meta">
                        <span><?php echo intval($project['image_count']); ?> photos</span>
                        <span><?php echo htmlspecialchars($project['category']); ?></span>
                    </div>
                    <a href="<?php echo $projectUrl; ?>" class="project-link">View Project →</a>
                </div>
            </article>
        <?php endforeach; ?>
    <?php endif; ?>
</section>

<script src="js/gallery.js"></script>

<?php
require_once 'includes/footer.php';
?>
