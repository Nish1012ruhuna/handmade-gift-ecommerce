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


$sql = "
    SELECT
        CustomerID,
        FullName,
        NIC,
        Email,
        MobileNo,
        CreatedAt
    FROM Customer
    ORDER BY CustomerID DESC
";


$result = $conn->query($sql);

if (!$result) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Could not load customers."
    ]);

    exit;
}


$customers = [];

while ($row = $result->fetch_assoc()) {

    $customers[] = $row;
}


echo json_encode([
    "success" => true,
    "customers" => $customers
]);

?>