<?php
require_once 'db.php';
header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT p.id, p.title, p.slug, p.category, p.description, p.featured_image, p.project_order, (SELECT COUNT(1) FROM project_images WHERE project_id = p.id) AS image_count FROM projects p ORDER BY p.project_order ASC, p.created_at DESC");
    $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['projects' => $projects]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['projects' => [], 'error' => $e->getMessage()]);
}
