<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Placeholder build addition
    echo json_encode(['status' => 'success', 'message' => 'Add build endpoint is ready.']);
}
?>
