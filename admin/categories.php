<?php
/**
 * 4x4 Defender Parts Admin — Category Management
 */
$pageId = 'categories';
$pageTitle = 'Category Management';
$pageBreadcrumb = 'Parts Catalog';
require_once __DIR__ . '/includes/layout-start.php';
?>

<div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1.25rem;flex-wrap:wrap;">
    <p class="text-muted" style="margin:0">Organize parts library categories for the shop catalog.</p>
    <button type="button" class="admin-btn-gold" id="addCategoryBtn">+ Add Category</button>
</div>

<div class="admin-grid-3" id="categoriesGrid">
    <div class="admin-card" style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--text-muted);">Loading categories from database…</div>
</div>

<!-- Add/Edit Category Modal -->
<div id="categoryModal" style="display:none;position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);align-items:center;justify-content:center;">
    <div style="background:var(--carbon-3);border:1px solid var(--glass-border);border-radius:var(--radius);padding:2rem;width:min(440px,95vw);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;">
            <h3 style="margin:0;" id="categoryModalTitle">Add Category</h3>
            <button type="button" id="closeCategoryModal" style="background:transparent;border:none;color:var(--text-muted);font-size:1.5rem;cursor:pointer;">×</button>
        </div>
        <form id="categoryForm">
            <input type="hidden" id="editCategoryId" name="id" />
            <input type="hidden" id="categoryAction" name="action" value="add" />
            <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>" />
            <div class="admin-field" style="margin-bottom:1rem;">
                <label>Category Name *</label>
                <input type="text" id="categoryName" name="name" required placeholder="e.g. Suspension" />
            </div>
            <div class="admin-field" style="margin-bottom:1rem;">
                <label>Description</label>
                <input type="text" id="categoryDesc" name="description" placeholder="Optional description" />
            </div>
            <div style="display:flex;gap:0.75rem;margin-top:1rem;">
                <button type="submit" class="admin-btn-gold" style="flex:1;" id="saveCategoryBtn">Save</button>
                <button type="button" id="cancelCategoryModal" style="flex:1;padding:0.65rem 1.15rem;border-radius:999px;border:1px solid var(--glass-border);background:transparent;color:var(--text-muted);cursor:pointer;">Cancel</button>
            </div>
        </form>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('categoriesGrid');
    const modal = document.getElementById('categoryModal');
    let categoriesList = [];

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

    function loadCategories() {
        fetch('../backend/manage-categories.php')
            .then(res => res.json())
            .then(data => {
                categoriesList = data.categories || [];
                renderCategories();
            })
            .catch(() => {
                grid.innerHTML = '<div class="admin-card" style="grid-column:1/-1;text-align:center;padding:2rem;color:#f87171;">Failed to load categories.</div>';
            });
    }

    function renderCategories() {
        if (!categoriesList.length) {
            grid.innerHTML = '<div class="admin-card" style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--text-muted);">No categories in database yet. Click "+ Add Category" to create one.</div>';
            return;
        }
        grid.innerHTML = categoriesList.map(c => `
            <div class="admin-card admin-card-interactive">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:.5rem;margin-bottom:.5rem;">
                    <div>
                        <h3 style="margin:0 0 0.2rem;font-size:1rem;">${c.name}</h3>
                        ${c.description ? `<p style="font-size:0.82rem;color:var(--text-muted);margin:0 0 0.5rem;">${c.description}</p>` : ''}
                    </div>
                    <span class="admin-badge ${c.status ? 'admin-badge-green' : 'admin-badge-silver'}">${c.status ? 'Active' : 'Inactive'}</span>
                </div>
                <div class="admin-table-actions" style="margin-top:.85rem;">
                    <button type="button" class="btn-cat-edit" data-id="${c.id}">✏️ Edit</button>
                    <button type="button" class="btn-cat-status" data-id="${c.id}">${c.status ? '⏸ Deactivate' : '▶ Activate'}</button>
                    <button type="button" class="btn-cat-delete" data-id="${c.id}" style="color:#f87171;border-color:rgba(248,113,113,0.3);">🗑 Delete</button>
                </div>
            </div>`).join('');

        grid.querySelectorAll('.btn-cat-edit').forEach(btn => {
            btn.addEventListener('click', e => {
                const cat = categoriesList.find(c => Number(c.id) === Number(e.target.dataset.id));
                if (!cat) return;
                document.getElementById('categoryModalTitle').textContent = 'Edit Category';
                document.getElementById('categoryAction').value = 'edit';
                document.getElementById('editCategoryId').value = cat.id;
                document.getElementById('categoryName').value = cat.name;
                document.getElementById('categoryDesc').value = cat.description || '';
                document.getElementById('saveCategoryBtn').textContent = 'Update';
                modal.style.display = 'flex';
            });
        });

        grid.querySelectorAll('.btn-cat-status').forEach(btn => {
            btn.addEventListener('click', e => {
                const id = Number(e.target.dataset.id);
                const formData = new FormData();
                formData.append('action', 'toggle_status');
                formData.append('id', id);
                formData.append('csrf_token', window.csrfToken || '');

                fetch('../backend/manage-categories.php', { method: 'POST', body: formData })
                    .then(res => res.json())
                    .then(res => {
                        if (res.status === 'success') {
                            showToast('Category status updated.', 'gold');
                            loadCategories();
                        }
                    });
            });
        });

        grid.querySelectorAll('.btn-cat-delete').forEach(btn => {
            btn.addEventListener('click', e => {
                const id = Number(e.target.dataset.id);
                const cat = categoriesList.find(c => Number(c.id) === id);
                if (!confirm(`Delete category "${cat ? cat.name : id}"?`)) return;

                const formData = new FormData();
                formData.append('action', 'delete');
                formData.append('id', id);
                formData.append('csrf_token', window.csrfToken || '');

                fetch('../backend/manage-categories.php', { method: 'POST', body: formData })
                    .then(res => res.json())
                    .then(res => {
                        if (res.status === 'success') {
                            showToast(`Category deleted.`, 'red');
                            loadCategories();
                        } else {
                            alert(res.message || 'Unable to delete category');
                        }
                    });
            });
        });
    }

    document.getElementById('addCategoryBtn').addEventListener('click', () => {
        document.getElementById('categoryModalTitle').textContent = 'Add Category';
        document.getElementById('categoryAction').value = 'add';
        document.getElementById('editCategoryId').value = '';
        document.getElementById('categoryName').value = '';
        document.getElementById('categoryDesc').value = '';
        document.getElementById('saveCategoryBtn').textContent = 'Save';
        modal.style.display = 'flex';
    });

    document.getElementById('closeCategoryModal').addEventListener('click', () => modal.style.display = 'none');
    document.getElementById('cancelCategoryModal').addEventListener('click', () => modal.style.display = 'none');

    document.getElementById('categoryForm').addEventListener('submit', e => {
        e.preventDefault();
        const formData = new FormData(document.getElementById('categoryForm'));

        fetch('../backend/manage-categories.php', { method: 'POST', body: formData })
            .then(res => res.json())
            .then(res => {
                if (res.status === 'success') {
                    showToast(res.message || 'Category saved successfully.', 'gold');
                    modal.style.display = 'none';
                    loadCategories();
                } else {
                    alert(res.message || 'Failed to save category');
                }
            });
    });

    loadCategories();
});
</script>

<?php require_once __DIR__ . '/includes/layout-end.php'; ?>
