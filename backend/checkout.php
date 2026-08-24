<?php
/**
 * 4x4 Defender Parts — Checkout & Order Creation API
 * Saves order to MySQL BEFORE redirecting to WhatsApp
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../includes/auth_helper.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

try {
    // Read JSON payload or FormData
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (strpos($contentType, 'application/json') !== false) {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
    } else {
        $input = $_POST;
    }

    $customerName = trim($input['customerName'] ?? $input['fullName'] ?? '');
    $phone = trim($input['phone'] ?? $input['phoneNumber'] ?? '');
    $email = trim($input['email'] ?? '');
    $vehicleModel = trim($input['vehicleModel'] ?? '');
    $fulfillmentType = trim($input['fulfillmentType'] ?? $input['fulfillment'] ?? 'pickup');
    $address = trim($input['address'] ?? '');
    $district = trim($input['district'] ?? '');
    $postalCode = trim($input['postalCode'] ?? '');
    $notes = trim($input['notes'] ?? '');
    $paymentMethod = trim($input['paymentMethod'] ?? 'Cash on Delivery');
    $deliveryFee = floatval($input['deliveryFee'] ?? ($fulfillmentType === 'delivery' ? 2500 : 0));
    $items = $input['items'] ?? [];

    if ($customerName === '' || $phone === '' || $vehicleModel === '') {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Full Name, Phone Number, and Vehicle Model are required.']);
        exit;
    }

    if (empty($items)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Cart items cannot be empty.']);
        exit;
    }

    // Determine current user ID if logged in
    $userId = $_SESSION['user_id'] ?? null;

    // Calculate product total and verify prices
    $productSubtotal = 0.00;
    $validatedItems = [];

    foreach ($items as $item) {
        $prodId = intval($item['id'] ?? 0);
        $qty = max(1, intval($item['quantity'] ?? 1));
        $itemPrice = floatval($item['price'] ?? 0);
        $itemTitle = trim($item['title'] ?? $item['name'] ?? 'Custom 4x4 Part');

        if ($prodId > 0) {
            $pStmt = $pdo->prepare("SELECT title, price, stock FROM products WHERE id = ?");
            $pStmt->execute([$prodId]);
            $dbProduct = $pStmt->fetch();
            if ($dbProduct) {
                $itemTitle = $dbProduct['title'];
                $itemPrice = floatval($dbProduct['price']);
            }
        }

        $lineTotal = $itemPrice * $qty;
        $productSubtotal += $lineTotal;

        $validatedItems[] = [
            'product_id' => $prodId > 0 ? $prodId : 1,
            'product_title' => $itemTitle,
            'quantity' => $qty,
            'price' => $itemPrice
        ];
    }

    $grandTotal = $productSubtotal + $deliveryFee;

    // Begin database transaction
    $pdo->beginTransaction();

    // Generate unique order number
    $orderNumber = 'ORD-' . date('Y') . '-' . sprintf('%04d', rand(1000, 9999));

    // 1. Insert Order
    $orderStmt = $pdo->prepare("
        INSERT INTO orders 
        (user_id, customer_name, phone, email, address, district, postal_code, vehicle_model, notes, fulfillment_type, delivery_fee, total_amount, payment_method, whatsapp_reference, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    ");
    $orderStmt->execute([
        $userId,
        $customerName,
        $phone,
        $email,
        $address,
        $district,
        $postalCode,
        $vehicleModel,
        $notes,
        $fulfillmentType,
        $deliveryFee,
        $grandTotal,
        $paymentMethod,
        $orderNumber
    ]);

    $orderId = $pdo->lastInsertId();

    // 2. Insert Order Items & Update Stock
    $itemInsertStmt = $pdo->prepare("INSERT INTO order_items (order_id, product_id, product_title, quantity, price) VALUES (?, ?, ?, ?, ?)");
    $stockUpdateStmt = $pdo->prepare("UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?");
    $movementStmt = $pdo->prepare("INSERT INTO inventory_movements (product_id, quantity_changed, reason, user_id) VALUES (?, ?, ?, ?)");

    foreach ($validatedItems as $vi) {
        $itemInsertStmt->execute([
            $orderId,
            $vi['product_id'],
            $vi['product_title'],
            $vi['quantity'],
            $vi['price']
        ]);

        if ($vi['product_id'] > 0) {
            $stockUpdateStmt->execute([$vi['quantity'], $vi['product_id']]);
            $movementStmt->execute([$vi['product_id'], -$vi['quantity'], "Customer Order #$orderId", $userId]);
        }
    }

    // 3. Insert Admin Notification
    $notifStmt = $pdo->prepare("INSERT INTO admin_notifications (type, title, message) VALUES ('order', ?, ?)");
    $notifStmt->execute([
        "New Order #$orderId ($orderNumber)",
        "$customerName placed an order for LKR " . number_format($grandTotal, 2) . " ($fulfillmentType)."
    ]);

    // 4. Save/update customer record if user logged in
    if ($userId) {
        $custStmt = $pdo->prepare("
            INSERT INTO customers (user_id, phone, address, vehicle_model, notes) 
            VALUES (?, ?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
                phone = VALUES(phone), 
                address = VALUES(address), 
                vehicle_model = VALUES(vehicle_model)
        ");
        $custStmt->execute([$userId, $phone, $address, $vehicleModel, $notes]);
    }

    $pdo->commit();

    // Format WhatsApp message
    $itemsText = array_map(function($i) {
        return "📦 *" . $i['product_title'] . "*\n   Qty: " . $i['quantity'] . " | LKR " . number_format($i['price'] * $i['quantity'], 2);
    }, $validatedItems);

    $itemsStr = implode("\n\n", $itemsText);

    $fulfillmentStr = ($fulfillmentType === 'pickup') 
        ? "🏪 *Fulfillment:* Garage Pickup" 
        : "🚚 *Fulfillment:* Islandwide Delivery\n📍 *Address:* $address, $district ($postalCode)";

    $waMessage = "🛠️ *4X4 DEFENDER PARTS ORDER #$orderNumber* 🛠️\n\n" .
        "👤 *Customer:* $customerName\n" .
        "📞 *Phone:* $phone\n" .
        "🚗 *Vehicle:* $vehicleModel\n" .
        "$fulfillmentStr\n" .
        ($notes ? "📝 *Notes:* $notes\n" : "") .
        "\n------------------------------------------\n" .
        "*ORDER ITEMS:*\n$itemsStr\n" .
        "------------------------------------------\n" .
        "💵 *Subtotal:* LKR " . number_format($productSubtotal, 2) . "\n" .
        "🚚 *Delivery:* " . ($deliveryFee > 0 ? "LKR " . number_format($deliveryFee, 2) : "Free (Garage Pickup)") . "\n" .
        "💰 *Grand Total:* LKR " . number_format($grandTotal, 2) . "\n" .
        "💳 *Payment:* $paymentMethod\n" .
        "------------------------------------------\n\n" .
        "Order registered in 4x4 Defender Parts database. Thank you!";

    $whatsappUrl = "https://wa.me/" . getWhatsAppNumber($pdo) . "?text=" . urlencode($waMessage);

    echo json_encode([
        'status' => 'success',
        'order_id' => $orderId,
        'order_number' => $orderNumber,
        'total_amount' => $grandTotal,
        'whatsapp_url' => $whatsappUrl,
        'message' => 'Order successfully saved to database.'
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
