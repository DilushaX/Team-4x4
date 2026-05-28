<?php
if (session_status() === PHP_SESSION_NONE) {
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
    <title>Team 4x4 | <?php echo isset($pageTitle) ? htmlspecialchars($pageTitle) : "Engineered Excellence"; ?></title>
    <link rel="stylesheet" href="css/style.css" />
    <link rel="stylesheet" href="css/animations.css" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet" />
</head>
<body class="<?php echo isset($bodyClass) ? htmlspecialchars($bodyClass) : ""; ?>">
    <header class="site-header">
        <div class="brand" style="display: flex; align-items: center; cursor: pointer;" onclick="window.location.href='index.php';">
            <span style="color: #ffce2e; margin-right: 0.6rem; font-size: 1.3rem; display: inline-flex; align-items: center;">🚙</span>
            <span class="brand-mark">TEAM 4X4</span>
        </div>
        <nav class="site-nav">
            <a href="index.php" <?php echo isPageActive('index.php'); ?>>Home</a>
            <a href="shop.php" <?php echo isPageActive('shop.php'); ?>>Shop</a>
            <a href="gallery.php" <?php echo isPageActive('gallery.php'); ?>>Gallery</a>
            <a href="contact.php" <?php echo isPageActive('contact.php'); ?>>Contact</a>
            <a href="cart.php" <?php echo isPageActive('cart.php'); ?>>Cart</a>
        </nav>
        <div class="header-actions" style="display: flex; align-items: center; gap: 1rem;">
            <span class="search-icon" style="color: rgba(255, 255, 255, 0.7); cursor: pointer; font-size: 1.15rem; display: inline-flex; align-items: center; margin-right: 0.25rem;">🔍</span>
            
            <?php if (isset($_SESSION['user_id'])): ?>
                <!-- Logged In Sessions -->
                <?php if ($_SESSION['role'] === 'admin'): ?>
                    <a href="admin/dashboard.php" class="button-primary" style="font-size: 0.8rem; padding: 0.6rem 1.25rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">Admin Portal</a>
                <?php else: ?>
                    <span style="color: rgba(255, 255, 255, 0.7); font-size: 0.85rem; font-weight: 600; letter-spacing: 0.05em;">HI, <?php echo htmlspecialchars(strtoupper(explode(' ', $_SESSION['user_name'])[0])); ?></span>
                <?php endif; ?>
                <a href="logout.php" class="button-secondary" style="font-size: 0.8rem; padding: 0.6rem 1.25rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">Log Out</a>
            <?php else: ?>
                <!-- Guest Sessions -->
                <a href="login.php" class="button-secondary" style="font-size: 0.8rem; padding: 0.6rem 1.25rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">Login</a>
                <a href="signup.php" class="button-primary" style="font-size: 0.8rem; padding: 0.6rem 1.25rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">Sign Up</a>
            <?php endif; ?>
            
            <a href="contact.php" class="button-outline" style="font-size: 0.8rem; padding: 0.6rem 1.25rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 999px;">Inquire</a>
        </div>
    </header>
