<?php

/*
|--------------------------------------------------------------------------
| GIFTORA - PayHere Notification Handler
|--------------------------------------------------------------------------
*/


require_once __DIR__ . "/../../config/payhere.php";


/*
|--------------------------------------------------------------------------
| Make sure request is POST
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    http_response_code(405);

    exit("Invalid request method.");
}


/*
|--------------------------------------------------------------------------
| Receive PayHere Notification
|--------------------------------------------------------------------------
*/

$merchantId =
    $_POST["merchant_id"] ?? "";

$orderId =
    $_POST["order_id"] ?? "";

$paymentId =
    $_POST["payment_id"] ?? "";

$payhereAmount =
    $_POST["payhere_amount"] ?? "";

$payhereCurrency =
    $_POST["payhere_currency"] ?? "";

$statusCode =
    $_POST["status_code"] ?? "";

$md5sig =
    $_POST["md5sig"] ?? "";

$statusMessage =
    $_POST["status_message"] ?? "";

$method =
    $_POST["method"] ?? "";


/*
|--------------------------------------------------------------------------
| Verify Merchant ID
|--------------------------------------------------------------------------
*/

if (
    $merchantId !==
    $PAYHERE_MERCHANT_ID
) {

    http_response_code(400);

    exit("Invalid merchant ID.");
}


/*
|--------------------------------------------------------------------------
| Generate Local Signature
|--------------------------------------------------------------------------
|
| PayHere notification verification:
|
| strtoupper(
|   md5(
|      merchant_id
|      + order_id
|      + payhere_amount
|      + payhere_currency
|      + status_code
|      + strtoupper(md5(merchant_secret))
|   )
| )
|
|--------------------------------------------------------------------------
*/

$localMd5Sig =
    strtoupper(
        md5(
            $merchantId .
            $orderId .
            $payhereAmount .
            $payhereCurrency .
            $statusCode .
            strtoupper(
                md5(
                    $PAYHERE_MERCHANT_SECRET
                )
            )
        )
    );


/*
|--------------------------------------------------------------------------
| Verify Signature
|--------------------------------------------------------------------------
*/

if (
    $localMd5Sig !==
    strtoupper($md5sig)
) {

    http_response_code(400);

    exit("Invalid payment signature.");
}


/*
|--------------------------------------------------------------------------
| Payment is verified
|--------------------------------------------------------------------------
*/

if ($statusCode === "2") {

    /*
     * Payment successful.
     */

    $paymentStatus =
        "SUCCESS";

} elseif ($statusCode === "0") {

    $paymentStatus =
        "PENDING";

} elseif ($statusCode === "-1") {

    $paymentStatus =
        "CANCELLED";

} elseif ($statusCode === "-2") {

    $paymentStatus =
        "FAILED";

} elseif ($statusCode === "-3") {

    $paymentStatus =
        "CHARGEDBACK";

} else {

    $paymentStatus =
        "UNKNOWN";
}


/*
|--------------------------------------------------------------------------
| Development Logging
|--------------------------------------------------------------------------
*/

$logData = [

    "time" =>
        date("Y-m-d H:i:s"),

    "merchant_id" =>
        $merchantId,

    "order_id" =>
        $orderId,

    "payment_id" =>
        $paymentId,

    "amount" =>
        $payhereAmount,

    "currency" =>
        $payhereCurrency,

    "status_code" =>
        $statusCode,

    "status" =>
        $paymentStatus,

    "method" =>
        $method,

    "message" =>
        $statusMessage
];


file_put_contents(
    __DIR__ . "/payment_log.txt",
    json_encode($logData) .
    PHP_EOL,
    FILE_APPEND
);


/*
|--------------------------------------------------------------------------
| Response
|--------------------------------------------------------------------------
*/

http_response_code(200);

echo "OK";