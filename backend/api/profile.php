<?php

require_once "../config/database.php";
require_once "../config/session.php";

header("Content-Type: application/json");

requireLogin();


$customerID = $_SESSION["customer_id"];


/*
|--------------------------------------------------------------------------
| GET PROFILE
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    $sql = "SELECT
                CustomerID,
                FullName,
                NIC,
                Email,
                MobileNo,
                ShippingAddress,
                BillingAddress,
                CreatedAt
            FROM customer
            WHERE CustomerID = ?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $customerID);
    $stmt->execute();

    $result = $stmt->get_result();

    if ($result->num_rows !== 1) {

        http_response_code(404);

        echo json_encode([
            "success" => false,
            "message" => "Customer not found."
        ]);

        exit;
    }

    $customer = $result->fetch_assoc();

    echo json_encode([
        "success" => true,
        "customer" => $customer
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| POST REQUESTS
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $action = $_POST["action"] ?? "update_profile";


    /*
    |--------------------------------------------------------------------------
    | UPDATE PROFILE
    |--------------------------------------------------------------------------
    */

    if ($action === "update_profile") {

        $fullName = trim($_POST["fullName"] ?? "");
        $nic = trim($_POST["nic"] ?? "");
        $mobileNo = trim($_POST["mobileNo"] ?? "");
        $shippingAddress = trim($_POST["shippingAddress"] ?? "");
        $billingAddress = trim($_POST["billingAddress"] ?? "");


        if ($fullName === "") {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Full name is required."
            ]);

            exit;
        }


        $sql = "UPDATE customer
                SET FullName = ?,
                    NIC = ?,
                    MobileNo = ?,
                    ShippingAddress = ?,
                    BillingAddress = ?
                WHERE CustomerID = ?";

        $stmt = $conn->prepare($sql);

        $stmt->bind_param(
            "sssssi",
            $fullName,
            $nic,
            $mobileNo,
            $shippingAddress,
            $billingAddress,
            $customerID
        );


        if ($stmt->execute()) {

            $_SESSION["customer_name"] = $fullName;

            echo json_encode([
                "success" => true,
                "message" => "Profile updated successfully."
            ]);

        } else {

            http_response_code(500);

            echo json_encode([
                "success" => false,
                "message" => "Unable to update profile."
            ]);
        }

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | CHANGE PASSWORD
    |--------------------------------------------------------------------------
    */

    if ($action === "change_password") {

        $currentPassword = $_POST["currentPassword"] ?? "";
        $newPassword = $_POST["newPassword"] ?? "";
        $confirmPassword = $_POST["confirmPassword"] ?? "";


        if (
            $currentPassword === "" ||
            $newPassword === "" ||
            $confirmPassword === ""
        ) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Please fill in all password fields."
            ]);

            exit;
        }


        /*
        | Get current password hash
        */

        $sql = "SELECT PasswordHash
                FROM customer
                WHERE CustomerID = ?";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $customerID);
        $stmt->execute();

        $result = $stmt->get_result();
        $customer = $result->fetch_assoc();


        /*
        | Verify current password
        */

        if (
            !$customer ||
            !password_verify(
                $currentPassword,
                $customer["PasswordHash"]
            )
        ) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Current password is incorrect."
            ]);

            exit;
        }


        /*
        | Validate new password
        */

        if (
            strlen($newPassword) < 8 ||
            !preg_match('/[A-Z]/', $newPassword) ||
            !preg_match('/[a-z]/', $newPassword) ||
            !preg_match('/[0-9]/', $newPassword)
        ) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "New password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number."
            ]);

            exit;
        }


        if ($newPassword !== $confirmPassword) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "New passwords do not match."
            ]);

            exit;
        }


        /*
        | Hash new password
        */

        $newPasswordHash = password_hash(
            $newPassword,
            PASSWORD_DEFAULT
        );


        /*
        | Update password
        */

        $updateSql = "UPDATE customer
                      SET PasswordHash = ?
                      WHERE CustomerID = ?";

        $updateStmt = $conn->prepare($updateSql);

        $updateStmt->bind_param(
            "si",
            $newPasswordHash,
            $customerID
        );


        if ($updateStmt->execute()) {

            session_regenerate_id(true);

            echo json_encode([
                "success" => true,
                "message" => "Password changed successfully."
            ]);

        } else {

            http_response_code(500);

            echo json_encode([
                "success" => false,
                "message" => "Unable to change password."
            ]);
        }

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Unknown Action
    |--------------------------------------------------------------------------
    */

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid action."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Unsupported Method
|--------------------------------------------------------------------------
*/

http_response_code(405);

echo json_encode([
    "success" => false,
    "message" => "Method not allowed."
]);

?>