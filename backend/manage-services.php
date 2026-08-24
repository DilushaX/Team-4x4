<?php
/**
 * 4x4 Defender Parts — Services Pages Management API
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
            $stmt = $pdo->prepare("SELECT * FROM services WHERE id = ?");
            $stmt->execute([$id]);
            $service = $stmt->fetch();
            echo json_encode(['service' => $service]);
        } elseif (isset($_GET['slug'])) {
            $slug = trim($_GET['slug']);
            $stmt = $pdo->prepare("SELECT * FROM services WHERE slug = ?");
            $stmt->execute([$slug]);
            $service = $stmt->fetch();
            echo json_encode(['service' => $service]);
        } else {
            $stmt = $pdo->query("SELECT * FROM services ORDER BY id ASC");
            $services = $stmt->fetchAll();
            echo json_encode(['services' => $services]);
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
            $slug = trim($_POST['slug'] ?? '');
            $subtitle = trim($_POST['subtitle'] ?? '');
            $description = trim($_POST['description'] ?? '');
            $features = trim($_POST['features'] ?? '');
            $pricing = trim($_POST['pricing'] ?? '');
            $duration = trim($_POST['duration'] ?? '');
            $compatibility = trim($_POST['compatibility'] ?? '');
            $faqs = trim($_POST['faqs'] ?? '[]'); // Expect JSON string
            $seoTitle = trim($_POST['seo_title'] ?? '');
            $seoDescription = trim($_POST['seo_description'] ?? '');

            if ($title === '') {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Service title is required']);
                exit;
            }

            if ($slug === '') {
                $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $title));
            }

            // Handle hero banner upload
            $heroBannerPath = null;
            if (!empty($_FILES['hero_banner']['name'])) {
                $uploadDir = __DIR__ . '/../uploads/services/';
                if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

                $file = $_FILES['hero_banner'];
                $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
                $allowed = ['jpg', 'jpeg', 'png', 'webp'];
                if (in_array($ext, $allowed) && $file['size'] <= 5 * 1024 * 1024) {
                    $filename = uniqid('s_') . '.' . $ext;
                    if (move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
                        $heroBannerPath = 'uploads/services/' . $filename;
                    }
                }
            }

            if ($action === 'add') {
                $stmt = $pdo->prepare("INSERT INTO services (slug, title, subtitle, description, features, hero_banner, pricing, duration, compatibility, faqs, seo_title, seo_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$slug, $title, $subtitle, $description, $features, $heroBannerPath, $pricing, $duration, $compatibility, $faqs, $seoTitle, $seoDescription]);
                $serviceId = $pdo->lastInsertId();
            } else {
                $id = intval($_POST['id'] ?? 0);
                if ($id <= 0) {
                    http_response_code(400);
                    echo json_encode(['status' => 'error', 'message' => 'Invalid service ID']);
                    exit;
                }

                if ($heroBannerPath) {
                    $stmt = $pdo->prepare("UPDATE services SET slug = ?, title = ?, subtitle = ?, description = ?, features = ?, hero_banner = ?, pricing = ?, duration = ?, compatibility = ?, faqs = ?, seo_title = ?, seo_description = ? WHERE id = ?");
                    $stmt->execute([$slug, $title, $subtitle, $description, $features, $heroBannerPath, $pricing, $duration, $compatibility, $faqs, $seoTitle, $seoDescription, $id]);
                } else {
                    $stmt = $pdo->prepare("UPDATE services SET slug = ?, title = ?, subtitle = ?, description = ?, features = ?, pricing = ?, duration = ?, compatibility = ?, faqs = ?, seo_title = ?, seo_description = ? WHERE id = ?");
                    $stmt->execute([$slug, $title, $subtitle, $description, $features, $pricing, $duration, $compatibility, $faqs, $seoTitle, $seoDescription, $id]);
                }
            }

            echo json_encode(['status' => 'success', 'message' => 'Service page content saved successfully']);
            exit;
        }

        if ($action === 'delete') {
            $id = intval($_POST['id'] ?? 0);
            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid service ID']);
                exit;
            }

            $stmt = $pdo->prepare("DELETE FROM services WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['status' => 'success', 'message' => 'Service deleted successfully']);
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
