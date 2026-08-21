<?php
$pageId = 'suppliers';
$pageTitle = 'Supplier Management';
$pageBreadcrumb = 'Workshop Logistics';
$extraHead = '';
require_once __DIR__ . '/includes/layout-start.php';
?>

<div class="flex-between mb-1">
    <h2>Vendor & Supplier Directory</h2>
    <button type="button" class="admin-btn-gold" onclick="openSupplierModal()">+ Add Supplier</button>
</div>

<div class="admin-card">
    <table class="admin-table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Supplier Name</th>
                <th>Company</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Products Supplied</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody id="suppliersTable">
            <tr><td colspan="7" style="text-align:center;">Loading suppliers from database...</td></tr>
        </tbody>
    </table>
</div>

<div id="supplierModal" class="admin-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:10000; align-items:center; justify-content:center;">
    <div class="admin-card" style="width: 100%; max-width: 500px; position:relative;">
        <h3 class="mb-1" id="supplierModalTitle">Add Vendor / Supplier</h3>
        <form id="supplierForm" onsubmit="saveSupplier(event)">
            <input type="hidden" name="action" id="supplierAction" value="add" />
            <input type="hidden" name="id" id="supplierId" value="" />
            <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>" />
            <div class="form-group mb-1">
                <label>Contact Name *</label>
                <input type="text" name="name" id="supplierName" class="admin-input" required />
            </div>
            <div class="form-group mb-1">
                <label>Company / Brand</label>
                <input type="text" name="company" id="supplierCompany" class="admin-input" />
            </div>
            <div class="form-group mb-1">
                <label>Phone Number</label>
                <input type="text" name="phone" id="supplierPhone" class="admin-input" />
            </div>
            <div class="form-group mb-1">
                <label>Email Address</label>
                <input type="email" name="email" id="supplierEmail" class="admin-input" />
            </div>
            <div class="form-group mb-1">
                <label>Products / Category Supplied</label>
                <input type="text" name="products_supplied" id="supplierProducts" class="admin-input" placeholder="e.g. Suspension Shocks, Winches" />
            </div>
            <div class="flex-between mt-1">
                <button type="button" class="admin-btn-secondary" onclick="closeSupplierModal()">Cancel</button>
                <button type="submit" class="admin-btn-gold" id="supplierSaveBtn">Save Supplier</button>
            </div>
        </form>
    </div>
</div>

<script>
let suppliersCache = [];

async function loadSuppliers() {
    const tbody = document.getElementById("suppliersTable");
    try {
        const res = await fetch("../backend/manage-suppliers.php");
        const data = await res.json();
        
        if (data.status !== "success" || !data.suppliers || data.suppliers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--admin-text-muted);">No suppliers found in database. Click "+ Add Supplier" to create one.</td></tr>`;
            return;
        }

        suppliersCache = data.suppliers;
        tbody.innerHTML = data.suppliers.map(s => `
            <tr>
                <td>#${s.id}</td>
                <td><strong>${escapeHtml(s.name)}</strong></td>
                <td>${escapeHtml(s.company || '—')}</td>
                <td>${escapeHtml(s.phone || '—')}</td>
                <td>${escapeHtml(s.email || '—')}</td>
                <td>${escapeHtml(s.products_supplied || '—')}</td>
                <td>
                    <button class="admin-btn-secondary" onclick="editSupplier(${s.id})" style="padding:0.25rem 0.6rem; font-size:0.8rem; margin-right:0.35rem;">Edit</button>
                    <button class="admin-btn-secondary" onclick="deleteSupplier(${s.id})" style="color:#ff5555; padding:0.25rem 0.6rem; font-size:0.8rem;">Delete</button>
                </td>
            </tr>
        `).join("");
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">Failed to connect to supplier database.</td></tr>`;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function openSupplierModal() {
    document.getElementById("supplierModalTitle").textContent = "Add Vendor / Supplier";
    document.getElementById("supplierAction").value = "add";
    document.getElementById("supplierId").value = "";
    document.getElementById("supplierForm").reset();
    document.getElementById("supplierModal").style.display = "flex";
}

function editSupplier(id) {
    const s = suppliersCache.find(item => Number(item.id) === Number(id));
    if (!s) return;
    document.getElementById("supplierModalTitle").textContent = "Edit Supplier";
    document.getElementById("supplierAction").value = "edit";
    document.getElementById("supplierId").value = s.id;
    document.getElementById("supplierName").value = s.name || '';
    document.getElementById("supplierCompany").value = s.company || '';
    document.getElementById("supplierPhone").value = s.phone || '';
    document.getElementById("supplierEmail").value = s.email || '';
    document.getElementById("supplierProducts").value = s.products_supplied || '';
    document.getElementById("supplierModal").style.display = "flex";
}

function closeSupplierModal() {
    document.getElementById("supplierModal").style.display = "none";
    document.getElementById("supplierForm").reset();
}

async function saveSupplier(e) {
    e.preventDefault();
    const form = document.getElementById("supplierForm");
    const formData = new FormData(form);

    try {
        const res = await fetch("../backend/manage-suppliers.php", {
            method: "POST",
            body: formData
        });
        const data = await res.json();
        if (data.status === "success") {
            closeSupplierModal();
            loadSuppliers();
        } else {
            alert("Error: " + data.message);
        }
    } catch (err) {
        alert("Failed to save supplier.");
    }
}

async function deleteSupplier(id) {
    if (!confirm("Are you sure you want to delete this supplier record?")) return;
    const formData = new FormData();
    formData.append("action", "delete");
    formData.append("id", id);
    formData.append("csrf_token", window.csrfToken || '');

    try {
        const res = await fetch("../backend/manage-suppliers.php", {
            method: "POST",
            body: formData
        });
        const data = await res.json();
        if (data.status === "success") {
            loadSuppliers();
        } else {
            alert("Error: " + data.message);
        }
    } catch (err) {
        alert("Failed to delete supplier.");
    }
}

document.addEventListener("DOMContentLoaded", loadSuppliers);
</script>

<?php require_once __DIR__ . '/includes/layout-end.php'; ?>
