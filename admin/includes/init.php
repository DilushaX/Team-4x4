<?php
/**
 * 4x4 Defender Parts Admin — Page bootstrap (PHP/MySQL secure)
 * Usage: require_once 'includes/init.php'; at top of each admin/*.php page
 */

require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth_helper.php';

// Access guard - restricts to admin role
checkAuth('admin');

$pageId = $pageId ?? 'dashboard';
$pageTitle = $pageTitle ?? 'Dashboard Overview';
$pageBreadcrumb = $pageBreadcrumb ?? 'Operations Portal';
$extraHead = $extraHead ?? '';
$extraScripts = $extraScripts ?? '';

function admin_escape($value) {
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}
?>
