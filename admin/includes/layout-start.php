<?php require_once __DIR__ . '/init.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>4x4 Defender Parts Admin | <?php echo admin_escape($pageTitle); ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="css/admin.css" />
    <script>
        window.adminUser = {
            name: "<?php echo admin_escape($_SESSION['user_name'] ?? 'Admin'); ?>",
            role: "<?php echo admin_escape($_SESSION['role'] ?? 'admin'); ?>"
        };
        window.csrfToken = "<?php echo generateCsrfToken(); ?>";
    </script>
    <?php echo $extraHead; ?>
</head>
<body class="admin-body"
    data-admin-page="<?php echo admin_escape($pageId); ?>"
    data-admin-title="<?php echo admin_escape($pageTitle); ?>"
    data-admin-breadcrumb="<?php echo admin_escape($pageBreadcrumb); ?>">

<div id="admin-page-content">
