<?php
/**
 * Team 4x4 Admin — Build Gallery Management
 */
$pageId = 'gallery';
$pageTitle = 'Build Gallery Management';
$pageBreadcrumb = 'Workshop';
require_once __DIR__ . '/includes/layout-start.php';
?>

<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:1rem;">
    <p class="text-muted" style="margin:0">Manage restoration and custom build showcase projects displayed on the public gallery.</p>
    <button type="button" class="admin-btn-gold" id="adminScrollToForm">+ Add New Project Build</button>
</div>

<!-- Add / Edit Project Form -->
<div class="admin-card" style="margin-bottom:1.5rem;" id="projectFormCard">
    <div class="admin-card-header">
        <h3 id="formTitle">Add New Build Project</h3>
    </div>
    <form id="galleryForm" class="admin-form-grid" enctype="multipart/form-data">
        <input type="hidden" name="id" id="buildId" />
        <input type="hidden" name="action" id="buildAction" value="add" />
        <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>" />

        <div class="admin-field" style="grid-column:1/-1;">
            <label>Build Title *</label>
            <input name="title" id="buildTitle" type="text" placeholder="Defender 110 Frame-Off Restoration" required />
        </div>
        <div class="admin-field" style="grid-column:1/-1;">
            <label>Description *</label>
            <textarea name="description" id="buildDescription" rows="3" placeholder="Comprehensive project overview and specs…" required></textarea>
        </div>
        <div class="admin-field">
            <label>Category *</label>
            <select name="category" id="buildCategory" required>
                <option value="Restoration">Restoration</option>
                <option value="Suspension">Suspension</option>
                <option value="Fabrication">Fabrication</option>
                <option value="Lighting">Lighting</option>
                <option value="Recovery">Recovery</option>
                <option value="Intake">Intake</option>
            </select>
        </div>
        <div class="admin-field">
            <label>Display Order</label>
            <input name="project_order" id="buildOrder" type="number" value="1" min="0" />
        </div>
        <div class="admin-field">
            <label>Completion Date</label>
            <input name="completion_date" id="buildCompletionDate" type="date" value="<?php echo date('Y-m-d'); ?>" />
        </div>
        <div class="admin-field">
            <label>Featured Image (Main)</label>
            <input name="featured_image" id="buildFeaturedImage" type="file" accept="image/jpeg,image/png,image/webp" />
        </div>
        <div class="admin-field">
            <label>Before Image</label>
            <input name="before_image" id="buildBeforeImage" type="file" accept="image/jpeg,image/png,image/webp" />
        </div>
        <div class="admin-field">
            <label>After Image</label>
            <input name="after_image" id="buildAfterImage" type="file" accept="image/jpeg,image/png,image/webp" />
        </div>
        <div class="admin-field" style="grid-column:1/-1;">
            <label>Additional Photos (Gallery)</label>
            <input name="images[]" id="buildImages" type="file" multiple accept="image/jpeg,image/png,image/webp" />
        </div>
        <div class="admin-field" style="grid-column:1/-1;">
            <label>Installed Parts / Modifications (one per line)</label>
            <textarea name="installed_parts" id="buildInstalledParts" rows="3" placeholder="Old Man Emu BP-51 Bypass Shocks&#10;Tactical Steel Bumper"></textarea>
        </div>

        <div class="admin-field full" style="grid-column:1/-1;display:flex;gap:0.75rem;align-items:center;margin-top:0.5rem;">
            <button type="submit" class="admin-btn-gold" id="saveBuildBtn">💾 Save Build Project</button>
            <button type="button" class="admin-btn-ghost" id="cancelBuildBtn" style="display:none;">Cancel Edit</button>
            <span id="galleryFormMessage" style="font-size:0.88rem;font-weight:600;"></span>
        </div>
    </form>
</div>

<!-- Projects Table -->
<div class="admin-card">
    <div class="admin-card-header">
        <h3>Existing Build Projects</h3>
    </div>
    <div class="admin-table-wrap">
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Build Title</th>
                    <th>Category</th>
                    <th>Slug</th>
                    <th>Completion</th>
                    <th>Order</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="buildsTable">
                <tr><td colspan="6" style="text-align:center;color:var(--text-muted);">Loading build projects…</td></tr>
            </tbody>
        </table>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const galleryForm = document.getElementById('galleryForm');
    const buildsTable = document.getElementById('buildsTable');
    const messageEl = document.getElementById('galleryFormMessage');
    const scrollToFormBtn = document.getElementById('adminScrollToForm');
    const cancelBuildBtn = document.getElementById('cancelBuildBtn');
    let projectsList = [];

    function setMessage(text, isError = false) {
        if (!messageEl) return;
        messageEl.textContent = text;
        messageEl.style.color = isError ? '#f87171' : '#4ade80';
    }

    function showToast(message, type = 'gold') {
        const existing = document.querySelector('.admin-toast');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        const color = type === 'gold' ? 'var(--gold)' : type === 'red' ? '#f87171' : '#4ade80';
        toast.style.cssText = `position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;padding:0.85rem 1.35rem;border-radius:var(--radius-sm);background:var(--carbon-3);border:1px solid ${color};color:${color};font-size:0.88rem;font-weight:600;box-shadow:0 8px 32px rgba(0,0,0,0.4);`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    function loadBuilds() {
        fetch('../backend/manage-gallery.php')
            .then(res => res.json())
            .then(data => {
                projectsList = data.projects || [];
                renderBuilds();
            })
            .catch(() => {
                buildsTable.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#f87171;">Failed to load build projects.</td></tr>';
            });
    }

    function renderBuilds() {
        if (!projectsList.length) {
            buildsTable.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">No build projects found in database.</td></tr>';
            return;
        }
        buildsTable.innerHTML = projectsList.map(p => `
            <tr>
                <td><strong>${p.title}</strong></td>
                <td><span class="admin-badge admin-badge-gold">${p.category}</span></td>
                <td><span style="font-family:monospace;font-size:0.8rem;color:var(--text-muted);">${p.slug}</span></td>
                <td>${p.completion_date || '—'}</td>
                <td>${p.project_order || 0}</td>
                <td class="admin-table-actions">
                    <a href="../project.php?slug=${encodeURIComponent(p.slug)}" target="_blank" class="admin-btn-ghost" style="padding:0.3rem 0.6rem;font-size:0.75rem;">👁 View</a>
                    <button type="button" class="btn-edit-project" data-id="${p.id}">✏️ Edit</button>
                    <button type="button" class="btn-delete-project" data-id="${p.id}" style="color:#f87171;border-color:rgba(248,113,113,0.3);">🗑 Delete</button>
                </td>
            </tr>
        `).join('');

        buildsTable.querySelectorAll('.btn-edit-project').forEach(btn => {
            btn.addEventListener('click', e => {
                const id = Number(e.target.dataset.id);
                fetch(`../backend/manage-gallery.php?id=${id}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.project) editProject(data.project);
                    });
            });
        });

        buildsTable.querySelectorAll('.btn-delete-project').forEach(btn => {
            btn.addEventListener('click', e => {
                const id = Number(e.target.dataset.id);
                const p = projectsList.find(item => Number(item.id) === id);
                if (!confirm(`Delete project "${p ? p.title : id}"?`)) return;

                const formData = new FormData();
                formData.append('action', 'delete');
                formData.append('id', id);
                formData.append('csrf_token', window.csrfToken || '');

                fetch('../backend/manage-gallery.php', { method: 'POST', body: formData })
                    .then(res => res.json())
                    .then(res => {
                        if (res.status === 'success') {
                            showToast('Build project deleted.', 'red');
                            loadBuilds();
                        } else {
                            alert(res.message || 'Failed to delete project');
                        }
                    });
            });
        });
    }

    function editProject(p) {
        document.getElementById('formTitle').textContent = 'Edit Build Project';
        document.getElementById('buildAction').value = 'edit';
        document.getElementById('buildId').value = p.id;
        document.getElementById('buildTitle').value = p.title || '';
        document.getElementById('buildDescription').value = p.description || '';
        document.getElementById('buildCategory').value = p.category || 'Restoration';
        document.getElementById('buildOrder').value = p.project_order || 1;
        document.getElementById('buildCompletionDate').value = p.completion_date || '<?php echo date('Y-m-d'); ?>';
        document.getElementById('buildInstalledParts').value = p.installed_parts || '';
        cancelBuildBtn.style.display = 'inline-block';
        document.getElementById('projectFormCard').scrollIntoView({ behavior: 'smooth' });
    }

    cancelBuildBtn.addEventListener('click', () => {
        resetForm();
    });

    function resetForm() {
        document.getElementById('formTitle').textContent = 'Add New Build Project';
        document.getElementById('buildAction').value = 'add';
        document.getElementById('buildId').value = '';
        galleryForm.reset();
        cancelBuildBtn.style.display = 'none';
        setMessage('');
    }

    galleryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        setMessage('Saving build project…', false);

        const formData = new FormData(galleryForm);

        fetch('../backend/manage-gallery.php', { method: 'POST', body: formData })
            .then(res => res.json())
            .then(res => {
                if (res.status === 'success') {
                    setMessage('✅ Project saved successfully!', false);
                    showToast('Build project saved.', 'gold');
                    resetForm();
                    loadBuilds();
                } else {
                    setMessage('⚠️ ' + (res.message || 'Unable to save project.'), true);
                }
            })
            .catch(() => setMessage('⚠️ Network connection error.', true));
    });

    scrollToFormBtn?.addEventListener('click', () => {
        resetForm();
        document.getElementById('projectFormCard').scrollIntoView({ behavior: 'smooth' });
    });

    loadBuilds();
});
</script>

<?php require_once __DIR__ . '/includes/layout-end.php'; ?>
