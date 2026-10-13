
<?php

header("Content-Type: application/json; charset=UTF-8");
header("Cache-Control: no-store, no-cache, must-revalidate");

require_once __DIR__ . "/../../config/database.php";
require_once __DIR__ . "/../../config/session.php";

requireAdmin();

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
    // Total products
    $result = $conn->query(
        "SELECT COUNT(*) AS total FROM product"
    );
    $products = (int) $result->fetch_assoc()["total"];

    // Total orders
    $result = $conn->query(
        "SELECT COUNT(*) AS total FROM orders"
    );
    $orders = (int) $result->fetch_assoc()["total"];

    // Total customers
    $result = $conn->query(
        "SELECT COUNT(*) AS total FROM customer"
    );
    $customers = (int) $result->fetch_assoc()["total"];

    // Products with stock quantity of 5 or less
    $result = $conn->query(
        "SELECT COUNT(*) AS total
         FROM product
         WHERE StockQuantity <= 5"
    );
    $lowStock = (int) $result->fetch_assoc()["total"];

    // Latest five orders
    $recentResult = $conn->query(
        "SELECT OrderID, OrderDate, TotalAmount, Status
         FROM orders
         ORDER BY OrderDate DESC, OrderID DESC
         LIMIT 5"
    );

    $recentOrders = [];

    while ($row = $recentResult->fetch_assoc()) {
        $recentOrders[] = $row;
    }

    echo json_encode([
        "success" => true,
        "stats" => [
            "products" => $products,
            "orders" => $orders,
            "customers" => $customers,
            "lowStock" => $lowStock
        ],
        "recentOrders" => $recentOrders
    ]);

} catch (Throwable $e) {
    error_log("Admin dashboard error: " . $e->getMessage());

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Could not load dashboard information."
    ]);
}
?>
