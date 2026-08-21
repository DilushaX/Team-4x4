<?php
/**
 * Team 4x4 Admin — Services Content Management
 */
$pageId = 'services';
$pageTitle = 'Services Management';
$pageBreadcrumb = 'Workshop';
require_once __DIR__ . '/includes/layout-start.php';
?>

<p class="text-muted" style="margin:-0.5rem 0 1rem">Edit content, specs, pricing, and showcase parameters for all 6 core workshop services.</p>

<div class="admin-tabs" id="serviceTabs">
    <div style="padding:1rem;color:var(--text-muted);">Loading workshop services…</div>
</div>

<div id="servicePanels"></div>

<script>
document.addEventListener("DOMContentLoaded", () => {
    const tabsContainer = document.getElementById("serviceTabs");
    const panelsContainer = document.getElementById("servicePanels");
    let servicesList = [];

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

    function loadServices() {
        fetch('../backend/manage-services.php')
            .then(res => res.json())
            .then(data => {
                servicesList = data.services || [];
                renderServices();
            })
            .catch(() => {
                tabsContainer.innerHTML = '<div style="color:#f87171;padding:1rem;">Failed to load services.</div>';
            });
    }

    function renderServices() {
        if (servicesList.length === 0) {
            tabsContainer.innerHTML = '<div style="padding:1rem;">No services found in database.</div>';
            return;
        }

        tabsContainer.innerHTML = servicesList.map((s, i) => `
            <button type="button" class="admin-tab${i === 0 ? ' active' : ''}" data-tab="${s.slug}">${s.title}</button>
        `).join('');

        panelsContainer.innerHTML = servicesList.map((s, i) => `
            <div class="admin-tab-panel${i === 0 ? ' active' : ''}" data-tab="${s.slug}">
                <div class="admin-card">
                    <form class="service-edit-form" data-id="${s.id}">
                        <input type="hidden" name="id" value="${s.id}" />
                        <input type="hidden" name="action" value="edit" />
                        <input type="hidden" name="csrf_token" value="${window.csrfToken || ''}" />
                        
                        <div class="admin-form-grid">
                            <div class="admin-field">
                                <label>Service Title *</label>
                                <input type="text" name="title" value="${escapeHtml(s.title || '')}" required />
                            </div>
                            <div class="admin-field">
                                <label>Slug</label>
                                <input type="text" name="slug" value="${escapeHtml(s.slug || '')}" required readonly style="opacity:0.7;" />
                            </div>
                            <div class="admin-field">
                                <label>Subtitle</label>
                                <input type="text" name="subtitle" value="${escapeHtml(s.subtitle || '')}" />
                            </div>
                            <div class="admin-field">
                                <label>Pricing Estimate</label>
                                <input type="text" name="pricing" value="${escapeHtml(s.pricing || '')}" placeholder="LKR 180,000 - 320,000" />
                            </div>
                            <div class="admin-field">
                                <label>Estimated Duration</label>
                                <input type="text" name="duration" value="${escapeHtml(s.duration || '')}" placeholder="2-4 weeks" />
                            </div>
                            <div class="admin-field">
                                <label>Hero Banner Image</label>
                                <input type="file" name="hero_banner" accept="image/jpeg,image/png,image/webp" />
                                ${s.hero_banner ? `<p style="font-size:0.75rem;color:var(--text-muted);margin:0.2rem 0 0;">Current: ${s.hero_banner}</p>` : ''}
                            </div>
                            <div class="admin-field full" style="grid-column:1/-1;">
                                <label>Full Description</label>
                                <textarea name="description" rows="3">${escapeHtml(s.description || '')}</textarea>
                            </div>
                            <div class="admin-field full" style="grid-column:1/-1;">
                                <label>Core Features (pipe separated: Feature 1|Feature 2)</label>
                                <textarea name="features" rows="3">${escapeHtml(s.features || '')}</textarea>
                            </div>
                            <div class="admin-field full" style="grid-column:1/-1;">
                                <label>Vehicle Compatibility</label>
                                <input type="text" name="compatibility" value="${escapeHtml(s.compatibility || '')}" placeholder="Defender, Land Cruiser, Hilux" />
                            </div>
                        </div>

                        <div style="margin-top:1.25rem;display:flex;gap:0.75rem;align-items:center;">
                            <button type="submit" class="admin-btn-gold">💾 Save ${escapeHtml(s.title)} Content</button>
                            <span class="form-msg" style="font-size:0.88rem;font-weight:600;"></span>
                        </div>
                    </form>
                </div>
            </div>
        `).join('');

        AdminUI.initTabs();

        // Attach form submission listeners
        document.querySelectorAll('.service-edit-form').forEach(form => {
            form.addEventListener('submit', e => {
                e.preventDefault();
                const msg = form.querySelector('.form-msg');
                const btn = form.querySelector('button[type="submit"]');
                msg.textContent = 'Saving…';
                msg.style.color = 'var(--text-muted)';
                btn.disabled = true;

                const formData = new FormData(form);

                fetch('../backend/manage-services.php', { method: 'POST', body: formData })
                    .then(res => res.json())
                    .then(res => {
                        btn.disabled = false;
                        if (res.status === 'success') {
                            msg.textContent = '✅ Saved successfully!';
                            msg.style.color = '#4ade80';
                            showToast('Service content updated.', 'gold');
                        } else {
                            msg.textContent = '⚠️ ' + (res.message || 'Error saving service');
                            msg.style.color = '#f87171';
                        }
                    })
                    .catch(() => {
                        btn.disabled = false;
                        msg.textContent = '⚠️ Connection error.';
                        msg.style.color = '#f87171';
                    });
            });
        });
    }

    function escapeHtml(str) {
        return String(str).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    loadServices();
});
</script>

<?php require_once __DIR__ . '/includes/layout-end.php'; ?>
