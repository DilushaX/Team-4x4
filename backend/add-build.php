<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../includes/auth_helper.php';
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['status'=>'error','message'=>'Method not allowed']); exit; }
requireAdminApi();
requireCsrfApi($_POST['csrf_token'] ?? '');
try {
    $title = trim($_POST['title'] ?? '');
    $category = trim($_POST['category'] ?? 'General');
    $description = trim($_POST['description'] ?? '');
    if ($title === '') { http_response_code(400); echo json_encode(['status'=>'error','message'=>'Title required']); exit; }
    $slug = strtolower(preg_replace('/[^a-z0-9]+/i','-', $title));
    $stmt = $pdo->prepare("INSERT INTO projects (title, slug, category, description) VALUES (?, ?, ?, ?)");
    $stmt->execute([$title, $slug, $category, $description]);
    echo json_encode(['status'=>'success','id'=>$pdo->lastInsertId()]);
} catch (PDOException $e) { http_response_code(500); echo json_encode(['status'=>'error','message'=>$e->getMessage()]); }
