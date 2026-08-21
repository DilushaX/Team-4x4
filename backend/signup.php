<?php
/**
 * Team 4x4 — Secure Signup Processing API
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../includes/auth_helper.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $csrfToken = $_POST['csrf_token'] ?? '';

    // Validate CSRF
    if (!verifyCsrfToken($csrfToken)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'CSRF verification failed. Request denied.']);
        exit;
    }

    if ($name === '' || $email === '' || $password === '') {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'All fields are required.']);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Please enter a valid email address.']);
        exit;
    }

    if (strlen($password) < 6) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Password must be at least 6 characters.']);
        exit;
    }

    try {
        // Check if user already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['status' => 'error', 'message' => 'This email address is already registered.']);
            exit;
        }

        // Hash password
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        // Begin transaction to ensure both user and customer profile are created
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'customer')");
        $stmt->execute([$name, $email, $hashedPassword]);
        $userId = $pdo->lastInsertId();

        // Create empty customer profile
        $custStmt = $pdo->prepare("INSERT INTO customers (user_id) VALUES (?)");
        $custStmt->execute([$userId]);

        $pdo->commit();

        // Log the newly registered user in
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        loginUser($user);

        echo json_encode(['status' => 'success', 'redirect' => 'index.php']);
        exit;
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error during account registration.']);
        exit;
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
}
?>
