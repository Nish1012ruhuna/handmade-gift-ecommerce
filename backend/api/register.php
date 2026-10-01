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
| Get Form Data
|--------------------------------------------------------------------------
*/

$fullName = trim($_POST["fullName"] ?? "");
$nic = trim($_POST["nic"] ?? "");
$email = strtolower(trim($_POST["email"] ?? ""));
$mobileNo = trim($_POST["mobileNo"] ?? "");
$password = $_POST["password"] ?? "";
$confirmPassword = $_POST["confirmPassword"] ?? "";


/*
|--------------------------------------------------------------------------
| Required Fields
|--------------------------------------------------------------------------
*/

if ($fullName === "" || $email === "" || $password === "") {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Please fill in all required fields."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Email Validation
|--------------------------------------------------------------------------
*/

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
| Password Validation
|--------------------------------------------------------------------------
| Minimum 8 characters
| At least one uppercase letter
| At least one lowercase letter
| At least one number
|--------------------------------------------------------------------------
*/

if (
    strlen($password) < 8 ||
    !preg_match('/[A-Z]/', $password) ||
    !preg_match('/[a-z]/', $password) ||
    !preg_match('/[0-9]/', $password)
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Confirm Password
|--------------------------------------------------------------------------
*/

if ($password !== $confirmPassword) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Passwords do not match."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Check Existing Email
|--------------------------------------------------------------------------
*/

$checkSql = "SELECT CustomerID FROM customer WHERE Email = ?";

$checkStmt = $conn->prepare($checkSql);

if (!$checkStmt) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Database error."
    ]);

    exit;
}

$checkStmt->bind_param("s", $email);
$checkStmt->execute();

$result = $checkStmt->get_result();

if ($result->num_rows > 0) {

    http_response_code(409);

    echo json_encode([
        "success" => false,
        "message" => "An account with this email already exists."
    ]);

    exit;
}

$checkStmt->close();


/*
|--------------------------------------------------------------------------
| Hash Password
|--------------------------------------------------------------------------
*/

$passwordHash = password_hash(
    $password,
    PASSWORD_DEFAULT
);


/*
|--------------------------------------------------------------------------
| Insert Customer
|--------------------------------------------------------------------------
*/

$sql = "INSERT INTO customer
        (FullName, NIC, Email, MobileNo, PasswordHash)
        VALUES (?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);

if (!$stmt) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Database error."
    ]);

    exit;
}

$stmt->bind_param(
    "sssss",
    $fullName,
    $nic,
    $email,
    $mobileNo,
    $passwordHash
);


if ($stmt->execute()) {

    echo json_encode([
        "success" => true,
        "message" => "Registration successful.",
        "customerID" => $stmt->insert_id
    ]);

} else {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Registration failed."
    ]);
}

$stmt->close();
$conn->close();

?>