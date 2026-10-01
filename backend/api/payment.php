<?php

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/session.php";

requireLogin();

$customerID = $_SESSION["customer_id"];


/*
|--------------------------------------------------------------------------
| ONLY POST
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    header("Allow: POST");

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| INPUT
|--------------------------------------------------------------------------
*/

$orderID =
    intval($_POST["orderID"] ?? 0);

$paymentMethod =
    trim($_POST["paymentMethod"] ?? "");

$amount =
    floatval($_POST["amount"] ?? 0);

$transactionReference =
    trim(
        $_POST["transactionReference"] ?? ""
    );


/*
|--------------------------------------------------------------------------
| VALIDATION
|--------------------------------------------------------------------------
*/

if (
    $orderID <= 0 ||
    $paymentMethod === "" ||
    $amount <= 0
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" =>
            "Invalid payment information."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| VERIFY ORDER BELONGS TO CUSTOMER
|--------------------------------------------------------------------------
*/

$sql = "
    SELECT
        OrderID,
        TotalAmount
    FROM `Order`
    WHERE
        OrderID = ?
        AND CustomerID = ?
    LIMIT 1
";

$stmt = $conn->prepare($sql);

$stmt->bind_param(
    "ii",
    $orderID,
    $customerID
);

$stmt->execute();

$result = $stmt->get_result();

$order = $result->fetch_assoc();

$stmt->close();


if (!$order) {

    http_response_code(404);

    echo json_encode([
        "success" => false,
        "message" => "Order not found."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| PAYMENT RECORD
|--------------------------------------------------------------------------
|
| Full payment gateway validation belongs to Week 7.
|--------------------------------------------------------------------------
*/

$sql = "
    INSERT INTO Payment
    (
        OrderID,
        PaymentMethod,
        Amount,
        Status,
        TransactionReference
    )
    VALUES (?, ?, ?, 'Pending', ?)
";

$stmt = $conn->prepare($sql);

$stmt->bind_param(
    "isds",
    $orderID,
    $paymentMethod,
    $amount,
    $transactionReference
);


if ($stmt->execute()) {

    echo json_encode([
        "success" => true,
        "message" =>
            "Payment record created."
    ]);

} else {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Payment failed."
    ]);
}

?>