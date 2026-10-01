<?php

require_once "../config/database.php";
require_once "../config/session.php";

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Get Login Data
|--------------------------------------------------------------------------
*/

$email = strtolower(trim($_POST["email"] ?? ""));
$password = $_POST["password"] ?? "";


/*
|--------------------------------------------------------------------------
| Basic Validation
|--------------------------------------------------------------------------
*/

if ($email === "" || $password === "") {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Email and password are required."
    ]);

    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Please enter a valid email address."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Find Customer
|--------------------------------------------------------------------------
*/

$sql = "SELECT
            CustomerID,
            FullName,
            Email,
            PasswordHash
        FROM customer
        WHERE Email = ?";

$stmt = $conn->prepare($sql);

if (!$stmt) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Database error."
    ]);

    exit;
}

$stmt->bind_param("s", $email);
$stmt->execute();

$result = $stmt->get_result();


/*
|--------------------------------------------------------------------------
| Generic Login Error
|--------------------------------------------------------------------------
| We don't reveal whether the email exists.
|--------------------------------------------------------------------------
*/

if ($result->num_rows !== 1) {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Invalid email or password."
    ]);

    exit;
}

$customer = $result->fetch_assoc();


/*
|--------------------------------------------------------------------------
| Verify Password
|--------------------------------------------------------------------------
*/

if (!password_verify($password, $customer["PasswordHash"])) {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Invalid email or password."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Create Secure Session
|--------------------------------------------------------------------------
*/

session_regenerate_id(true);

$_SESSION["customer_id"] = $customer["CustomerID"];
$_SESSION["customer_name"] = $customer["FullName"];
$_SESSION["customer_email"] = $customer["Email"];
$_SESSION["role"] = "customer";
$_SESSION["last_activity"] = time();


/*
|--------------------------------------------------------------------------
| Response
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => true,
    "message" => "Login successful.",
    "data" => [
        "customer" => [
            "id" => $customer["CustomerID"],
            "name" => $customer["FullName"],
            "email" => $customer["Email"]
        ]
    ]
]);

$stmt->close();
$conn->close();

?>