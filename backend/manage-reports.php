<?php
/**
 * Team 4x4 — Reports Generation API
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

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $type = $_GET['type'] ?? 'sales';

        if ($type === 'sales') {
            // Aggregate sales metrics
            $totalSales = floatval($pdo->query("SELECT IFNULL(SUM(total_amount), 0) FROM orders WHERE status = 'completed'")->fetchColumn());
            $orderCount = intval($pdo->query("SELECT COUNT(*) FROM orders WHERE status = 'completed'")->fetchColumn());
            $avgOrderVal = $orderCount > 0 ? ($totalSales / $orderCount) : 0;
            
            // Sales by month
            $salesMonthly = [];
            for ($i = 5; $i >= 0; $i--) {
                $monthName = date('F Y', strtotime("-$i months"));
                $month = date('m', strtotime("-$i months"));
                $year = date('Y', strtotime("-$i months"));
                
                $mStmt = $pdo->prepare("SELECT IFNULL(SUM(total_amount), 0) FROM orders WHERE status = 'completed' AND MONTH(created_at) = ? AND YEAR(created_at) = ?");
                $mStmt->execute([$month, $year]);
                $salesMonthly[] = [
                    'label' => $monthName,
                    'value' => floatval($mStmt->fetchColumn())
                ];
            }

            echo json_encode([
                'status' => 'success',
                'summary' => [
                    'total_sales' => $totalSales,
                    'order_count' => $orderCount,
                    'average_order_value' => $avgOrderVal
                ],
                'chart_data' => $salesMonthly
            ]);
            exit;
        }

        if ($type === 'inventory') {
            // Asset Valuation (Sum of price * stock)
            $valuation = floatval($pdo->query("SELECT SUM(price * stock) FROM products")->fetchColumn());
            $totalStock = intval($pdo->query("SELECT SUM(stock) FROM products")->fetchColumn());
            
            // Low stock products
            $lowStockStmt = $pdo->query("SELECT title, sku, stock, price FROM products WHERE stock <= 3 ORDER BY stock ASC");
            $lowStockItems = $lowStockStmt->fetchAll();

            echo json_encode([
                'status' => 'success',
                'summary' => [
                    'total_valuation' => $valuation,
                    'total_stock_count' => $totalStock,
                    'low_stock_count' => count($lowStockItems)
                ],
                'low_stock_items' => $lowStockItems
            ]);
            exit;
        }

        if ($type === 'customers') {
            // Customer count
            $totalCust = intval($pdo->query("SELECT COUNT(*) FROM users WHERE role = 'customer'")->fetchColumn());
            
            // Top customers by spending
            $topCustStmt = $pdo->query("
                SELECT 
                    u.name, 
                    u.email, 
                    COUNT(o.id) AS orders_count, 
                    IFNULL(SUM(o.total_amount), 0) AS total_spent 
                FROM users u
                JOIN orders o ON o.user_id = u.id
                WHERE u.role = 'customer' AND o.status = 'completed'
                GROUP BY u.id
                ORDER BY total_spent DESC
                LIMIT 5");
            $topCustomers = $topCustStmt->fetchAll();

            echo json_encode([
                'status' => 'success',
                'summary' => [
                    'total_customers' => $totalCust,
                    'active_customers' => count($topCustomers)
                ],
                'top_customers' => $topCustomers
            ]);
            exit;
        }
    }

    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
