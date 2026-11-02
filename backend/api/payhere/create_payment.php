
<?php

header("Content-Type: application/json");

require_once __DIR__ . "/../../config/database.php";
require_once __DIR__ . "/../../config/session.php";
require_once __DIR__ . "/../../config/payhere.php";
require_once __DIR__ . "/../../config/gift_box_addons.php";

function respond($statusCode, $message, $extra = [])
{
    http_response_code($statusCode);

    echo json_encode(array_merge([
        "success" => false,
        "message" => $message
    ], $extra));

    exit;
}

// Only accept POST requests.
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Allow: POST");
    respond(405, "Invalid request method.");
}

// The customer must be logged in.
requireLogin();

$customerId = (int) $_SESSION["customer_id"];

// Read the JSON request.
$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
    respond(400, "Invalid JSON data.");
}

// Read delivery details.
$fullName = trim($data["fullName"] ?? "");
$phone    = trim($data["phone"] ?? "");
$email    = trim($data["email"] ?? "");
$address  = trim($data["address"] ?? "");
$city     = trim($data["city"] ?? "");
$country  = trim($data["country"] ?? "Sri Lanka");

// Do not trust the amount sent by JavaScript.
$items = $data["items"] ?? null;

if (
    $fullName === "" ||
    $phone === "" ||
    !filter_var($email, FILTER_VALIDATE_EMAIL) ||
    $address === "" ||
    $city === ""
) {
    respond(400, "Please provide valid delivery and contact details.");
}

if (!is_array($items) || count($items) === 0) {
    respond(400, "Your cart is empty or invalid.");
}

if (count($items) > 100) {
    respond(400, "Too many items in the cart.");
}

// Combine duplicate product IDs and validate quantities.
$quantities = [];
$cartLines = [];

foreach ($items as $item) {
    if (!is_array($item)) {
        respond(400, "Invalid cart item.");
    }

    $productId = filter_var(
        $item["productId"] ?? null,
        FILTER_VALIDATE_INT
    );

    $quantity = filter_var(
        $item["quantity"] ?? null,
        FILTER_VALIDATE_INT
    );
    $giftBoxAddonIds = $item["giftBoxAddonIds"] ?? [];

    if (
        $productId === false || $productId < 1 ||
        $quantity === false || $quantity < 1 ||
        $quantity > 100 ||
        !is_array($giftBoxAddonIds)
    ) {
        respond(400, "Invalid product ID or quantity.");
    }

    try {
        $selectedAddons = getGiftBoxAddonsByIds($giftBoxAddonIds);
    } catch (InvalidArgumentException $e) {
        respond(400, $e->getMessage());
    }

    $quantities[$productId] =
        ($quantities[$productId] ?? 0) + $quantity;

    if ($quantities[$productId] > 100) {
        respond(400, "The quantity for a product is too large.");
    }

    $cartLines[] = [
        "productId" => $productId,
        "quantity" => $quantity,
        "giftBoxAddons" => $selectedAddons
    ];
}

$nameParts = preg_split('/\s+/', $fullName);
$firstName = $nameParts[0];
$lastName = count($nameParts) > 1
    ? implode(" ", array_slice($nameParts, 1))
    : "";

$shippingFee = 0.00;

$currency = "LKR";
$orderId = null;
$totalAmount = 0.00;

try {
    $conn->begin_transaction();

    // Confirm that this customer still exists.
    $customerStmt = $conn->prepare(
        "SELECT CustomerID FROM customer
         WHERE CustomerID = ? LIMIT 1"
    );
    $customerStmt->bind_param("i", $customerId);
    $customerStmt->execute();
    $customerResult = $customerStmt->get_result();

    if ($customerResult->num_rows !== 1) {
        throw new RuntimeException("Customer account was not found.");
    }

    $customerStmt->close();

    // Get the real product prices and check stock in MySQL.
    $productStmt = $conn->prepare(
        "SELECT p.ProductID, p.Title, p.Price, p.StockQuantity, c.Name AS CategoryName
         FROM product p
         INNER JOIN category c ON c.CategoryID = p.CategoryID
         WHERE p.ProductID = ? AND p.IsActive = 1
         FOR UPDATE"
    );

    $verifiedProducts = [];

    foreach ($quantities as $productId => $quantity) {
        $productStmt->bind_param("i", $productId);
        $productStmt->execute();

        $result = $productStmt->get_result();
        $product = $result->fetch_assoc();

        if (!$product) {
            throw new RuntimeException(
                "A product in your cart is unavailable."
            );
        }

        if ((int) $product["StockQuantity"] < $quantity) {
            throw new RuntimeException(
                "Not enough stock for " . $product["Title"] . "."
            );
        }

        $verifiedProducts[$productId] = $product;
    }

    $productStmt->close();

    $verifiedItems = [];
    $subtotal = 0.00;

    foreach ($cartLines as $line) {
        $productId = $line["productId"];
        $quantity = $line["quantity"];
        $product = $verifiedProducts[$productId];
        $selectedAddons = $line["giftBoxAddons"];
        $isGiftBox = strtolower(trim($product["CategoryName"])) === "gift boxes";

        if (count($selectedAddons) > 0 && !$isGiftBox) {
            throw new RuntimeException(
                "Gift-box items can only be added to products in the Gift Boxes category."
            );
        }

        $addonTotal = array_reduce(
            $selectedAddons,
            function ($total, $addon) {
                return $total + (float) $addon["price"];
            },
            0.0
        );

        $unitPrice = (float) $product["Price"] + $addonTotal;
        $subtotal += round($unitPrice * $quantity, 2);

        $verifiedItems[] = [
            "productId" => (int) $product["ProductID"],
            "quantity" => $quantity,
            "unitPrice" => $unitPrice,
            "giftBoxAddons" => $selectedAddons
        ];
    }

    // Calculate the total on the server.
    // This does not use the amount from the browser.
    $subtotal = round($subtotal, 2);
    if ($subtotal > 0 && $subtotal < 2000) {
        $shippingFee = 350.00;
    }
    $totalAmount = round($subtotal + $shippingFee, 2);

    $deliveryAddress = $address . ", " . $city . ", " . $country;

    // Create the database order. OrderID is generated by MariaDB.
    $orderStmt = $conn->prepare(
        "INSERT INTO orders
            (CustomerID, TotalAmount, Status, DeliveryAddress)
         VALUES (?, ?, 'Pending', ?)"
    );

    $orderStmt->bind_param(
        "ids",
        $customerId,
        $totalAmount,
        $deliveryAddress
    );

    $orderStmt->execute();
    $orderId = (int) $conn->insert_id;
    $orderStmt->close();

    // Save each product and its verified price.
    $itemStmt = $conn->prepare(
        "INSERT INTO orderitem
            (OrderID, ProductID, CustomizationID, Quantity, UnitPrice)
         VALUES (?, ?, ?, ?, ?)"
    );

    foreach ($verifiedItems as $item) {
        $productId = $item["productId"];
        $quantity = $item["quantity"];
        $unitPrice = $item["unitPrice"];
        $customizationId = saveGiftBoxAddons(
            $conn,
            $item["giftBoxAddons"]
        );

        $itemStmt->bind_param(
            "iiiid",
            $orderId,
            $productId,
            $customizationId,
            $quantity,
            $unitPrice
        );

        $itemStmt->execute();
    }

    $itemStmt->close();

    // One pending payment record per order.
    $paymentMethod = "PayHere";
    $paymentStatus = "Pending";

    $paymentStmt = $conn->prepare(
        "INSERT INTO payment
            (OrderID, PaymentMethod, Amount, Status)
         VALUES (?, ?, ?, ?)"
    );

    $paymentStmt->bind_param(
        "isds",
        $orderId,
        $paymentMethod,
        $totalAmount,
        $paymentStatus
    );

    $paymentStmt->execute();
    $paymentStmt->close();

    // All three records must be saved together.
    $conn->commit();

} catch (Throwable $e) {
    try {
        $conn->rollback();
    } catch (Throwable $ignored) {
        // The transaction may already have been rolled back.
    }

    error_log("GIFTORA checkout error: " . $e->getMessage());

    $message = $e instanceof RuntimeException
        ? $e->getMessage()
        : "Could not create your order. Please try again.";

    respond(400, $message);
}

// PayHere uses the numeric database OrderID as its order reference.
$payHereOrderId = (string) $orderId;
$formattedAmount = number_format($totalAmount, 2, ".", "");

$hashedSecret = strtoupper(md5($PAYHERE_MERCHANT_SECRET));

$hash = strtoupper(md5(
    $PAYHERE_MERCHANT_ID .
    $payHereOrderId .
    $formattedAmount .
    $currency .
    $hashedSecret
));

// Return the fields expected by checkout.js.
echo json_encode([
    "success" => true,
    "payment_url" => $PAYHERE_PAYMENT_URL,
    "merchant_id" => $PAYHERE_MERCHANT_ID,
    "order_id" => $payHereOrderId,
    "items" => "GIFTORA Order #" . $payHereOrderId,
    "currency" => $currency,
    "amount" => $formattedAmount,
    "hash" => $hash,
    "first_name" => $firstName,
    "last_name" => $lastName,
    "email" => $email,
    "phone" => $phone,
    "address" => $address,
    "city" => $city,
    "country" => $country,
    "return_url" => $PAYHERE_RETURN_URL,
    "cancel_url" => $PAYHERE_CANCEL_URL,
    "notify_url" => $PAYHERE_NOTIFY_URL
]);