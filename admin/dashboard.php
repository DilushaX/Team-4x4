<?php
/**
 * 4x4 Defender Parts Admin — Live Dashboard Command Center
 */
$pageId = 'dashboard';
$pageTitle = 'Dashboard Overview';
$pageBreadcrumb = 'Operations Portal';
$extraHead = '<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>';
require_once __DIR__ . '/includes/layout-start.php';
?>

<p class="text-muted" style="margin:-0.5rem 0 1.5rem;">Land Rover Defender restoration workshop &amp; parts command center.</p>

<!-- Live Stats Grid -->
<div class="admin-stats-grid">
    <div class="admin-stat-card">
        <div class="stat-icon">⚙️</div>
        <div class="stat-value" id="statProducts" data-count="0">0</div>
        <div class="stat-label">Total Products</div>
    </div>
    <div class="admin-stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-value" id="statOrders" data-count="0">0</div>
        <div class="stat-label">Total Orders</div>
    </div>
    <div class="admin-stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-value" id="statCustomers" data-count="0">0</div>
        <div class="stat-label">Total Customers</div>
    </div>
    <div class="admin-stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-value" id="statRevenue" data-count="0" data-currency="true">LKR 0</div>
        <div class="stat-label">Total Revenue</div>
    </div>
    <div class="admin-stat-card">
        <div class="stat-icon">🚙</div>
        <div class="stat-value" id="statProjects" data-count="0">0</div>
        <div class="stat-label">Build Projects</div>
    </div>
    <div class="admin-stat-card">
        <div class="stat-icon">⚠️</div>
        <div class="stat-value" id="statLowStock" data-count="0" style="color:#f87171;">0</div>
        <div class="stat-label">Low Stock Parts</div>
    </div>
</div>

<!-- Charts Grid -->
<div class="admin-grid-2" style="margin-bottom: 1.5rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
    <div class="admin-card">
        <div class="admin-card-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem;">
            <h3>Revenue Analytics (Monthly)</h3>
            <span style="font-size:0.8rem; color:var(--text-muted);">Completed Orders</span>
        </div>
        <div style="height: 260px; position: relative;">
            <canvas id="revenueChart"></canvas>
        </div>
    </div>
    <div class="admin-card">
        <div class="admin-card-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem;">
            <h3>Orders Breakdown</h3>
            <span style="font-size:0.8rem; color:var(--text-muted);">By Status</span>
        </div>
        <div style="height: 260px; position: relative;">
            <canvas id="ordersStatusChart"></canvas>
        </div>
    </div>
</div>

<!-- Tables Grid -->
<div class="admin-grid-2" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.5rem;">
    <!-- Recent Orders -->
    <div class="admin-card">
        <div class="admin-card-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem;">
            <h3>Recent Orders</h3>
            <a href="orders.php" class="admin-btn-ghost" style="font-size:0.78rem;">View All →</a>
        </div>
        <div class="admin-table-wrap">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody id="dashboardRecentOrders">
                    <tr><td colspan="4" style="text-align:center; color:var(--text-muted);">Loading orders…</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Low Stock Alert -->
    <div class="admin-card">
        <div class="admin-card-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem;">
            <h3>Low Stock Inventory</h3>
            <a href="inventory.php" class="admin-btn-ghost" style="font-size:0.78rem;">Manage Stock →</a>
        </div>
        <div class="admin-table-wrap">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>In Stock</th>
                    </tr>
                </thead>
                <tbody id="dashboardLowStock">
                    <tr><td colspan="3" style="text-align:center; color:var(--text-muted);">Loading stock alerts…</td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    fetch('../backend/get-dashboard-stats.php')
        .then(res => res.json())
        .then(data => {
            if (data.status !== 'success') return;
            
            // 1. Update Stat Counters
            const s = data.stats;
            document.getElementById('statProducts').dataset.count = s.products;
            document.getElementById('statProducts').textContent = s.products;
            
            document.getElementById('statOrders').dataset.count = s.orders;
            document.getElementById('statOrders').textContent = s.orders;
            
            document.getElementById('statCustomers').dataset.count = s.customers;
            document.getElementById('statCustomers').textContent = s.customers;
            
            document.getElementById('statRevenue').dataset.count = s.revenue;
            document.getElementById('statRevenue').textContent = `LKR ${Number(s.revenue).toLocaleString('en-US')}`;
            
            document.getElementById('statProjects').dataset.count = s.projects;
            document.getElementById('statProjects').textContent = s.projects;
            
            document.getElementById('statLowStock').dataset.count = s.lowStock;
            document.getElementById('statLowStock').textContent = s.lowStock;

            // Trigger Counter Animations
            if (window.AdminUI && window.AdminUI.animateCounters) {
                AdminUI.animateCounters();
            }

            // 2. Render Recent Orders
            const ordersTbody = document.getElementById('dashboardRecentOrders');
            if (data.recentOrders && data.recentOrders.length > 0) {
                ordersTbody.innerHTML = data.recentOrders.map(o => `
                    <tr>
                        <td><strong>ORD-#${o.id}</strong></td>
                        <td>${o.customer}</td>
                        <td class="text-gold">LKR ${Number(o.total).toLocaleString()}</td>
                        <td>${window.AdminUI ? AdminUI.statusBadge(o.status) : o.status}</td>
                    </tr>
                `).join('');
            } else {
                ordersTbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No recent orders found.</td></tr>';
            }

            // 3. Render Low Stock Alerts
            const stockTbody = document.getElementById('dashboardLowStock');
            if (data.lowStock && data.lowStock.length > 0) {
                stockTbody.innerHTML = data.lowStock.map(p => `
                    <tr>
                        <td><strong>${p.name}</strong></td>
                        <td><span style="font-family:monospace;font-size:0.8rem;color:var(--text-muted);">${p.sku || 'N/A'}</span></td>
                        <td><span class="admin-badge admin-badge-red">${p.stock} remaining</span></td>
                    </tr>
                `).join('');
            } else {
                stockTbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#4ade80;">All stock levels healthy!</td></tr>';
            }

            // 4. Update Window AdminData for Charts
            window.AdminData = window.AdminData || {};
            window.AdminData.revenueMonthly = data.revenueMonthly || [0,0,0,0,0,0,0,0,0,0,0,0];
            window.AdminData.ordersByStatus = data.ordersByStatus || { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
            
            if (typeof initAdminCharts === 'function') {
                initAdminCharts();
            }
        })
        .catch(err => console.error("Dashboard stats load error:", err));
});
</script>

<?php
$extraScripts = '<script src="js/admin-charts.js"></script>';
require_once __DIR__ . '/includes/layout-end.php';
?>
