<?php

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/session.php";

requireAdmin();

/*
|--------------------------------------------------------------------------
| GET ORDERS
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    $sql = "
        SELECT
            o.OrderID,
            o.OrderDate,
            o.TotalAmount,
            o.Status,
            o.DeliveryAddress,
            c.FullName,
            c.Email
        FROM `orders` o
        INNER JOIN `customer` c
            ON o.CustomerID = c.CustomerID
        ORDER BY o.OrderDate DESC
    ";

    $result = $conn->query($sql);

    if (!$result) {
        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Could not load orders."
        ]);

        exit;
    }

    $orders = [];

    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }

    echo json_encode([
        "success" => true,
        "orders" => $orders
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| UPDATE ORDER STATUS
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    // Support both form data and JSON data.
    $input = $_POST;

    if (empty($input)) {
        $rawInput = file_get_contents("php://input");
        $jsonInput = json_decode($rawInput, true);

        if (is_array($jsonInput)) {
            $input = $jsonInput;
        }
    }

    // Accept common order ID field names.
    $orderID = intval(
        $input["orderID"]
        ?? $input["order_id"]
        ?? $input["OrderID"]
        ?? 0
    );

    $status = trim(
        $input["status"]
        ?? $input["Status"]
        ?? ""
    );

    // Allowed order statuses.
    $allowedStatuses = [
        "Pending",
        "Processing",
        "Confirmed",
        "Shipped",
        "Delivered",
        "Cancelled"
    ];

    if (
        $orderID <= 0 ||
        !in_array($status, $allowedStatuses, true)
    ) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Invalid order status.",
            "receivedOrderID" => $orderID,
            "receivedStatus" => $status
        ]);

        exit;
    }

    // Update the order in the database.
    $sql = "
        UPDATE `orders`
        SET Status = ?
        WHERE OrderID = ?
    ";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Could not prepare order update."
        ]);

        exit;
    }

    $stmt->bind_param("si", $status, $orderID);

    if (!$stmt->execute()) {
        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Could not update order."
        ]);

        $stmt->close();
        exit;
    }

    // Check whether the order exists.
    // affected_rows can be zero if the status was already the same.
    if ($stmt->affected_rows === 0) {

        $check = $conn->prepare(
            "SELECT OrderID FROM `orders` WHERE OrderID = ?"
        );

        if (!$check) {
            http_response_code(500);

            echo json_encode([
                "success" => false,
                "message" => "Could not verify the order."
            ]);

            $stmt->close();
            exit;
        }

        $check->bind_param("i", $orderID);
        $check->execute();
        $check->store_result();

        if ($check->num_rows === 0) {
            http_response_code(404);

            echo json_encode([
                "success" => false,
                "message" => "Order not found."
            ]);

            $check->close();
            $stmt->close();
            exit;
        }

        $check->close();
    }

    echo json_encode([
        "success" => true,
        "message" => "Order status updated successfully."
    ]);

    $stmt->close();
    exit;
}

header("Allow: GET, POST");

http_response_code(405);

echo json_encode([
    "success" => false,
    "message" => "Method not allowed."
]);

?>
