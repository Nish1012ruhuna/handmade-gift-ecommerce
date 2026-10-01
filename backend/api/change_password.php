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

$currentPassword =
    $_POST["currentPassword"] ?? "";

$newPassword =
    $_POST["newPassword"] ?? "";

$confirmPassword =
    $_POST["confirmPassword"] ?? "";


/*
|--------------------------------------------------------------------------
| REQUIRED
|--------------------------------------------------------------------------
*/

if (
    $currentPassword === "" ||
    $newPassword === "" ||
    $confirmPassword === ""
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" =>
            "Please fill in all password fields."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| NEW PASSWORD VALIDATION
|--------------------------------------------------------------------------
*/

if (strlen($newPassword) < 8) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" =>
            "New password must contain at least 8 characters."
    ]);

    exit;
}

if (
    !preg_match("/[A-Z]/", $newPassword) ||
    !preg_match("/[a-z]/", $newPassword) ||
    !preg_match("/[0-9]/", $newPassword)
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" =>
            "New password must contain uppercase, lowercase and a number."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| CONFIRM PASSWORD
|--------------------------------------------------------------------------
*/

if ($newPassword !== $confirmPassword) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" =>
            "New passwords do not match."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| GET CURRENT PASSWORD HASH
|--------------------------------------------------------------------------
*/

$sql = "
    SELECT PasswordHash
    FROM Customer
    WHERE CustomerID = ?
    LIMIT 1
";

$stmt = $conn->prepare($sql);

$stmt->bind_param(
    "i",
    $customerID
);

$stmt->execute();

$result = $stmt->get_result();

$customer = $result->fetch_assoc();

$stmt->close();


if (!$customer) {

    http_response_code(404);

    echo json_encode([
        "success" => false,
        "message" => "Customer not found."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| VERIFY CURRENT PASSWORD
|--------------------------------------------------------------------------
*/

if (
    !password_verify(
        $currentPassword,
        $customer["PasswordHash"]
    )
) {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" =>
            "Current password is incorrect."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| HASH NEW PASSWORD
|--------------------------------------------------------------------------
*/

$newPasswordHash = password_hash(
    $newPassword,
    PASSWORD_BCRYPT
);


/*
|--------------------------------------------------------------------------
| UPDATE PASSWORD
|--------------------------------------------------------------------------
*/

$sql = "
    UPDATE Customer
    SET PasswordHash = ?
    WHERE CustomerID = ?
";

$stmt = $conn->prepare($sql);

$stmt->bind_param(
    "si",
    $newPasswordHash,
    $customerID
);

if ($stmt->execute()) {

    $_SESSION["last_activity"] = time();

    echo json_encode([
        "success" => true,
        "message" =>
            "Password changed successfully."
    ]);

} else {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Password change failed."
    ]);
}

$stmt->close();

?>