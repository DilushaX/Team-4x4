<?php
// 4x4DefenderParts Production-Ready Database Connector
if (session_status() === PHP_SESSION_NONE) {
    $sessionPath = '/Applications/XAMPP/xamppfiles/temp';
    if (is_dir($sessionPath) && is_writable($sessionPath)) {
        session_save_path($sessionPath);
    }
    session_start();
}

$host = getenv('DB_HOST') ?: '127.0.0.1';
$port = getenv('DB_PORT') ?: 3306;
$db   = getenv('DB_NAME') ?: 'team4x4';
$user = getenv('DB_USER') ?: 'root';
$pass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';
$charset = 'utf8mb4';

$socket = getenv('DB_SOCKET') ?: '/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock';
if (file_exists($socket) && empty(getenv('DB_HOST'))) {
    $dsn = "mysql:unix_socket=$socket;dbname=$db;charset=$charset";
} else {
    $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
}

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    error_log("Database connection error: " . $e->getMessage());
    if (getenv('APP_ENV') === 'development' || (defined('DEV_MODE') && DEV_MODE)) {
        die("Database connection failed: " . htmlspecialchars($e->getMessage()));
    } else {
        http_response_code(500);
        die("Service temporarily unavailable. Please try again later.");
    }
}
?>
