<?php

header("Content-Type: application/json; charset=UTF-8");
header("Cache-Control: no-store, no-cache, must-revalidate");

require_once __DIR__ . "/../../config/database.php";
require_once __DIR__ . "/../../config/session.php";

// Only authenticated administrators can access inquiries.
requireAdmin();

if (!in_array($_SERVER["REQUEST_METHOD"], ["GET", "POST"], true)) {
    header("Allow: GET, POST");
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed."
    ]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $input = json_decode(file_get_contents("php://input"), true);

    if (!is_array($input)) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Invalid request data."
        ]);
        exit;
    }

    $inquiryID = filter_var(
        $input["inquiryID"] ?? null,
        FILTER_VALIDATE_INT
    );
    $replyInput = $input["reply"] ?? null;

    if ($inquiryID === false || $inquiryID < 1) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Invalid inquiry ID."
        ]);
        exit;
    }

    if (!is_string($replyInput)) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Reply must be text."
        ]);
        exit;
    }

    $reply = trim($replyInput);

    if ($reply === "" || mb_strlen($reply) > 5000) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Reply must contain 1 to 5000 characters."
        ]);
        exit;
    }

    try {
        $stmt = $conn->prepare("
            UPDATE order_inquiry
            SET AdminReply = ?,
                InquiryStatus = 'Replied',
                RepliedAt = CURRENT_TIMESTAMP
            WHERE InquiryID = ?
        ");

        if (!$stmt) {
            throw new RuntimeException("Could not prepare inquiry reply.");
        }

        $stmt->bind_param("si", $reply, $inquiryID);

        if (!$stmt->execute()) {
            throw new RuntimeException("Could not save inquiry reply.");
        }

        if ($stmt->affected_rows === 0) {
            $stmt->close();

            $check = $conn->prepare(
                "SELECT InquiryID FROM order_inquiry WHERE InquiryID = ?"
            );

            if (!$check) {
                throw new RuntimeException("Could not verify inquiry.");
            }

            $check->bind_param("i", $inquiryID);
            $check->execute();
            $check->store_result();
            $inquiryExists = $check->num_rows > 0;
            $check->close();

            if (!$inquiryExists) {
                http_response_code(404);

                echo json_encode([
                    "success" => false,
                    "message" => "Inquiry not found."
                ]);
                exit;
            }
        } else {
            $stmt->close();
        }

        echo json_encode([
            "success" => true,
            "message" => "Reply saved successfully."
        ]);
        exit;

    } catch (Throwable $e) {
        error_log("Admin inquiry reply error: " . $e->getMessage());

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Unable to save the reply."
        ]);
        exit;
    }
}

// Optional customer ID filter.
$customerID = null;

if (isset($_GET["customer_id"])) {
    $customerID = filter_var(
        $_GET["customer_id"],
        FILTER_VALIDATE_INT
    );

    if ($customerID === false || $customerID < 1) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Invalid customer ID."
        ]);
        exit;
    }
}

try {
    if ($customerID !== null) {

        // Return all inquiries for the selected customer.
        $stmt = $conn->prepare("
            SELECT
                InquiryID,
                CustomerID,
                OrderID,
                Subject,
                Message,
                AdminReply,
                InquiryStatus,
                CreatedAt,
                RepliedAt
            FROM order_inquiry
            WHERE CustomerID = ?
            ORDER BY CreatedAt DESC, InquiryID DESC
        ");

        $stmt->bind_param("i", $customerID);
        $stmt->execute();

        $result = $stmt->get_result();

    } elseif (isset($_GET["all"]) && $_GET["all"] === "1") {

        // Return all inquiries for the dedicated Inquiries page.
        $result = $conn->query("
            SELECT
                InquiryID,
                CustomerID,
                OrderID,
                Subject,
                Message,
                AdminReply,
                InquiryStatus,
                CreatedAt,
                RepliedAt
            FROM order_inquiry
            ORDER BY CreatedAt DESC, InquiryID DESC
        ");

    } else {

        // Return only the latest five inquiries for the dashboard.
        $result = $conn->query("
            SELECT
                InquiryID,
                CustomerID,
                OrderID,
                Subject,
                Message,
                AdminReply,
                InquiryStatus,
                CreatedAt,
                RepliedAt
            FROM order_inquiry
            ORDER BY CreatedAt DESC, InquiryID DESC
            LIMIT 5
        ");
    }

    if (!$result) {
        throw new RuntimeException("Inquiry query failed.");
    }

    $inquiries = [];

    while ($row = $result->fetch_assoc()) {
        $inquiries[] = $row;
    }

    if (isset($stmt)) {
        $stmt->close();
    }

    echo json_encode([
        "success" => true,
        "inquiries" => $inquiries
    ]);

} catch (Throwable $e) {
    error_log("Admin inquiries error: " . $e->getMessage());

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to load customer inquiries."
    ]);
}