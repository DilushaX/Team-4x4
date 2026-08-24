#!/usr/bin/env python3
"""Generate 4X4 DEFENDER PARTS admin management pages."""

import os

BASE = os.path.dirname(os.path.abspath(__file__))

HEAD = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>4X4 DEFENDER PARTS Admin | {title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="css/admin.css" />
    {extra_head}
</head>
<body class="admin-body" data-admin-page="{page_id}" data-admin-title="{title}" data-admin-breadcrumb="{breadcrumb}">

<div id="admin-page-content">
{content}
</div>

<script src="js/admin-data.js"></script>
<script src="js/admin-shell.js"></script>
<script src="js/admin.js"></script>
{extra_scripts}
</body>
</html>
'''

def write_page(filename, page_id, title, breadcrumb, content, extra_head='', extra_scripts=''):
    html = HEAD.format(
        title=title, page_id=page_id, breadcrumb=breadcrumb,
        content=content, extra_head=extra_head, extra_scripts=extra_scripts
    )
    with open(os.path.join(BASE, filename), 'w') as f:
        f.write(html)
    print(f'Created {filename}')

# PRODUCTS
write_page('products.html', 'products', 'Product Management', 'Parts Catalog',
'''<div class="flex-between mb-1">
    <p class="text-muted" style="margin:0">Manage shop parts, pricing, stock, and featured items.</p>
    <button type="button" class="admin-btn-gold">+ Add Product</button>
</div>
<div class="admin-card mb-1">
    <div class="admin-form-grid">
        <div class="admin-field"><label>Search Products</label><input type="search" id="productSearch" placeholder="Name, SKU, category..." /></div>
        <div class="admin-field"><label>Category</label><select><option>All Categories</option><option>Performance</option><option>Exterior</option><option>Lighting</option></select></div>
    </div>
</div>
<div class="admin-card">
    <div class="admin-table-wrap">
        <table class="admin-table" id="productsTable">
            <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Price (LKR)</th><th>Stock</th><th>Featured</th><th>Actions</th></tr></thead>
            <tbody id="productsBody"></tbody>
        </table>
    </div>
</div>''',
extra_scripts='''<script>
document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.getElementById("productsBody");
    AdminData.products.forEach(p => {
        tbody.innerHTML += `<tr>
            <td><strong>${p.name}</strong></td><td>${p.sku}</td><td>${p.category}</td>
            <td class="text-gold">${AdminUI.formatLKR(p.price)}</td>
            <td>${p.stock <= 3 ? `<span class="admin-badge admin-badge-red">${p.stock}</span>` : p.stock}</td>
            <td>${p.featured ? '<span class="admin-badge admin-badge-gold">Yes</span>' : '—'}</td>
            <td class="admin-table-actions">
                <button type="button">Edit</button><button type="button">Images</button><button type="button">Delete</button>
            </td></tr>`;
    });
    document.getElementById("productSearch")?.addEventListener("input", (e) => {
        const q = e.target.value.toLowerCase();
        tbody.querySelectorAll("tr").forEach(r => r.style.display = r.textContent.toLowerCase().includes(q) ? "" : "none");
    });
});
</script>''')

# CATEGORIES
write_page('categories.html', 'categories', 'Category Management', 'Parts Catalog',
'''<div class="flex-between mb-1">
    <p class="text-muted" style="margin:0">Organize parts library categories for the shop.</p>
    <button type="button" class="admin-btn-gold">+ Add Category</button>
</div>
<div class="admin-grid-3" id="categoriesGrid"></div>
<div class="admin-card mt-1">
    <div class="admin-card-header"><h3>Add / Edit Category</h3></div>
    <form class="admin-form-grid">
        <div class="admin-field"><label>Category Name</label><input type="text" placeholder="e.g. Suspension" /></div>
        <div class="admin-field"><label>Slug</label><input type="text" placeholder="suspension" /></div>
        <div class="admin-field full"><label>Description</label><textarea placeholder="Category description for shop filters"></textarea></div>
        <div class="full"><button type="button" class="admin-btn-gold">Save Category</button></div>
    </form>
</div>''',
extra_scripts='''<script>
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("categoriesGrid").innerHTML = AdminData.categories.map(c => `
        <div class="admin-card admin-card-interactive">
            <h3 style="margin:0 0 0.5rem">${c}</h3>
            <p class="text-muted" style="font-size:0.85rem;margin:0 0 1rem">${Math.floor(Math.random()*20+5)} products</p>
            <div class="admin-table-actions"><button type="button">Edit</button><button type="button">Delete</button></div>
        </div>`).join("");
});
</script>''')

# ORDERS
write_page('orders.html', 'orders', 'Order Management', 'Commerce',
'''<p class="text-muted" style="margin:-0.5rem 0 1rem">Manage workshop pickups, islandwide deliveries, and payment status.</p>
<div class="admin-tabs">
    <button type="button" class="admin-tab active" data-tab="pending">Pending</button>
    <button type="button" class="admin-tab" data-tab="confirmed">Confirmed</button>
    <button type="button" class="admin-tab" data-tab="completed">Completed</button>
    <button type="button" class="admin-tab" data-tab="cancelled">Cancelled</button>
</div>
<div class="admin-tab-panel active" data-tab="pending"><div class="admin-card"><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Order ID</th><th>Customer</th><th>Vehicle</th><th>Products</th><th>Qty</th><th>Total</th><th>Delivery</th><th>Payment</th><th>Actions</th></tr></thead><tbody id="ordersPending"></tbody></table></div></div></div>
<div class="admin-tab-panel" data-tab="confirmed"><div class="admin-card"><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Delivery</th><th>Payment</th><th>Actions</th></tr></thead><tbody id="ordersConfirmed"></tbody></table></div></div></div>
<div class="admin-tab-panel" data-tab="completed"><div class="admin-card"><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Date</th><th>Actions</th></tr></thead><tbody id="ordersCompleted"></tbody></table></div></div></div>
<div class="admin-tab-panel" data-tab="cancelled"><div class="admin-card"><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Actions</th></tr></thead><tbody id="ordersCancelled"></tbody></table></div></div></div>''',
extra_scripts='''<script>
function orderActions(o) {
    const wa = AdminUI.whatsAppLink(AdminData.settings.whatsapp, `Order ${o.id} update for ${o.customer}`);
    return `<button type="button">View</button><button type="button">Edit</button><button type="button">Complete</button><button type="button">Cancel</button><a href="invoice.html">Print</a><a href="${wa}" target="_blank">WhatsApp</a>`;
}
document.addEventListener("DOMContentLoaded", () => {
    AdminData.recentOrders.forEach(o => {
        const row = `<tr><td><strong>${o.id}</strong></td><td>${o.customer}</td><td>${o.vehicle||"—"}</td><td>Bull Bar, Shocks</td><td>2</td><td class="text-gold">${AdminUI.formatLKR(o.total)}</td><td>${o.method}</td><td>${AdminUI.statusBadge(o.payment)}</td><td class="admin-table-actions">${orderActions(o)}</td></tr>`;
        if (o.status==="pending") document.getElementById("ordersPending").innerHTML += row;
        if (o.status==="confirmed") document.getElementById("ordersConfirmed").innerHTML += `<tr><td>${o.id}</td><td>${o.customer}</td><td>${AdminUI.formatLKR(o.total)}</td><td>${o.method}</td><td>${AdminUI.statusBadge(o.payment)}</td><td class="admin-table-actions">${orderActions(o)}</td></tr>`;
        if (o.status==="completed") document.getElementById("ordersCompleted").innerHTML += `<tr><td>${o.id}</td><td>${o.customer}</td><td>${AdminUI.formatLKR(o.total)}</td><td>${o.date}</td><td class="admin-table-actions">${orderActions(o)}</td></tr>`;
        if (o.status==="cancelled") document.getElementById("ordersCancelled").innerHTML += `<tr><td>${o.id}</td><td>${o.customer}</td><td>${AdminUI.formatLKR(o.total)}</td><td class="admin-table-actions">${orderActions(o)}</td></tr>`;
    });
    AdminUI.initTabs();
});
</script>''')

# CUSTOMERS
write_page('customers.html', 'customers', 'Customer Management', 'Commerce',
'''<div class="admin-tabs">
    <button type="button" class="admin-tab active" data-tab="registered">Registered Users</button>
    <button type="button" class="admin-tab" data-tab="guest">Guest Customers</button>
</div>
<div class="admin-tab-panel active" data-tab="registered">
    <div class="admin-card"><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Total Spent</th><th>Actions</th></tr></thead><tbody id="registeredCustomers"></tbody></table></div></div>
</div>
<div class="admin-tab-panel" data-tab="guest">
    <div class="admin-card"><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Contact</th><th>Orders</th><th>Last Order</th><th>Actions</th></tr></thead><tbody><tr><td>Guest — +94 77 234 5678</td><td>1</td><td>ORD-2024-0885</td><td class="admin-table-actions"><button>View History</button><a href="#">WhatsApp</a></td></tr></tbody></table></div></div>
</div>''',
extra_scripts='''<script>
document.addEventListener("DOMContentLoaded", () => {
    AdminData.recentCustomers.filter(c=>c.type==="Registered").forEach(c => {
        document.getElementById("registeredCustomers").innerHTML += `<tr><td><strong>${c.name}</strong></td><td>${c.email}</td><td>+94 70 XXX XXXX</td><td>${c.orders}</td><td class="text-gold">${AdminUI.formatLKR(c.spent)}</td><td class="admin-table-actions"><button>View</button><button>Orders</button></td></tr>`;
    });
    AdminUI.initTabs();
});
</script>''')

# GALLERY through SETTINGS — see generate_pages2.py
print('Batch 1 done')
