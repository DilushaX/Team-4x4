<?php
/**
 * 4x4 Defender Parts Admin — Add / Edit Product Page
 */
$pageId = 'products';
$pageTitle = 'Add / Edit Product';
$pageBreadcrumb = 'Commerce · Products';
require_once __DIR__ . '/includes/layout-start.php';
?>

<div style="margin-bottom:1.25rem;">
    <p class="text-muted" style="margin:0">Fill in the details below to add a new part to the catalog, or edit an existing one.</p>
</div>

<form id="productForm" novalidate enctype="multipart/form-data">
    <input type="hidden" name="id" id="productId" />
    <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>" />

    <div class="admin-card" style="margin-bottom:1rem;">
        <div class="admin-card-header">
            <h3>Basic Information</h3>
        </div>
        <div class="admin-form-grid">
            <div class="admin-field">
                <label>Product Name *</label>
                <input type="text" name="title" id="title" required placeholder="e.g. Tactical Bull Bar V2" />
            </div>
            <div class="admin-field">
                <label>SKU</label>
                <input type="text" name="sku" id="sku" placeholder="e.g. T4X4-BBV2" />
            </div>
            <div class="admin-field">
                <label>Category</label>
                <select name="category" id="category">
                    <option value="">Select category…</option>
                </select>
            </div>
            <div class="admin-field">
                <label>Price (LKR) *</label>
                <input type="number" name="price" id="price" step="0.01" min="0" required placeholder="0.00" />
            </div>
            <div class="admin-field">
                <label>Stock Quantity *</label>
                <input type="number" name="stock" id="stock" min="0" required placeholder="0" />
            </div>
            <div class="admin-field">
                <label>Featured</label>
                <select name="featured" id="featured">
                    <option value="0">No</option>
                    <option value="1">Yes — Show on homepage</option>
                </select>
            </div>
            <div class="admin-field full" style="grid-column:1/-1;">
                <label>Compatibility</label>
                <input type="text" name="compatibility" id="compatibility" placeholder="e.g. Defender 90 / 110 / 130 / Universal" />
            </div>
            <div class="admin-field full" style="grid-column:1/-1;">
                <label>Condition</label>
                <input type="text" name="condition" id="condition" placeholder="New / Used / Refurbished" value="New" />
            </div>
            <div class="admin-field full" style="grid-column:1/-1;">
                <label>Description</label>
                <textarea name="description" id="description" rows="4" placeholder="Describe the product, key specs, and purpose…"></textarea>
            </div>
            <div class="admin-field full" style="grid-column:1/-1;">
                <label>Features (one per line)</label>
                <textarea name="features" id="features" rows="4" placeholder="Premium raw materials&#10;Maximum trail durability&#10;Corrosion-resistant finish"></textarea>
            </div>
        </div>
    </div>

    <div class="admin-card" style="margin-bottom:1rem;">
        <div class="admin-card-header">
            <h3>Product Images</h3>
        </div>
        <div class="admin-form-grid">
            <div class="admin-field">
                <label>Main Image</label>
                <input type="file" name="image" id="image" accept="image/jpeg,image/png,image/webp" />
                <p style="font-size:0.75rem;color:var(--text-muted);margin:0.35rem 0 0;">Recommended: JPG, PNG or WEBP, max 5MB</p>
                <div id="mainImgPreview" style="margin-top:0.5rem;"></div>
            </div>
            <div class="admin-field">
                <label>Additional Images</label>
                <input type="file" name="images[]" id="images" accept="image/jpeg,image/png,image/webp" multiple />
                <p style="font-size:0.75rem;color:var(--text-muted);margin:0.35rem 0 0;">Select multiple for gallery</p>
            </div>
        </div>
    </div>

    <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;">
        <button type="submit" class="admin-btn-gold" id="submitBtn">💾 Save Product</button>
        <a href="products.php" class="admin-btn-ghost">← Back to Products</a>
        <span id="formMessage" style="font-size:0.88rem;font-weight:600;"></span>
    </div>
</form>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const qs = new URLSearchParams(location.search);
    const productId = qs.get('id');
    const form = document.getElementById('productForm');
    const msg = document.getElementById('formMessage');
    const submitBtn = document.getElementById('submitBtn');
    const categorySelect = document.getElementById('category');

    // Populate categories dynamically from MySQL
    fetch('../backend/manage-categories.php')
        .then(res => res.json())
        .then(data => {
            if (data.categories) {
                categorySelect.innerHTML = '<option value="">Select category…</option>' +
                    data.categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
                if (productId && window._loadedCategory) {
                    categorySelect.value = window._loadedCategory;
                }
            }
        });

    // If editing existing product
    if (productId) {
        document.title = '4x4 Defender Parts Admin | Edit Product';
        document.getElementById('productId').value = productId;

        fetch(`../backend/get-products.php?id=${productId}`)
            .then(res => res.json())
            .then(data => {
                const p = data.product;
                if (p) {
                    document.getElementById('title').value = p.title || '';
                    document.getElementById('sku').value = p.sku || '';
                    window._loadedCategory = p.category;
                    categorySelect.value = p.category || '';
                    document.getElementById('price').value = p.price || 0;
                    document.getElementById('stock').value = p.stock || 0;
                    document.getElementById('featured').value = (p.is_featured || p.featured) ? '1' : '0';
                    document.getElementById('compatibility').value = p.compatibility || '';
                    document.getElementById('condition').value = p.condition || 'New';
                    document.getElementById('description').value = p.description || '';
                    document.getElementById('features').value = p.features || '';

                    if (p.image_path) {
                        document.getElementById('mainImgPreview').innerHTML = `<img src="../${p.image_path}" style="height:60px;border-radius:4px;object-fit:cover;" />`;
                    }
                    submitBtn.textContent = '💾 Update Product';
                }
            });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('title').value.trim();
        const price = parseFloat(document.getElementById('price').value);

        if (!title) {
            showMsg('⚠️ Product name is required.', '#f87171');
            return;
        }
        if (isNaN(price) || price <= 0) {
            showMsg('⚠️ Please enter a valid price.', '#f87171');
            return;
        }

        submitBtn.textContent = 'Saving…';
        submitBtn.disabled = true;

        const endpoint = productId ? '../backend/edit-product.php' : '../backend/add-product.php';
        const formData = new FormData(form);

        fetch(endpoint, { method: 'POST', body: formData })
            .then(res => res.json())
            .then(res => {
                if (res.status === 'success') {
                    showMsg('✅ Product saved successfully! Redirecting…', '#4ade80');
                    setTimeout(() => { window.location.href = 'products.php'; }, 1000);
                } else {
                    showMsg('⚠️ ' + (res.message || 'Error saving product'), '#f87171');
                    submitBtn.disabled = false;
                    submitBtn.textContent = productId ? '💾 Update Product' : '💾 Save Product';
                }
            })
            .catch(err => {
                showMsg('⚠️ Network link error.', '#f87171');
                submitBtn.disabled = false;
                submitBtn.textContent = productId ? '💾 Update Product' : '💾 Save Product';
            });
    });

    function showMsg(text, color = 'var(--text-muted)') {
        msg.textContent = text;
        msg.style.color = color;
    }
});
</script>

<?php require_once __DIR__ . '/includes/layout-end.php'; ?>
