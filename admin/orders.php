<?php
/**
 * Team 4x4 Admin — Order Management
 */
$pageId = 'orders';
$pageTitle = 'Order Management';
$pageBreadcrumb = 'Commerce';
require_once __DIR__ . '/includes/layout-start.php';
?>

<p class="text-muted" style="margin:-0.5rem 0 1rem">Manage workshop pickups, islandwide deliveries, customer items, and payment processing.</p>

<div class="admin-tabs" id="orderTabs">
    <button type="button" class="admin-tab active" data-tab="pending">⏳ Pending</button>
    <button type="button" class="admin-tab" data-tab="confirmed">✅ Confirmed</button>
    <button type="button" class="admin-tab" data-tab="processing">⚙️ Processing</button>
    <button type="button" class="admin-tab" data-tab="completed">🏁 Completed</button>
    <button type="button" class="admin-tab" data-tab="cancelled">❌ Cancelled</button>
</div>

<div class="admin-tab-panel active" data-tab="pending">
    <div class="admin-card"><div class="admin-table-wrap">
        <table class="admin-table"><thead><tr>
            <th>Order Ref</th><th>Customer</th><th>Vehicle</th><th>Fulfillment</th>
            <th>Total (LKR)</th><th>Payment</th><th>Date</th><th>Actions</th>
        </tr></thead><tbody id="ordersPending"></tbody></table>
    </div></div>
</div>

<div class="admin-tab-panel" data-tab="confirmed">
    <div class="admin-card"><div class="admin-table-wrap">
        <table class="admin-table"><thead><tr>
            <th>Order Ref</th><th>Customer</th><th>Vehicle</th><th>Fulfillment</th>
            <th>Total (LKR)</th><th>Payment</th><th>Date</th><th>Actions</th>
        </tr></thead><tbody id="ordersConfirmed"></tbody></table>
    </div></div>
</div>

<div class="admin-tab-panel" data-tab="processing">
    <div class="admin-card"><div class="admin-table-wrap">
        <table class="admin-table"><thead><tr>
            <th>Order Ref</th><th>Customer</th><th>Vehicle</th><th>Fulfillment</th>
            <th>Total (LKR)</th><th>Payment</th><th>Date</th><th>Actions</th>
        </tr></thead><tbody id="ordersProcessing"></tbody></table>
    </div></div>
</div>

<div class="admin-tab-panel" data-tab="completed">
    <div class="admin-card"><div class="admin-table-wrap">
        <table class="admin-table"><thead><tr>
            <th>Order Ref</th><th>Customer</th><th>Vehicle</th><th>Fulfillment</th>
            <th>Total (LKR)</th><th>Payment</th><th>Date</th><th>Actions</th>
        </tr></thead><tbody id="ordersCompleted"></tbody></table>
    </div></div>
</div>

<div class="admin-tab-panel" data-tab="cancelled">
    <div class="admin-card"><div class="admin-table-wrap">
        <table class="admin-table"><thead><tr>
            <th>Order Ref</th><th>Customer</th><th>Vehicle</th><th>Fulfillment</th>
            <th>Total (LKR)</th><th>Payment</th><th>Date</th><th>Actions</th>
        </tr></thead><tbody id="ordersCancelled"></tbody></table>
    </div></div>
</div>

<!-- Order Detail Modal -->
<div id="orderDetailModal" style="display:none;position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);align-items:center;justify-content:center;">
    <div style="background:var(--carbon-3);border:1px solid var(--glass-border);border-radius:var(--radius);padding:2rem;width:min(620px,95vw);max-height:90vh;overflow-y:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
            <h3 style="margin:0;" id="modalOrderTitle">Order Details</h3>
            <button type="button" id="closeOrderModal" style="background:transparent;border:none;color:var(--text-muted);font-size:1.5rem;cursor:pointer;">×</button>
        </div>
        <div id="modalOrderContent"></div>
        <div style="display:flex;gap:0.75rem;margin-top:1.5rem;flex-wrap:wrap;" id="modalOrderActions"></div>
    </div>
</div>

<script>
document.addEventListener("DOMContentLoaded", () => {
    let allOrders = [];
    const modal = document.getElementById('orderDetailModal');
    
    document.getElementById('closeOrderModal').addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

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

    function loadOrders() {
        fetch('../backend/manage-orders.php')
            .then(res => res.json())
            .then(data => {
                allOrders = data.orders || [];
                renderAllOrders();
            })
            .catch(() => {
                showToast('Failed to connect to orders backend', 'red');
            });
    }

    function renderAllOrders() {
        const pending = document.getElementById('ordersPending');
        const confirmed = document.getElementById('ordersConfirmed');
        const processing = document.getElementById('ordersProcessing');
        const completed = document.getElementById('ordersCompleted');
        const cancelled = document.getElementById('ordersCancelled');

        pending.innerHTML = '';
        confirmed.innerHTML = '';
        processing.innerHTML = '';
        completed.innerHTML = '';
        cancelled.innerHTML = '';

        if (!allOrders.length) {
            const emptyMsg = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);">No orders found.</td></tr>';
            pending.innerHTML = emptyMsg;
            confirmed.innerHTML = emptyMsg;
            processing.innerHTML = emptyMsg;
            completed.innerHTML = emptyMsg;
            cancelled.innerHTML = emptyMsg;
            return;
        }

        allOrders.forEach(o => {
            const ref = o.whatsapp_reference || `ORD-${o.id}`;
            const targetTbody = o.status === 'pending' ? pending 
                : o.status === 'confirmed' ? confirmed 
                : o.status === 'processing' ? processing
                : o.status === 'completed' ? completed 
                : cancelled;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${ref}</strong></td>
                <td><strong>${escapeHtml(o.customer_name)}</strong><br><span style="font-size:0.78rem;color:var(--text-muted);">${escapeHtml(o.phone || '')}</span></td>
                <td>${escapeHtml(o.vehicle_model || '—')}</td>
                <td><span class="admin-badge ${o.fulfillment_type === 'delivery' ? 'admin-badge-gold' : 'admin-badge-blue'}">${escapeHtml(o.fulfillment_type || 'pickup')}</span></td>
                <td class="text-gold">LKR ${Number(o.total_amount).toLocaleString()}</td>
                <td><span class="admin-badge ${o.payment_status === 'paid' ? 'admin-badge-green' : 'admin-badge-silver'}">${escapeHtml(o.payment_status || 'unpaid')}</span></td>
                <td><span style="font-size:0.8rem;color:var(--text-muted);">${(o.created_at || '').substring(0,10)}</span></td>
                <td class="admin-table-actions">
                    <button type="button" class="btn-view-order" data-id="${o.id}">👁 View</button>
                    ${o.status === 'pending' ? `<button type="button" class="btn-confirm-order" data-id="${o.id}" style="color:#4ade80;border-color:rgba(74,222,128,.3);">✅ Confirm</button>` : ''}
                    ${o.status === 'confirmed' ? `<button type="button" class="btn-complete-order" data-id="${o.id}" style="color:#4ade80;border-color:rgba(74,222,128,.3);">🏁 Complete</button>` : ''}
                    ${(o.status === 'pending' || o.status === 'confirmed') ? `<button type="button" class="btn-cancel-order" data-id="${o.id}" style="color:#f87171;border-color:rgba(248,113,113,.3);">❌ Cancel</button>` : ''}
                    <a href="invoice.php?id=${o.id}" target="_blank" class="admin-btn-ghost" style="padding:0.3rem 0.6rem;font-size:0.75rem;">🖨 Inv</a>
                </td>
            `;
            targetTbody.appendChild(row);
        });

        // Attach action handlers
        document.querySelectorAll('.btn-view-order').forEach(btn => {
            btn.addEventListener('click', e => {
                const id = Number(e.target.dataset.id);
                fetch(`../backend/manage-orders.php?id=${id}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.order) openOrderModal(data.order);
                    });
            });
        });

        document.querySelectorAll('.btn-confirm-order').forEach(btn => {
            btn.addEventListener('click', e => updateOrderStatus(Number(e.target.dataset.id), 'confirmed'));
        });

        document.querySelectorAll('.btn-complete-order').forEach(btn => {
            btn.addEventListener('click', e => updateOrderStatus(Number(e.target.dataset.id), 'completed', 'paid'));
        });

        document.querySelectorAll('.btn-cancel-order').forEach(btn => {
            btn.addEventListener('click', e => {
                const id = Number(e.target.dataset.id);
                if (confirm(`Cancel order #${id}?`)) {
                    updateOrderStatus(id, 'cancelled');
                }
            });
        });
    }

    function openOrderModal(order) {
        document.getElementById('modalOrderTitle').textContent = `Order ${order.whatsapp_reference || ('#' + order.id)}`;
        
        let itemsHtml = '';
        if (order.items && order.items.length > 0) {
            itemsHtml = order.items.map(i => `
                <div style="display:flex;justify-content:space-between;padding:0.35rem 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:0.85rem;">
                    <span>${escapeHtml(i.product_title)} (x${i.quantity})</span>
                    <span style="color:var(--gold);">LKR ${Number(i.price * i.quantity).toLocaleString()}</span>
                </div>
            `).join('');
        }

        document.getElementById('modalOrderContent').innerHTML = `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem;">
                <div><p style="font-size:0.72rem;text-transform:uppercase;letter-spacing:.1em;color:var(--text-muted);margin:0 0 0.2rem">Customer</p><p style="margin:0;font-weight:600">${escapeHtml(order.customer_name)}</p></div>
                <div><p style="font-size:0.72rem;text-transform:uppercase;letter-spacing:.1em;color:var(--text-muted);margin:0 0 0.2rem">Phone</p><p style="margin:0">${escapeHtml(order.phone || '—')}</p></div>
                <div><p style="font-size:0.72rem;text-transform:uppercase;letter-spacing:.1em;color:var(--text-muted);margin:0 0 0.2rem">Vehicle</p><p style="margin:0">${escapeHtml(order.vehicle_model || '—')}</p></div>
                <div><p style="font-size:0.72rem;text-transform:uppercase;letter-spacing:.1em;color:var(--text-muted);margin:0 0 0.2rem">Fulfillment</p><p style="margin:0">${escapeHtml(order.fulfillment_type || 'pickup')}</p></div>
                <div><p style="font-size:0.72rem;text-transform:uppercase;letter-spacing:.1em;color:var(--text-muted);margin:0 0 0.2rem">Delivery Fee</p><p style="margin:0">LKR ${Number(order.delivery_fee || 0).toLocaleString()}</p></div>
                <div><p style="font-size:0.72rem;text-transform:uppercase;letter-spacing:.1em;color:var(--text-muted);margin:0 0 0.2rem">Total Amount</p><p style="margin:0;color:var(--gold);font-weight:700">LKR ${Number(order.total_amount).toLocaleString()}</p></div>
                <div><p style="font-size:0.72rem;text-transform:uppercase;letter-spacing:.1em;color:var(--text-muted);margin:0 0 0.2rem">Status</p><p style="margin:0">${escapeHtml(order.status)}</p></div>
                <div><p style="font-size:0.72rem;text-transform:uppercase;letter-spacing:.1em;color:var(--text-muted);margin:0 0 0.2rem">Payment Method</p><p style="margin:0">${escapeHtml(order.payment_method || 'Cash')}</p></div>
                ${order.address ? `<div style="grid-column:1/-1;"><p style="font-size:0.72rem;text-transform:uppercase;letter-spacing:.1em;color:var(--text-muted);margin:0 0 0.2rem">Delivery Address</p><p style="margin:0">${escapeHtml(order.address)}, ${escapeHtml(order.district || '')}</p></div>` : ''}
                ${order.notes ? `<div style="grid-column:1/-1;"><p style="font-size:0.72rem;text-transform:uppercase;letter-spacing:.1em;color:var(--text-muted);margin:0 0 0.2rem">Notes</p><p style="margin:0">${escapeHtml(order.notes)}</p></div>` : ''}
            </div>
            <div style="margin-top:1rem;">
                <h4 style="margin:0 0 0.5rem;font-size:0.9rem;color:var(--gold);">Order Items</h4>
                ${itemsHtml}
            </div>
        `;

        const actionsEl = document.getElementById('modalOrderActions');
        actionsEl.innerHTML = '';

        if (order.status === 'pending') {
            addModalBtn(actionsEl, '✅ Confirm Order', 'gold', () => { updateOrderStatus(order.id, 'confirmed'); modal.style.display = 'none'; });
            addModalBtn(actionsEl, '❌ Cancel Order', 'red', () => { updateOrderStatus(order.id, 'cancelled'); modal.style.display = 'none'; });
        } else if (order.status === 'confirmed') {
            addModalBtn(actionsEl, '🏁 Complete & Pay', 'green', () => { updateOrderStatus(order.id, 'completed', 'paid'); modal.style.display = 'none'; });
            addModalBtn(actionsEl, '❌ Cancel Order', 'red', () => { updateOrderStatus(order.id, 'cancelled'); modal.style.display = 'none'; });
        }

        if (order.phone) {
            const wa = `https://wa.me/${order.phone.replace(/\D/g,'')}?text=${encodeURIComponent('Hi ' + order.customer_name + ', regarding your Team 4x4 order ' + (order.whatsapp_reference || ('#' + order.id)) + '.')}`;
            addModalBtn(actionsEl, '💬 WhatsApp Customer', 'ghost', () => window.open(wa, '_blank'));
        }

        addModalBtn(actionsEl, '🖨 Printable Invoice', 'ghost', () => window.open(`invoice.php?id=${order.id}`, '_blank'));

        modal.style.display = 'flex';
    }

    function addModalBtn(container, label, type, action) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = label;
        if (type === 'gold') {
            btn.className = 'admin-btn-gold';
        } else if (type === 'red') {
            btn.style.cssText = 'padding:0.65rem 1.15rem;border-radius:999px;border:1px solid rgba(248,113,113,0.3);background:rgba(248,113,113,0.1);color:#f87171;font-weight:600;font-size:0.8rem;cursor:pointer;';
        } else if (type === 'green') {
            btn.style.cssText = 'padding:0.65rem 1.15rem;border-radius:999px;border:1px solid rgba(74,222,128,0.3);background:rgba(74,222,128,0.1);color:#4ade80;font-weight:600;font-size:0.8rem;cursor:pointer;';
        } else {
            btn.className = 'admin-btn-ghost';
        }
        btn.addEventListener('click', action);
        container.appendChild(btn);
    }

    function updateOrderStatus(id, newStatus, paymentStatus = null) {
        const formData = new FormData();
        formData.append('action', 'update_status');
        formData.append('id', id);
        formData.append('status', newStatus);
        if (paymentStatus) formData.append('payment_status', paymentStatus);
        formData.append('csrf_token', window.csrfToken || '');

        fetch('../backend/manage-orders.php', { method: 'POST', body: formData })
            .then(res => res.json())
            .then(res => {
                if (res.status === 'success') {
                    showToast(`Order #${id} status updated to ${newStatus}.`, newStatus === 'cancelled' ? 'red' : 'gold');
                    loadOrders();
                } else {
                    alert(res.message || 'Failed to update status');
                }
            });
    }

    function escapeHtml(str) {
        return String(str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    loadOrders();
    AdminUI.initTabs();
});
</script>

<?php require_once __DIR__ . '/includes/layout-end.php'; ?>
