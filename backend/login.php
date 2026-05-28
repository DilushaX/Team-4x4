<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    // Placeholder login logic
    echo json_encode(['status' => 'success', 'message' => 'Login endpoint is ready.']);
}
?>
