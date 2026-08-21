<?php
/**
 * Team 4x4 — Messages Management API
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../includes/auth_helper.php';

header('Content-Type: application/json');

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        if (isset($_GET['id'])) {
            $id = intval($_GET['id']);
            $stmt = $pdo->prepare("SELECT * FROM messages WHERE id = ?");
            $stmt->execute([$id]);
            $msg = $stmt->fetch();
            echo json_encode(['message' => $msg]);
        } else {
            $stmt = $pdo->query("SELECT * FROM messages ORDER BY created_at DESC");
            $messages = $stmt->fetchAll();
            echo json_encode(['messages' => $messages]);
        }
        exit;
    }

    if ($method === 'POST') {
        $action = $_POST['action'] ?? '';
        requireCsrfApi($_POST['csrf_token'] ?? '');
        $id = intval($_POST['id'] ?? 0);

        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid message ID']);
            exit;
        }

        if ($action === 'mark_read') {
            $stmt = $pdo->prepare("UPDATE messages SET status = 'read' WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['status' => 'success', 'message' => 'Message marked as read']);
            exit;
        }

        if ($action === 'delete') {
            $stmt = $pdo->prepare("DELETE FROM messages WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['status' => 'success', 'message' => 'Message deleted']);
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
