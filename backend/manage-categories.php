<?php
/**
 * 4x4 Defender Parts — Categories Management API
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
            $stmt = $pdo->prepare("SELECT * FROM categories WHERE id = ?");
            $stmt->execute([$id]);
            $category = $stmt->fetch();
            echo json_encode(['category' => $category]);
        } else {
            $stmt = $pdo->query("SELECT * FROM categories ORDER BY sort_order ASC, name ASC");
            $categories = $stmt->fetchAll();
            echo json_encode(['categories' => $categories]);
        }
        exit;
    }

    if ($method === 'POST') {
        $action = $_POST['action'] ?? 'add';
        $csrfToken = $_POST['csrf_token'] ?? '';

        // Validate CSRF for modifications
        if (!verifyCsrfToken($csrfToken)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'CSRF verification failed']);
            exit;
        }

        if ($action === 'add' || $action === 'edit') {
            $name = trim($_POST['name'] ?? '');
            $description = trim($_POST['description'] ?? '');
            $status = isset($_POST['status']) ? intval($_POST['status']) : 1;
            $sortOrder = isset($_POST['sort_order']) ? intval($_POST['sort_order']) : 0;

            if ($name === '') {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Category name is required']);
                exit;
            }

            $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $name));

            // Image Upload
            $imagePath = null;
            if (!empty($_FILES['image']['name'])) {
                $uploadDir = __DIR__ . '/../uploads/categories/';
                if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

                $img = $_FILES['image'];
                $ext = strtolower(pathinfo($img['name'], PATHINFO_EXTENSION));
                
                // MIME validation
                $allowed = ['jpg', 'jpeg', 'png', 'webp'];
                if (!in_array($ext, $allowed)) {
                    http_response_code(400);
                    echo json_encode(['status' => 'error', 'message' => 'Invalid file format. Only JPG, PNG, WEBP allowed.']);
                    exit;
                }

                if ($img['size'] > 5 * 1024 * 1024) {
                    http_response_code(400);
                    echo json_encode(['status' => 'error', 'message' => 'File size exceeds 5MB limit']);
                    exit;
                }

                $filename = uniqid('cat_') . '.' . $ext;
                $target = $uploadDir . $filename;
                if (move_uploaded_file($img['tmp_name'], $target)) {
                    $imagePath = 'uploads/categories/' . $filename;
                }
            }

            if ($action === 'add') {
                $stmt = $pdo->prepare("INSERT INTO categories (name, slug, description, image_path, status, sort_order) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([$name, $slug, $description, $imagePath, $status, $sortOrder]);
                echo json_encode(['status' => 'success', 'message' => 'Category added successfully']);
            } else {
                $id = intval($_POST['id'] ?? 0);
                if ($id <= 0) {
                    http_response_code(400);
                    echo json_encode(['status' => 'error', 'message' => 'Invalid category ID']);
                    exit;
                }

                if ($imagePath) {
                    $stmt = $pdo->prepare("UPDATE categories SET name = ?, slug = ?, description = ?, image_path = ?, status = ?, sort_order = ? WHERE id = ?");
                    $stmt->execute([$name, $slug, $description, $imagePath, $status, $sortOrder, $id]);
                } else {
                    $stmt = $pdo->prepare("UPDATE categories SET name = ?, slug = ?, description = ?, status = ?, sort_order = ? WHERE id = ?");
                    $stmt->execute([$name, $slug, $description, $status, $sortOrder, $id]);
                }
                echo json_encode(['status' => 'success', 'message' => 'Category updated successfully']);
            }
            exit;
        }

        if ($action === 'delete') {
            $id = intval($_POST['id'] ?? 0);
            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid category ID']);
                exit;
            }

            $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['status' => 'success', 'message' => 'Category deleted successfully']);
            exit;
        }

        if ($action === 'toggle_status') {
            $id = intval($_POST['id'] ?? 0);
            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid category ID']);
                exit;
            }

            $stmt = $pdo->prepare("UPDATE categories SET status = NOT status WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['status' => 'success', 'message' => 'Status toggled successfully']);
            exit;
        }
    }

    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
