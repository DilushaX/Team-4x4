<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../includes/auth_helper.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

requireAdminApi();
requireCsrfApi($_POST['csrf_token'] ?? '');

try {
    $id = intval($_POST['id'] ?? 0);
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid product id']);
        exit;
    }

    $action = $_POST['action'] ?? '';
    if ($action === 'toggle_featured') {
        $featured = isset($_POST['featured']) ? intval($_POST['featured']) : 0;
        $stmt = $pdo->prepare("UPDATE products SET is_featured = ? WHERE id = ?");
        $stmt->execute([$featured, $id]);
        echo json_encode(['status' => 'success', 'message' => 'Featured status updated successfully']);
        exit;
    }

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
        echo json_encode(['status' => 'error', 'message' => 'Product title and price are required']);
        exit;
    }

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

    // Handle main image upload securely
    $mainImagePath = null;
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

    // Build update fields
    $fields = [
        'title' => $title,
        'slug' => $slug,
        'sku' => $sku,
        'category' => $category,
        'category_id' => $categoryId,
        'description' => $description,
        'price' => $price,
        'stock' => $stock,
        'is_featured' => $featured,
        'features' => $features,
        'compatibility' => $compatibility
    ];
    if ($mainImagePath) {
        $fields['image_path'] = $mainImagePath;
    }

    $setParts = [];
    $values = [];
    foreach ($fields as $k => $v) {
        $setParts[] = "$k = ?";
        $values[] = $v;
    }
    $values[] = $id;

    $sql = "UPDATE products SET " . implode(', ', $setParts) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($values);

    // Handle multiple additional images
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
                $imgStmt->execute([$id, $extraRes['path']]);
            }
        }
    }

    echo json_encode(['status' => 'success', 'message' => 'Product updated successfully']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
