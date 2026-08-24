<?php
/**
 * 4x4 Defender Parts — Inventory Management API
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
        // Fetch products with inventory summary
        $stmt = $pdo->query("SELECT id, title, sku, stock, is_featured FROM products ORDER BY stock ASC");
        $products = $stmt->fetchAll();

        // Count summaries
        $totalItems = count($products);
        $lowStock = 0;
        $outOfStock = 0;
        foreach ($products as $p) {
            if ($p['stock'] === 0) {
                $outOfStock++;
            } elseif ($p['stock'] <= 3) {
                $lowStock++;
            }
        }

        // Fetch movement logs
        $logStmt = $pdo->query("
            SELECT 
                im.id, 
                p.title AS name, 
                p.sku, 
                im.quantity_changed, 
                im.reason, 
                DATE_FORMAT(im.created_at, '%d %b %Y %H:%i') AS date 
            FROM inventory_movements im 
            JOIN products p ON im.product_id = p.id 
            ORDER BY im.created_at DESC 
            LIMIT 50");
        $movements = $logStmt->fetchAll();

        echo json_encode([
            'status' => 'success',
            'summary' => [
                'total_items' => $totalItems,
                'low_stock' => $lowStock,
                'out_of_stock' => $outOfStock
            ],
            'products' => $products,
            'movements' => $movements
        ]);
        exit;
    }

    if ($method === 'POST') {
        $action = $_POST['action'] ?? 'adjust_stock';
        $csrfToken = $_POST['csrf_token'] ?? '';

        if (!verifyCsrfToken($csrfToken)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'CSRF verification failed']);
            exit;
        }

        if ($action === 'adjust_stock') {
            $id = intval($_POST['id'] ?? 0);
            $qty = intval($_POST['quantity_changed'] ?? 0);
            $reason = trim($_POST['reason'] ?? 'manual adjustment');

            if ($id <= 0 || $qty === 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid product or quantity change']);
                exit;
            }

            $pdo->beginTransaction();
            // Get current stock
            $cStmt = $pdo->prepare("SELECT stock FROM products WHERE id = ? FOR UPDATE");
            $cStmt->execute([$id]);
            $current = intval($cStmt->fetchColumn());

            $newStock = max(0, $current + $qty);

            // Update
            $uStmt = $pdo->prepare("UPDATE products SET stock = ? WHERE id = ?");
            $uStmt->execute([$newStock, $id]);

            // Log movement
            $logStmt = $pdo->prepare("INSERT INTO inventory_movements (product_id, quantity_changed, reason, user_id) VALUES (?, ?, ?, ?)");
            $logStmt->execute([$id, $qty, $reason, $_SESSION['user_id']]);

            // Add notification if stock is low
            if ($newStock <= 3) {
                $pName = $pdo->query("SELECT title FROM products WHERE id = $id")->fetchColumn();
                $notifTitle = "Low Stock Alert: $pName";
                $notifMsg = "Product stock has dropped to $newStock units.";
                
                $nStmt = $pdo->prepare("INSERT INTO admin_notifications (type, title, message) VALUES ('stock', ?, ?)");
                $nStmt->execute([$notifTitle, $notifMsg]);
            }

            $pdo->commit();

            echo json_encode(['status' => 'success', 'new_stock' => $newStock, 'message' => 'Stock updated and movement logged successfully']);
            exit;
        }
    }

    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
