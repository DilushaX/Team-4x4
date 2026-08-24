<?php
header('Content-Type: text/plain');
$dsn = 'mysql:host=127.0.0.1;port=3306;dbname=team4x4;charset=utf8mb4';
try {
    $pdo = new PDO($dsn, 'root', '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    $pdo->exec("ALTER TABLE products ADD COLUMN IF NOT EXISTS compatibility TEXT NULL");
    $pdo->exec("ALTER TABLE products ADD COLUMN IF NOT EXISTS `condition` VARCHAR(100) NULL DEFAULT 'New'");
    $pdo->exec("ALTER TABLE products ADD COLUMN IF NOT EXISTS installation_notes TEXT NULL");
    $pdo->exec("INSERT INTO settings (`key`, `value`) VALUES ('business_name', '4X4 DEFENDER PARTS') ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)");
    $pdo->exec("INSERT INTO settings (`key`, `value`) VALUES ('company_name', '4X4 DEFENDER PARTS') ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)");

    echo "migration_ok\n";
    foreach ($pdo->query('DESCRIBE products') as $row) {
        echo $row['Field'] . "\n";
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo 'migration_error: ' . $e->getMessage() . "\n";
}
