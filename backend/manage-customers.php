<?php
/**
 * 4x4 Defender Parts — Customers Management API
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
        if (isset($_GET['id'])) {
            $id = intval($_GET['id']);
            
            // Get single customer details with order history
            $stmt = $pdo->prepare("
                SELECT 
                    u.id, 
                    u.name, 
                    u.email, 
                    c.phone, 
                    c.address, 
                    c.vehicle_model, 
                    c.notes, 
                    u.created_at
                FROM users u
                LEFT JOIN customers c ON c.user_id = u.id
                WHERE u.id = ? AND u.role = 'customer'
                LIMIT 1");
            $stmt->execute([$id]);
            $customer = $stmt->fetch();

            if ($customer) {
                // Fetch order history
                $orderStmt = $pdo->prepare("SELECT id, total_amount, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC");
                $orderStmt->execute([$id]);
                $customer['orders_history'] = $orderStmt->fetchAll();

                // Compute total spent
                $spent = 0;
                foreach ($customer['orders_history'] as $o) {
                    if ($o['status'] === 'completed') {
                        $spent += floatval($o['total_amount']);
                    }
                }
                $customer['lifetime_value'] = $spent;
                $customer['total_orders'] = count($customer['orders_history']);
                
                echo json_encode(['customer' => $customer]);
            } else {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Customer profile not found']);
            }
        } else {
            // List all customers with computed details
            $search = isset($_GET['search']) ? '%' . trim($_GET['search']) . '%' : '';

            $sql = "
                SELECT 
                    u.id, 
                    u.name, 
                    u.email, 
                    c.phone, 
                    c.address, 
                    c.vehicle_model,
                    c.notes,
                    COUNT(o.id) AS total_orders,
                    IFNULL(SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END), 0) AS lifetime_value,
                    MAX(o.created_at) AS last_order
                FROM users u
                LEFT JOIN customers c ON c.user_id = u.id
                LEFT JOIN orders o ON o.user_id = u.id
                WHERE u.role = 'customer' ";
            
            $params = [];
            if ($search !== '') {
                $sql .= " AND (u.name LIKE ? OR u.email LIKE ? OR c.phone LIKE ?) ";
                $params[] = $search;
                $params[] = $search;
                $params[] = $search;
            }

            $sql .= " GROUP BY u.id ORDER BY u.created_at DESC";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $customers = $stmt->fetchAll();
            
            echo json_encode(['customers' => $customers]);
        }
        exit;
    }

    if ($method === 'POST') {
        $action = $_POST['action'] ?? 'edit';
        $csrfToken = $_POST['csrf_token'] ?? '';

        if (!verifyCsrfToken($csrfToken)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'CSRF verification failed']);
            exit;
        }

        $id = intval($_POST['id'] ?? 0);
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid customer ID']);
            exit;
        }

        if ($action === 'edit') {
            $name = trim($_POST['name'] ?? '');
            $phone = trim($_POST['phone'] ?? '');
            $address = trim($_POST['address'] ?? '');
            $vehicleModel = trim($_POST['vehicle_model'] ?? '');
            $notes = trim($_POST['notes'] ?? '');

            if ($name === '') {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Name cannot be empty']);
                exit;
            }

            $pdo->beginTransaction();
            // Update users table name
            $uStmt = $pdo->prepare("UPDATE users SET name = ? WHERE id = ?");
            $uStmt->execute([$name, $id]);

            // Update customers table
            $cStmt = $pdo->prepare("UPDATE customers SET phone = ?, address = ?, vehicle_model = ?, notes = ? WHERE user_id = ?");
            $cStmt->execute([$phone, $address, $vehicleModel, $notes, $id]);

            $pdo->commit();

            echo json_encode(['status' => 'success', 'message' => 'Customer profile updated successfully']);
            exit;
        }

        if ($action === 'delete') {
            // Delete customer (which deletes user, ON DELETE CASCADE handles customers row)
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ? AND role = 'customer'");
            $stmt->execute([$id]);
            echo json_encode(['status' => 'success', 'message' => 'Customer deleted successfully']);
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
