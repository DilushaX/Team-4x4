<?php
/**
 * 4x4 Defender Parts — Secure Authentication & Session Helper
 */

if (session_status() === PHP_SESSION_NONE) {
    // Session configuration for security
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    ini_set('session.cookie_secure', isset($_SERVER['HTTPS']) ? 1 : 0);
    session_start();
}

// Session Timeout duration (30 minutes = 1800 seconds)
define('SESSION_TIMEOUT', 1800);

/**
 * Log in a user and set up session variables
 */
function loginUser($user, $remember = false) {
    session_regenerate_id(true); // Prevent session fixation
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['role'] = $user['role'] ?? 'customer';
    $_SESSION['last_activity'] = time();

    if ($remember) {
        // Generate remember-me cookie (lasts 30 days)
        $token = bin2hex(random_bytes(32));
        $_SESSION['remember_token'] = $token;
        setcookie('remember_token', $token, time() + (86400 * 30), "/", "", isset($_SERVER['HTTPS']), true);
        
        // Save token to database
        global $pdo;
        if (isset($pdo)) {
            $stmt = $pdo->prepare("UPDATE users SET remember_token = ? WHERE id = ?");
            $stmt->execute([$token, $user['id']]);
        }
    }
}

/**
 * Log out current user and clear session
 */
function logoutUser() {
    global $pdo;
    if (isset($_SESSION['user_id']) && isset($_COOKIE['remember_token'])) {
        if (isset($pdo)) {
            $stmt = $pdo->prepare("UPDATE users SET remember_token = NULL WHERE id = ?");
            $stmt->execute([$_SESSION['user_id']]);
        }
    }

    $_SESSION = [];
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    setcookie('remember_token', '', time() - 3600, "/");
    session_destroy();
}

/**
 * Check session activity and handle automatic timeout
 */
function checkSessionTimeout() {
    if (isset($_SESSION['user_id'])) {
        if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > SESSION_TIMEOUT)) {
            logoutUser();
            session_start();
            $_SESSION['login_error'] = "Session expired due to inactivity. Please log in again.";
            header('Location: login.php');
            exit;
        }
        $_SESSION['last_activity'] = time();
    }
}

// Automatically check timeout on page load
checkSessionTimeout();

/**
 * Verify authentication and role requirements
 */
function checkAuth($requiredRole = null) {
    if (!isset($_SESSION['user_id'])) {
        $_SESSION['login_error'] = "Please log in to access this page.";
        $loginUrl = (strpos($_SERVER['SCRIPT_NAME'], '/admin/') !== false) ? '../login.php' : 'login.php';
        header('Location: ' . $loginUrl);
        exit;
    }

    if ($requiredRole !== null && ($_SESSION['role'] ?? '') !== $requiredRole) {
        // Forbidden
        http_response_code(403);
        exit("Access Denied: Insufficient operational clearance.");
    }
}

/**
 * Generate CSRF Token and store in session
 */
function generateCsrfToken() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Output Hidden CSRF Form input
 */
function getCsrfInput() {
    $token = generateCsrfToken();
    return '<input type="hidden" name="csrf_token" value="' . htmlspecialchars($token) . '" />';
}

/**
 * Verify CSRF Token against session
 */
function verifyCsrfToken($token) {
    if (!isset($_SESSION['csrf_token']) || empty($token)) {
        return false;
    }
    return hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Helper to sanitize user outputs (XSS prevention)
 */
function escape($value) {
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

/**
 * Securely validate and save image upload (Requirement 22)
 *
 * @param array $file Single $_FILES element e.g. $_FILES['image']
 * @param string $targetSubDir Subfolder inside uploads/ e.g. 'products', 'gallery', 'categories'
 * @return array ['success' => bool, 'path' => string|null, 'error' => string|null]
 */
function validateAndSaveImage($file, $targetSubDir = 'products') {
    if (!isset($file['error']) || is_array($file['error'])) {
        return ['success' => false, 'error' => 'Invalid upload parameters.'];
    }

    if ($file['error'] === UPLOAD_ERR_NO_FILE) {
        return ['success' => true, 'path' => null];
    }

    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['success' => false, 'error' => 'Upload error code: ' . $file['error']];
    }

    // 5MB Size Validation
    $maxBytes = 5 * 1024 * 1024;
    if ($file['size'] > $maxBytes) {
        return ['success' => false, 'error' => 'File size exceeds 5MB maximum limit.'];
    }

    // Extension Validation
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
    if (!in_array($ext, $allowedExts, true)) {
        return ['success' => false, 'error' => 'Invalid file extension. Only JPG, PNG, WEBP allowed.'];
    }

    // finfo MIME Type Validation
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    $allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!in_array($mime, $allowedMimes, true)) {
        return ['success' => false, 'error' => 'Invalid image MIME type: ' . $mime];
    }

    // Create target directory
    $uploadBaseDir = __DIR__ . '/../uploads/' . trim($targetSubDir, '/') . '/';
    if (!is_dir($uploadBaseDir)) {
        mkdir($uploadBaseDir, 0755, true);
    }

    // Generate unique secure filename
    $uniqueName = bin2hex(random_bytes(16)) . '.' . $ext;
    $targetPath = $uploadBaseDir . $uniqueName;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        return ['success' => false, 'error' => 'Failed to move uploaded file.'];
    }

    $relativePath = 'uploads/' . trim($targetSubDir, '/') . '/' . $uniqueName;
    return ['success' => true, 'path' => $relativePath];
}

/**
 * Require admin role for JSON API endpoints.
 */
function requireAdminApi() {
    if (!isset($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'admin') {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }
}

/**
 * Verify CSRF token for API POST requests; exits with JSON error on failure.
 */
function requireCsrfApi($token) {
    if (!verifyCsrfToken($token)) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode(['status' => 'error', 'message' => 'CSRF verification failed']);
        exit;
    }
}

/**
 * Normalize settings keys for public/admin compatibility.
 */
function normalizeSettingsKeys(array $settings) {
    $map = [
        'company_name' => 'business_name',
        'whatsapp_number' => 'whatsapp',
        'contact_phone' => 'phone',
        'contact_email' => 'email',
        'workshop_address' => 'address',
        'delivery_charge' => 'delivery_charges',
    ];
    foreach ($map as $newKey => $legacyKey) {
        if (!empty($settings[$newKey]) && empty($settings[$legacyKey])) {
            $settings[$legacyKey] = $settings[$newKey];
        } elseif (!empty($settings[$legacyKey]) && empty($settings[$newKey])) {
            $settings[$newKey] = $settings[$legacyKey];
        }
    }
    return $settings;
}

/**
 * Sync canonical + legacy settings keys in database.
 */
function syncSettingsAliases(PDO $pdo, array $postData) {
    $aliases = [
        'company_name' => 'business_name',
        'whatsapp_number' => 'whatsapp',
        'contact_phone' => 'phone',
        'contact_email' => 'email',
        'workshop_address' => 'address',
        'delivery_charge' => 'delivery_charges',
    ];
    $stmt = $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?");
    foreach ($aliases as $primary => $legacy) {
        if (isset($postData[$primary])) {
            $val = trim($postData[$primary]);
            $stmt->execute([$legacy, $val, $val]);
        }
    }
}

/**
 * Load all site settings from database with normalized keys.
 */
function getSiteSettings(PDO $pdo) {
    $settings = [];
    try {
        $stmt = $pdo->query("SELECT `key`, `value` FROM settings");
        foreach ($stmt->fetchAll() as $row) {
            $settings[$row['key']] = $row['value'];
        }
    } catch (PDOException $e) {
        // Return empty on failure
    }
    return normalizeSettingsKeys($settings);
}

/**
 * Get WhatsApp number digits only for wa.me links.
 */
function getWhatsAppNumber(PDO $pdo) {
    $s = getSiteSettings($pdo);
    $wa = preg_replace('/\D/', '', $s['whatsapp_number'] ?? $s['whatsapp'] ?? '94703939459');
    return $wa ?: '94703939459';
}
