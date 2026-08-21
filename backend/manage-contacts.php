<?php
/**
 * Team 4x4 — Contact Messages Management API
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../includes/auth_helper.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

try {
    // 1. Submit message (Public contact form submit)
    // POST request with no admin check, just validation
    if ($method === 'POST' && isset($_POST['action']) && $_POST['action'] === 'submit') {
        $name = trim($_POST['name'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $phone = trim($_POST['phone'] ?? '');
        $subject = trim($_POST['subject'] ?? '');
        $message = trim($_POST['message'] ?? '');

        if ($name === '' || $email === '' || $message === '') {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Name, email, and message are required fields']);
            exit;
        }

        // Insert message
        $stmt = $pdo->prepare("INSERT INTO messages (name, email, phone, subject, message, status) VALUES (?, ?, ?, ?, ?, 'unread')");
        $stmt->execute([$name, $email, $phone, $subject, $message]);
        $messageId = $pdo->lastInsertId();

        // Create Admin Notification
        $notifTitle = "New Message from $name";
        $notifMsg = "Subject: " . ($subject ?: 'General Inquiry');
        $nStmt = $pdo->prepare("INSERT INTO admin_notifications (type, title, message) VALUES ('message', ?, ?)");
        $nStmt->execute([$notifTitle, $notifMsg]);

        echo json_encode(['status' => 'success', 'message' => 'Thank you. Your message has been received successfully.']);
        exit;
    }

    // All other operations require Admin access
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    if ($method === 'GET') {
        if (isset($_GET['id'])) {
            $id = intval($_GET['id']);
            $stmt = $pdo->prepare("SELECT * FROM messages WHERE id = ?");
            $stmt->execute([$id]);
            $msg = $stmt->fetch();
            
            if ($msg) {
                // Auto mark as read on view
                if ($msg['status'] === 'unread') {
                    $uStmt = $pdo->prepare("UPDATE messages SET status = 'read' WHERE id = ?");
                    $uStmt->execute([$id]);
                    $msg['status'] = 'read';
                }
                echo json_encode(['message' => $msg]);
            } else {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Message not found']);
            }
        } else {
            $stmt = $pdo->query("SELECT *, DATE_FORMAT(created_at, '%d %b %Y %H:%i') AS date FROM messages ORDER BY created_at DESC");
            $messages = $stmt->fetchAll();
            echo json_encode(['messages' => $messages]);
        }
        exit;
    }

    if ($method === 'POST') {
        $action = $_POST['action'] ?? '';
        $csrfToken = $_POST['csrf_token'] ?? '';

        if (!verifyCsrfToken($csrfToken)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'CSRF verification failed']);
            exit;
        }

        $id = intval($_POST['id'] ?? 0);
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid message ID']);
            exit;
        }

        if ($action === 'reply') {
            $replyContent = trim($_POST['reply_content'] ?? '');
            if ($replyContent === '') {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Reply content cannot be empty']);
                exit;
            }

            // Save reply
            $stmt = $pdo->prepare("UPDATE messages SET reply_content = ?, status = 'replied' WHERE id = ?");
            $stmt->execute([$replyContent, $id]);

            // In production, we would use mail/SMTP to send the reply to the user's email
            // $to = $messageRow['email']
            // mail($to, "RE: " . $subject, $replyContent);

            echo json_encode(['status' => 'success', 'message' => 'Reply saved successfully and message status updated']);
            exit;
        }

        if ($action === 'archive') {
            $stmt = $pdo->prepare("UPDATE messages SET status = 'archived' WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['status' => 'success', 'message' => 'Message archived successfully']);
            exit;
        }

        if ($action === 'delete') {
            $stmt = $pdo->prepare("DELETE FROM messages WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['status' => 'success', 'message' => 'Message deleted successfully']);
            exit;
        }
    }

    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
