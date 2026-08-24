/**
 * 4x4 Defender Parts Admin — core interactions
 */
const AdminUI = {
    formatLKR(value) {
        return `LKR ${Number(value).toLocaleString('en-US')}`;
    },

    statusBadge(status) {
        const map = {
            pending: 'admin-badge-gold',
            confirmed: 'admin-badge-blue',
            completed: 'admin-badge-green',
            cancelled: 'admin-badge-red',
            paid: 'admin-badge-green',
            refunded: 'admin-badge-silver',
        };
        const cls = map[String(status).toLowerCase()] || 'admin-badge-silver';
        return `<span class="admin-badge ${cls}">${status}</span>`;
    },

    animateCounters() {
        document.querySelectorAll('[data-count]').forEach((el) => {
            const target = parseFloat(el.dataset.count);
            const isCurrency = el.dataset.currency === 'true';
            const duration = 1400;
            const start = performance.now();

            const step = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(target * eased);
                el.textContent = isCurrency ? AdminUI.formatLKR(current) : current.toLocaleString();
                if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        });
    },

    initTabs(root = document) {
        root.querySelectorAll('.admin-tabs').forEach((tabBar) => {
            const panels = tabBar.parentElement?.querySelectorAll('.admin-tab-panel');
            tabBar.querySelectorAll('.admin-tab').forEach((tab) => {
                tab.addEventListener('click', () => {
                    const id = tab.dataset.tab;
                    tabBar.querySelectorAll('.admin-tab').forEach((t) => t.classList.remove('active'));
                    tab.classList.add('active');
                    panels?.forEach((p) => {
                        p.classList.toggle('active', p.dataset.tab === id);
                    });
                });
            });
        });
    },

    whatsAppLink(phone, message) {
        const num = phone.replace(/\D/g, '');
        return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
    },
};

document.addEventListener('DOMContentLoaded', () => {
    AdminUI.animateCounters();
    AdminUI.initTabs();

    document.body.style.opacity = '0';
    requestAnimationFrame(() => {
        document.body.style.transition = 'opacity 0.35s ease';
        document.body.style.opacity = '1';
    });

    document.querySelectorAll('.admin-nav-link').forEach((link) => {
        link.addEventListener('click', () => {
            document.getElementById('adminSidebar')?.classList.remove('mobile-open');
            document.getElementById('adminSidebarOverlay')?.classList.remove('visible');
        });
    });
});

window.AdminUI = AdminUI;
