const loginForm = document.getElementById("adminLoginForm");
const loginMessage = document.getElementById("loginMessage");
const loginButton = document.getElementById("loginButton");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    loginMessage.textContent = "";
    loginMessage.className = "message";

    loginButton.disabled = true;
    loginButton.textContent = "Signing in...";

    try {
        const formData = new FormData(loginForm);

        const response = await fetch(
            "/giftora/backend/api/login.php",
            {
                method: "POST",
                body: formData,
                credentials: "same-origin",
                cache: "no-store"
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Admin login failed."
            );
        }

        loginMessage.textContent = "Login successful!";
        loginMessage.classList.add("success");

        window.location.href =
            "/giftora/admin_dashboard.html";

    } catch (error) {
        loginMessage.textContent =
            error.message || "Unable to connect to the server.";

        loginMessage.classList.add("error");

    } finally {
        loginButton.disabled = false;
        loginButton.textContent = "Sign In";
    }
});
