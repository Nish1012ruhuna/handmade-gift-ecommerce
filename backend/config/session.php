<?php

// Start session only if it has not already started
if (session_status() === PHP_SESSION_NONE) {

    $isHttps = (
        isset($_SERVER['HTTPS']) &&
        $_SERVER['HTTPS'] !== 'off'
    );

    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.use_trans_sid', '0');

    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);

    session_start();
}


/*
|--------------------------------------------------------------------------
| Require Customer Login
|--------------------------------------------------------------------------
*/

function requireLogin()
{
    if (
        !isset($_SESSION['customer_id']) ||
        ($_SESSION['role'] ?? '') !== 'customer'
    ) {
        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Authentication required."
        ]);

        exit;
    }
}


/*
|--------------------------------------------------------------------------
| Require Admin Login
|--------------------------------------------------------------------------
*/

function requireAdmin()
{
    if (
        !isset($_SESSION['admin_id']) ||
        ($_SESSION['role'] ?? '') !== 'admin'
    ) {
        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Admin authentication required."
        ]);

        exit;
    }
}
?>