<?php
if (session_status() === PHP_SESSION_NONE) {
    $sessionPath = '/Applications/XAMPP/xamppfiles/temp';
    if (is_dir($sessionPath) && is_writable($sessionPath)) {
        session_save_path($sessionPath);
    }
    session_start();
}
require_once __DIR__ . '/db.php';

// Helper to determine active navbar states
function isPageActive($pageName) {
    $currentScript = basename($_SERVER['SCRIPT_NAME']);
    return ($currentScript === $pageName) ? 'class="active"' : '';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="4X4 DEFENDER PARTS offers premium Defender parts, restoration, fabrication, lighting and off-road upgrades designed for performance and adventure." />
    <title>4X4 DEFENDER PARTS | <?php echo isset($pageTitle) ? htmlspecialchars($pageTitle) : "Engineered Excellence"; ?></title>
    <link rel="stylesheet" href="css/style.css" />
    <link rel="stylesheet" href="css/animations.css" />
    <link rel="stylesheet" href="css/responsive.css" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet" />
</head>
<body class="<?php echo isset($bodyClass) ? htmlspecialchars($bodyClass) : ""; ?>">
    <header class="site-header">
        <div class="brand" onclick="window.location.href='index.php';">
            <img src="assets/images/logo.jpg" alt="4X4 DEFENDER PARTS Logo" />
            <span class="brand-wordmark">4X4 DEFENDER PARTS</span>
        </div>
        <button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobileNav">
            <span class="nav-toggle-bar"></span>
            <span class="nav-toggle-bar"></span>
            <span class="nav-toggle-bar"></span>
        </button>
        <div class="nav-overlay" hidden></div>
        <div class="header-menu" id="mobileNav" aria-hidden="true">
            <button class="nav-close" type="button" aria-label="Close menu">&times;</button>
            <nav class="site-nav">
                <a href="index.php" <?php echo isPageActive('index.php'); ?>>Home</a>
                <a href="shop.php" <?php echo isPageActive('shop.php'); ?>>Shop</a>
                <a href="gallery.php" <?php echo isPageActive('gallery.php'); ?>>Gallery</a>
                <a href="contact.php" <?php echo isPageActive('contact.php'); ?>>Contact</a>
                <a href="cart.php" <?php echo isPageActive('cart.php'); ?>>Cart</a>
            </nav>
            <div class="header-actions">
                <span class="search-icon">🔍</span>
                <?php if (isset($_SESSION['user_id'])): ?>
                    <?php if ($_SESSION['role'] === 'admin'): ?>
                        <a href="admin/dashboard.php" class="button-primary">Admin Portal</a>
                    <?php else: ?>
                        <span class="user-greeting">HI, <?php echo htmlspecialchars(strtoupper(explode(' ', $_SESSION['user_name'])[0])); ?></span>
                    <?php endif; ?>
                    <a href="logout.php" class="button-secondary">Log Out</a>
                <?php else: ?>
                    <a href="login.php" class="button-secondary">Login</a>
                    <a href="signup.php" class="button-primary">Sign Up</a>
                <?php endif; ?>
                <a href="contact.php" class="button-outline">Inquire</a>
            </div>
        </div>
    </header>
