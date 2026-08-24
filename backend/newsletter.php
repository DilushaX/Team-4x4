<?php
/**
 * 4x4 Defender Parts — Newsletter Subscription Handler
 */

require_once __DIR__ . '/db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

$email = trim($_POST['email'] ?? '');

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Please enter a valid email address.']);
    exit;
}

try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $stmt = $pdo->prepare("INSERT IGNORE INTO subscribers (email) VALUES (?)");
    $stmt->execute([$email]);

    if ($stmt->rowCount() === 0) {
        echo json_encode(['status' => 'success', 'message' => 'You are already on the list!']);
    } else {
        echo json_encode(['status' => 'success', 'message' => 'Subscribed! Watch your inbox for updates.']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error. Please try again later.']);
}
