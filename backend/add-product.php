<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Add product placeholder
    echo json_encode(['status' => 'success', 'message' => 'Add product endpoint is ready.']);
}
?>
