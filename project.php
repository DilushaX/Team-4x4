<?php
$pageTitle = "Project Details";
$bodyClass = "project-page";
require_once 'includes/header.php';

$slug = trim($_GET['slug'] ?? '');
$project = null;
$images = [];

if ($slug !== '') {
    try {
        $stmt = $pdo->prepare("SELECT * FROM projects WHERE slug = ? LIMIT 1");
        $stmt->execute([$slug]);
        $project = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($project) {
            $imgStmt = $pdo->prepare("SELECT image_path FROM project_images WHERE project_id = ? ORDER BY id ASC");
            $imgStmt->execute([$project['id']]);
            $images = $imgStmt->fetchAll(PDO::FETCH_COLUMN);
        }
    } catch (Throwable $e) {
        $project = null;
    }
}

if (!$project) {
    ?>
    <section class="gallery-hero">
        <div class="gallery-hero-copy">
            <span class="eyebrow">Build Gallery</span>
            <h1>Project Not Found</h1>
            <p>The project build you are looking for does not exist or is no longer available in our records.</p>
            <a href="gallery.php" class="button-primary" style="display:inline-block;margin-top:1rem;">← Back to Gallery</a>
        </div>
    </section>
    <?php
    require_once 'includes/footer.php';
    exit;
}

$pageTitle = $project['title'] . " | 4x4 Defender Parts Build";
$heroImage = $project['featured_image'] ?: ($images[0] ?? 'assets/images/fabrication.jpg');
$displayImages = $images;
if ($heroImage && !in_array($heroImage, $displayImages, true)) {
    array_unshift($displayImages, $heroImage);
}
?>

<section class="gallery-hero">
    <div class="gallery-hero-copy">
        <span class="eyebrow"><?php echo htmlspecialchars($project['category']); ?> Specialism</span>
        <h1><?php echo htmlspecialchars($project['title']); ?></h1>
        <p><?php echo htmlspecialchars($project['description']); ?></p>
        <a href="gallery.php" class="button-secondary" style="display:inline-block;margin-top:1rem;">← Back to Build Gallery</a>
    </div>
</section>

<section class="project-detail" style="max-width: 1200px; margin: 2rem auto; padding: 0 1.5rem;">
    <div class="project-detail-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 2rem;">
        <div class="gallery-panel glass-card" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 1.5rem; padding: 1.5rem;">
            <div class="gallery-main" style="position: relative; overflow: hidden; border-radius: 1rem; margin-bottom: 1rem;">
                <img id="projectMainImage" src="<?php echo htmlspecialchars($heroImage); ?>" alt="<?php echo htmlspecialchars($project['title']); ?>" style="width: 100%; height: 420px; object-fit: cover; border-radius: 1rem;" />
            </div>
            <?php if (!empty($displayImages)): ?>
                <div class="product-gallery" style="display: flex; gap: 0.75rem; overflow-x: auto; padding-bottom: 0.5rem;">
                    <?php foreach ($displayImages as $index => $src): ?>
                        <button type="button" class="product-thumb<?php echo $index === 0 ? ' active' : ''; ?>" data-src="<?php echo htmlspecialchars($src); ?>" style="border: 1px solid rgba(255,255,255,0.2); background: transparent; padding: 2px; border-radius: 8px; cursor: pointer; flex-shrink: 0;">
                            <img src="<?php echo htmlspecialchars($src); ?>" alt="Project thumbnail <?php echo $index + 1; ?>" style="width: 70px; height: 55px; object-fit: cover; border-radius: 6px;" />
                        </button>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>

        <aside class="project-info glass-card" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 1.5rem; padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem;">
            <div class="project-stats" style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1rem;">
                <div><strong style="display:block; color:var(--text-muted); font-size:0.75rem; text-transform:uppercase;">Category</strong><span style="color:#62c428; font-weight:700;"><?php echo htmlspecialchars($project['category']); ?></span></div>
                <div><strong style="display:block; color:var(--text-muted); font-size:0.75rem; text-transform:uppercase;">Completion</strong><span><?php echo htmlspecialchars($project['completion_date'] ?: 'Active'); ?></span></div>
                <div><strong style="display:block; color:var(--text-muted); font-size:0.75rem; text-transform:uppercase;">Photos</strong><span><?php echo count($displayImages); ?></span></div>
            </div>

            <div class="project-description">
                <h2 style="font-size: 1.3rem; margin-bottom: 0.75rem;">Build Overview</h2>
                <p style="line-height: 1.6; color: rgba(255,255,255,0.85);"><?php echo nl2br(htmlspecialchars($project['description'])); ?></p>
            </div>

            <?php if (!empty($project['modifications'])): ?>
                <div>
                    <h3 style="font-size: 1.1rem; color: #62c428; margin-bottom: 0.5rem;">Key Modifications</h3>
                    <p style="line-height: 1.5; color: rgba(255,255,255,0.8); font-size: 0.9rem;"><?php echo nl2br(htmlspecialchars($project['modifications'])); ?></p>
                </div>
            <?php endif; ?>

            <?php if (!empty($project['installed_parts'])): ?>
                <div>
                    <h3 style="font-size: 1.1rem; color: #62c428; margin-bottom: 0.5rem;">Installed Components</h3>
                    <p style="line-height: 1.5; color: rgba(255,255,255,0.8); font-size: 0.9rem;"><?php echo nl2br(htmlspecialchars($project['installed_parts'])); ?></p>
                </div>
            <?php endif; ?>
        </aside>
    </div>

    <!-- Before & After Comparison (if images present) -->
    <?php if (!empty($project['before_image']) || !empty($project['after_image'])): ?>
        <div style="margin-top: 3rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 1.5rem; padding: 2rem;">
            <h2 style="font-size: 1.4rem; text-align: center; margin-bottom: 1.5rem; color: #62c428;">Transformation Showcase</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
                <?php if (!empty($project['before_image'])): ?>
                    <div style="text-align: center;">
                        <span style="display: inline-block; background: rgba(255,255,255,0.1); padding: 0.3rem 1rem; border-radius: 4px; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.75rem;">BEFORE</span>
                        <img src="<?php echo htmlspecialchars($project['before_image']); ?>" alt="Before restoration" style="width: 100%; height: 260px; object-fit: cover; border-radius: 1rem;" />
                    </div>
                <?php endif; ?>
                <?php if (!empty($project['after_image'])): ?>
                    <div style="text-align: center;">
                        <span style="display: inline-block; background: #62c428; color: #000; padding: 0.3rem 1rem; border-radius: 4px; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.75rem;">AFTER</span>
                        <img src="<?php echo htmlspecialchars($project['after_image']); ?>" alt="After restoration" style="width: 100%; height: 260px; object-fit: cover; border-radius: 1rem;" />
                    </div>
                <?php endif; ?>
            </div>
        </div>
    <?php endif; ?>
</section>

<script>
    const mainImage = document.getElementById('projectMainImage');
    const thumbs = document.querySelectorAll('.product-thumb');
    thumbs.forEach((thumb) => {
        thumb.addEventListener('click', () => {
            const src = thumb.dataset.src;
            if (!src || !mainImage) return;
            mainImage.src = src;
            thumbs.forEach((btn) => btn.style.borderColor = 'rgba(255,255,255,0.2)');
            thumb.style.borderColor = '#62c428';
        });
    });
</script>

<?php require_once 'includes/footer.php'; ?>
