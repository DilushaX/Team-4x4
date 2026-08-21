<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../includes/auth_helper.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAdminApi();
    requireCsrfApi($_POST['csrf_token'] ?? '');

    try {
        // Validation
        $title = trim($_POST['title'] ?? '');
        $sku = trim($_POST['sku'] ?? '');
        $category = trim($_POST['category'] ?? '');
        $price = floatval($_POST['price'] ?? 0);
        $description = trim($_POST['description'] ?? '');
        $features = trim($_POST['features'] ?? '');
        $stock = intval($_POST['stock'] ?? 0);
        $featured = isset($_POST['featured']) && ($_POST['featured'] === '1' || $_POST['featured'] === 'on') ? 1 : 0;
        $compatibility = trim($_POST['compatibility'] ?? '');

        if ($title === '' || $price <= 0) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Product title and positive price are required.']);
            exit;
        }

        // Generate slug
        $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', trim($title)));

        // Look up category_id
        $categoryId = null;
        if ($category !== '') {
            $catStmt = $pdo->prepare("SELECT id FROM categories WHERE name = ? OR slug = ? LIMIT 1");
            $catStmt->execute([$category, strtolower(preg_replace('/[^a-z0-9]+/i', '-', $category))]);
            $catRow = $catStmt->fetch();
            if ($catRow) {
                $categoryId = $catRow['id'];
            }
        }

        // Handle main image upload using secure validation
        $mainImagePath = 'assets/images/fabrication.jpg'; // fallback default
        if (isset($_FILES['image']) && $_FILES['image']['error'] !== UPLOAD_ERR_NO_FILE) {
            $uploadRes = validateAndSaveImage($_FILES['image'], 'products');
            if (!$uploadRes['success']) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => $uploadRes['error']]);
                exit;
            }
            if ($uploadRes['path']) {
                $mainImagePath = $uploadRes['path'];
            }
        }

        // Insert product
        $stmt = $pdo->prepare("INSERT INTO products (title, slug, sku, category, category_id, description, price, stock, is_featured, image_path, features, compatibility) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$title, $slug, $sku, $category, $categoryId, $description, $price, $stock, $featured, $mainImagePath, $features, $compatibility]);
        $productId = $pdo->lastInsertId();

        // Handle multiple additional images if provided
        if (isset($_FILES['images']) && is_array($_FILES['images']['name'])) {
            foreach ($_FILES['images']['name'] as $i => $name) {
                if (empty($name)) continue;
                $singleFile = [
                    'name' => $_FILES['images']['name'][$i],
                    'type' => $_FILES['images']['type'][$i],
                    'tmp_name' => $_FILES['images']['tmp_name'][$i],
                    'error' => $_FILES['images']['error'][$i],
                    'size' => $_FILES['images']['size'][$i]
                ];
                $extraRes = validateAndSaveImage($singleFile, 'products');
                if ($extraRes['success'] && $extraRes['path']) {
                    $imgStmt = $pdo->prepare("INSERT INTO product_images (product_id, image_path) VALUES (?, ?)");
                    $imgStmt->execute([$productId, $extraRes['path']]);
                }
            }
        }

        echo json_encode(['status' => 'success', 'product_id' => $productId, 'message' => 'Product added successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}
