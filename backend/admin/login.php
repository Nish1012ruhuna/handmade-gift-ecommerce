<?php

header("Content-Type: application/json; charset=UTF-8");
header("Cache-Control: no-store, no-cache, must-revalidate");

require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/session.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Allow: POST");
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed."
    ]);

    exit;
}

$email = strtolower(trim($_POST["email"] ?? ""));
$password = $_POST["password"] ?? "";

if (
    $email === "" ||
    $password === "" ||
    !filter_var($email, FILTER_VALIDATE_EMAIL)
) {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Enter a valid email address and password."
    ]);

    exit;
}

$stmt = $conn->prepare(
    "SELECT AdminID, Name, Email, PasswordHash
     FROM admin
     WHERE Email = ?
     LIMIT 1"
);

if (!$stmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to process the login request."
    ]);

    exit;
}

$stmt->bind_param("s", $email);

if (!$stmt->execute()) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to process the login request."
    ]);

    $stmt->close();
    exit;
}

$result = $stmt->get_result();
$admin = $result->fetch_assoc();
$stmt->close();

if (!$admin || !password_verify($password, $admin["PasswordHash"])) {
    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Invalid admin email or password."
    ]);

    exit;
}

session_regenerate_id(true);

$_SESSION = [];
$_SESSION["admin_id"] = $admin["AdminID"];
$_SESSION["admin_name"] = $admin["Name"];
$_SESSION["admin_email"] = $admin["Email"];
$_SESSION["role"] = "admin";
$_SESSION["last_activity"] = time();

echo json_encode([
    "success" => true,
    "message" => "Admin login successful."
]);

$conn->close();

?>
