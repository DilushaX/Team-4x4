/**
 * Team 4x4 Admin — layout shell injector
 */
(function () {
    const page = document.body.dataset.adminPage || 'dashboard';
    const title = document.body.dataset.adminTitle || 'Dashboard';
    const breadcrumb = document.body.dataset.adminBreadcrumb || 'Operations Portal';

    function buildNav(activeId) {
        return AdminNav.map((item) => {
            if (item.section) {
                return `<p class="admin-nav-section">${item.section}</p>`;
            }
            const active = item.id === activeId ? ' active' : '';
            return `<a href="${item.href}" class="admin-nav-link${active}" data-page="${item.id}">
                <span class="nav-icon">${item.icon}</span>
                <span class="label">${item.label}</span>
            </a>`;
        }).join('');
    }

    function buildShell(contentHtml) {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        return `
        <div class="admin-sidebar-overlay" id="adminSidebarOverlay"></div>
        <aside class="admin-sidebar" id="adminSidebar">
            <div class="admin-sidebar-brand">
                <div class="brand-icon">🚙</div>
                <div class="brand-text">
                    <p class="brand-title">TEAM 4X4</p>
                    <p class="brand-sub">Admin Command</p>
                </div>
            </div>
            <nav class="admin-nav" aria-label="Admin navigation">
                ${buildNav(page)}
            </nav>
            <div class="admin-sidebar-footer">
                <a href="../logout.php" class="admin-nav-link logout">
                    <span class="nav-icon">🚪</span>
                    <span class="label">Logout</span>
                </a>
            </div>
        </aside>
        <div class="admin-main">
            <header class="admin-topbar">
                <button type="button" class="admin-topbar-toggle" id="adminSidebarToggle" aria-label="Toggle sidebar">☰</button>
                <div class="admin-search">
                    <span class="search-icon">🔍</span>
                    <input type="search" placeholder="Search orders, products, customers..." aria-label="Search admin" />
                </div>
                <div class="admin-topbar-actions">
                    <span class="admin-datetime">${dateStr} · ${timeStr}</span>
                    <button type="button" class="admin-icon-btn" aria-label="Notifications">🔔<span class="badge"></span></button>
                    <button type="button" class="admin-btn-gold" id="adminQuickAdd"><span>+</span> <span class="hide-mobile">Quick Add</span></button>
                    <div class="admin-profile">
                        <div class="avatar">${(window.adminUser?.name || 'Admin').split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}</div>
                        <span class="name">${window.adminUser?.name || 'Admin'}</span>
                    </div>
                </div>
            </header>
            <main class="admin-content">
                <div class="admin-page-header">
                    <p class="admin-breadcrumb">${breadcrumb}</p>
                    <h1>${title}</h1>
                </div>
                ${contentHtml}
            </main>
        </div>`;
    }

    function init() {
        const contentEl = document.getElementById('admin-page-content');
        if (!contentEl) return;

        const app = document.createElement('div');
        app.className = 'admin-app';
        app.id = 'adminApp';
        app.innerHTML = buildShell('');
        const mainContent = app.querySelector('.admin-content');
        while (contentEl.firstChild) {
            mainContent.appendChild(contentEl.firstChild);
        }
        document.body.insertBefore(app, document.body.firstChild);
        contentEl.remove();

        document.getElementById('adminSidebarToggle')?.addEventListener('click', () => {
            const sidebar = document.getElementById('adminSidebar');
            const overlay = document.getElementById('adminSidebarOverlay');
            if (window.innerWidth <= 1023) {
                sidebar?.classList.toggle('mobile-open');
                overlay?.classList.toggle('visible');
            } else {
                sidebar?.classList.toggle('collapsed');
                app.classList.toggle('sidebar-collapsed');
            }
        });

        document.getElementById('adminSidebarOverlay')?.addEventListener('click', () => {
            document.getElementById('adminSidebar')?.classList.remove('mobile-open');
            document.getElementById('adminSidebarOverlay')?.classList.remove('visible');
        });

        document.getElementById('adminQuickAdd')?.addEventListener('click', () => {
            window.location.href = 'add-product.php';
        });

        initAdminSearch();

        // Update clock every minute
        setInterval(() => {
            const el = document.querySelector('.admin-datetime');
            if (!el) return;
            const n = new Date();
            el.textContent = `${n.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} · ${n.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
        }, 60000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function initAdminSearch() {
        const input = document.querySelector('.admin-search input[type="search"]');
        if (!input) return;

        let dropdown = document.getElementById('adminSearchDropdown');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.id = 'adminSearchDropdown';
            dropdown.style.cssText = 'display:none;position:absolute;top:calc(100% + 0.35rem);left:0;right:0;z-index:2000;background:var(--carbon-3,#16181a);border:1px solid rgba(255,255,255,0.12);border-radius:8px;max-height:320px;overflow-y:auto;box-shadow:0 12px 40px rgba(0,0,0,0.45);';
            const wrap = input.closest('.admin-search');
            if (wrap) {
                wrap.style.position = 'relative';
                wrap.appendChild(dropdown);
            }
        }

        let timer = null;
        input.addEventListener('input', () => {
            clearTimeout(timer);
            const q = input.value.trim();
            if (q.length < 2) {
                dropdown.style.display = 'none';
                return;
            }
            timer = setTimeout(async () => {
                try {
                    const res = await fetch(`../backend/admin-search.php?q=${encodeURIComponent(q)}`);
                    const data = await res.json();
                    const results = data.results || [];
                    if (!results.length) {
                        dropdown.innerHTML = '<div style="padding:0.85rem 1rem;color:var(--text-muted);font-size:0.85rem;">No results found.</div>';
                    } else {
                        dropdown.innerHTML = results.map(r => `
                            <a href="${r.url}" style="display:block;padding:0.75rem 1rem;text-decoration:none;color:inherit;border-bottom:1px solid rgba(255,255,255,0.06);">
                                <div style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--gold,#ffce2e);">${r.type}</div>
                                <div style="font-weight:600;font-size:0.88rem;">${escapeHtml(r.label)}</div>
                                <div style="font-size:0.78rem;color:var(--text-muted);">${escapeHtml(r.meta || '')}</div>
                            </a>
                        `).join('');
                    }
                    dropdown.style.display = 'block';
                } catch (e) {
                    dropdown.style.display = 'none';
                }
            }, 300);
        });

        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    }

    function escapeHtml(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
})();
