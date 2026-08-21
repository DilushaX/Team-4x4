<?php
$pageId = 'reports';
$pageTitle = 'Business Intelligence & Reports';
$pageBreadcrumb = 'Analytics';
$extraHead = '';
require_once __DIR__ . '/includes/layout-start.php';
?>

<div class="admin-grid-3 mb-2">
    <div class="admin-card admin-card-interactive" id="salesReportCard">
        <h3>📊 Sales & Revenue Summary</h3>
        <p style="color: var(--admin-text-muted); font-size: 0.85rem; margin-top: 0.25rem;">Total revenue, average order value & order volume.</p>
        <button type="button" class="admin-btn-gold mt-1" onclick="generateReport('sales')">Generate Sales Report</button>
    </div>
    <div class="admin-card admin-card-interactive" id="inventoryReportCard">
        <h3>📋 Inventory Valuation</h3>
        <p style="color: var(--admin-text-muted); font-size: 0.85rem; margin-top: 0.25rem;">Stock levels, total asset valuation & low stock items.</p>
        <button type="button" class="admin-btn-gold mt-1" onclick="generateReport('inventory')">Generate Stock Report</button>
    </div>
    <div class="admin-card admin-card-interactive" id="customerReportCard">
        <h3>👥 Customer Analytics</h3>
        <p style="color: var(--admin-text-muted); font-size: 0.85rem; margin-top: 0.25rem;">Customer lifetime value & top spending accounts.</p>
        <button type="button" class="admin-btn-gold mt-1" onclick="generateReport('customers')">Generate Customer Report</button>
    </div>
</div>

<div class="admin-card" id="reportOutputArea" style="min-height: 250px;">
    <div id="reportPlaceholder" style="text-align: center; padding: 3rem; color: var(--admin-text-muted);">
        <p style="font-size: 1.1rem; font-weight: 600;">Select a report category above to generate live analytics from MySQL database.</p>
    </div>
    <div id="reportContent" style="display: none;"></div>
</div>

<script>
async function generateReport(type) {
    const outputEl = document.getElementById('reportContent');
    const placeholderEl = document.getElementById('reportPlaceholder');
    outputEl.style.display = 'block';
    placeholderEl.style.display = 'none';
    outputEl.innerHTML = '<p style="text-align:center; padding:2rem;">Calculating database analytics...</p>';

    try {
        const res = await fetch(`../backend/manage-reports.php?type=${type}`);
        const data = await res.json();
        
        if (data.status !== 'success') {
            outputEl.innerHTML = `<p style="color:red; text-align:center;">Error generating report: ${data.message}</p>`;
            return;
        }

        if (type === 'sales') {
            const summary = data.summary;
            let html = `
                <div class="flex-between mb-1">
                    <h2>Sales & Revenue Executive Report</h2>
                    <button class="admin-btn-gold" onclick="window.print()">🖨️ Print Report</button>
                </div>
                <div class="admin-grid-3 mb-2">
                    <div class="admin-card"><h4>Total Completed Sales</h4><p class="stat-number">LKR ${Number(summary.total_sales).toLocaleString('en-US')}</p></div>
                    <div class="admin-card"><h4>Completed Orders</h4><p class="stat-number">${summary.order_count}</p></div>
                    <div class="admin-card"><h4>Average Order Value</h4><p class="stat-number">LKR ${Math.round(summary.average_order_value).toLocaleString('en-US')}</p></div>
                </div>
                <h3>Monthly Revenue Breakdown (Last 6 Months)</h3>
                <table class="admin-table mt-1">
                    <thead><tr><th>Period</th><th>Revenue (LKR)</th></tr></thead>
                    <tbody>
                        ${data.chart_data.map(item => `<tr><td><strong>${item.label}</strong></td><td>LKR ${Number(item.value).toLocaleString('en-US')}</td></tr>`).join('')}
                    </tbody>
                </table>
            `;
            outputEl.innerHTML = html;
        } else if (type === 'inventory') {
            const summary = data.summary;
            let html = `
                <div class="flex-between mb-1">
                    <h2>Inventory Asset Valuation Report</h2>
                    <button class="admin-btn-gold" onclick="window.print()">🖨️ Print Report</button>
                </div>
                <div class="admin-grid-3 mb-2">
                    <div class="admin-card"><h4>Total Inventory Asset Valuation</h4><p class="stat-number">LKR ${Number(summary.total_valuation || 0).toLocaleString('en-US')}</p></div>
                    <div class="admin-card"><h4>Total Units in Stock</h4><p class="stat-number">${summary.total_stock_count || 0}</p></div>
                    <div class="admin-card"><h4>Low Stock Alert Items</h4><p class="stat-number">${summary.low_stock_count || 0}</p></div>
                </div>
                <h3>Low Stock Items Requiring Restock</h3>
                <table class="admin-table mt-1">
                    <thead><tr><th>Product Name</th><th>SKU</th><th>Units Left</th><th>Unit Price</th></tr></thead>
                    <tbody>
                        ${data.low_stock_items.map(item => `<tr><td><strong>${item.title}</strong></td><td>${item.sku || 'N/A'}</td><td style="color:#ff5555; font-weight:700;">${item.stock}</td><td>LKR ${Number(item.price).toLocaleString('en-US')}</td></tr>`).join('')}
                    </tbody>
                </table>
            `;
            outputEl.innerHTML = html;
        } else if (type === 'customers') {
            const summary = data.summary;
            let html = `
                <div class="flex-between mb-1">
                    <h2>Customer Lifetime Value Report</h2>
                    <button class="admin-btn-gold" onclick="window.print()">🖨️ Print Report</button>
                </div>
                <div class="admin-grid-2 mb-2">
                    <div class="admin-card"><h4>Total Registered Accounts</h4><p class="stat-number">${summary.total_customers}</p></div>
                    <div class="admin-card"><h4>Top Spending Accounts</h4><p class="stat-number">${summary.active_customers}</p></div>
                </div>
                <h3>Top Spenders</h3>
                <table class="admin-table mt-1">
                    <thead><tr><th>Customer Name</th><th>Email</th><th>Completed Orders</th><th>Total Lifetime Spent</th></tr></thead>
                    <tbody>
                        ${data.top_customers.map(c => `<tr><td><strong>${c.name}</strong></td><td>${c.email}</td><td>${c.orders_count}</td><td>LKR ${Number(c.total_spent).toLocaleString('en-US')}</td></tr>`).join('')}
                    </tbody>
                </table>
            `;
            outputEl.innerHTML = html;
        }
    } catch (e) {
        outputEl.innerHTML = `<p style="color:red; text-align:center;">Failed to connect to reports API.</p>`;
    }
}
</script>

<?php require_once __DIR__ . '/includes/layout-end.php'; ?>
