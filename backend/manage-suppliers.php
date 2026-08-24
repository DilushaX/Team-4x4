<?php
/**
 * 4x4 Defender Parts — Suppliers Management API
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
        $stmt = $pdo->query("SELECT * FROM suppliers ORDER BY id DESC");
        $suppliers = $stmt->fetchAll();
        echo json_encode(['status' => 'success', 'suppliers' => $suppliers]);
        exit;
    }

    if ($method === 'POST') {
        $action = $_POST['action'] ?? 'add';
        requireCsrfApi($_POST['csrf_token'] ?? '');

        if ($action === 'add') {
            $name = trim($_POST['name'] ?? '');
            $company = trim($_POST['company'] ?? '');
            $phone = trim($_POST['phone'] ?? '');
            $email = trim($_POST['email'] ?? '');
            $products = trim($_POST['products_supplied'] ?? '');

            if (empty($name)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Supplier name is required']);
                exit;
            }

            $stmt = $pdo->prepare("INSERT INTO suppliers (name, company, phone, email, products_supplied) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$name, $company, $phone, $email, $products]);

            echo json_encode(['status' => 'success', 'message' => 'Supplier added successfully']);
            exit;
        }

        if ($action === 'edit') {
            $id = intval($_POST['id'] ?? 0);
            $name = trim($_POST['name'] ?? '');
            $company = trim($_POST['company'] ?? '');
            $phone = trim($_POST['phone'] ?? '');
            $email = trim($_POST['email'] ?? '');
            $products = trim($_POST['products_supplied'] ?? '');

            if ($id <= 0 || empty($name)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Supplier name and ID are required']);
                exit;
            }

            $stmt = $pdo->prepare("UPDATE suppliers SET name = ?, company = ?, phone = ?, email = ?, products_supplied = ? WHERE id = ?");
            $stmt->execute([$name, $company, $phone, $email, $products, $id]);

            echo json_encode(['status' => 'success', 'message' => 'Supplier updated successfully']);
            exit;
        }

        if ($action === 'delete') {
            $id = intval($_POST['id'] ?? 0);
            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid supplier ID']);
                exit;
            }

            $stmt = $pdo->prepare("DELETE FROM suppliers WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode(['status' => 'success', 'message' => 'Supplier deleted successfully']);
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
