
<?php

header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/session.php";

requireLogin();

$customerID = (int) ($_SESSION["customer_id"] ?? 0);

if ($customerID <= 0) {
    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Please log in to view your orders."
    ]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    header("Allow: GET");
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed."
    ]);
    exit;
}

try {
    $sql = "
        SELECT
            OrderID,
            OrderDate,
            TotalAmount,
            Status,
            DeliveryAddress
        FROM `orders`
        WHERE CustomerID = ?
        ORDER BY OrderDate DESC
    ";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new Exception("Unable to prepare customer orders query.");
    }

    $stmt->bind_param("i", $customerID);
    $stmt->execute();

    $result = $stmt->get_result();
    $orders = [];

    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }

    $stmt->close();

    echo json_encode([
        "success" => true,
        "orders" => $orders
    ]);

} catch (Throwable $e) {
    error_log("Customer order history error: " . $e->getMessage());

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to load your orders right now."
    ]);
}
?>
