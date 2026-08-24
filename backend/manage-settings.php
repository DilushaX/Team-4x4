<?php
/**
 * 4x4 Defender Parts — Settings Management API
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../includes/auth_helper.php';

header('Content-Type: application/json');

// Protect API (Reading public settings is allowed, but saving is restricted to admins)
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM settings");
        $raw = $stmt->fetchAll();
        
        $settings = [];
        foreach ($raw as $row) {
            $settings[$row['key']] = $row['value'];
        }
        $settings = normalizeSettingsKeys($settings);
        
        echo json_encode(['status' => 'success', 'settings' => $settings]);
        exit;
    }

    if ($method === 'POST') {
        // Only admin can write settings
        if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
            exit;
        }

        $csrfToken = $_POST['csrf_token'] ?? '';
        if (!verifyCsrfToken($csrfToken)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'CSRF verification failed']);
            exit;
        }

        // Loop through all POST keys and save them, excluding action and csrf_token
        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?");
        
        foreach ($_POST as $key => $value) {
            if ($key === 'action' || $key === 'csrf_token') continue;
            
            // Trim inputs
            $value = trim($value);
            $stmt->execute([$key, $value, $value]);
        }
        
        $pdo->commit();
        syncSettingsAliases($pdo, $_POST);
        echo json_encode(['status' => 'success', 'message' => 'System settings updated successfully']);
        exit;
    }

    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
