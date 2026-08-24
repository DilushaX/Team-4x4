<?php
/**
 * 4x4 Defender Parts Admin — Projects Overview
 */
$pageId = 'projects';
$pageTitle = 'Project Management';
$pageBreadcrumb = 'Workshop';
require_once __DIR__ . '/includes/layout-start.php';
?>

<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:1rem;">
    <p class="text-muted" style="margin:0">Track active restoration and custom 4x4 engineering projects.</p>
    <a href="gallery-management.php" class="admin-btn-gold">+ New Build Project</a>
</div>

<div class="admin-grid-3" id="projectsGrid">
    <div class="admin-card" style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--text-muted);">Loading projects from database…</div>
</div>

<script>
document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("projectsGrid");

    fetch('../backend/manage-gallery.php')
        .then(res => res.json())
        .then(data => {
            const projects = data.projects || [];
            if (projects.length === 0) {
                grid.innerHTML = '<div class="admin-card" style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--text-muted);">No projects found in database.</div>';
                return;
            }
            grid.innerHTML = projects.map(p => `
                <div class="admin-card admin-card-interactive">
                    <div class="admin-card-header" style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem;">
                        <h3 style="margin:0;font-size:1.05rem;">${p.title}</h3>
                        <span class="admin-badge admin-badge-gold">${p.category}</span>
                    </div>
                    <p class="text-muted" style="font-size:0.85rem;margin:0 0 1rem;">${(p.description || '').substring(0, 90)}…</p>
                    <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.78rem;color:var(--text-muted);margin-bottom:1rem;">
                        <span>Completion: <strong>${p.completion_date || '—'}</strong></span>
                        <span>Order: <strong>${p.project_order || 0}</strong></span>
                    </div>
                    <div class="admin-table-actions">
                        <a href="../project.php?slug=${encodeURIComponent(p.slug)}" target="_blank" class="admin-btn-ghost" style="padding:0.35rem 0.75rem;font-size:0.78rem;">👁 Public Page</a>
                        <a href="gallery-management.php" class="admin-btn-gold" style="padding:0.35rem 0.75rem;font-size:0.78rem;">⚙️ Edit in Gallery</a>
                    </div>
                </div>
            `).join('');
        })
        .catch(() => {
            grid.innerHTML = '<div class="admin-card" style="grid-column:1/-1;text-align:center;padding:2rem;color:#f87171;">Failed to load projects.</div>';
        });
});
</script>

<?php require_once __DIR__ . '/includes/layout-end.php'; ?>
