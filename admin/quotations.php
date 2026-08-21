<?php
$pageId = 'quotations';
$pageTitle = 'Quotations & Estimates';
$pageBreadcrumb = 'Finance';
$extraHead = '';
require_once __DIR__ . '/includes/layout-start.php';
?>

<div class="flex-between mb-1">
    <h2>Quotations Directory</h2>
    <button type="button" class="admin-btn-gold" onclick="openQuoteModal()">+ Create Quotation</button>
</div>

<div class="admin-card">
    <table class="admin-table">
        <thead>
            <tr>
                <th>Quote #</th>
                <th>Customer</th>
                <th>Vehicle Model</th>
                <th>Phone / Email</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody id="quotationsTable">
            <tr><td colspan="8" style="text-align:center;">Loading quotations from database...</td></tr>
        </tbody>
    </table>
</div>

<!-- Modal for Create Quotation -->
<div id="quoteModal" class="admin-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:10000; align-items:center; justify-content:center; overflow-y:auto;">
    <div class="admin-card" style="width: 100%; max-width: 650px; margin: 2rem auto; position:relative;">
        <h3 class="mb-1">Create Custom Price Quotation</h3>
        <form id="quoteForm" onsubmit="saveQuote(event)">
            <input type="hidden" name="action" value="create" />
            <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>" />
            <div class="admin-grid-2 mb-1">
                <div class="form-group">
                    <label>Customer Name *</label>
                    <input type="text" name="customer_name" class="admin-input" required />
                </div>
                <div class="form-group">
                    <label>Customer Email *</label>
                    <input type="email" name="email" class="admin-input" required />
                </div>
            </div>
            <div class="admin-grid-2 mb-1">
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="text" name="phone" class="admin-input" />
                </div>
                <div class="form-group">
                    <label>Vehicle Model</label>
                    <input type="text" name="vehicle_model" class="admin-input" placeholder="e.g. Defender 110 TD5" />
                </div>
            </div>
            
            <h4 class="mt-1 mb-1">Line Items</h4>
            <div id="quoteItemsContainer">
                <div class="admin-grid-3 mb-1 quote-item-row">
                    <input type="text" name="items_description[]" class="admin-input" placeholder="Part / Service description" required />
                    <input type="number" name="items_quantity[]" class="admin-input" placeholder="Qty" value="1" min="1" required />
                    <input type="number" name="items_price[]" class="admin-input" placeholder="Unit Price (LKR)" step="0.01" required />
                </div>
            </div>
            <button type="button" class="admin-btn-secondary mb-1" onclick="addQuoteItemRow()">+ Add Item Row</button>

            <div class="flex-between mt-1">
                <button type="button" class="admin-btn-secondary" onclick="closeQuoteModal()">Cancel</button>
                <button type="submit" class="admin-btn-gold">Generate Quotation</button>
            </div>
        </form>
    </div>
</div>

<script>
async function loadQuotations() {
    const tbody = document.getElementById("quotationsTable");
    try {
        const res = await fetch("../backend/manage-quotations.php");
        const data = await res.json();
        
        if (data.status !== "success" || !data.quotations || data.quotations.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--admin-text-muted);">No quotations found in database. Click "+ Create Quotation" to start.</td></tr>`;
            return;
        }

        tbody.innerHTML = data.quotations.map(q => `
            <tr>
                <td><strong>${escapeHtml(q.quotation_number)}</strong></td>
                <td>${escapeHtml(q.customer_name)}</td>
                <td>${escapeHtml(q.vehicle_model || '—')}</td>
                <td>${escapeHtml(q.phone || '')}<br><small style="color:var(--admin-text-muted);">${escapeHtml(q.email)}</small></td>
                <td style="color:#ffce2e; font-weight:700;">LKR ${Number(q.total_amount).toLocaleString('en-US')}</td>
                <td>
                    <select class="sort-dropdown" style="background:#111; color:#fff; padding:0.2rem 0.5rem;" onchange="updateQuoteStatus(${q.id}, this.value)">
                        <option value="sent" ${q.status==='sent'?'selected':''}>Sent</option>
                        <option value="accepted" ${q.status==='accepted'?'selected':''}>Accepted</option>
                        <option value="draft" ${q.status==='draft'?'selected':''}>Draft</option>
                        <option value="expired" ${q.status==='expired'?'selected':''}>Expired</option>
                    </select>
                </td>
                <td>${q.created_at ? q.created_at.substring(0, 10) : '—'}</td>
                <td>
                    <button class="admin-btn-secondary" onclick="deleteQuote(${q.id})" style="color:#ff5555; padding:0.2rem 0.5rem; font-size:0.8rem;">Delete</button>
                </td>
            </tr>
        `).join("");
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:red;">Failed to load quotations from database.</td></tr>`;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function openQuoteModal() {
    document.getElementById("quoteModal").style.display = "flex";
}

function closeQuoteModal() {
    document.getElementById("quoteModal").style.display = "none";
    document.getElementById("quoteForm").reset();
}

function addQuoteItemRow() {
    const container = document.getElementById("quoteItemsContainer");
    const div = document.createElement("div");
    div.className = "admin-grid-3 mb-1 quote-item-row";
    div.innerHTML = `
        <input type="text" name="items_description[]" class="admin-input" placeholder="Part / Service description" required />
        <input type="number" name="items_quantity[]" class="admin-input" placeholder="Qty" value="1" min="1" required />
        <input type="number" name="items_price[]" class="admin-input" placeholder="Unit Price (LKR)" step="0.01" required />
    `;
    container.appendChild(div);
}

async function saveQuote(e) {
    e.preventDefault();
    const form = document.getElementById("quoteForm");
    const formData = new FormData(form);

    try {
        const res = await fetch("../backend/manage-quotations.php", {
            method: "POST",
            body: formData
        });
        const data = await res.json();
        if (data.status === "success") {
            closeQuoteModal();
            loadQuotations();
        } else {
            alert("Error: " + data.message);
        }
    } catch (err) {
        alert("Failed to create quotation.");
    }
}

async function updateQuoteStatus(id, newStatus) {
    const formData = new FormData();
    formData.append("action", "update_status");
    formData.append("id", id);
    formData.append("status", newStatus);
    formData.append("csrf_token", window.csrfToken || '');

    try {
        await fetch("../backend/manage-quotations.php", {
            method: "POST",
            body: formData
        });
    } catch (err) {
        alert("Failed to update status.");
    }
}

async function deleteQuote(id) {
    if (!confirm("Are you sure you want to delete this quotation?")) return;
    const formData = new FormData();
    formData.append("action", "delete");
    formData.append("id", id);
    formData.append("csrf_token", window.csrfToken || '');

    try {
        const res = await fetch("../backend/manage-quotations.php", {
            method: "POST",
            body: formData
        });
        const data = await res.json();
        if (data.status === "success") {
            loadQuotations();
        } else {
            alert("Error: " + data.message);
        }
    } catch (err) {
        alert("Failed to delete quotation.");
    }
}

document.addEventListener("DOMContentLoaded", loadQuotations);
</script>

<?php require_once __DIR__ . '/includes/layout-end.php'; ?>
