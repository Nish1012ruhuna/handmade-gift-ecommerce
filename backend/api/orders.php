
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
            o.OrderID,
            o.OrderDate,
            o.TotalAmount,
            o.Status,
            o.DeliveryAddress,
            oi.OrderItemID,
            p.Title AS ProductTitle,
            oi.Quantity,
            oi.UnitPrice,
            cu.SpecialInstruction
        FROM `orders` o
        LEFT JOIN orderitem oi ON oi.OrderID = o.OrderID
        LEFT JOIN product p ON p.ProductID = oi.ProductID
        LEFT JOIN customization cu ON cu.CustomizationID = oi.CustomizationID
        WHERE o.CustomerID = ?
        ORDER BY o.OrderDate DESC, oi.OrderItemID ASC
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
        $orderID = (int) $row["OrderID"];

        if (!isset($orders[$orderID])) {
            $orders[$orderID] = [
                "OrderID" => $orderID,
                "OrderDate" => $row["OrderDate"],
                "TotalAmount" => $row["TotalAmount"],
                "Status" => $row["Status"],
                "DeliveryAddress" => $row["DeliveryAddress"],
                "Items" => []
            ];
        }

        if ($row["OrderItemID"] !== null) {
            $giftBoxAddons = json_decode(
                $row["SpecialInstruction"] ?? "",
                true
            );

            $orders[$orderID]["Items"][] = [
                "ProductTitle" => $row["ProductTitle"],
                "Quantity" => (int) $row["Quantity"],
                "UnitPrice" => (float) $row["UnitPrice"],
                "GiftBoxAddons" => is_array($giftBoxAddons)
                    ? $giftBoxAddons
                    : []
            ];
        }
    }

    $stmt->close();
    $orders = array_values($orders);

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
