window.TEAM4X4_WHATSAPP_NUMBER = '94703939459';
window.TEAM4X4_WHATSAPP_BASE_URL = `https://wa.me/${window.TEAM4X4_WHATSAPP_NUMBER}`;

window.4x4defenderpartsBuildWhatsAppUrl = function(message) {
    return `${window.TEAM4X4_WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`;
};

window.4x4defenderpartsOpenWhatsApp = function(message) {
    const url = window.4x4defenderpartsBuildWhatsAppUrl(message);
    window.location.href = url;
    return url;
};

/** Load WhatsApp and contact settings from MySQL (single source of truth) */
(function load4x4DefenderPartsSettings() {
    fetch('backend/manage-settings.php')
        .then(res => res.json())
        .then(data => {
            const s = data.settings || {};
            const wa = (s.whatsapp_number || s.whatsapp || '').replace(/\D/g, '');
            if (wa) {
                window.TEAM4X4_WHATSAPP_NUMBER = wa;
                window.TEAM4X4_WHATSAPP_BASE_URL = `https://wa.me/${wa}`;
            }
            window.TEAM4X4_SETTINGS = s;
        })
        .catch(() => {});
})();
