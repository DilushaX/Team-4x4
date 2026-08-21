<?php
/**
 * Team 4x4 Admin — Products Management
 */
$pageId = 'products';
$pageTitle = 'Product Management';
$pageBreadcrumb = 'Commerce';
require_once __DIR__ . '/includes/layout-start.php';
?>

<div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1rem;flex-wrap:wrap;">
    <p class="text-muted" style="margin:0">Manage your parts catalog, pricing, stock levels and featured items.</p>
    <button type="button" class="admin-btn-gold" id="addProductBtn">+ Add Product</button>
</div>

<div class="admin-card" style="margin-bottom:1rem;">
    <div class="admin-form-grid">
        <div class="admin-field"><label>Search Products</label><input type="search" id="productSearch" placeholder="Name, SKU, category..." /></div>
        <div class="admin-field"><label>Category</label>
            <select id="categoryFilter">
                <option value="">All Categories</option>
            </select>
        </div>
    </div>
</div>

<div class="admin-card">
    <div class="admin-table-wrap">
        <table class="admin-table" id="productsTable">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Price (LKR)</th>
                    <th>Stock</th>
                    <th>Featured</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="productsBody">
                <tr><td colspan="7" style="text-align:center;color:var(--text-muted);">Loading products from database…</td></tr>
            </tbody>
        </table>
    </div>
</div>

<!-- Edit Product Modal -->
<div id="editProductModal" style="display:none;position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,0.7);backdrop-filter:blur(6px);align-items:center;justify-content:center;">
    <div style="background:var(--carbon-3);border:1px solid var(--glass-border);border-radius:var(--radius);padding:2rem;width:min(560px,95vw);max-height:90vh;overflow-y:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
            <h3 style="margin:0;font-size:1.1rem;">Edit Product</h3>
            <button type="button" id="closeEditModal" style="background:transparent;border:none;color:var(--text-muted);font-size:1.5rem;cursor:pointer;line-height:1;">×</button>
        </div>
        <form id="editProductForm">
            <input type="hidden" id="editProductId" name="id" />
            <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>" />
            <div class="admin-form-grid">
                <div class="admin-field"><label>Product Name *</label><input type="text" id="editTitle" name="title" required /></div>
                <div class="admin-field"><label>SKU</label><input type="text" id="editSku" name="sku" /></div>
                <div class="admin-field"><label>Category</label><input type="text" id="editCategory" name="category" /></div>
                <div class="admin-field"><label>Price (LKR) *</label><input type="number" id="editPrice" name="price" step="0.01" required /></div>
                <div class="admin-field"><label>Stock Quantity *</label><input type="number" id="editStock" name="stock" required /></div>
                <div class="admin-field"><label>Featured</label>
                    <select id="editFeatured" name="featured">
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                    </select>
                </div>
                <div class="admin-field full" style="grid-column:1/-1;"><label>Compatibility</label><input type="text" id="editCompatibility" name="compatibility" /></div>
                <div class="admin-field full" style="grid-column:1/-1;"><label>Description</label><textarea id="editDescription" name="description" rows="3"></textarea></div>
                <div class="admin-field full" style="grid-column:1/-1;"><label>Features (one per line)</label><textarea id="editFeatures" name="features" rows="3"></textarea></div>
            </div>
            <div style="display:flex;gap:0.75rem;margin-top:1.5rem;">
                <button type="submit" class="admin-btn-gold" style="flex:1;" id="saveEditBtn">Save Changes</button>
                <button type="button" id="cancelEditModal" style="flex:1;padding:0.65rem 1.15rem;border-radius:999px;border:1px solid var(--glass-border);background:transparent;color:var(--text-muted);cursor:pointer;">Cancel</button>
            </div>
            <div id="editModalMsg" style="margin-top:0.75rem;font-size:0.85rem;"></div>
        </form>
    </div>
</div>

<script>
document.addEventListener("DOMContentLoaded", () => {
    let allProducts = [];

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

    // Load categories for filter dropdown
    fetch('../backend/manage-categories.php')
        .then(res => res.json())
        .then(data => {
            const categoryFilter = document.getElementById("categoryFilter");
            if (categoryFilter && data.categories) {
                categoryFilter.innerHTML = '<option value="">All Categories</option>' +
                    data.categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
            }
        }).catch(() => {});

    // Load products from MySQL
    function loadProducts() {
        fetch('../backend/get-products.php')
            .then(res => res.json())
            .then(data => {
                allProducts = data.products || [];
                applyFilters();
            })
            .catch(err => {
                const tbody = document.getElementById("productsBody");
                if (tbody) {
                    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#f87171;">Failed to load products. Try again.</td></tr>';
                }
            });
    }

    function renderProducts(products) {
        const tbody = document.getElementById("productsBody");
        if (!tbody) return;
        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);">No products found.</td></tr>';
            return;
        }
        tbody.innerHTML = products.map(p => `
            <tr>
                <td><strong>${p.title || p.name}</strong></td>
                <td><span style="font-family:monospace;font-size:0.8rem;color:var(--text-muted)">${p.sku || '—'}</span></td>
                <td>${p.category || 'General'}</td>
                <td class="text-gold">LKR ${Number(p.price).toLocaleString()}</td>
                <td>${p.stock <= 3
                    ? `<span class="admin-badge admin-badge-red">${p.stock} low</span>`
                    : `<span style="color:var(--text)">${p.stock}</span>`
                }</td>
                <td>${(p.featured || p.is_featured) ? '<span class="admin-badge admin-badge-gold">Yes</span>' : '<span class="admin-badge admin-badge-silver">No</span>'}</td>
                <td class="admin-table-actions">
                    <button type="button" class="btn-edit" data-id="${p.id}" title="Edit product">✏️ Edit</button>
                    <button type="button" class="btn-toggle-featured" data-id="${p.id}" data-featured="${(p.featured || p.is_featured) ? 1 : 0}">${(p.featured || p.is_featured) ? '⭐ Unfeature' : '☆ Feature'}</button>
                    <button type="button" class="btn-delete" data-id="${p.id}" style="color:#f87171;border-color:rgba(248,113,113,0.3);">🗑 Delete</button>
                </td>
            </tr>`).join('');
        attachRowHandlers();
    }

    function attachRowHandlers() {
        const tbody = document.getElementById("productsBody");
        if (!tbody) return;

        tbody.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = Number(e.target.dataset.id);
                fetch(`../backend/get-products.php?id=${id}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.product) openEditModal(data.product);
                    });
            });
        });

        tbody.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = Number(e.target.dataset.id);
                const p = allProducts.find(item => Number(item.id) === id);
                if (!confirm(`Delete product "${p ? p.title : id}"? This action cannot be undone.`)) return;

                const formData = new FormData();
                formData.append('id', id);
                formData.append('csrf_token', window.csrfToken || '');

                fetch('../backend/delete-product.php', { method: 'POST', body: formData })
                    .then(res => res.json())
                    .then(res => {
                        if (res.status === 'success') {
                            showToast('Product deleted.', 'red');
                            loadProducts();
                        } else {
                            alert(res.message || 'Unable to delete product');
                        }
                    });
            });
        });

        tbody.querySelectorAll('.btn-toggle-featured').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = Number(e.target.dataset.id);
                const currentFeatured = Number(e.target.dataset.featured);
                const newFeatured = currentFeatured ? 0 : 1;

                const formData = new FormData();
                formData.append('id', id);
                formData.append('action', 'toggle_featured');
                formData.append('featured', newFeatured);
                formData.append('csrf_token', window.csrfToken || '');

                fetch('../backend/edit-product.php', { method: 'POST', body: formData })
                    .then(res => res.json())
                    .then(res => {
                        if (res.status === 'success') {
                            showToast('Product featured status updated.', 'gold');
                            loadProducts();
                        } else {
                            alert(res.message || 'Unable to toggle featured status');
                        }
                    });
            });
        });
    }

    function applyFilters() {
        const searchInput = document.getElementById("productSearch");
        const categoryFilter = document.getElementById("categoryFilter");
        const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const cat = categoryFilter ? categoryFilter.value : '';
        const filtered = allProducts.filter(p => {
            const name = (p.title || p.name || '').toLowerCase();
            const sku = (p.sku || '').toLowerCase();
            const pCat = (p.category || '').toLowerCase();
            const matchSearch = !q || name.includes(q) || sku.includes(q) || pCat.includes(q);
            const matchCat = !cat || p.category === cat;
            return matchSearch && matchCat;
        });
        renderProducts(filtered);
    }

    document.getElementById("productSearch")?.addEventListener('input', applyFilters);
    document.getElementById("categoryFilter")?.addEventListener('change', applyFilters);

    document.getElementById('addProductBtn')?.addEventListener('click', () => {
        window.location.href = 'add-product.php';
    });

    function openEditModal(p) {
        document.getElementById('editProductId').value = p.id;
        document.getElementById('editTitle').value = p.title || p.name || '';
        document.getElementById('editSku').value = p.sku || '';
        document.getElementById('editCategory').value = p.category || '';
        document.getElementById('editPrice').value = p.price || 0;
        document.getElementById('editStock').value = p.stock || 0;
        document.getElementById('editFeatured').value = (p.is_featured || p.featured) ? '1' : '0';
        document.getElementById('editCompatibility').value = p.compatibility || '';
        document.getElementById('editDescription').value = p.description || '';
        document.getElementById('editFeatures').value = p.features || '';
        document.getElementById('editModalMsg').textContent = '';
        document.getElementById('editProductModal').style.display = 'flex';
    }

    document.getElementById('closeEditModal')?.addEventListener('click', closeEditModal);
    document.getElementById('cancelEditModal')?.addEventListener('click', closeEditModal);

    function closeEditModal() {
        document.getElementById('editProductModal').style.display = 'none';
    }

    document.getElementById('editProductForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = document.getElementById('saveEditBtn');
        btn.disabled = true;
        btn.textContent = 'Saving…';

        const formData = new FormData(document.getElementById('editProductForm'));

        fetch('../backend/edit-product.php', { method: 'POST', body: formData })
            .then(res => res.json())
            .then(res => {
                btn.disabled = false;
                btn.textContent = 'Save Changes';
                if (res.status === 'success') {
                    showToast('Product updated successfully.', 'gold');
                    closeEditModal();
                    loadProducts();
                } else {
                    document.getElementById('editModalMsg').textContent = '⚠️ ' + (res.message || 'Failed to update product');
                    document.getElementById('editModalMsg').style.color = '#f87171';
                }
            })
            .catch(() => {
                btn.disabled = false;
                btn.textContent = 'Save Changes';
                document.getElementById('editModalMsg').textContent = '⚠️ Network error.';
                document.getElementById('editModalMsg').style.color = '#f87171';
            });
    });

    loadProducts();
});
</script>


<?php require_once __DIR__ . '/includes/layout-end.php'; ?>
