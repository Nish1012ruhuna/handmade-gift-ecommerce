<?php

header("Content-Type: application/json; charset=UTF-8");
header("Cache-Control: no-store, no-cache, must-revalidate");

require_once __DIR__ . "/../../config/database.php";
require_once __DIR__ . "/../../config/session.php";

// Only authenticated administrators can access inquiries.
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

// Optional customer ID filter.
$customerID = null;

if (isset($_GET["customer_id"])) {
    $customerID = filter_var(
        $_GET["customer_id"],
        FILTER_VALIDATE_INT
    );

    if ($customerID === false || $customerID < 1) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Invalid customer ID."
        ]);
        exit;
    }
}

try {
    if ($customerID !== null) {

        // Return all inquiries for the selected customer.
        $stmt = $conn->prepare("
            SELECT
                InquiryID,
                CustomerID,
                OrderID,
                Subject,
                Message,
                InquiryStatus,
                CreatedAt
            FROM order_inquiry
            WHERE CustomerID = ?
            ORDER BY CreatedAt DESC, InquiryID DESC
        ");

        $stmt->bind_param("i", $customerID);
        $stmt->execute();

        $result = $stmt->get_result();

    } elseif (isset($_GET["all"]) && $_GET["all"] === "1") {

        // Return all inquiries for the dedicated Inquiries page.
        $result = $conn->query("
            SELECT
                InquiryID,
                CustomerID,
                OrderID,
                Subject,
                Message,
                InquiryStatus,
                CreatedAt
            FROM order_inquiry
            ORDER BY CreatedAt DESC, InquiryID DESC
        ");

    } else {

        // Return only the latest five inquiries for the dashboard.
        $result = $conn->query("
            SELECT
                InquiryID,
                CustomerID,
                OrderID,
                Subject,
                Message,
                InquiryStatus,
                CreatedAt
            FROM order_inquiry
            ORDER BY CreatedAt DESC, InquiryID DESC
            LIMIT 5
        ");
    }

    if (!$result) {
        throw new RuntimeException("Inquiry query failed.");
    }

    $inquiries = [];

    while ($row = $result->fetch_assoc()) {
        $inquiries[] = $row;
    }

    if (isset($stmt)) {
        $stmt->close();
    }

    echo json_encode([
        "success" => true,
        "inquiries" => $inquiries
    ]);

} catch (Throwable $e) {
    error_log("Admin inquiries error: " . $e->getMessage());

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to load customer inquiries."
    ]);
}