<?php
/**
 * Team 4x4 — Reset Password
 */

require_once 'includes/db.php';
require_once 'includes/auth_helper.php';

$token = trim($_GET['token'] ?? $_POST['token'] ?? '');
$email = trim($_GET['email'] ?? $_POST['email'] ?? '');
$message = '';
$messageColor = '';
$isValid = false;
$user = null;

if ($token !== '' && $email !== '') {
    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND reset_token = ? LIMIT 1");
        $stmt->execute([$email, $token]);
        $user = $stmt->fetch();

        if ($user) {
            $expiry = strtotime($user['reset_expires']);
            if (time() < $expiry) {
                $isValid = true;
            } else {
                $message = "⚠️ This password reset link has expired.";
                $messageColor = "#f87171";
            }
        } else {
            $message = "⚠️ Invalid reset token or email address.";
            $messageColor = "#f87171";
        }
    } catch (PDOException $e) {
        $message = "⚠️ Database error.";
        $messageColor = "#f87171";
    }
} else {
    $message = "⚠️ Missing required parameters.";
    $messageColor = "#f87171";
}

if ($isValid && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $password = $_POST['password'] ?? '';
    $confirm = $_POST['confirm_password'] ?? '';
    $csrfToken = $_POST['csrf_token'] ?? '';

    if (!verifyCsrfToken($csrfToken)) {
        $message = "⚠️ CSRF verification failed.";
        $messageColor = "#f87171";
    } elseif (strlen($password) < 6) {
        $message = "⚠️ Security Key must be at least 6 characters.";
        $messageColor = "#f87171";
    } elseif ($password !== $confirm) {
        $message = "⚠️ Security Keys do not match.";
        $messageColor = "#f87171";
    } else {
        try {
            $hashed = password_hash($password, PASSWORD_BCRYPT);
            $updateStmt = $pdo->prepare("UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?");
            $updateStmt->execute([$hashed, $user['id']]);

            $message = "✅ Security Key reset successfully! Please log in with your new key.";
            $messageColor = "#4ade80";
            $isValid = false; // Hide form
        } catch (PDOException $e) {
            $message = "⚠️ Database error. Failed to save security key.";
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
    <title>Team 4x4 | Reset Security Key</title>
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
                <span class="auth-chip">KEY RESET</span>
                <h1>Reset Key</h1>
                <p class="auth-subtitle">Establish a new security key to regain Technical Portal access.</p>
            </div>

            <?php if ($message): ?>
                <div style="color:<?php echo $messageColor; ?>;font-size:0.88rem;margin-bottom:1.25rem;background:rgba(255,255,255,0.05);padding:0.85rem;border-radius:8px;border:1px solid <?php echo $messageColor; ?>;line-height:1.5;">
                    <?php echo htmlspecialchars($message); ?>
                </div>
            <?php endif; ?>

            <?php if ($isValid): ?>
                <form class="auth-form" method="post" action="reset-password.php">
                    <?php echo getCsrfInput(); ?>
                    <input type="hidden" name="token" value="<?php echo htmlspecialchars($token); ?>" />
                    <input type="hidden" name="email" value="<?php echo htmlspecialchars($email); ?>" />
                    
                    <label class="auth-field">
                        <span>New Security Key</span>
                        <input type="password" name="password" placeholder="••••••••••••" required />
                    </label>

                    <label class="auth-field">
                        <span>Confirm Security Key</span>
                        <input type="password" name="confirm_password" placeholder="••••••••••••" required />
                    </label>

                    <button class="auth-button" type="submit">Establish Security Key →</button>
                </form>
            <?php endif; ?>
        </section>
    </main>

    <script src="js/main.js"></script>
</body>
</html>
