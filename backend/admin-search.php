<?php
/**
 * Team 4x4 — Admin Global Search API
 */
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../includes/auth_helper.php';

header('Content-Type: application/json');
requireAdminApi();

$q = trim($_GET['q'] ?? '');
if ($q === '' || strlen($q) < 2) {
    echo json_encode(['status' => 'success', 'results' => []]);
    exit;
}

$like = '%' . $q . '%';

try {
    $results = [];

    $productStmt = $pdo->prepare("
        SELECT id, title, sku, category, price
        FROM products
        WHERE title LIKE ? OR sku LIKE ? OR category LIKE ?
        ORDER BY title ASC
        LIMIT 8
    ");
    $productStmt->execute([$like, $like, $like]);
    foreach ($productStmt->fetchAll() as $row) {
        $results[] = [
            'type' => 'product',
            'id' => $row['id'],
            'label' => $row['title'],
            'meta' => ($row['sku'] ?: $row['category']) . ' · LKR ' . number_format($row['price']),
            'url' => 'add-product.php?id=' . $row['id'],
        ];
    }

    $orderStmt = $pdo->prepare("
        SELECT id, customer_name, phone, total_amount, status, whatsapp_reference
        FROM orders
        WHERE customer_name LIKE ? OR phone LIKE ? OR whatsapp_reference LIKE ? OR CAST(id AS CHAR) LIKE ?
        ORDER BY created_at DESC
        LIMIT 8
    ");
    $orderStmt->execute([$like, $like, $like, $like]);
    foreach ($orderStmt->fetchAll() as $row) {
        $ref = $row['whatsapp_reference'] ?: ('ORD-' . $row['id']);
        $results[] = [
            'type' => 'order',
            'id' => $row['id'],
            'label' => $ref . ' — ' . $row['customer_name'],
            'meta' => ucfirst($row['status']) . ' · LKR ' . number_format($row['total_amount']),
            'url' => 'orders.php',
        ];
    }

    $customerStmt = $pdo->prepare("
        SELECT u.id, u.name, u.email, c.phone
        FROM users u
        LEFT JOIN customers c ON c.user_id = u.id
        WHERE u.role = 'customer' AND (u.name LIKE ? OR u.email LIKE ? OR c.phone LIKE ?)
        ORDER BY u.name ASC
        LIMIT 8
    ");
    $customerStmt->execute([$like, $like, $like]);
    foreach ($customerStmt->fetchAll() as $row) {
        $results[] = [
            'type' => 'customer',
            'id' => $row['id'],
            'label' => $row['name'],
            'meta' => $row['email'] . ($row['phone'] ? ' · ' . $row['phone'] : ''),
            'url' => 'customers.php',
        ];
    }

    echo json_encode(['status' => 'success', 'results' => $results]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Search failed']);
}
