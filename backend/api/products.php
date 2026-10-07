<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

// Database connection
require_once __DIR__ . "/../config/database.php";


// --------------------------------------------------
// GET PRODUCT DATA
// --------------------------------------------------

try {

    /*
     * If an ID is provided:
     *
     * products.php?id=5
     *
     * return only product 5.
     *
     * Otherwise:
     *
     * products.php
     *
     * return all active products.
     */

    if (isset($_GET["id"])) {

        $productID = filter_input(
            INPUT_GET,
            "id",
            FILTER_VALIDATE_INT
        );

        if (!$productID) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid product ID."
            ]);

            exit;
        }


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
            FROM product p
            INNER JOIN category c
                ON p.CategoryID = c.CategoryID
            WHERE p.ProductID = ?
            AND p.IsActive = TRUE
        ";


        $stmt = $conn->prepare($sql);

        if (!$stmt) {

            throw new Exception(
                "Failed to prepare database query."
            );
        }


        $stmt->bind_param(
            "i",
            $productID
        );

        $stmt->execute();

        $result = $stmt->get_result();

        if ($result->num_rows === 0) {

            http_response_code(404);

            echo json_encode([
                "success" => false,
                "message" => "Product not found."
            ]);

            exit;
        }


        $product = $result->fetch_assoc();


        // Convert database values to correct types
        $product["ProductID"] =
            (int) $product["ProductID"];

        $product["CategoryID"] =
            (int) $product["CategoryID"];

        $product["Price"] =
            (float) $product["Price"];

        $product["StockQuantity"] =
            (int) $product["StockQuantity"];

        $product["Customizable"] =
            (bool) $product["Customizable"];

        $product["IsActive"] =
            (bool) $product["IsActive"];


        echo json_encode([
            "success" => true,
            "product" => $product
        ]);


        $stmt->close();

        exit;
    }


    // --------------------------------------------------
    // GET ALL ACTIVE PRODUCTS
    // --------------------------------------------------

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
        FROM product p
        INNER JOIN category c
            ON p.CategoryID = c.CategoryID
        WHERE p.IsActive = TRUE
        ORDER BY p.ProductID DESC
    ";


    $result = $conn->query($sql);


    if (!$result) {

        throw new Exception(
            "Failed to retrieve products."
        );
    }


    $products = [];


    while ($row = $result->fetch_assoc()) {

        $products[] = [

            "ProductID" =>
                (int) $row["ProductID"],

            "CategoryID" =>
                (int) $row["CategoryID"],

            "CategoryName" =>
                $row["CategoryName"],

            "Title" =>
                $row["Title"],

            "Description" =>
                $row["Description"],

            "Price" =>
                (float) $row["Price"],

            "StockQuantity" =>
                (int) $row["StockQuantity"],

            "ImageURL" =>
                $row["ImageURL"],

            "Customizable" =>
                (bool) $row["Customizable"],

            "IsActive" =>
                (bool) $row["IsActive"]
        ];
    }


    echo json_encode([

        "success" => true,

        "count" =>
            count($products),

        "products" =>
            $products
    ]);


} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" =>
            "Server error while retrieving products."
    ]);
}


$conn->close();

?>