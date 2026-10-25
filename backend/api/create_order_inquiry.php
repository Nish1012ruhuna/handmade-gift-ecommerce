
<?php

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/session.php";

// Only logged-in customers can submit order enquiries.
requireLogin();

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Allow: POST");
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed."
    ]);
    exit;
}

$customerID = (int) ($_SESSION["customer_id"] ?? 0);

$input = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($input)) {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid request data."
    ]);
    exit;
}

$orderID = filter_var(
    $input["orderID"] ?? null,
    FILTER_VALIDATE_INT
);

$subject = trim($input["subject"] ?? "");
$message = trim($input["message"] ?? "");

$allowedSubjects = [
    "Order status",
    "Delivery delay",
    "Payment issue",
    "Product issue",
    "Change my order",
    "Cancellation or return",
    "Other"
];

if (!$orderID || $orderID <= 0) {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Please select a valid order."
    ]);
    exit;
}

if (!in_array($subject, $allowedSubjects, true)) {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Please select a valid enquiry subject."
    ]);
    exit;
}

if ($message === "" || mb_strlen($message) < 10) {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Please explain your issue in at least 10 characters."
    ]);
    exit;
}

if (mb_strlen($message) > 5000) {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Your message must not exceed 5000 characters."
    ]);
    exit;
}

try {
    // Verify that this order belongs to the logged-in customer.
    $check = $conn->prepare(
        "SELECT OrderID
         FROM orders
         WHERE OrderID = ? AND CustomerID = ?"
    );

    $check->bind_param("ii", $orderID, $customerID);
    $check->execute();

    $order = $check->get_result()->fetch_assoc();
    $check->close();

    if (!$order) {
        http_response_code(404);

        echo json_encode([
            "success" => false,
            "message" => "Order not found in your account."
        ]);
        exit;
    }

    // Save the enquiry in the database.
    $stmt = $conn->prepare(
        "INSERT INTO order_inquiry
            (OrderID, CustomerID, Subject, Message)
         VALUES (?, ?, ?, ?)"
    );

    $stmt->bind_param(
        "iiss",
        $orderID,
        $customerID,
        $subject,
        $message
    );

    $stmt->execute();

    $inquiryID = $conn->insert_id;
    $stmt->close();

    echo json_encode([
        "success" => true,
        "message" => "Your enquiry has been submitted successfully.",
        "inquiryID" => $inquiryID,
        "orderID" => $orderID
    ]);

} catch (Throwable $e) {
    error_log("Order enquiry error: " . $e->getMessage());

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to submit your enquiry right now. Please try again."
    ]);
}
?>
