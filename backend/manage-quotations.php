<?php
/**
 * 4x4 Defender Parts — Quotations Management API
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../includes/auth_helper.php';

header('Content-Type: application/json');

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
            $stmt = $pdo->prepare("SELECT * FROM quotations WHERE id = ?");
            $stmt->execute([$id]);
            $quote = $stmt->fetch();

            if ($quote) {
                $itemStmt = $pdo->prepare("SELECT * FROM quotation_items WHERE quotation_id = ?");
                $itemStmt->execute([$id]);
                $quote['items'] = $itemStmt->fetchAll();
            }
            echo json_encode(['status' => 'success', 'quotation' => $quote]);
        } else {
            $stmt = $pdo->query("SELECT * FROM quotations ORDER BY created_at DESC");
            $quotations = $stmt->fetchAll();
            echo json_encode(['status' => 'success', 'quotations' => $quotations]);
        }
        exit;
    }

    if ($method === 'POST') {
        $action = $_POST['action'] ?? 'create';
        requireCsrfApi($_POST['csrf_token'] ?? '');

        if ($action === 'create') {
            $customerName = trim($_POST['customer_name'] ?? '');
            $email = trim($_POST['email'] ?? '');
            $phone = trim($_POST['phone'] ?? '');
            $vehicle = trim($_POST['vehicle_model'] ?? '');
            $status = trim($_POST['status'] ?? 'sent');

            $descriptions = $_POST['items_description'] ?? [];
            $quantities = $_POST['items_quantity'] ?? [];
            $prices = $_POST['items_price'] ?? [];

            if (empty($customerName) || empty($email)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Customer name and email are required']);
                exit;
            }

            $quoteNumber = 'QT-' . date('Y') . '-' . str_pad(rand(100, 999), 3, '0', STR_PAD_LEFT);
            $totalAmount = 0.00;

            for ($i = 0; $i < count($descriptions); $i++) {
                $q = intval($quantities[$i] ?? 1);
                $p = floatval($prices[$i] ?? 0);
                $totalAmount += ($q * $p);
            }

            $pdo->beginTransaction();

            $stmt = $pdo->prepare("INSERT INTO quotations (quotation_number, customer_name, email, phone, vehicle_model, total_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$quoteNumber, $customerName, $email, $phone, $vehicle, $totalAmount, $status]);
            $quoteId = $pdo->lastInsertId();

            $itemStmt = $pdo->prepare("INSERT INTO quotation_items (quotation_id, description, quantity, price) VALUES (?, ?, ?, ?)");
            for ($i = 0; $i < count($descriptions); $i++) {
                $desc = trim($descriptions[$i] ?? '');
                $q = intval($quantities[$i] ?? 1);
                $p = floatval($prices[$i] ?? 0);
                if (!empty($desc)) {
                    $itemStmt->execute([$quoteId, $desc, $q, $p]);
                }
            }

            $pdo->commit();

            echo json_encode(['status' => 'success', 'message' => 'Quotation created successfully', 'quotation_number' => $quoteNumber]);
            exit;
        }

        if ($action === 'update_status') {
            $id = intval($_POST['id'] ?? 0);
            $status = trim($_POST['status'] ?? 'sent');

            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid quotation ID']);
                exit;
            }

            $stmt = $pdo->prepare("UPDATE quotations SET status = ? WHERE id = ?");
            $stmt->execute([$status, $id]);

            echo json_encode(['status' => 'success', 'message' => 'Quotation status updated']);
            exit;
        }

        if ($action === 'delete') {
            $id = intval($_POST['id'] ?? 0);
            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid quotation ID']);
                exit;
            }

            $stmt = $pdo->prepare("DELETE FROM quotations WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode(['status' => 'success', 'message' => 'Quotation deleted successfully']);
            exit;
        }
    }

    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
