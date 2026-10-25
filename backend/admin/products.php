
<?php

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/session.php";

requireAdmin();

/*
|--------------------------------------------------------------------------
| HELPER: SEND JSON RESPONSE
|--------------------------------------------------------------------------
*/

function sendResponse($success, $message, $extra = [], $statusCode = 200)
{
    http_response_code($statusCode);

    echo json_encode(array_merge([
        "success" => $success,
        "message" => $message
    ], $extra));

    exit;
}

/*
|--------------------------------------------------------------------------
| GET: LOAD PRODUCTS
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    $sql = "
        SELECT
            p.ProductID,
            p.CategoryID,
            c.Name AS CategoryName,
            p.Title,
            p.Description,
            p.Price,
            p.StockQuantity,
            p.ImageURL,
            p.Customizable,
            p.IsActive
        FROM Product p
        INNER JOIN Category c
            ON p.CategoryID = c.CategoryID
        WHERE p.IsActive = 1
        ORDER BY p.ProductID DESC
    ";

    $result = $conn->query($sql);

    if (!$result) {
        sendResponse(
            false,
            "Could not load products.",
            [],
            500
        );
    }

    $products = [];

    while ($row = $result->fetch_assoc()) {

        $row["ProductID"] = (int) $row["ProductID"];
        $row["CategoryID"] = (int) $row["CategoryID"];
        $row["Price"] = (float) $row["Price"];
        $row["StockQuantity"] = (int) $row["StockQuantity"];
        $row["Customizable"] = (int) $row["Customizable"];
        $row["IsActive"] = (int) $row["IsActive"];

        $products[] = $row;
    }

    echo json_encode([
        "success" => true,
        "products" => $products
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| ONLY POST IS ALLOWED FOR CHANGES
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    header("Allow: GET, POST");

    sendResponse(
        false,
        "Method not allowed.",
        [],
        405
    );
}

/*
|--------------------------------------------------------------------------
| READ FORM DATA
|--------------------------------------------------------------------------
*/

$action = trim($_POST["action"] ?? "");

$productID = filter_var(
    $_POST["product_id"] ?? null,
    FILTER_VALIDATE_INT
);

$categoryID = filter_var(
    $_POST["category_id"] ?? null,
    FILTER_VALIDATE_INT
);

$title = trim($_POST["title"] ?? "");
$description = trim($_POST["description"] ?? "");
$imageURL = trim($_POST["image_url"] ?? "");

$priceInput = $_POST["price"] ?? null;
$stockInput = $_POST["stock_quantity"] ?? null;

$customizable = isset($_POST["customizable"])
    && $_POST["customizable"] === "1"
        ? 1
        : 0;

/*
|--------------------------------------------------------------------------
| DELETE / DEACTIVATE PRODUCT
|--------------------------------------------------------------------------
*/

if ($action === "delete") {

    if (!$productID || $productID <= 0) {
        sendResponse(
            false,
            "Invalid product ID.",
            [],
            400
        );
    }

    $stmt = $conn->prepare("
        UPDATE Product
        SET IsActive = 0
        WHERE ProductID = ? AND IsActive = 1
    ");

    if (!$stmt) {
        sendResponse(
            false,
            "Could not prepare the delete operation.",
            [],
            500
        );
    }

    $stmt->bind_param("i", $productID);

    if (!$stmt->execute()) {
        $stmt->close();

        sendResponse(
            false,
            "Could not delete the product.",
            [],
            500
        );
    }

    $changed = $stmt->affected_rows;
    $stmt->close();

    if ($changed === 0) {
        sendResponse(
            false,
            "Product not found or already deleted.",
            [],
            404
        );
    }

    sendResponse(
        true,
        "Product deleted successfully."
    );
}

/*
|--------------------------------------------------------------------------
| VALIDATE CREATE AND UPDATE ACTIONS
|--------------------------------------------------------------------------
*/

if (!in_array($action, ["create", "update"], true)) {
    sendResponse(
        false,
        "Invalid product action.",
        [],
        400
    );
}

if (
    $action === "update"
    && (!$productID || $productID <= 0)
) {
    sendResponse(
        false,
        "Invalid product ID.",
        [],
        400
    );
}

if (
    !$categoryID
    || $categoryID <= 0
    || $title === ""
    || $priceInput === null
    || $priceInput === ""
    || !is_numeric($priceInput)
    || !is_finite((float) $priceInput)
    || (float) $priceInput < 0
    || $stockInput === null
    || $stockInput === ""
    || filter_var(
        $stockInput,
        FILTER_VALIDATE_INT
    ) === false
    || (int) $stockInput < 0
) {
    sendResponse(
        false,
        "Please provide valid product details.",
        [],
        400
    );
}

if (strlen($title) > 200 || strlen($imageURL) > 500) {
    sendResponse(
        false,
        "The product name or image path is too long.",
        [],
        400
    );
}

$price = (float) $priceInput;
$stockQuantity = (int) $stockInput;

/*
|--------------------------------------------------------------------------
| CHECK THAT THE CATEGORY EXISTS
|--------------------------------------------------------------------------
*/

$categoryStmt = $conn->prepare("
    SELECT CategoryID
    FROM Category
    WHERE CategoryID = ?
");

if (!$categoryStmt) {
    sendResponse(
        false,
        "Could not validate the category.",
        [],
        500
    );
}

$categoryStmt->bind_param("i", $categoryID);
$categoryStmt->execute();
$categoryStmt->store_result();

$categoryExists = $categoryStmt->num_rows > 0;

$categoryStmt->close();

if (!$categoryExists) {
    sendResponse(
        false,
        "Please select a valid category.",
        [],
        400
    );
}

/*
|--------------------------------------------------------------------------
| CREATE PRODUCT
|--------------------------------------------------------------------------
*/

if ($action === "create") {

    $stmt = $conn->prepare("
        INSERT INTO Product
        (
            CategoryID,
            Title,
            Description,
            Price,
            StockQuantity,
            ImageURL,
            Customizable,
            IsActive
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    ");

    if (!$stmt) {
        sendResponse(
            false,
            "Could not prepare the product.",
            [],
            500
        );
    }

    $stmt->bind_param(
        "issdisi",
        $categoryID,
        $title,
        $description,
        $price,
        $stockQuantity,
        $imageURL,
        $customizable
    );

    if (!$stmt->execute()) {
        $stmt->close();

        sendResponse(
            false,
            "Product could not be added.",
            [],
            500
        );
    }

    $newProductID = $conn->insert_id;

    $stmt->close();

    sendResponse(
        true,
        "Product added successfully.",
        ["product_id" => $newProductID]
    );
}

/*
|--------------------------------------------------------------------------
| UPDATE PRODUCT
|--------------------------------------------------------------------------
*/

if ($action === "update") {

    $stmt = $conn->prepare("
        UPDATE Product
        SET
            CategoryID = ?,
            Title = ?,
            Description = ?,
            Price = ?,
            StockQuantity = ?,
            ImageURL = ?,
            Customizable = ?
        WHERE ProductID = ?
          AND IsActive = 1
    ");

    if (!$stmt) {
        sendResponse(
            false,
            "Could not prepare the product update.",
            [],
            500
        );
    }

    $stmt->bind_param(
        "issdisii",
        $categoryID,
        $title,
        $description,
        $price,
        $stockQuantity,
        $imageURL,
        $customizable,
        $productID
    );

    if (!$stmt->execute()) {
        $stmt->close();

        sendResponse(
            false,
            "Product could not be updated.",
            [],
            500
        );
    }

    $stmt->close();

    /*
     * A valid update can affect zero rows if the submitted
     * values are identical to the values already stored.
     * Check existence separately before reporting failure.
     */

    $check = $conn->prepare("
        SELECT ProductID
        FROM Product
        WHERE ProductID = ? AND IsActive = 1
    ");

    if (!$check) {
        sendResponse(
            false,
            "Could not verify the product update.",
            [],
            500
        );
    }

    $check->bind_param("i", $productID);
    $check->execute();
    $check->store_result();

    $exists = $check->num_rows > 0;

    $check->close();

    if (!$exists) {
        sendResponse(
            false,
            "Product not found or already deleted.",
            [],
            404
        );
    }

    sendResponse(
        true,
        "Product updated successfully."
    );
}

?>
