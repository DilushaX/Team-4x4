<?php
/**
 * Team 4x4 Admin — Inventory & Stock Management
 */
$pageId = 'inventory';
$pageTitle = 'Inventory Management';
$pageBreadcrumb = 'Workshop';
require_once __DIR__ . '/includes/layout-start.php';
?>

<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:1rem;">
    <p class="text-muted" style="margin:0">Track parts stock, low inventory thresholds, and audit physical movements.</p>
</div>

<div class="admin-tabs" id="invTabs">
    <button type="button" class="admin-tab active" data-tab="current">📦 Current Stock</button>
    <button type="button" class="admin-tab" data-tab="low">⚠️ Low Stock Alerts</button>
    <button type="button" class="admin-tab" data-tab="history">📜 Movement Logs</button>
</div>

<div class="admin-tab-panel active" data-tab="current">
    <div class="admin-card">
        <div class="admin-table-wrap">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Product Title</th>
                        <th>SKU</th>
                        <th>Stock Level</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="invCurrent">
                    <tr><td colspan="5" style="text-align:center;color:var(--text-muted);">Loading inventory…</td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<div class="admin-tab-panel" data-tab="low">
    <div class="admin-card">
        <div class="admin-table-wrap">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Product Title</th>
                        <th>SKU</th>
                        <th>Current Stock</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="invLow">
                    <tr><td colspan="4" style="text-align:center;color:var(--text-muted);">Loading low stock items…</td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<div class="admin-tab-panel" data-tab="history">
    <div class="admin-card">
        <div class="admin-table-wrap">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Date & Time</th>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Change</th>
                        <th>Reason</th>
                    </tr>
                </thead>
                <tbody id="invHistory">
                    <tr><td colspan="5" style="text-align:center;color:var(--text-muted);">Loading movement logs…</td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Stock Adjust Modal -->
<div id="adjustModal" style="display:none;position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);align-items:center;justify-content:center;">
    <div style="background:var(--carbon-3);border:1px solid var(--glass-border);border-radius:var(--radius);padding:2rem;width:min(440px,95vw);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;">
            <h3 style="margin:0;">Adjust Stock</h3>
            <button type="button" id="closeAdjustModal" style="background:transparent;border:none;color:var(--text-muted);font-size:1.5rem;cursor:pointer;">×</button>
        </div>
        <form id="adjustForm">
            <input type="hidden" id="adjustProdId" name="id" />
            <input type="hidden" name="action" value="adjust_stock" />
            <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>" />

            <div style="margin-bottom:1rem;">
                <p style="margin:0;font-weight:600;" id="adjustProdTitle">Product Title</p>
                <p style="margin:0.25rem 0 0;font-size:0.83rem;color:var(--text-muted);">Current Stock: <strong id="adjustCurrentStock" style="color:var(--gold);">0</strong></p>
            </div>

            <div class="admin-field" style="margin-bottom:1rem;">
                <label>Stock Quantity Change (+ to add, - to reduce) *</label>
                <input type="number" id="adjustQty" name="quantity_changed" required placeholder="e.g. +5 or -2" />
            </div>

            <div class="admin-field" style="margin-bottom:1.25rem;">
                <label>Adjustment Reason *</label>
                <input type="text" id="adjustReason" name="reason" required placeholder="e.g. Workshop Restock / Damage Replacement" />
            </div>

            <div style="display:flex;gap:0.75rem;">
                <button type="submit" class="admin-btn-gold" style="flex:1;" id="saveAdjustBtn">Save Adjustment</button>
                <button type="button" id="cancelAdjustModal" style="flex:1;padding:0.65rem 1.15rem;border-radius:999px;border:1px solid var(--glass-border);background:transparent;color:var(--text-muted);cursor:pointer;">Cancel</button>
            </div>
        </form>
    </div>
</div>

<script>
document.addEventListener("DOMContentLoaded", () => {
    const invCurrent = document.getElementById("invCurrent");
    const invLow = document.getElementById("invLow");
    const invHistory = document.getElementById("invHistory");
    const modal = document.getElementById("adjustModal");
    let productsList = [];

    document.getElementById('closeAdjustModal').addEventListener('click', () => modal.style.display = 'none');
    document.getElementById('cancelAdjustModal').addEventListener('click', () => modal.style.display = 'none');

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

    function loadInventory() {
        fetch('../backend/manage-inventory.php')
            .then(res => res.json())
            .then(data => {
                productsList = data.products || [];
                renderTables(data);
            })
            .catch(() => {
                invCurrent.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#f87171;">Failed to load inventory data.</td></tr>';
            });
    }

    function renderTables(data) {
        // Current Stock
        if (productsList.length === 0) {
            invCurrent.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">No products found.</td></tr>';
        } else {
            invCurrent.innerHTML = productsList.map(p => `
                <tr>
                    <td><strong>${p.title}</strong></td>
                    <td><span style="font-family:monospace;font-size:0.8rem;color:var(--text-muted);">${p.sku || '—'}</span></td>
                    <td><strong style="color:${p.stock <= 3 ? '#f87171' : 'var(--text)'};">${p.stock}</strong></td>
                    <td>${p.stock === 0 ? '<span class="admin-badge admin-badge-red">Out of Stock</span>' : (p.stock <= 3 ? '<span class="admin-badge admin-badge-gold">Low Stock</span>' : '<span class="admin-badge admin-badge-green">In Stock</span>')}</td>
                    <td class="admin-table-actions">
                        <button type="button" class="btn-adjust-stock" data-id="${p.id}">⚙️ Adjust Stock</button>
                    </td>
                </tr>
            `).join('');
        }

        // Low Stock
        const lowItems = productsList.filter(p => p.stock <= 3);
        if (lowItems.length === 0) {
            invLow.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);">No low stock items. All stock levels healthy!</td></tr>';
        } else {
            invLow.innerHTML = lowItems.map(p => `
                <tr>
                    <td><strong>${p.title}</strong></td>
                    <td><span style="font-family:monospace;font-size:0.8rem;color:var(--text-muted);">${p.sku || '—'}</span></td>
                    <td><span class="admin-badge admin-badge-red">${p.stock} units remaining</span></td>
                    <td class="admin-table-actions">
                        <button type="button" class="btn-adjust-stock" data-id="${p.id}">⚙️ Restock</button>
                    </td>
                </tr>
            `).join('');
        }

        // History
        const movements = data.movements || [];
        if (movements.length === 0) {
            invHistory.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">No movement logs recorded.</td></tr>';
        } else {
            invHistory.innerHTML = movements.map(m => `
                <tr>
                    <td><span style="font-size:0.82rem;color:var(--text-muted);">${m.date}</span></td>
                    <td><strong>${m.name}</strong></td>
                    <td><span style="font-family:monospace;font-size:0.8rem;color:var(--text-muted);">${m.sku || '—'}</span></td>
                    <td><strong style="color:${m.quantity_changed > 0 ? '#4ade80' : '#f87171'};">${m.quantity_changed > 0 ? '+' : ''}${m.quantity_changed}</strong></td>
                    <td><span style="font-size:0.85rem;">${m.reason}</span></td>
                </tr>
            `).join('');
        }

        // Attach listeners
        document.querySelectorAll('.btn-adjust-stock').forEach(btn => {
            btn.addEventListener('click', e => {
                const id = Number(e.target.dataset.id);
                const prod = productsList.find(p => Number(p.id) === id);
                if (!prod) return;

                document.getElementById('adjustProdId').value = prod.id;
                document.getElementById('adjustProdTitle').textContent = prod.title;
                document.getElementById('adjustCurrentStock').textContent = prod.stock;
                document.getElementById('adjustQty').value = '';
                document.getElementById('adjustReason').value = '';
                modal.style.display = 'flex';
            });
        });
    }

    document.getElementById('adjustForm').addEventListener('submit', e => {
        e.preventDefault();
        const formData = new FormData(document.getElementById('adjustForm'));

        fetch('../backend/manage-inventory.php', { method: 'POST', body: formData })
            .then(res => res.json())
            .then(res => {
                if (res.status === 'success') {
                    showToast('Stock level adjusted and movement logged.', 'gold');
                    modal.style.display = 'none';
                    loadInventory();
                } else {
                    alert(res.message || 'Failed to adjust stock');
                }
            });
    });

    loadInventory();
    AdminUI.initTabs();
});
</script>

<?php require_once __DIR__ . '/includes/layout-end.php'; ?>
