<?php
/**
 * 4x4 Defender Parts Admin — System Settings
 */
$pageId = 'settings';
$pageTitle = 'Settings';
$pageBreadcrumb = 'System';
require_once __DIR__ . '/includes/layout-start.php';
?>

<div style="margin-bottom:1.25rem;">
    <p class="text-muted" style="margin:0">Configure website information, contact phone, WhatsApp link, address, and delivery charges stored in MySQL.</p>
</div>

<div class="admin-card">
    <form id="settingsForm" class="admin-form-grid">
        <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>" />
        
        <div class="admin-field">
            <label>Company Name</label>
            <input type="text" name="company_name" id="setCompany" placeholder="4x4 Defender Parts" />
        </div>
        <div class="admin-field">
            <label>WhatsApp Number (with country code)</label>
            <input type="text" name="whatsapp_number" id="setWhatsapp" placeholder="+94703939459" />
        </div>
        <div class="admin-field">
            <label>Contact Phone</label>
            <input type="text" name="contact_phone" id="setPhone" placeholder="+94 70 393 9459" />
        </div>
        <div class="admin-field">
            <label>Contact Email</label>
            <input type="email" name="contact_email" id="setEmail" placeholder="info@4x4defenderparts.lk" />
        </div>
        <div class="admin-field">
            <label>Islandwide Delivery Fee (LKR)</label>
            <input type="number" name="delivery_charge" id="setDelivery" step="0.01" min="0" placeholder="2500" />
        </div>
        <div class="admin-field full" style="grid-column:1/-1;">
            <label>Workshop / Store Physical Address</label>
            <textarea name="workshop_address" id="setAddress" rows="3" placeholder="No. 45 Garage Lane, Colombo, Sri Lanka"></textarea>
        </div>

        <div class="full" style="grid-column:1/-1;display:flex;gap:1rem;align-items:center;margin-top:0.5rem;">
            <button type="submit" class="admin-btn-gold" id="saveSettingsBtn">💾 Save Settings</button>
            <span id="settingsMsg" style="font-size:0.88rem;font-weight:600;"></span>
        </div>
    </form>
</div>

<script>
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('settingsForm');
    const msg = document.getElementById('settingsMsg');

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

    // Load current settings from database
    fetch('../backend/manage-settings.php')
        .then(res => res.json())
        .then(data => {
            const s = data.settings || {};
            document.getElementById('setCompany').value = s.company_name || s.company || '4x4 Defender Parts';
            document.getElementById('setWhatsapp').value = s.whatsapp_number || s.whatsapp || '+94703939459';
            document.getElementById('setPhone').value = s.contact_phone || s.phone || '+94703939459';
            document.getElementById('setEmail').value = s.contact_email || s.email || 'info@4x4defenderparts.lk';
            document.getElementById('setDelivery').value = s.delivery_charge || s.deliveryCharge || 2500;
            document.getElementById('setAddress').value = s.workshop_address || s.address || 'No. 45 Garage Lane, Colombo, Sri Lanka';
        });

    form.addEventListener('submit', e => {
        e.preventDefault();
        msg.textContent = 'Saving…';
        msg.style.color = 'var(--text-muted)';

        const formData = new FormData(form);

        fetch('../backend/manage-settings.php', { method: 'POST', body: formData })
            .then(res => res.json())
            .then(res => {
                if (res.status === 'success') {
                    msg.textContent = '✅ Settings saved successfully!';
                    msg.style.color = '#4ade80';
                    showToast('System settings updated.', 'gold');
                } else {
                    msg.textContent = '⚠️ ' + (res.message || 'Failed to save settings');
                    msg.style.color = '#f87171';
                }
            })
            .catch(() => {
                msg.textContent = '⚠️ Connection error.';
                msg.style.color = '#f87171';
            });
    });
});
</script>

<?php require_once __DIR__ . '/includes/layout-end.php'; ?>
