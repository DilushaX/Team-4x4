<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../includes/auth_helper.php';
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['status'=>'error','message'=>'Method not allowed']); exit; }
requireAdminApi();
requireCsrfApi($_POST['csrf_token'] ?? '');
try {
    $id = intval($_POST['id'] ?? 0);
    $name = trim($_POST['name'] ?? '');
    $slug = trim($_POST['slug'] ?? '');
    $description = trim($_POST['description'] ?? '');
    if ($id <= 0 || $name === '') { http_response_code(400); echo json_encode(['status'=>'error','message'=>'Invalid input']); exit; }
    if ($slug === '') $slug = strtolower(preg_replace('/[^a-z0-9]+/i','-', $name));
    $stmt = $pdo->prepare("UPDATE categories SET name = ?, slug = ?, description = ? WHERE id = ?");
    $stmt->execute([$name, $slug, $description, $id]);
    echo json_encode(['status'=>'success']);
} catch (PDOException $e) { http_response_code(500); echo json_encode(['status'=>'error','message'=>$e->getMessage()]); }
