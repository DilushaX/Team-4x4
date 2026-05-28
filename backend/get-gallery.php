<?php
header('Content-Type: application/json');
$uploadDir = __DIR__ . '/../uploads/gallery';
$files = [];
$allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
if (is_dir($uploadDir)) {
    foreach (scandir($uploadDir) as $file) {
        if ($file === '.' || $file === '..') {
            continue;
        }
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        if (!in_array($ext, $allowed, true)) {
            continue;
        }
        $files[] = 'uploads/gallery/' . $file;
    }
}
echo json_encode(array_values($files));
