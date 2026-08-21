<?php
/**
 * Team 4x4 — Products Management CRUD API
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../includes/auth_helper.php';

header('Content-Type: application/json');

// Protect API
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        if (isset($_GET['id'])) {
            $id = intval($_GET['id']);
            $stmt = $pdo->prepare("SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?");
            $stmt->execute([$id]);
            $product = $stmt->fetch();
            if ($product) {
                // Get additional images
                $imgStmt = $pdo->prepare("SELECT id, image_path FROM product_images WHERE product_id = ?");
                $imgStmt->execute([$id]);
                $product['images'] = $imgStmt->fetchAll();
                echo json_encode(['product' => $product]);
            } else {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Product not found']);
            }
        } else {
            $stmt = $pdo->query("SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC");
            $products = $stmt->fetchAll();
            echo json_encode(['products' => $products]);
        }
        exit;
    }

    if ($method === 'POST') {
        $action = $_POST['action'] ?? 'add';
        $csrfToken = $_POST['csrf_token'] ?? '';

        // Verify CSRF
        if (!verifyCsrfToken($csrfToken)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'CSRF verification failed']);
            exit;
        }

        if ($action === 'add' || $action === 'edit') {
            $title = trim($_POST['title'] ?? '');
            $sku = trim($_POST['sku'] ?? '');
            $categoryId = intval($_POST['category_id'] ?? 0);
            $price = floatval($_POST['price'] ?? 0);
            $stock = intval($_POST['stock'] ?? 0);
            $featured = isset($_POST['featured']) && (intval($_POST['featured']) === 1 || $_POST['featured'] === 'on') ? 1 : 0;
            $compatibility = trim($_POST['compatibility'] ?? '');
            $description = trim($_POST['description'] ?? '');
            $features = trim($_POST['features'] ?? '');
            $installationNotes = trim($_POST['installation_notes'] ?? '');

            // Fallback category name text
            $catName = '';
            if ($categoryId > 0) {
                $cStmt = $pdo->prepare("SELECT name FROM categories WHERE id = ?");
                $cStmt->execute([$categoryId]);
                $catName = $cStmt->fetchColumn() ?: '';
            }

            if ($title === '' || $price <= 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Product title and positive price are required']);
                exit;
            }

            $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $title));
            $uploadDir = __DIR__ . '/../uploads/products/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

            // Handle main image upload
            $mainImagePath = null;
            if (!empty($_FILES['image']['name'])) {
                $img = $_FILES['image'];
                $ext = strtolower(pathinfo($img['name'], PATHINFO_EXTENSION));
                $allowed = ['jpg', 'jpeg', 'png', 'webp'];
                if (in_array($ext, $allowed) && $img['size'] <= 5 * 1024 * 1024) {
                    $filename = uniqid('p_') . '.' . $ext;
                    if (move_uploaded_file($img['tmp_name'], $uploadDir . $filename)) {
                        $mainImagePath = 'uploads/products/' . $filename;
                    }
                }
            }

            if ($action === 'add') {
                $stmt = $pdo->prepare("INSERT INTO products (title, slug, description, price, stock, is_featured, image_path, sku, category, category_id, features, compatibility, installation_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$title, $slug, $description, $price, $stock, $featured, $mainImagePath, $sku, $catName, $categoryId, $features, $compatibility, $installationNotes]);
                $productId = $pdo->lastInsertId();

                // Log initial stock movement
                if ($stock > 0) {
                    $logStmt = $pdo->prepare("INSERT INTO inventory_movements (product_id, quantity_changed, reason, user_id) VALUES (?, ?, 'initial stock', ?)");
                    $logStmt->execute([$productId, $stock, $_SESSION['user_id']]);
                }
            } else {
                $productId = intval($_POST['id'] ?? 0);
                if ($productId <= 0) {
                    http_response_code(400);
                    echo json_encode(['status' => 'error', 'message' => 'Invalid product ID']);
                    exit;
                }

                // Check original stock to log difference
                $origStock = intval($pdo->query("SELECT stock FROM products WHERE id = $productId")->fetchColumn());
                
                $sql = "UPDATE products SET title = ?, slug = ?, description = ?, price = ?, stock = ?, is_featured = ?, sku = ?, category = ?, category_id = ?, features = ?, compatibility = ?, installation_notes = ? ";
                $params = [$title, $slug, $description, $price, $stock, $featured, $sku, $catName, $categoryId, $features, $compatibility, $installationNotes];

                if ($mainImagePath) {
                    $sql .= ", image_path = ? ";
                    $params[] = $mainImagePath;
                }

                $sql .= "WHERE id = ?";
                $params[] = $productId;

                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);

                // Log stock change if modified
                if ($stock !== $origStock) {
                    $diff = $stock - $origStock;
                    $logStmt = $pdo->prepare("INSERT INTO inventory_movements (product_id, quantity_changed, reason, user_id) VALUES (?, ?, 'manual correction', ?)");
                    $logStmt->execute([$productId, $diff, $_SESSION['user_id']]);
                }
            }

            // Handle additional images upload (multiple)
            if (!empty($_FILES['images']['name'][0])) {
                foreach ($_FILES['images']['name'] as $i => $name) {
                    if (empty($name)) continue;
                    $tmp = $_FILES['images']['tmp_name'][$i];
                    $size = $_FILES['images']['size'][$i];
                    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
                    $allowed = ['jpg', 'jpeg', 'png', 'webp'];
                    if (in_array($ext, $allowed) && $size <= 5 * 1024 * 1024) {
                        $filename = uniqid('pi_') . '.' . $ext;
                        if (move_uploaded_file($tmp, $uploadDir . $filename)) {
                            $imgPath = 'uploads/products/' . $filename;
                            $imgStmt = $pdo->prepare("INSERT INTO product_images (product_id, image_path) VALUES (?, ?)");
                            $imgStmt->execute([$productId, $imgPath]);
                        }
                    }
                }
            }

            echo json_encode(['status' => 'success', 'product_id' => $productId, 'message' => 'Product saved successfully']);
            exit;
        }

        if ($action === 'delete') {
            $id = intval($_POST['id'] ?? 0);
            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid product ID']);
                exit;
            }

            $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['status' => 'success', 'message' => 'Product deleted successfully']);
            exit;
        }

        if ($action === 'toggle_featured') {
            $id = intval($_POST['id'] ?? 0);
            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid product ID']);
                exit;
            }

            $stmt = $pdo->prepare("UPDATE products SET is_featured = NOT is_featured WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['status' => 'success', 'message' => 'Featured status toggled successfully']);
            exit;
        }

        if ($action === 'adjust_stock') {
            $id = intval($_POST['id'] ?? 0);
            $qty = intval($_POST['quantity_changed'] ?? 0);
            $reason = trim($_POST['reason'] ?? 'adjustment');

            if ($id <= 0 || $qty === 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid product or quantity change']);
                exit;
            }

            $pdo->beginTransaction();
            // Get current stock
            $cStmt = $pdo->prepare("SELECT stock FROM products WHERE id = ? FOR UPDATE");
            $cStmt->execute([$id]);
            $current = intval($cStmt->fetchColumn());

            $newStock = max(0, $current + $qty);

            // Update
            $uStmt = $pdo->prepare("UPDATE products SET stock = ? WHERE id = ?");
            $uStmt->execute([$newStock, $id]);

            // Log
            $logStmt = $pdo->prepare("INSERT INTO inventory_movements (product_id, quantity_changed, reason, user_id) VALUES (?, ?, ?, ?)");
            $logStmt->execute([$id, $qty, $reason, $_SESSION['user_id']]);

            $pdo->commit();

            echo json_encode(['status' => 'success', 'new_stock' => $newStock, 'message' => 'Stock adjusted successfully']);
            exit;
        }
    }

    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
