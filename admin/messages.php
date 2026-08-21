<?php
/**
 * Team 4x4 Admin — Contact Messages & Inquiries
 */
$pageId = 'messages';
$pageTitle = 'Messages & Inquiries';
$pageBreadcrumb = 'Communication';
require_once __DIR__ . '/includes/layout-start.php';
?>

<div style="margin-bottom:1.25rem;">
    <p class="text-muted" style="margin:0">Review customer inquiries, technical requests, and service submissions stored in MySQL.</p>
</div>

<div class="admin-card">
    <div class="admin-table-wrap">
        <table class="admin-table">
            <thead>
                <tr>
                    <th>From</th>
                    <th>Email / Phone</th>
                    <th>Vehicle</th>
                    <th>Service Required</th>
                    <th>Message Details</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="messagesTableBody">
                <tr><td colspan="8" style="text-align:center;color:var(--text-muted);">Loading inquiry messages…</td></tr>
            </tbody>
        </table>
    </div>
</div>

<script>
document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.getElementById("messagesTableBody");

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

    function loadMessages() {
        fetch('../backend/manage-messages.php')
            .then(res => res.json())
            .then(data => {
                const messages = data.messages || [];
                renderMessages(messages);
            })
            .catch(() => {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#f87171;">Failed to load messages.</td></tr>';
            });
    }

    function renderMessages(messages) {
        if (messages.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);">No messages found in database.</td></tr>';
            return;
        }

        tbody.innerHTML = messages.map(m => `
            <tr style="${m.status === 'unread' ? 'background:rgba(255,206,46,0.04);' : ''}">
                <td><strong>${escapeHtml(m.name)}</strong></td>
                <td>
                    <span style="font-size:0.83rem;">${escapeHtml(m.email)}</span><br>
                    <span style="font-size:0.78rem;color:var(--text-muted);">${escapeHtml(m.phone || '—')}</span>
                </td>
                <td>${escapeHtml(m.vehicle || '—')}</td>
                <td><span class="admin-badge admin-badge-gold">${escapeHtml(m.service || 'General')}</span></td>
                <td><p style="margin:0;font-size:0.85rem;max-width:280px;line-height:1.4;">${escapeHtml(m.message)}</p></td>
                <td><span style="font-size:0.8rem;color:var(--text-muted);">${(m.created_at || '').substring(0,10)}</span></td>
                <td><span class="admin-badge ${m.status === 'unread' ? 'admin-badge-red' : 'admin-badge-silver'}">${escapeHtml(m.status)}</span></td>
                <td class="admin-table-actions">
                    ${m.phone ? `<a href="https://wa.me/${m.phone.replace(/\D/g,'')}?text=${encodeURIComponent('Hi ' + m.name + ', Team 4x4 workshop responding to your inquiry.')}" target="_blank" class="admin-btn-ghost" style="padding:0.3rem 0.6rem;font-size:0.75rem;">💬 WA Reply</a>` : ''}
                    ${m.status === 'unread' ? `<button type="button" class="btn-read-msg" data-id="${m.id}">✓ Read</button>` : ''}
                    <button type="button" class="btn-del-msg" data-id="${m.id}" style="color:#f87171;border-color:rgba(248,113,113,0.3);">🗑 Delete</button>
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('.btn-read-msg').forEach(btn => {
            btn.addEventListener('click', e => {
                const id = Number(e.target.dataset.id);
                const formData = new FormData();
                formData.append('action', 'mark_read');
                formData.append('id', id);
                formData.append('csrf_token', window.csrfToken || '');

                fetch('../backend/manage-messages.php', { method: 'POST', body: formData })
                    .then(res => res.json())
                    .then(res => {
                        if (res.status === 'success') {
                            showToast('Message marked as read.', 'gold');
                            loadMessages();
                        }
                    });
            });
        });

        tbody.querySelectorAll('.btn-del-msg').forEach(btn => {
            btn.addEventListener('click', e => {
                const id = Number(e.target.dataset.id);
                if (!confirm(`Delete message #${id}?`)) return;

                const formData = new FormData();
                formData.append('action', 'delete');
                formData.append('id', id);
                formData.append('csrf_token', window.csrfToken || '');

                fetch('../backend/manage-messages.php', { method: 'POST', body: formData })
                    .then(res => res.json())
                    .then(res => {
                        if (res.status === 'success') {
                            showToast('Message deleted.', 'red');
                            loadMessages();
                        }
                    });
            });
        });
    }

    function escapeHtml(str) {
        return String(str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    loadMessages();
});
</script>

<?php require_once __DIR__ . '/includes/layout-end.php'; ?>
