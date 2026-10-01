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
        FROM `Order` o
        INNER JOIN Customer c
            ON o.CustomerID = c.CustomerID
        ORDER BY o.OrderDate DESC
    ";

    $result = $conn->query($sql);

    if (!$result) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" =>
                "Could not load orders."
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

    $orderID =
        intval($_POST["orderID"] ?? 0);

    $status =
        trim($_POST["status"] ?? "");


    $allowedStatuses = [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled"
    ];


    if (
        $orderID <= 0 ||
        !in_array(
            $status,
            $allowedStatuses,
            true
        )
    ) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" =>
                "Invalid order status."
        ]);

        exit;
    }


    $sql = "
        UPDATE `Order`
        SET Status = ?
        WHERE OrderID = ?
    ";

    $stmt = $conn->prepare($sql);

    $stmt->bind_param(
        "si",
        $status,
        $orderID
    );


    if ($stmt->execute()) {

        echo json_encode([
            "success" => true,
            "message" =>
                "Order status updated."
        ]);

    } else {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" =>
                "Could not update order."
        ]);
    }

    exit;
}


header("Allow: GET, POST");

http_response_code(405);

echo json_encode([
    "success" => false,
    "message" => "Method not allowed."
]);

?>