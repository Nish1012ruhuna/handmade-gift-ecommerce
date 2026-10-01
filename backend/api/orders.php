<?php

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/session.php";

requireLogin();

$customerID = $_SESSION["customer_id"];


/*
|--------------------------------------------------------------------------
| GET CUSTOMER ORDERS
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    $sql = "
        SELECT
            OrderID,
            OrderDate,
            TotalAmount,
            Status,
            DeliveryAddress
        FROM `Order`
        WHERE CustomerID = ?
        ORDER BY OrderDate DESC
    ";

    $stmt = $conn->prepare($sql);

    $stmt->bind_param(
        "i",
        $customerID
    );

    $stmt->execute();

    $result = $stmt->get_result();

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
| CREATE ORDER
|--------------------------------------------------------------------------
|
| This will be improved in Week 7.
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $deliveryAddress =
        trim($_POST["deliveryAddress"] ?? "");

    $totalAmount =
        floatval($_POST["totalAmount"] ?? 0);


    if (
        $deliveryAddress === "" ||
        $totalAmount <= 0
    ) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" =>
                "Invalid order information."
        ]);

        exit;
    }


    $conn->begin_transaction();

    try {

        $sql = "
            INSERT INTO `Order`
            (
                CustomerID,
                TotalAmount,
                Status,
                DeliveryAddress
            )
            VALUES (?, ?, 'Pending', ?)
        ";

        $stmt = $conn->prepare($sql);

        $stmt->bind_param(
            "ids",
            $customerID,
            $totalAmount,
            $deliveryAddress
        );

        if (!$stmt->execute()) {
            throw new Exception(
                "Order insert failed."
            );
        }

        $orderID = $conn->insert_id;

        $conn->commit();

        echo json_encode([
            "success" => true,
            "message" =>
                "Order created successfully.",
            "order_id" => $orderID
        ]);

    } catch (Exception $e) {

        $conn->rollback();

        error_log(
            "Order creation failed: " .
            $e->getMessage()
        );

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" =>
                "Could not create order."
        ]);
    }

    exit;
}


/*
|--------------------------------------------------------------------------
| METHOD NOT ALLOWED
|--------------------------------------------------------------------------
*/

header("Allow: GET, POST");

http_response_code(405);

echo json_encode([
    "success" => false,
    "message" => "Method not allowed."
]);

?>