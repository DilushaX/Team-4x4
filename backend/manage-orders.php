<?php
/**
 * 4x4 Defender Parts — Orders Management API
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
            $stmt = $pdo->prepare("SELECT * FROM orders WHERE id = ?");
            $stmt->execute([$id]);
            $order = $stmt->fetch();

            if ($order) {
                // Fetch order items
                $itemStmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = ?");
                $itemStmt->execute([$id]);
                $order['items'] = $itemStmt->fetchAll();

                // Fetch customer details if registered
                if ($order['user_id']) {
                    $uStmt = $pdo->prepare("SELECT name, email FROM users WHERE id = ?");
                    $uStmt->execute([$order['user_id']]);
                    $order['user'] = $uStmt->fetch();
                }
                echo json_encode(['order' => $order]);
            } else {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Order not found']);
            }
        } else {
            $stmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC");
            $orders = $stmt->fetchAll();
            echo json_encode(['orders' => $orders]);
        }
        exit;
    }

    if ($method === 'POST') {
        $action = $_POST['action'] ?? 'update_status';
        $csrfToken = $_POST['csrf_token'] ?? '';

        if (!verifyCsrfToken($csrfToken)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'CSRF verification failed']);
            exit;
        }

        $id = intval($_POST['id'] ?? 0);
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid order ID']);
            exit;
        }

        if ($action === 'update_status') {
            $status = trim($_POST['status'] ?? 'pending');
            $allowedStatus = ['pending', 'confirmed', 'processing', 'completed', 'cancelled'];
            if (!in_array($status, $allowedStatus)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid status']);
                exit;
            }

            $paymentStatus = trim($_POST['payment_status'] ?? '');
            $allowedPayment = ['unpaid', 'paid', 'refunded'];
            if ($paymentStatus !== '' && !in_array($paymentStatus, $allowedPayment)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid payment status']);
                exit;
            }

            if ($paymentStatus !== '') {
                $stmt = $pdo->prepare("UPDATE orders SET status = ?, payment_status = ? WHERE id = ?");
                $stmt->execute([$status, $paymentStatus, $id]);
            } else {
                $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
                $stmt->execute([$status, $id]);
            }

            // Add notification alert for completed order or cancel
            $notifTitle = "Order #$id " . ucfirst($status);
            $notifMsg = "Order status updated to $status by Admin.";
            $notifStmt = $pdo->prepare("INSERT INTO admin_notifications (type, title, message) VALUES ('order', ?, ?)");
            $notifStmt->execute([$notifTitle, $notifMsg]);

            echo json_encode(['status' => 'success', 'message' => 'Order status updated successfully']);
            exit;
        }

        if ($action === 'add_note') {
            $note = trim($_POST['note'] ?? '');
            if ($note === '') {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Note cannot be empty']);
                exit;
            }

            // Fetch current notes
            $nStmt = $pdo->prepare("SELECT notes FROM orders WHERE id = ?");
            $nStmt->execute([$id]);
            $current = $nStmt->fetchColumn() ?: '';

            $timestamp = date('d M Y H:i');
            $newNotes = $current . "\n[$timestamp Admin]: $note";

            $updateStmt = $pdo->prepare("UPDATE orders SET notes = ? WHERE id = ?");
            $updateStmt->execute([$newNotes, $id]);

            echo json_encode(['status' => 'success', 'notes' => $newNotes, 'message' => 'Order note added successfully']);
            exit;
        }

        if ($action === 'add_whatsapp_reference') {
            $ref = trim($_POST['whatsapp_reference'] ?? '');
            
            $stmt = $pdo->prepare("UPDATE orders SET whatsapp_reference = ? WHERE id = ?");
            $stmt->execute([$ref, $id]);

            echo json_encode(['status' => 'success', 'message' => 'WhatsApp reference updated successfully']);
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
