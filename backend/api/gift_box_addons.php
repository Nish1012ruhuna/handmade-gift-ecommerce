<?php

header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . "/../config/gift_box_addons.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    header("Allow: GET");
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Method not allowed."
    ]);
    exit;
}

echo json_encode([
    "success" => true,
    "samplePrices" => true,
    "addons" => giftBoxAddonCatalog()
]);
