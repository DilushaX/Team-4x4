<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    // Placeholder signup logic
    echo json_encode(['status' => 'success', 'message' => 'Signup endpoint is ready.']);
}
?>
