<?php
/**
 * 4x4 Defender Parts — Authentication State Check API
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../includes/auth_helper.php';

header('Content-Type: application/json');

echo json_encode([
    'logged_in' => isset($_SESSION['user_id']),
    'user_name' => $_SESSION['user_name'] ?? null,
    'role' => $_SESSION['role'] ?? null
]);
?>
