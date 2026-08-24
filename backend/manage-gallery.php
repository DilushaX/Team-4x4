<?php
/**
 * 4x4 Defender Parts — Gallery Projects Management API
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
            $stmt = $pdo->prepare("SELECT * FROM projects WHERE id = ?");
            $stmt->execute([$id]);
            $project = $stmt->fetch();
            if ($project) {
                // Secondary gallery images
                $imgStmt = $pdo->prepare("SELECT id, image_path FROM project_images WHERE project_id = ?");
                $imgStmt->execute([$id]);
                $project['images'] = $imgStmt->fetchAll();
                echo json_encode(['project' => $project]);
            } else {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Project not found']);
            }
        } else {
            $stmt = $pdo->query("SELECT * FROM projects ORDER BY project_order ASC, created_at DESC");
            $projects = $stmt->fetchAll();
            echo json_encode(['projects' => $projects]);
        }
        exit;
    }

    if ($method === 'POST') {
        $action = $_POST['action'] ?? 'add';
        $csrfToken = $_POST['csrf_token'] ?? '';

        if (!verifyCsrfToken($csrfToken)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'CSRF verification failed']);
            exit;
        }

        if ($action === 'add' || $action === 'edit') {
            $title = trim($_POST['title'] ?? '');
            $category = trim($_POST['category'] ?? 'Restoration');
            $description = trim($_POST['description'] ?? '');
            $modifications = trim($_POST['modifications'] ?? '');
            $installedParts = trim($_POST['installed_parts'] ?? '');
            $customerNotes = trim($_POST['customer_notes'] ?? '');
            $completionDate = trim($_POST['completion_date'] ?? date('Y-m-d'));
            $projectOrder = intval($_POST['project_order'] ?? 0);

            if ($title === '') {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Project title is required']);
                exit;
            }

            $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $title));
            $uploadDir = __DIR__ . '/../uploads/gallery/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

            // Upload helper
            $uploadImage = function($fileKey) use ($uploadDir) {
                if (!empty($_FILES[$fileKey]['name'])) {
                    $file = $_FILES[$fileKey];
                    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
                    $allowed = ['jpg', 'jpeg', 'png', 'webp'];
                    if (in_array($ext, $allowed) && $file['size'] <= 5 * 1024 * 1024) {
                        $filename = uniqid('g_') . '_' . $fileKey . '.' . $ext;
                        if (move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
                            return 'uploads/gallery/' . $filename;
                        }
                    }
                }
                return null;
            };

            $featuredImage = $uploadImage('featured_image');
            $beforeImage = $uploadImage('before_image');
            $afterImage = $uploadImage('after_image');

            if ($action === 'add') {
                $stmt = $pdo->prepare("INSERT INTO projects (title, slug, category, description, featured_image, before_image, after_image, modifications, installed_parts, customer_notes, completion_date, project_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$title, $slug, $category, $description, $featuredImage, $beforeImage, $afterImage, $modifications, $installedParts, $customerNotes, $completionDate, $projectOrder]);
                $projectId = $pdo->lastInsertId();
            } else {
                $projectId = intval($_POST['id'] ?? 0);
                if ($projectId <= 0) {
                    http_response_code(400);
                    echo json_encode(['status' => 'error', 'message' => 'Invalid project ID']);
                    exit;
                }

                // Fetch original images for preservation if no new upload
                $origStmt = $pdo->prepare("SELECT featured_image, before_image, after_image FROM projects WHERE id = ?");
                $origStmt->execute([$projectId]);
                $orig = $origStmt->fetch();

                if (!$featuredImage) $featuredImage = $orig['featured_image'];
                if (!$beforeImage) $beforeImage = $orig['before_image'];
                if (!$afterImage) $afterImage = $orig['after_image'];

                $stmt = $pdo->prepare("UPDATE projects SET title = ?, slug = ?, category = ?, description = ?, featured_image = ?, before_image = ?, after_image = ?, modifications = ?, installed_parts = ?, customer_notes = ?, completion_date = ?, project_order = ? WHERE id = ?");
                $stmt->execute([$title, $slug, $category, $description, $featuredImage, $beforeImage, $afterImage, $modifications, $installedParts, $customerNotes, $completionDate, $projectOrder, $projectId]);
            }

            // Handle additional images (multiple)
            if (!empty($_FILES['images']['name'][0])) {
                foreach ($_FILES['images']['name'] as $i => $name) {
                    if (empty($name)) continue;
                    $tmp = $_FILES['images']['tmp_name'][$i];
                    $size = $_FILES['images']['size'][$i];
                    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
                    $allowed = ['jpg', 'jpeg', 'png', 'webp'];
                    if (in_array($ext, $allowed) && $size <= 5 * 1024 * 1024) {
                        $filename = uniqid('g_extra_') . '.' . $ext;
                        if (move_uploaded_file($tmp, $uploadDir . $filename)) {
                            $imgPath = 'uploads/gallery/' . $filename;
                            $imgStmt = $pdo->prepare("INSERT INTO project_images (project_id, image_path) VALUES (?, ?)");
                            $imgStmt->execute([$projectId, $imgPath]);
                        }
                    }
                }
            }

            echo json_encode(['status' => 'success', 'project_id' => $projectId, 'message' => 'Project saved successfully']);
            exit;
        }

        if ($action === 'delete') {
            $id = intval($_POST['id'] ?? 0);
            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid project ID']);
                exit;
            }

            $stmt = $pdo->prepare("DELETE FROM projects WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['status' => 'success', 'message' => 'Project deleted successfully']);
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
