<?php
/**
 * 4x4 Defender Parts — Logout Route
 */

require_once 'includes/db.php';
require_once 'includes/auth_helper.php';

logoutUser();

header('Location: index.php');
exit;
?>
