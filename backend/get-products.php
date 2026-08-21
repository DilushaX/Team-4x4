<?php
require_once 'db.php';

header('Content-Type: application/json');

try {
	if (isset($_GET['id'])) {
		$id = intval($_GET['id']);
		$stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
		$stmt->execute([$id]);
		$product = $stmt->fetch();
		if ($product) {
			$imgStmt = $pdo->prepare("SELECT image_path FROM product_images WHERE product_id = ?");
			$imgStmt->execute([$product['id']]);
			$images = $imgStmt->fetchAll(PDO::FETCH_COLUMN);
			$product['images'] = $images;
			echo json_encode(['product' => $product]);
			exit;
		}
		echo json_encode(['product' => null]);
		exit;
	}

	$page = max(1, intval($_GET['page'] ?? 1));
	$limit = intval($_GET['limit'] ?? 0);
	if ($limit > 0) {
		$limit = min(100, max(1, $limit));
	}
	$search = trim($_GET['search'] ?? $_GET['q'] ?? '');
	$category = trim($_GET['category'] ?? '');

	$where = [];
	$params = [];

	if ($search !== '') {
		$where[] = "(title LIKE ? OR sku LIKE ? OR category LIKE ? OR description LIKE ?)";
		$term = '%' . $search . '%';
		$params = array_merge($params, [$term, $term, $term, $term]);
	}
	if ($category !== '') {
		$where[] = "category = ?";
		$params[] = $category;
	}

	$whereSql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

	$countStmt = $pdo->prepare("SELECT COUNT(*) FROM products $whereSql");
	$countStmt->execute($params);
	$total = intval($countStmt->fetchColumn());

	$sql = "SELECT id, title, sku, category, price, stock, is_featured AS featured, image_path, slug, description, compatibility FROM products $whereSql ORDER BY created_at DESC";
	if ($limit > 0) {
		$offset = ($page - 1) * $limit;
		$sql .= " LIMIT $limit OFFSET $offset";
	}

	$stmt = $pdo->prepare($sql);
	$stmt->execute($params);
	$products = $stmt->fetchAll();

	$response = ['products' => $products];
	if ($limit > 0) {
		$response['pagination'] = [
			'page' => $page,
			'limit' => $limit,
			'total' => $total,
			'pages' => max(1, (int) ceil($total / $limit)),
		];
	}

	echo json_encode($response);
} catch (PDOException $e) {
	http_response_code(500);
	echo json_encode(['error' => $e->getMessage()]);
}
