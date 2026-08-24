/**
 * 4x4 Defender Parts Admin — Chart.js dashboards (requires live AdminData from API)
 */
function initAdminCharts() {
    if (typeof Chart === 'undefined' || !window.AdminData) return;

    Chart.defaults.color = 'rgba(242, 242, 242, 0.65)';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.08)';
    Chart.defaults.font.family = 'Inter, system-ui, sans-serif';

    const gold = '#62c428';

    const revenueCanvas = document.getElementById('revenueChart');
    if (revenueCanvas) {
        if (window._revChart) window._revChart.destroy();
        const monthLabels = [];
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            monthLabels.push(d.toLocaleDateString('en-GB', { month: 'short' }));
        }
        window._revChart = new Chart(revenueCanvas, {
            type: 'line',
            data: {
                labels: monthLabels,
                datasets: [{
                    label: 'Revenue (LKR)',
                    data: AdminData.revenueMonthly || [],
                    borderColor: gold,
                    backgroundColor: 'rgba(255, 206, 46, 0.12)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: gold,
                    pointRadius: 4,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (v) => v >= 1000000 ? `LKR ${(v / 1000000).toFixed(1)}M` : `LKR ${Number(v).toLocaleString()}`,
                        },
                    },
                },
            },
        });
    }

    const statusCanvas = document.getElementById('ordersStatusChart');
    if (statusCanvas) {
        if (window._statChart) window._statChart.destroy();
        const s = AdminData.ordersByStatus || { pending: 0, confirmed: 0, processing: 0, completed: 0, cancelled: 0 };
        window._statChart = new Chart(statusCanvas, {
            type: 'doughnut',
            data: {
                labels: ['Pending', 'Confirmed', 'Processing', 'Completed', 'Cancelled'],
                datasets: [{
                    data: [s.pending || 0, s.confirmed || 0, s.processing || 0, s.completed || 0, s.cancelled || 0],
                    backgroundColor: [gold, '#60a5fa', '#a78bfa', '#4ade80', '#f87171'],
                    borderWidth: 0,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
            },
        });
    }
}
