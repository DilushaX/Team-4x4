<?php
/**
 * Team 4x4 Admin — Invoice View & Generator
 */

require_once __DIR__ . '/../backend/db.php';
require_once __DIR__ . '/../includes/auth_helper.php';

checkAuth('admin');

// Load company settings for invoice header
$companySettings = [
    'name' => 'Team 4x4',
    'address' => 'Colombo, Sri Lanka',
    'phone' => '+94 70 393 9459',
    'email' => 'info@team4x4.lk',
];
try {
    $settingsStmt = $pdo->query("SELECT `key`, `value` FROM settings");
    $rawSettings = [];
    foreach ($settingsStmt->fetchAll() as $row) {
        $rawSettings[$row['key']] = $row['value'];
    }
    $rawSettings = normalizeSettingsKeys($rawSettings);
    $companySettings['name'] = $rawSettings['company_name'] ?? $rawSettings['business_name'] ?? $companySettings['name'];
    $companySettings['address'] = $rawSettings['workshop_address'] ?? $rawSettings['address'] ?? $companySettings['address'];
    $companySettings['phone'] = $rawSettings['contact_phone'] ?? $rawSettings['phone'] ?? $companySettings['phone'];
    $companySettings['email'] = $rawSettings['contact_email'] ?? $rawSettings['email'] ?? $companySettings['email'];
} catch (PDOException $e) {
    // Use defaults
}

$orderId = intval($_GET['id'] ?? 0);
$order = null;
$items = [];

if ($orderId > 0) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM orders WHERE id = ? LIMIT 1");
        $stmt->execute([$orderId]);
        $order = $stmt->fetch();

        if ($order) {
            $itemStmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = ?");
            $itemStmt->execute([$orderId]);
            $items = $itemStmt->fetchAll();
        }
    } catch (PDOException $e) {
        $order = null;
    }
}

// Single order printable view
if ($order):
    $subtotal = 0;
    foreach ($items as $item) {
        $subtotal += floatval($item['price']) * intval($item['quantity']);
    }
    $ref = $order['whatsapp_reference'] ?: ('ORD-' . $order['id']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Invoice <?php echo htmlspecialchars($ref); ?> | Team 4x4</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <style>
        body { font-family: 'Inter', sans-serif; background: #0c0d0e; color: #e5e7eb; margin: 0; padding: 2rem; }
        .invoice-box { max-width: 800px; margin: 0 auto; background: #16181a; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 2.5rem; box-shadow: 0 12px 40px rgba(0,0,0,0.5); }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #ffce2e; padding-bottom: 1.5rem; margin-bottom: 2rem; }
        .brand { font-size: 1.8rem; font-weight: 800; color: #ffce2e; letter-spacing: 2px; }
        .inv-title { text-align: right; }
        .inv-title h2 { margin: 0; font-size: 1.5rem; color: #fff; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
        .info-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 1.25rem; border-radius: 8px; }
        .info-card h4 { margin: 0 0 0.5rem; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: #ffce2e; }
        .info-card p { margin: 0.25rem 0; font-size: 0.9rem; color: #cbd5e1; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
        th { text-align: left; background: rgba(255,255,255,0.05); padding: 0.75rem 1rem; font-size: 0.8rem; text-transform: uppercase; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.1); }
        td { padding: 0.85rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.9rem; }
        .text-right { text-align: right; }
        .totals { margin-left: auto; width: 300px; }
        .totals-row { display: flex; justify-content: space-between; padding: 0.4rem 0; font-size: 0.9rem; }
        .totals-row.grand { font-size: 1.2rem; font-weight: 800; color: #ffce2e; border-top: 1px solid #ffce2e; padding-top: 0.75rem; margin-top: 0.5rem; }
        .no-print { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
        .btn { padding: 0.65rem 1.25rem; border-radius: 999px; font-weight: 600; cursor: pointer; border: none; text-decoration: none; display: inline-block; }
        .btn-gold { background: #ffce2e; color: #000; }
        .btn-ghost { background: transparent; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.2); }
        @media print {
            body { background: #fff; color: #000; padding: 0; }
            .invoice-box { border: none; box-shadow: none; padding: 0; color: #000; background: #fff; }
            .no-print { display: none; }
            .info-card { background: #f8fafc; border: 1px solid #e2e8f0; }
            .info-card p { color: #1e293b; }
            th { background: #f1f5f9; color: #475569; }
            td { border-bottom: 1px solid #e2e8f0; }
            .brand { color: #000; }
            .totals-row.grand { color: #000; border-top: 2px solid #000; }
        }
    </style>
</head>
<body>

<div class="no-print">
    <button class="btn btn-gold" onclick="window.print()">🖨 Print Invoice</button>
    <a href="orders.php" class="btn btn-ghost">← Back to Orders</a>
</div>

<div class="invoice-box">
    <div class="header">
        <div>
            <div class="brand"><?php echo htmlspecialchars(strtoupper($companySettings['name'])); ?></div>
            <p style="margin:0.25rem 0 0;font-size:0.85rem;color:#94a3b8;">Custom 4x4 Engineering & Performance Parts</p>
            <p style="margin:0.2rem 0 0;font-size:0.8rem;color:#64748b;"><?php echo htmlspecialchars($companySettings['address']); ?> | <?php echo htmlspecialchars($companySettings['phone']); ?></p>
        </div>
        <div class="inv-title">
            <h2>INVOICE</h2>
            <p style="margin:0.25rem 0 0;font-weight:700;color:#ffce2e;"><?php echo htmlspecialchars($ref); ?></p>
            <p style="margin:0.2rem 0 0;font-size:0.82rem;color:#94a3b8;">Date: <?php echo date('d M Y', strtotime($order['created_at'])); ?></p>
        </div>
    </div>

    <div class="grid-2">
        <div class="info-card">
            <h4>Billed To</h4>
            <p><strong><?php echo htmlspecialchars($order['customer_name']); ?></strong></p>
            <p>Phone: <?php echo htmlspecialchars($order['phone']); ?></p>
            <?php if ($order['email']): ?><p>Email: <?php echo htmlspecialchars($order['email']); ?></p><?php endif; ?>
            <p>Vehicle: <?php echo htmlspecialchars($order['vehicle_model']); ?></p>
        </div>
        <div class="info-card">
            <h4>Fulfillment & Payment</h4>
            <p>Method: <strong><?php echo strtoupper(htmlspecialchars($order['fulfillment_type'])); ?></strong></p>
            <?php if ($order['fulfillment_type'] === 'delivery'): ?>
                <p>Address: <?php echo htmlspecialchars($order['address']); ?>, <?php echo htmlspecialchars($order['district']); ?></p>
            <?php endif; ?>
            <p>Payment: <?php echo htmlspecialchars($order['payment_method'] ?: 'Cash on Delivery'); ?></p>
            <p>Status: <strong><?php echo strtoupper(htmlspecialchars($order['status'])); ?></strong></p>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Item Description</th>
                <th class="text-right">Price (LKR)</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Total (LKR)</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($items as $i): 
                $lineTotal = floatval($i['price']) * intval($i['quantity']);
            ?>
                <tr>
                    <td><strong><?php echo htmlspecialchars($i['product_title']); ?></strong></td>
                    <td class="text-right"><?php echo number_format($i['price'], 2); ?></td>
                    <td class="text-right"><?php echo $i['quantity']; ?></td>
                    <td class="text-right"><?php echo number_format($lineTotal, 2); ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>

    <div class="totals">
        <div class="totals-row">
            <span>Product Subtotal</span>
            <span>LKR <?php echo number_format($subtotal, 2); ?></span>
        </div>
        <div class="totals-row">
            <span>Delivery Charge</span>
            <span><?php echo $order['delivery_fee'] > 0 ? ('LKR ' . number_format($order['delivery_fee'], 2)) : 'Free Pickup'; ?></span>
        </div>
        <div class="totals-row grand">
            <span>Grand Total</span>
            <span>LKR <?php echo number_format($order['total_amount'], 2); ?></span>
        </div>
    </div>
</div>

</body>
</html>
<?php
exit;
endif;

// List view if no specific order ID requested
$pageId = 'invoices';
$pageTitle = 'Invoices';
$pageBreadcrumb = 'Finance';
require_once __DIR__ . '/includes/layout-start.php';

try {
    $stmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC");
    $orders = $stmt->fetchAll();
} catch (PDOException $e) {
    $orders = [];
}
?>

<div class="admin-card">
    <div class="admin-table-wrap">
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Invoice / Order</th>
                    <th>Customer</th>
                    <th>Vehicle</th>
                    <th>Total (LKR)</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($orders)): ?>
                    <tr><td colspan="6" style="text-align:center;color:var(--text-muted);">No orders found for invoices.</td></tr>
                <?php else: ?>
                    <?php foreach ($orders as $o): ?>
                        <tr>
                            <td><strong><?php echo htmlspecialchars($o['whatsapp_reference'] ?: ('ORD-' . $o['id'])); ?></strong></td>
                            <td><?php echo htmlspecialchars($o['customer_name']); ?></td>
                            <td><?php echo htmlspecialchars($o['vehicle_model']); ?></td>
                            <td class="text-gold">LKR <?php echo number_format($o['total_amount'], 2); ?></td>
                            <td><span class="admin-badge admin-badge-gold"><?php echo htmlspecialchars($o['status']); ?></span></td>
                            <td class="admin-table-actions">
                                <a href="invoice.php?id=<?php echo $o['id']; ?>" target="_blank" class="admin-btn-gold" style="padding:0.35rem 0.75rem;font-size:0.78rem;">🖨 Print Invoice</a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<?php require_once __DIR__ . '/includes/layout-end.php'; ?>
