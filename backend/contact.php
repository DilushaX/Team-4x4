<?php
/**
 * Team 4x4 — Contact / Inquiry Submission Handler
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../includes/auth_helper.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

try {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $vehicle = trim($_POST['vehicle'] ?? '');
    $service = trim($_POST['service'] ?? '');
    $message = trim($_POST['message'] ?? '');

    if ($name === '' || $email === '' || $message === '') {
        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) || strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Name, email, and message details are required.']);
            exit;
        } else {
            echo "<script>alert('Please fill in all required fields (Name, Email, Message).'); window.history.back();</script>";
            exit;
        }
    }

    // Insert message into MySQL
    $stmt = $pdo->prepare("INSERT INTO messages (name, email, phone, vehicle, service, message, status) VALUES (?, ?, ?, ?, ?, ?, 'unread')");
    $stmt->execute([$name, $email, $phone, $vehicle, $service, $message]);
    $msgId = $pdo->lastInsertId();

    // Insert admin notification
    $notifStmt = $pdo->prepare("INSERT INTO admin_notifications (type, title, message) VALUES ('message', ?, ?)");
    $notifStmt->execute([
        "New Inquiry from $name",
        "Subject: " . ($service ?: 'General Inquiry') . " — $email"
    ]);

    // Handle AJAX vs standard POST redirect
    if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) || strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false) {
        echo json_encode(['status' => 'success', 'message' => 'Inquiry received. Our workshop technicians will contact you shortly.', 'id' => $msgId]);
    } else {
        echo "<script>alert('Thank you for contacting Team 4x4. Your request has been transmitted successfully!'); window.location.href = '../contact.php?sent=1';</script>";
    }

} catch (PDOException $e) {
    if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) || strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    } else {
        echo "<script>alert('An error occurred. Please try again.'); window.history.back();</script>";
    }
}
?>
