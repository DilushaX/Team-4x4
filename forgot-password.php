<?php
/**
 * Team 4x4 — Forgot Password
 */

require_once 'includes/db.php';
require_once 'includes/auth_helper.php';

$message = '';
$messageColor = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $csrfToken = $_POST['csrf_token'] ?? '';

    if (!verifyCsrfToken($csrfToken)) {
        $message = "⚠️ CSRF verification failed.";
        $messageColor = "#f87171";
    } elseif ($email === '') {
        $message = "⚠️ Please enter your email address.";
        $messageColor = "#f87171";
    } else {
        try {
            $stmt = $pdo->prepare("SELECT id, name FROM users WHERE email = ? LIMIT 1");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if ($user) {
                // Generate token
                $token = bin2hex(random_bytes(32));
                $expires = date('Y-m-d H:i:s', time() + 3600); // 1 hour

                // Save to database
                $updateStmt = $pdo->prepare("UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?");
                $updateStmt->execute([$token, $expires, $user['id']]);

                // Reset link
                $resetLink = "reset-password.php?token=" . $token . "&email=" . urlencode($email);
                
                $message = "✅ Reset link generated! In production, this will be emailed. [Click here to reset your password]($resetLink)";
                $messageColor = "#4ade80";
            } else {
                // To prevent email enumeration, we can say check your inbox, but since it is a dev build, we will inform the user.
                $message = "⚠️ This email is not registered in our database.";
                $messageColor = "#f87171";
            }
        } catch (PDOException $e) {
            $message = "⚠️ Database error. Please try again later.";
            $messageColor = "#f87171";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Team 4x4 | Forgot Security Key</title>
    <link rel="stylesheet" href="css/style.css" />
    <link rel="stylesheet" href="css/responsive.css" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
</head>
<body class="auth-page auth-login">
    <header class="site-header">
        <div class="brand" style="display: flex; align-items: center; cursor: pointer;" onclick="window.location.href='index.php';">
            <span style="color: #ffce2e; margin-right: 0.6rem; font-size: 1.3rem;">🚙</span>
            <span class="brand-mark">TEAM 4X4</span>
        </div>
    </header>

    <main class="auth-main">
        <a href="login.php" class="auth-back">← Back to Login</a>
        <section class="auth-card">
            <div class="auth-card-head">
                <span class="auth-chip">KEY RECOVERY</span>
                <h1>Recover Key</h1>
                <p class="auth-subtitle">Request a reset link for your Technical Portal credentials.</p>
            </div>

            <?php if ($message): ?>
                <div style="color:<?php echo $messageColor; ?>;font-size:0.88rem;margin-bottom:1.25rem;background:rgba(255,255,255,0.05);padding:0.85rem;border-radius:8px;border:1px solid <?php echo $messageColor; ?>;line-height:1.5;">
                    <?php 
                    // Render reset link markdown as clickable html
                    if (strpos($message, '[Click here') !== false) {
                        preg_match('/\[(.*?)\]\((.*?)\)/', $message, $matches);
                        $cleanMsg = str_replace($matches[0], '', $message);
                        echo htmlspecialchars($cleanMsg) . ' <a href="' . htmlspecialchars($matches[2]) . '" style="color:#ffce2e;text-decoration:underline;font-weight:700;">' . htmlspecialchars($matches[1]) . '</a>';
                    } else {
                        echo htmlspecialchars($message);
                    }
                    ?>
                </div>
            <?php endif; ?>

            <form class="auth-form" method="post" action="forgot-password.php">
                <?php echo getCsrfInput(); ?>
                
                <label class="auth-field">
                    <span>Email Address</span>
                    <input type="email" name="email" placeholder="operator@team4x4.lk" required />
                </label>

                <button class="auth-button" type="submit">Request Reset Link →</button>
            </form>
        </section>
    </main>

    <script src="js/main.js"></script>
</body>
</html>
