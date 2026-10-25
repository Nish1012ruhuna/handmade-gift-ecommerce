<?php

header("Content-Type: application/json; charset=UTF-8");
header("Cache-Control: no-store, no-cache, must-revalidate");

require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/session.php";

// Only authenticated admins can view customer records.
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
    $sql = "
        SELECT
            CustomerID,
            FullName,
            Email,
            MobileNo,
            ShippingAddress,
            CreatedAt
        FROM customer
        ORDER BY CustomerID DESC
    ";

    $result = $conn->query($sql);

    if (!$result) {
        throw new RuntimeException("Customer query failed.");
    }

    $customers = [];

    while ($row = $result->fetch_assoc()) {
        $customers[] = $row;
    }

    echo json_encode([
        "success" => true,
        "customers" => $customers
    ]);

} catch (Throwable $e) {
    error_log("Admin customers error: " . $e->getMessage());

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Could not load customers."
    ]);
}