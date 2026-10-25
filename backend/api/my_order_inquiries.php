<?php

header("Content-Type: application/json; charset=UTF-8");
header("Cache-Control: no-store, no-cache, must-revalidate");

require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/session.php";

requireLogin();

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    header("Allow: GET");

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed."
    ]);
    exit;
}

$customerID = (int) ($_SESSION["customer_id"] ?? 0);

try {
    $stmt = $conn->prepare(
        "SELECT
            InquiryID,
            OrderID,
            Subject,
            Message,
            AdminReply,
            InquiryStatus,
            CreatedAt,
            RepliedAt
         FROM order_inquiry
         WHERE CustomerID = ?
         ORDER BY CreatedAt DESC, InquiryID DESC"
    );

    $stmt->bind_param("i", $customerID);
    $stmt->execute();

    $result = $stmt->get_result();
    $inquiries = [];

    while ($row = $result->fetch_assoc()) {
        $inquiries[] = $row;
    }

    $stmt->close();

    echo json_encode([
        "success" => true,
        "inquiries" => $inquiries
    ]);

} catch (Throwable $e) {
    error_log("Customer inquiries error: " . $e->getMessage());

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to load your inquiries."
    ]);
}
?>