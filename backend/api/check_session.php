<?php

require_once "../config/session.php";

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] !== "GET") {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Check Customer Session
|--------------------------------------------------------------------------
*/

if (
    !isset($_SESSION["customer_id"]) ||
    ($_SESSION["role"] ?? "") !== "customer"
) {

    echo json_encode([
        "success" => true,
        "loggedIn" => false
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Logged In
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => true,
    "loggedIn" => true,
    "data" => [
        "customer" => [
            "id" => $_SESSION["customer_id"],
            "name" => $_SESSION["customer_name"],
            "email" => $_SESSION["customer_email"]
        ]
    ]
]);

?>