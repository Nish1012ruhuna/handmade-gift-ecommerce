<?php

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/session.php";

requireAdmin();


/*
|--------------------------------------------------------------------------
| GET PRODUCTS
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    $sql = "
        SELECT
            p.ProductID,
            p.CategoryID,
            p.Title,
            p.Description,
            p.Price,
            p.StockQuantity,
            p.ImageURL,
            p.Customizable,
            c.Name AS CategoryName
        FROM Product p
        INNER JOIN Category c
            ON p.CategoryID = c.CategoryID
        ORDER BY p.ProductID DESC
    ";

    $result = $conn->query($sql);

    if (!$result) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" =>
                "Could not load products."
        ]);

        exit;
    }


    $products = [];

    while ($row = $result->fetch_assoc()) {

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
| ADD PRODUCT
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $categoryID =
        intval($_POST["categoryID"] ?? 0);

    $title =
        trim($_POST["title"] ?? "");

    $description =
        trim($_POST["description"] ?? "");

    $price =
        floatval($_POST["price"] ?? 0);

    $stockQuantity =
        intval($_POST["stockQuantity"] ?? 0);

    $imageURL =
        trim($_POST["imageURL"] ?? "");

    $customizable =
        isset($_POST["customizable"])
            ? 1
            : 0;


    /*
     * Validation
     */

    if (
        $categoryID <= 0 ||
        $title === "" ||
        $price <= 0 ||
        $stockQuantity < 0
    ) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" =>
                "Please provide valid product details."
        ]);

        exit;
    }


    /*
     * Insert
     */

    $sql = "
        INSERT INTO Product
        (
            CategoryID,
            Title,
            Description,
            Price,
            StockQuantity,
            ImageURL,
            Customizable
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ";

    $stmt = $conn->prepare($sql);


    if (!$stmt) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" =>
                "Could not prepare product."
        ]);

        exit;
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


    if ($stmt->execute()) {

        echo json_encode([
            "success" => true,
            "message" =>
                "Product added successfully.",
            "product_id" =>
                $conn->insert_id
        ]);

    } else {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" =>
                "Product could not be added."
        ]);
    }

    exit;
}


header("Allow: GET, POST");

http_response_code(405);

echo json_encode([
    "success" => false,
    "message" => "Method not allowed."
]);

?>