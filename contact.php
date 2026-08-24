<?php
$pageTitle = "Contact Technicians";
$bodyClass = "contact-page";
require_once 'includes/db.php';
require_once 'includes/auth_helper.php';
$waNumber = getWhatsAppNumber($pdo);
require_once 'includes/header.php';
?>

<main>
    <section class="contact-hero">
        <div class="contact-hero-copy">
            <span class="eyebrow">4X4 DEFENDER PARTS</span>
            <h1>Connect with our elite technicians.</h1>
            <p>Schedule diagnostics, workshop operations, or custom build inquiries with precision and confidence.</p>
        </div>
    </section>

    <?php if (isset($_GET['sent'])): ?>
        <div style="max-width:800px;margin:1rem auto;padding:1rem 1.5rem;background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.3);border-radius:12px;color:#4ade80;text-align:center;font-weight:600;">
            ✅ Request transmitted successfully! Our technical team will reach out to you shortly.
        </div>
    <?php endif; ?>

    <section class="contact-grid">
        <aside class="contact-card contact-details">
            <div class="contact-card-title">
                <h3>Headquarters</h3>
            </div>
            <div class="contact-info">
                <p class="contact-label">Address</p>
                <p>No. 45, Garage Lane, Industrial Zone<br>Colombo 00200<br>Sri Lanka</p>
            </div>
            <div class="contact-info">
                <p class="contact-label">Communications</p>
                <p>+94 70 393 9459</p>
                <p>info@4x4defenderparts.lk</p>
            </div>
            <div class="contact-info">
                <p class="contact-label">Operational Hours</p>
                <p>Mon - Fri: 0800 - 1800 hrs</p>
                <p>Sat: 0900 - 1400 hrs</p>
                <p>Sun: Offroad Testing</p>
            </div>
            <div class="contact-actions">
                <a href="https://wa.me/<?php echo htmlspecialchars($waNumber); ?>" target="_blank" class="button-primary">WhatsApp Support</a>
            </div>
        </aside>

        <article class="contact-card contact-form-card">
            <div class="contact-card-title">
                <h3>Schedule Service / Inquiry</h3>
            </div>
            <form action="backend/contact.php" method="post" class="contact-form">
                <input type="hidden" name="csrf_token" value="<?php echo generateCsrfToken(); ?>" />
                
                <div class="form-row">
                    <label>
                        <span>Full Name *</span>
                        <input type="text" name="name" placeholder="Full Name" required value="<?php echo htmlspecialchars($_SESSION['user_name'] ?? ''); ?>" />
                    </label>
                    <label>
                        <span>Email Address *</span>
                        <input type="email" name="email" placeholder="Email Address" required value="<?php echo htmlspecialchars($_SESSION['user_email'] ?? ''); ?>" />
                    </label>
                </div>
                <div class="form-row">
                    <label>
                        <span>Phone Number</span>
                        <input type="tel" name="phone" placeholder="+94 7X XXX XXXX" />
                    </label>
                    <label>
                        <span>Vehicle Specification</span>
                        <input type="text" name="vehicle" placeholder="Make, Model, Year (e.g. Defender 110)" />
                    </label>
                </div>
                <div class="form-row">
                    <label style="width:100%;">
                        <span>Service Required</span>
                        <select name="service">
                            <option value="General Inquiry" selected>Select Protocol…</option>
                            <option value="Diagnostics">Diagnostics & Inspection</option>
                            <option value="Frame-Off Restoration">Frame-Off Restoration</option>
                            <option value="Tactical Suspension">Tactical Suspension</option>
                            <option value="Armor & Fabrication">Armor & Fabrication</option>
                            <option value="High-Output Lumens">High-Output Lumens</option>
                            <option value="Winch & Recovery">Winch & Recovery</option>
                            <option value="Elevated Air Intakes">Elevated Air Intakes</option>
                        </select>
                    </label>
                </div>
                <label>
                    <span>Operational Details *</span>
                    <textarea name="message" rows="5" placeholder="Describe the symptoms, requirements, or part numbers…" required></textarea>
                </label>
                <button type="submit" class="auth-button">INQUIRE ABOUT YOUR DEFENDER</button>
            </form>
        </article>
    </section>

    <section class="contact-map">
        <div class="map-pin">Workshop Location<br><strong>4x4 Defender Parts HQ, Colombo</strong></div>
    </section>
</main>

<?php require_once 'includes/footer.php'; ?>
