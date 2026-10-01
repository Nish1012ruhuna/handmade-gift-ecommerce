<?php

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/session.php";

requireAdmin();


/*
|--------------------------------------------------------------------------
| GET CATEGORIES
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    $sql = "
        SELECT
            CategoryID,
            Name,
            Description
        FROM Category
        ORDER BY CategoryID DESC
    ";

    $result = $conn->query($sql);

    if (!$result) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" =>
                "Could not load categories."
        ]);

        exit;
    }


    $categories = [];

    while ($row = $result->fetch_assoc()) {

        $categories[] = $row;
    }


    echo json_encode([
        "success" => true,
        "categories" => $categories
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| ADD CATEGORY
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $name =
        trim($_POST["name"] ?? "");

    $description =
        trim($_POST["description"] ?? "");


    if ($name === "") {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" =>
                "Category name is required."
        ]);

        exit;
    }


    $sql = "
        INSERT INTO Category
        (
            Name,
            Description
        )
        VALUES (?, ?)
    ";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" =>
                "Could not prepare category."
        ]);

        exit;
    }


    $stmt->bind_param(
        "ss",
        $name,
        $description
    );


    if ($stmt->execute()) {

        echo json_encode([
            "success" => true,
            "message" =>
                "Category added successfully.",
            "category_id" =>
                $conn->insert_id
        ]);

    } else {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" =>
                "Category could not be added."
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