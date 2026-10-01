<?php

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../config/database.php";


$categoryID =
    $_GET["category_id"] ?? "";


/*
|--------------------------------------------------------------------------
| CATEGORY FILTER
|--------------------------------------------------------------------------
*/

if ($categoryID !== "") {

    if (!ctype_digit((string)$categoryID)) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" =>
                "Invalid category ID."
        ]);

        exit;
    }

    $categoryID =
        (int) $categoryID;


    $sql = "
        SELECT
            p.ProductID,
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
        WHERE p.CategoryID = ?
        ORDER BY p.ProductID DESC
    ";

    $stmt = $conn->prepare($sql);

    $stmt->bind_param(
        "i",
        $categoryID
    );

    $stmt->execute();

    $result = $stmt->get_result();

} else {

    $sql = "
        SELECT
            p.ProductID,
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
}


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


$conn->close();

?>