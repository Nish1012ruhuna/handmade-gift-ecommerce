<?php

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/session.php";


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


$email =
    strtolower(
        trim($_POST["email"] ?? "")
    );

$password =
    $_POST["password"] ?? "";


if (
    $email === "" ||
    $password === ""
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" =>
            "Please enter your email and password."
    ]);

    exit;
}


$sql = "
    SELECT
        AdminID,
        Name,
        Email,
        PasswordHash
    FROM Admin
    WHERE Email = ?
    LIMIT 1
";

$stmt = $conn->prepare($sql);

if (!$stmt) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Something went wrong."
    ]);

    exit;
}


$stmt->bind_param(
    "s",
    $email
);

$stmt->execute();

$result = $stmt->get_result();

$admin = $result->fetch_assoc();

$stmt->close();


/*
|--------------------------------------------------------------------------
| VERIFY ADMIN
|--------------------------------------------------------------------------
*/

if (
    !$admin ||
    !password_verify(
        $password,
        $admin["PasswordHash"]
    )
) {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" =>
            "Invalid admin credentials."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| NEW SESSION ID
|--------------------------------------------------------------------------
*/

session_regenerate_id(true);


/*
|--------------------------------------------------------------------------
| ADMIN SESSION
|--------------------------------------------------------------------------
*/

$_SESSION["admin_id"] =
    (int) $admin["AdminID"];

$_SESSION["admin_name"] =
    $admin["Name"];

$_SESSION["admin_email"] =
    $admin["Email"];

$_SESSION["role"] =
    "admin";

$_SESSION["last_activity"] =
    time();


/*
|--------------------------------------------------------------------------
| SUCCESS
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => true,
    "message" =>
        "Admin login successful.",
    "admin" => [
        "id" =>
            (int) $admin["AdminID"],
        "name" =>
            $admin["Name"],
        "email" =>
            $admin["Email"]
    ]
]);

?>