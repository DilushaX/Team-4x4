<?php
/**
 * Team 4x4 Admin — Customer Management
 */
$pageId = 'customers';
$pageTitle = 'Customer Management';
$pageBreadcrumb = 'Commerce';
require_once __DIR__ . '/includes/layout-start.php';
?>

<p class="text-muted" style="margin:-0.5rem 0 1rem">View customer profiles, registered accounts, phone contacts, and order history.</p>

<div class="admin-card">
    <div class="admin-form-grid" style="margin-bottom:1rem;">
        <div class="admin-field"><label>Search Customers</label><input type="search" id="customerSearch" placeholder="Name, email, or phone…" /></div>
    </div>
    <div class="admin-table-wrap">
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Customer Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Vehicle Model</th>
                    <th>Orders</th>
                    <th>Lifetime Spend</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="customersTableBody">
                <tr><td colspan="7" style="text-align:center;color:var(--text-muted);">Loading customers from database…</td></tr>
            </tbody>
        </table>
    </div>
</div>

<!-- Customer Detail Modal -->
<div id="customerModal" style="display:none;position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);align-items:center;justify-content:center;">
    <div style="background:var(--carbon-3);border:1px solid var(--glass-border);border-radius:var(--radius);padding:2rem;width:min(540px,95vw);max-height:90vh;overflow-y:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
            <h3 style="margin:0;" id="customerModalTitle">Customer Profile</h3>
            <button type="button" id="closeCustomerModal" style="background:transparent;border:none;color:var(--text-muted);font-size:1.5rem;cursor:pointer;">×</button>
        </div>
        <div id="customerModalContent"></div>
        <div style="display:flex;gap:0.75rem;margin-top:1.5rem;flex-wrap:wrap;" id="customerModalActions"></div>
    </div>
</div>

<script>
document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.getElementById('customersTableBody');
    const modal = document.getElementById('customerModal');
    const searchInput = document.getElementById('customerSearch');
    let allCustomers = [];

    document.getElementById('closeCustomerModal').addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

    function loadCustomers(q = '') {
        const url = q ? `../backend/manage-customers.php?search=${encodeURIComponent(q)}` : '../backend/manage-customers.php';
        fetch(url)
            .then(res => res.json())
            .then(data => {
                allCustomers = data.customers || [];
                renderCustomers(allCustomers);
            })
            .catch(() => {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#f87171;">Failed to load customers.</td></tr>';
            });
    }

    function renderCustomers(customers) {
        if (!customers.length) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);">No customers found in database.</td></tr>';
            return;
        }

        tbody.innerHTML = customers.map(c => `
            <tr>
                <td><strong>${c.name}</strong></td>
                <td><span style="color:var(--text-muted);font-size:.82rem">${c.email}</span></td>
                <td><span style="color:var(--text-muted);font-size:.82rem">${c.phone || '—'}</span></td>
                <td>${c.vehicle_model || '—'}</td>
                <td><strong>${c.total_orders || 0}</strong></td>
                <td class="text-gold">LKR ${Number(c.lifetime_value || 0).toLocaleString()}</td>
                <td class="admin-table-actions">
                    <button type="button" class="btn-view-customer" data-id="${c.id}">👁 Profile</button>
                    ${c.phone ? `<a href="https://wa.me/${c.phone.replace(/\D/g,'')}?text=${encodeURIComponent('Hi ' + c.name + ', Team 4x4 workshop reaching out regarding your vehicle build.')}" target="_blank" title="WhatsApp">💬 WA</a>` : ''}
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('.btn-view-customer').forEach(btn => {
            btn.addEventListener('click', e => {
                const id = Number(e.target.dataset.id);
                fetch(`../backend/manage-customers.php?id=${id}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.customer) openCustomerModal(data.customer);
                    });
            });
        });
    }

    function escapeHtml(str) {
        return String(str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;');
    }

    function openCustomerModal(c) {
        document.getElementById('customerModalTitle').textContent = c.name;
        
        let ordersHtml = '';
        if (c.orders_history && c.orders_history.length > 0) {
            ordersHtml = c.orders_history.map(o => `
                <div style="display:flex;justify-content:space-between;padding:0.4rem 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:0.83rem;">
                    <span>Order #${o.id} (${o.created_at || ''})</span>
                    <span style="color:var(--gold);font-weight:600;">LKR ${Number(o.total_amount).toLocaleString()}</span>
                    <span>${window.AdminUI ? AdminUI.statusBadge(o.status) : o.status}</span>
                </div>
            `).join('');
        } else {
            ordersHtml = '<p style="font-size:0.82rem;color:var(--text-muted);">No orders recorded yet.</p>';
        }

        document.getElementById('customerModalContent').innerHTML = `
            <form id="customerEditForm">
                <input type="hidden" name="id" value="${c.id}" />
                <div class="admin-form-grid">
                    <div class="admin-field"><label>Name</label><input type="text" name="name" id="custEditName" value="${escapeHtml(c.name)}" required /></div>
                    <div class="admin-field"><label>Phone</label><input type="text" name="phone" id="custEditPhone" value="${escapeHtml(c.phone || '')}" /></div>
                    <div class="admin-field full" style="grid-column:1/-1;"><label>Address</label><textarea name="address" id="custEditAddress" rows="2">${escapeHtml(c.address || '')}</textarea></div>
                    <div class="admin-field"><label>Vehicle Model</label><input type="text" name="vehicle_model" id="custEditVehicle" value="${escapeHtml(c.vehicle_model || '')}" /></div>
                    <div class="admin-field full" style="grid-column:1/-1;"><label>Notes</label><textarea name="notes" id="custEditNotes" rows="2">${escapeHtml(c.notes || '')}</textarea></div>
                </div>
                <p style="font-size:0.82rem;color:var(--text-muted);margin:0.75rem 0 0;">Email: ${escapeHtml(c.email)} · Lifetime: LKR ${Number(c.lifetime_value || 0).toLocaleString()}</p>
            </form>
            <div style="margin-top:1.25rem;">
                <h4 style="margin:0 0 0.5rem;font-size:0.9rem;color:var(--gold);">Order History (${c.total_orders})</h4>
                ${ordersHtml}
            </div>`;

        const actionsEl = document.getElementById('customerModalActions');
        actionsEl.innerHTML = `
            <button type="button" class="admin-btn-gold" id="saveCustomerBtn">💾 Save Profile</button>
            ${c.phone ? `<a href="https://wa.me/${c.phone.replace(/\D/g,'')}?text=${encodeURIComponent('Hi ' + c.name + ', Team 4x4 reaching out.')}" target="_blank" class="admin-btn-ghost">💬 WhatsApp</a>` : ''}
            <button type="button" class="admin-btn-ghost" onclick="document.getElementById('customerModal').style.display='none'">Close</button>`;

        document.getElementById('saveCustomerBtn').addEventListener('click', () => {
            const formData = new FormData();
            formData.append('action', 'edit');
            formData.append('id', c.id);
            formData.append('name', document.getElementById('custEditName').value);
            formData.append('phone', document.getElementById('custEditPhone').value);
            formData.append('address', document.getElementById('custEditAddress').value);
            formData.append('vehicle_model', document.getElementById('custEditVehicle').value);
            formData.append('notes', document.getElementById('custEditNotes').value);
            formData.append('csrf_token', window.csrfToken || '');

            fetch('../backend/manage-customers.php', { method: 'POST', body: formData })
                .then(res => res.json())
                .then(res => {
                    if (res.status === 'success') {
                        modal.style.display = 'none';
                        loadCustomers(searchInput?.value || '');
                    } else {
                        alert(res.message || 'Failed to update customer');
                    }
                });
        });
        
        modal.style.display = 'flex';
    }

    searchInput?.addEventListener('input', e => {
        loadCustomers(e.target.value);
    });

    loadCustomers();
});
</script>

<?php require_once __DIR__ . '/includes/layout-end.php'; ?>
