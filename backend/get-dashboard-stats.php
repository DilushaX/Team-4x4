<?php
/**
 * 4x4 Defender Parts — Live Admin Dashboard Stats API
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../includes/auth_helper.php';

header('Content-Type: application/json');

// Protect API
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

try {
    // 1. Stats Counters
    $stats = [];

    // Products count
    $stats['products'] = intval($pdo->query("SELECT COUNT(*) FROM products")->fetchColumn());

    // Orders count
    $stats['orders'] = intval($pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn());

    // Customers count (registered customers)
    $stats['customers'] = intval($pdo->query("SELECT COUNT(*) FROM users WHERE role = 'customer'")->fetchColumn());

    // Total Revenue (completed orders)
    $stats['revenue'] = floatval($pdo->query("SELECT IFNULL(SUM(total_amount), 0) FROM orders WHERE status = 'completed'")->fetchColumn());

    // Total Projects (active / completed builds)
    $stats['projects'] = intval($pdo->query("SELECT COUNT(*) FROM projects")->fetchColumn());

    // Low stock items (stock <= 3)
    $stats['lowStock'] = intval($pdo->query("SELECT COUNT(*) FROM products WHERE stock <= 3")->fetchColumn());


    // 2. Recent Orders
    $recentOrdersQuery = "
        SELECT 
            id, 
            customer_name AS customer, 
            vehicle_model AS vehicle, 
            total_amount AS total, 
            status, 
            payment_method AS method,
            payment_status AS payment,
            DATE_FORMAT(created_at, '%d %b %Y') AS date 
        FROM orders 
        ORDER BY created_at DESC 
        LIMIT 5";
    $recentOrders = $pdo->query($recentOrdersQuery)->fetchAll();


    // 3. Recent Customers
    $recentCustomersQuery = "
        SELECT 
            u.name, 
            u.email, 
            COUNT(o.id) AS orders, 
            IFNULL(SUM(o.total_amount), 0) AS spent, 
            'Registered' AS type 
        FROM users u 
        LEFT JOIN orders o ON o.user_id = u.id 
        WHERE u.role = 'customer' 
        GROUP BY u.id 
        ORDER BY u.created_at DESC 
        LIMIT 4";
    $recentCustomers = $pdo->query($recentCustomersQuery)->fetchAll();


    // 4. Latest Projects
    $latestProjectsQuery = "
        SELECT 
            title, 
            category AS client, 
            'In Progress' AS status,
            75 AS progress 
        FROM projects 
        ORDER BY created_at DESC 
        LIMIT 3";
    $latestProjects = $pdo->query($latestProjectsQuery)->fetchAll();


    // 5. Recent Messages (Inbox)
    $recentMessagesQuery = "
        SELECT 
            name AS `from`, 
            'Contact Form' AS type, 
            subject, 
            created_at AS date, 
            CASE WHEN status = 'unread' THEN 1 ELSE 0 END AS unread 
        FROM messages 
        ORDER BY created_at DESC 
        LIMIT 3";
    $recentMessages = $pdo->query($recentMessagesQuery)->fetchAll();
    // Convert unread to boolean for frontend JS compat
    foreach ($recentMessages as &$m) {
        $m['unread'] = (bool)$m['unread'];
    }


    // 6. Low Stock Products
    $lowStockProductsQuery = "
        SELECT 
            title AS name, 
            sku, 
            stock, 
            5 AS min 
        FROM products 
        WHERE stock <= 3 
        ORDER BY stock ASC 
        LIMIT 3";
    $lowStockProducts = $pdo->query($lowStockProductsQuery)->fetchAll();


    // 7. Top Selling Parts
    $topPartsQuery = "
        SELECT 
            p.title AS name, 
            IFNULL(SUM(oi.quantity), 0) AS sold, 
            IFNULL(SUM(oi.quantity * oi.price), 0) AS revenue 
        FROM products p
        LEFT JOIN order_items oi ON oi.product_id = p.id
        GROUP BY p.id
        ORDER BY sold DESC
        LIMIT 4";
    $topParts = $pdo->query($topPartsQuery)->fetchAll();


    // 8. Monthly Revenue (last 12 months)
    $revenueMonthly = [];
    for ($i = 11; $i >= 0; $i--) {
        $month = date('m', strtotime("-$i months"));
        $year = date('Y', strtotime("-$i months"));
        $monthlyStmt = $pdo->prepare("SELECT SUM(total_amount) FROM orders WHERE status = 'completed' AND MONTH(created_at) = ? AND YEAR(created_at) = ?");
        $monthlyStmt->execute([$month, $year]);
        $val = floatval($monthlyStmt->fetchColumn());
        $revenueMonthly[] = $val > 0 ? $val : 0;
    }


    // 9. Orders By Status
    $ordersByStatus = [
        'pending' => 0,
        'confirmed' => 0,
        'processing' => 0,
        'completed' => 0,
        'cancelled' => 0
    ];
    $statusCounts = $pdo->query("SELECT status, COUNT(*) AS count FROM orders GROUP BY status")->fetchAll();
    foreach ($statusCounts as $sc) {
        $status = strtolower($sc['status']);
        if (array_key_exists($status, $ordersByStatus)) {
            $ordersByStatus[$status] = intval($sc['count']);
        }
    }

    echo json_encode([
        'status' => 'success',
        'stats' => $stats,
        'recentOrders' => $recentOrders,
        'recentCustomers' => $recentCustomers,
        'latestProjects' => $latestProjects,
        'messages' => $recentMessages,
        'lowStock' => $lowStockProducts,
        'topParts' => $topParts,
        'revenueMonthly' => $revenueMonthly,
        'ordersByStatus' => $ordersByStatus
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
