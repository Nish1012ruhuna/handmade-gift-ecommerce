<?php

require_once "../config/database.php";
require_once "../config/session.php";
require_once "../config/gift_box_addons.php";

header("Content-Type: application/json");


// =====================================================
// REQUIRE CUSTOMER LOGIN
// =====================================================

requireLogin();


// =====================================================
// ONLY POST REQUESTS
// =====================================================

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed."
    ]);

    exit;
}

// =====================================================
// READ JSON DATA
// =====================================================

$input = json_decode(
    file_get_contents("php://input"),
    true
);


if (!is_array($input)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid request data."
    ]);

    exit;
}


// =====================================================
// GET CUSTOMER FROM SESSION
// =====================================================

$customerId = (int) $_SESSION["customer_id"];


// =====================================================
// GET CHECKOUT DATA
// =====================================================

$deliveryAddress = trim(
    $input["deliveryAddress"] ?? ""
);

$paymentMethod = trim(
    $input["paymentMethod"] ?? ""
);

$bankReference = trim(
    $input["bankReference"] ?? ""
);

$items = $input["items"] ?? [];


// =====================================================
// VALIDATE REQUIRED DATA
// =====================================================

if ($deliveryAddress === "") {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Delivery address is required."
    ]);

    exit;
}


if (
    !in_array(
        $paymentMethod,
        [
            "Cash on Delivery",
            "Bank Transfer"
        ],
        true
    )
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid payment method."
    ]);

    exit;
}


if (
    $paymentMethod === "Bank Transfer" &&
    $bankReference === ""
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Bank transfer reference is required."
    ]);

    exit;
}


if (!is_array($items) || count($items) === 0) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Your cart is empty."
    ]);

    exit;
}


// =====================================================
// START DATABASE TRANSACTION
// =====================================================

$conn->begin_transaction();


try {

    $subtotal = 0;

    $validatedItems = [];
    $requestedQuantities = [];

    foreach ($items as $item) {
        if (!is_array($item)) {
            throw new Exception("Invalid product in cart.");
        }

        $productId = isset($item["productId"])
            ? (int) $item["productId"]
            : (isset($item["ProductID"]) ? (int) $item["ProductID"] : 0);
        $quantity = isset($item["quantity"])
            ? (int) $item["quantity"]
            : 0;

        if ($productId <= 0 || $quantity < 1 || $quantity > 100) {
            throw new Exception("Invalid product or quantity in cart.");
        }

        $requestedQuantities[$productId] =
            ($requestedQuantities[$productId] ?? 0) + $quantity;

        if ($requestedQuantities[$productId] > 100) {
            throw new Exception("The quantity for a product is too large.");
        }
    }

    // =================================================
    // PREPARE PRODUCT QUERY
    // =================================================

    $productStmt = $conn->prepare(
        "
        SELECT
            p.ProductID,
            Title,
            Price,
            StockQuantity,
            IsActive,
            c.Name AS CategoryName
        FROM product p
        INNER JOIN category c ON c.CategoryID = p.CategoryID
        WHERE p.ProductID = ?
        FOR UPDATE
        "
    );


    if (!$productStmt) {
        throw new Exception(
            "Unable to prepare product query."
        );
    }


    // =================================================
    // CHECK EVERY CART ITEM
    // =================================================

    foreach ($items as $item) {

        /*
         * The frontend may have different property names
         * depending on the current cart implementation.
         */

        $productId = isset($item["productId"])
            ? (int) $item["productId"]
            : (
                isset($item["ProductID"])
                    ? (int) $item["ProductID"]
                    : 0
            );


        $quantity = isset($item["quantity"])
            ? (int) $item["quantity"]
            : 0;
        $giftBoxAddonIds = $item["giftBoxAddonIds"] ?? [];


        // ---------------------------------------------
        // VALIDATE PRODUCT ID
        // ---------------------------------------------

        if ($productId <= 0) {

            throw new Exception(
                "Invalid product in cart."
            );
        }


        // ---------------------------------------------
        // VALIDATE QUANTITY
        // ---------------------------------------------

        if (
            $quantity < 1 ||
            $quantity > 100
        ) {

            throw new Exception(
                "Invalid quantity for product ID " .
                $productId . "."
            );
        }


        // ---------------------------------------------
        // GET REAL PRODUCT DATA FROM DATABASE
        // ---------------------------------------------

        $productStmt->bind_param(
            "i",
            $productId
        );

        $productStmt->execute();

        $result =
            $productStmt->get_result();


        $product =
            $result->fetch_assoc();


        if (!$product) {

            throw new Exception(
                "Product ID " .
                $productId .
                " was not found."
            );
        }


        // ---------------------------------------------
        // CHECK PRODUCT ACTIVE
        // ---------------------------------------------

        if ((int) $product["IsActive"] !== 1) {

            throw new Exception(
                $product["Title"] .
                " is currently unavailable."
            );
        }


        // ---------------------------------------------
        // CHECK STOCK
        // ---------------------------------------------

        $stock =
            (int) $product["StockQuantity"];


        if ($requestedQuantities[$productId] > $stock) {

            throw new Exception(
                "Only " .
                $stock .
                " item(s) of \"" .
                $product["Title"] .
                "\" are available across your cart."
            );
        }


        // ---------------------------------------------
        // USE DATABASE PRICE
        // ---------------------------------------------

        $selectedAddons = getGiftBoxAddonsByIds($giftBoxAddonIds);
        $isGiftBox = strtolower(trim($product["CategoryName"])) === "gift boxes";

        if (count($selectedAddons) > 0 && !$isGiftBox) {
            throw new Exception(
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

        $unitPrice =
            (float) $product["Price"] + $addonTotal;


        $lineTotal =
            $unitPrice * $quantity;


        $subtotal +=
            $lineTotal;


        // ---------------------------------------------
        // STORE VALIDATED ITEM
        // ---------------------------------------------

        $validatedItems[] = [

            "productId" =>
                $productId,

            "title" =>
                $product["Title"],

            "quantity" =>
                $quantity,

            "unitPrice" =>
                $unitPrice,

            "giftBoxAddons" =>
                $selectedAddons,

            "lineTotal" =>
                $lineTotal

        ];
    }


    $productStmt->close();


    // =================================================
    // DELIVERY CHARGE
    // =================================================

    $shipping =
        $subtotal > 0 && $subtotal < 2000
            ? 350
            : 0;


    // =================================================
    // FINAL TOTAL
    // =================================================

    $totalAmount =
        $subtotal + $shipping;


    // =================================================
    // INSERT ORDER
    // =================================================

    $orderStatus = "Pending";


    $orderStmt = $conn->prepare(
        "
        INSERT INTO orders
        (
            CustomerID,
            TotalAmount,
            Status,
            DeliveryAddress
        )
        VALUES (?, ?, ?, ?)
        "
    );


    if (!$orderStmt) {
        throw new Exception(
            "Unable to prepare order query."
        );
    }


    $orderStmt->bind_param(
        "idss",
        $customerId,
        $totalAmount,
        $orderStatus,
        $deliveryAddress
    );


    if (!$orderStmt->execute()) {

        throw new Exception(
            "Unable to create order."
        );
    }


    // =================================================
    // GET DATABASE ORDER ID
    // =================================================

    $orderId =
        $conn->insert_id;


    $orderStmt->close();


    // =================================================
    // INSERT ORDER ITEMS
    // =================================================

    $itemStmt = $conn->prepare(
        "
        INSERT INTO orderitem
        (
            OrderID,
            ProductID,
            CustomizationID,
            Quantity,
            UnitPrice
        )
        VALUES (?, ?, ?, ?, ?)
        "
    );


    if (!$itemStmt) {
        throw new Exception(
            "Unable to prepare order item query."
        );
    }


    foreach ($validatedItems as $item) {

        $productId =
            $item["productId"];

        $quantity =
            $item["quantity"];

        $customizationId = saveGiftBoxAddons(
            $conn,
            $item["giftBoxAddons"]
        );

        $unitPrice =
            $item["unitPrice"];


        $itemStmt->bind_param(
            "iiiid",
            $orderId,
            $productId,
            $customizationId,
            $quantity,
            $unitPrice
        );


        if (!$itemStmt->execute()) {

            throw new Exception(
                "Unable to save order item."
            );
        }
    }


    $itemStmt->close();


    // =================================================
    // INSERT PAYMENT
    // =================================================

    $paymentStatus = "Pending";


    $paymentStmt = $conn->prepare(
        "
        INSERT INTO payment
        (
            OrderID,
            PaymentMethod,
            Amount,
            Status,
            TransactionReference
        )
        VALUES (?, ?, ?, ?, ?)
        "
    );


    if (!$paymentStmt) {
        throw new Exception(
            "Unable to prepare payment query."
        );
    }


    $paymentStmt->bind_param(
        "isdss",
        $orderId,
        $paymentMethod,
        $totalAmount,
        $paymentStatus,
        $bankReference
    );


    if (!$paymentStmt->execute()) {

        throw new Exception(
            "Unable to save payment information."
        );
    }


    $paymentStmt->close();


    // =================================================
    // UPDATE STOCK
    // =================================================

    $stockStmt = $conn->prepare(
        "
        UPDATE product
        SET StockQuantity = StockQuantity - ?
        WHERE ProductID = ?
        "
    );


    if (!$stockStmt) {
        throw new Exception(
            "Unable to prepare stock update."
        );
    }


    foreach ($validatedItems as $item) {

        $quantity =
            $item["quantity"];

        $productId =
            $item["productId"];


        $stockStmt->bind_param(
            "ii",
            $quantity,
            $productId
        );


        if (!$stockStmt->execute()) {

            throw new Exception(
                "Unable to update product stock."
            );
        }
    }


    $stockStmt->close();


    // =================================================
    // COMMIT TRANSACTION
    // =================================================

    $conn->commit();


    // =================================================
    // SUCCESS RESPONSE
    // =================================================

    echo json_encode([

        "success" => true,

        "message" =>
            "Order created successfully.",

        "orderId" =>
            (int) $orderId,

        "subtotal" =>
            round($subtotal, 2),

        "shipping" =>
            round($shipping, 2),

        "total" =>
            round($totalAmount, 2),

        "paymentMethod" =>
            $paymentMethod

    ]);


} catch (Exception $e) {

    // =================================================
    // ROLLBACK IF ANYTHING FAILED
    // =================================================

    $conn->rollback();


    http_response_code(400);


    echo json_encode([

        "success" => false,

        "message" =>
            $e->getMessage()

    ]);
}

?>