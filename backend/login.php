<?php
/**
 * Team 4x4 — Secure Login Processing API
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../includes/auth_helper.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $remember = isset($_POST['remember']);
    $csrfToken = $_POST['csrf_token'] ?? '';

    // Validate CSRF
    if (!verifyCsrfToken($csrfToken)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'CSRF verification failed. Request denied.']);
        exit;
    }

    if ($email === '' || $password === '') {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Email and password are required.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            // Log user in
            loginUser($user, $remember);

            // Return success with redirect destination
            $redirect = ($user['role'] === 'admin') ? 'admin/dashboard.php' : 'index.php';
            echo json_encode(['status' => 'success', 'redirect' => $redirect]);
            exit;
        } else {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Invalid email or password.']);
            exit;
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Internal database error.']);
        exit;
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
}
?>
