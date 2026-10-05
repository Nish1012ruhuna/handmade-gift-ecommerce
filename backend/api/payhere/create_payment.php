<?php

header("Content-Type: application/json");


/*
|--------------------------------------------------------------------------
| Load PayHere Configuration
|--------------------------------------------------------------------------
*/

require_once __DIR__ . "/../../config/payhere.php";


/*
|--------------------------------------------------------------------------
| Only allow POST requests
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Read JSON sent by checkout.js
|--------------------------------------------------------------------------
*/

$rawData = file_get_contents("php://input");

$data = json_decode($rawData, true);


if (!is_array($data)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON data."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Get Customer Information
|--------------------------------------------------------------------------
*/

$fullName = trim($data["fullName"] ?? "");

$phone = trim($data["phone"] ?? "");

$email = trim($data["email"] ?? "");

$address = trim($data["address"] ?? "");

$city = trim($data["city"] ?? "");

$country = trim($data["country"] ?? "Sri Lanka");

$amount = floatval($data["amount"] ?? 0);


/*
|--------------------------------------------------------------------------
| Validate Customer Information
|--------------------------------------------------------------------------
*/

if ($fullName === "") {

    echo json_encode([
        "success" => false,
        "message" => "Full name is required."
    ]);

    exit;
}


if ($phone === "") {

    echo json_encode([
        "success" => false,
        "message" => "Phone number is required."
    ]);

    exit;
}


if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid email address."
    ]);

    exit;
}


if ($address === "") {

    echo json_encode([
        "success" => false,
        "message" => "Address is required."
    ]);

    exit;
}


if ($city === "") {

    echo json_encode([
        "success" => false,
        "message" => "City is required."
    ]);

    exit;
}


if ($amount <= 0) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid payment amount."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Split Full Name
|--------------------------------------------------------------------------
*/

$nameParts = preg_split(
    '/\s+/',
    $fullName
);


$firstName = $nameParts[0];


if (count($nameParts) > 1) {

    $lastName = implode(
        " ",
        array_slice($nameParts, 1)
    );

} else {

    $lastName = "";
}


/*
|--------------------------------------------------------------------------
| Create Unique Order ID
|--------------------------------------------------------------------------
*/

$orderId =
    "GIFTORA-" .
    date("YmdHis") .
    "-" .
    random_int(1000, 9999);


/*
|--------------------------------------------------------------------------
| PayHere Payment Information
|--------------------------------------------------------------------------
*/

$currency = "LKR";


$formattedAmount = number_format(
    $amount,
    2,
    ".",
    ""
);


/*
|--------------------------------------------------------------------------
| Generate PayHere Hash
|--------------------------------------------------------------------------
|
| PayHere:
|
| hash =
| strtoupper(
|   md5(
|     merchant_id
|     + order_id
|     + amount
|     + currency
|     + strtoupper(md5(merchant_secret))
|   )
| )
|
|--------------------------------------------------------------------------
*/

$hashedSecret = strtoupper(
    md5($PAYHERE_MERCHANT_SECRET)
);


$hash = strtoupper(
    md5(
        $PAYHERE_MERCHANT_ID .
        $orderId .
        $formattedAmount .
        $currency .
        $hashedSecret
    )
);


/*
|--------------------------------------------------------------------------
| Return Payment Data
|--------------------------------------------------------------------------
*/

echo json_encode([

    "success" => true,

    "payment_url" =>
        $PAYHERE_PAYMENT_URL,

    "merchant_id" =>
        $PAYHERE_MERCHANT_ID,

    "order_id" =>
        $orderId,

    "items" =>
        "GIFTORA Gift Order",

    "currency" =>
        $currency,

    "amount" =>
        $formattedAmount,

    "hash" =>
        $hash,

    "first_name" =>
        $firstName,

    "last_name" =>
        $lastName,

    "email" =>
        $email,

    "phone" =>
        $phone,

    "address" =>
        $address,

    "city" =>
        $city,

    "country" =>
        $country,

    "return_url" =>
        $PAYHERE_RETURN_URL,

    "cancel_url" =>
        $PAYHERE_CANCEL_URL,

    "notify_url" =>
        $PAYHERE_NOTIFY_URL

]);