<?php
/**
 * Team 4x4 — Access Request Portal (Signup)
 */

require_once 'includes/db.php';
require_once 'includes/auth_helper.php';

// Redirect if already logged in
if (isset($_SESSION['user_id'])) {
    if ($_SESSION['role'] === 'admin') {
        header('Location: admin/dashboard.php');
    } else {
        header('Location: index.php');
    }
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Team 4x4 | Request Access</title>
    <link rel="stylesheet" href="css/style.css" />
    <link rel="stylesheet" href="css/responsive.css" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
</head>
<body class="auth-page auth-signup">
    <header class="site-header">
        <div class="brand" style="display: flex; align-items: center; cursor: pointer;" onclick="window.location.href='index.php';">
            <span style="color: #ffce2e; margin-right: 0.6rem; font-size: 1.3rem;">🚙</span>
            <span class="brand-mark">TEAM 4X4</span>
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
                <a href="index.php">Home</a>
                <a href="shop.php">Shop</a>
                <a href="gallery.php">Gallery</a>
                <a href="contact.php">Contact</a>
                <a href="cart.php">Cart</a>
            </nav>
            <div class="header-actions">
                <a href="login.php" class="button-secondary">Login</a>
                <a href="signup.php" class="button-primary active">Sign Up</a>
                <a href="contact.php" class="button-outline" style="font-size: 0.8rem; padding: 0.6rem 1.25rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 999px;">Inquire</a>
            </div>
        </div>
    </header>

    <main class="auth-main">
        <a href="index.php" class="auth-back">← Back Home</a>
        <section class="auth-card">
            <div class="auth-card-head">
                <span class="auth-chip">REQUEST ACCESS</span>
                <h1>Request Access</h1>
                <p class="auth-subtitle">Initialize your technical profile within the Team 4x4 ecosystem.</p>
            </div>

            <!-- Error display element -->
            <div id="auth-error-msg" style="color:#f87171;font-size:0.88rem;margin-bottom:1.25rem;display:none;background:rgba(248,113,113,0.08);padding:0.85rem;border-radius:8px;border:1px solid rgba(248,113,113,0.15);line-height:1.4;"></div>

            <form class="auth-form" method="post" id="signupForm">
                <?php echo getCsrfInput(); ?>

                <label class="auth-field">
                    <span>Full Name</span>
                    <input type="text" name="name" id="name" placeholder="John Doe" required />
                </label>

                <label class="auth-field">
                    <span>Email Address</span>
                    <input type="email" name="email" id="email" placeholder="operator@team4x4.lk" required />
                </label>

                <label class="auth-field">
                    <span>Security Key (Password)</span>
                    <input type="password" name="password" id="password" placeholder="••••••••••••" required />
                </label>

                <p class="auth-note">Minimum 6 characters for credential security.</p>

                <button class="auth-button" type="submit" id="submitBtn">Create Account →</button>
            </form>

            <div class="auth-cta">
                <p>Already Registered? <a href="login.php">Initiate Session →</a></p>
            </div>
        </section>

        <section class="auth-footer auth-footer-compact">
            <div class="auth-metric">
                <strong>99.9%</strong>
                <small>Uptime</small>
            </div>
            <div class="auth-metric">
                <strong>AES-256</strong>
                <small>Encryption</small>
            </div>
            <div class="auth-metric">
                <strong>24/7</strong>
                <small>Support</small>
            </div>
            <div class="auth-metric">
                <strong>Global</strong>
                <small>Nodes</small>
            </div>
        </section>
    </main>

    <script src="js/main.js"></script>
    <script>
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('signupForm');
        const errorDiv = document.getElementById('auth-error-msg');
        const submitBtn = document.getElementById('submitBtn');

        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            errorDiv.style.display = 'none';
            submitBtn.disabled = true;
            submitBtn.textContent = 'Registering Account…';

            const formData = new FormData(form);
            fetch('backend/signup.php', {
                method: 'POST',
                body: formData
            })
            .then(res => {
                return res.json().then(data => ({
                    ok: res.ok,
                    status: res.status,
                    body: data
                }));
            })
            .then(res => {
                if (res.ok && res.body.status === 'success') {
                    errorDiv.style.borderColor = '#4ade80';
                    errorDiv.style.background = 'rgba(74,222,128,0.08)';
                    errorDiv.style.color = '#4ade80';
                    errorDiv.textContent = '✅ Profile Registered! Redirecting to dashboard…';
                    errorDiv.style.display = 'block';
                    
                    setTimeout(() => {
                        window.location.href = res.body.redirect;
                    }, 800);
                } else {
                    errorDiv.textContent = '⚠️ ' + (res.body.message || 'Registration failed. Please check inputs.');
                    errorDiv.style.display = 'block';
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Create Account →';
                }
            })
            .catch(err => {
                errorDiv.textContent = '⚠️ Connection error. Please check server link.';
                errorDiv.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Account →';
            });
        });
    });
    </script>
</body>
</html>
