/**
 * Team 4x4 Admin — shared navigation (live data loaded per-page from MySQL APIs)
 */
const AdminNav = [
    { section: 'Overview' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: 'dashboard.php' },
    { section: 'Commerce' },
    { id: 'products', label: 'Products', icon: '⚙️', href: 'products.php' },
    { id: 'categories', label: 'Categories', icon: '🏷️', href: 'categories.php' },
    { id: 'orders', label: 'Orders', icon: '📦', href: 'orders.php' },
    { id: 'customers', label: 'Customers', icon: '👥', href: 'customers.php' },
    { section: 'Workshop' },
    { id: 'gallery', label: 'Build Gallery', icon: '🖼️', href: 'gallery-management.php' },
    { id: 'projects', label: 'Projects', icon: '🚙', href: 'projects.php' },
    { id: 'services', label: 'Services', icon: '🛠️', href: 'services.php' },
    { id: 'inventory', label: 'Inventory', icon: '📋', href: 'inventory.php' },
    { id: 'suppliers', label: 'Suppliers', icon: '🏭', href: 'suppliers.php' },
    { section: 'Finance' },
    { id: 'quotations', label: 'Quotations', icon: '📝', href: 'quotations.php' },
    { id: 'invoices', label: 'Invoices', icon: '🧾', href: 'invoice.php' },
    { section: 'Communication' },
    { id: 'messages', label: 'Messages', icon: '💬', href: 'messages.php' },
    { id: 'reports', label: 'Reports', icon: '📈', href: 'reports.php' },
    { section: 'System' },
    { id: 'settings', label: 'Settings', icon: '⚙️', href: 'settings.php' },
];

/** Populated at runtime by dashboard API — never use fake defaults */
window.AdminNav = AdminNav;
window.AdminData = {
    revenueMonthly: [],
    ordersByStatus: { pending: 0, confirmed: 0, processing: 0, completed: 0, cancelled: 0 },
};
