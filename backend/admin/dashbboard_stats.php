
<?php

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/session.php";

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
    $products = $conn->query(
        "SELECT COUNT(*) AS total FROM Product"
    )->fetch_assoc()["total"];

    $orders = $conn->query(
        "SELECT COUNT(*) AS total FROM `Order`"
    )->fetch_assoc()["total"];

    $customers = $conn->query(
        "SELECT COUNT(*) AS total FROM Customer"
    )->fetch_assoc()["total"];

    $lowStock = $conn->query(
        "SELECT COUNT(*) AS total
         FROM Product
         WHERE StockQuantity <= 5"
    )->fetch_assoc()["total"];

    $recentResult = $conn->query(
        "SELECT OrderID, OrderDate, TotalAmount, Status
         FROM `Order`
         ORDER BY OrderDate DESC
         LIMIT 5"
    );

    $recentOrders = [];

    while ($row = $recentResult->fetch_assoc()) {
        $recentOrders[] = $row;
    }

    echo json_encode([
        "success" => true,
        "stats" => [
            "products" => (int) $products,
            "orders" => (int) $orders,
            "customers" => (int) $customers,
            "lowStock" => (int) $lowStock
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
