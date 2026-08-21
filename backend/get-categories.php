<?php
require_once 'db.php';
header('Content-Type: application/json');
try {
    $stmt = $pdo->query("SELECT id, name, slug, description FROM categories ORDER BY name ASC");
    $categories = $stmt->fetchAll();
    echo json_encode(['categories' => $categories]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
