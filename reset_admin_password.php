
<?php
require_once __DIR__ . "/backend/config/database.php";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = trim($_POST["email"] ?? "");
    $password = $_POST["password"] ?? "";

    if ($email === "" || strlen($password) < 12) {
        exit("Enter the admin email and a password of at least 12 characters.");
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $conn->prepare(
        "UPDATE admin SET PasswordHash = ? WHERE Email = ?"
    );

    $stmt->bind_param("ss", $hash, $email);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo "Admin password updated successfully.";
    } else {
        echo "No account was updated. Check the email address.";
    }

    $stmt->close();
    $conn->close();
    exit;
}
?>

<form method="post">
    <label>Admin email:</label>
    <input type="email" name="email" required>

    <br><br>

    <label>New password (12+ characters):</label>
    <input type="password" name="password" minlength="12" required>

    <br><br>

    <button type="submit">Reset Admin Password</button>
</form>
