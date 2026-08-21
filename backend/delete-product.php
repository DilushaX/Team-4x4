<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../includes/auth_helper.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

requireAdminApi();
requireCsrfApi($_POST['csrf_token'] ?? '');

try {
    $id = intval($_POST['id'] ?? 0);
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid product id']);
        exit;
    }

    // Delete product - product_images has FK ON DELETE CASCADE per schema
    $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(['status' => 'success']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
