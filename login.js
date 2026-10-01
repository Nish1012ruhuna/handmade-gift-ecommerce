document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");
    const loginBtn = document.getElementById("loginBtn");

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");

    const loginError = document.getElementById("loginError");
    const successMessage = document.getElementById("successMessage");

    const showPassword = document.getElementById("showPassword");


    // Show / hide password
    if (showPassword && passwordInput) {

        showPassword.addEventListener("click", function () {

            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                showPassword.textContent = "🙈";
            } else {
                passwordInput.type = "password";
                showPassword.textContent = "👁";
            }

        });
    }


    // Login form
    if (loginForm) {

        loginForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            // Clear old messages
            emailError.textContent = "";
            passwordError.textContent = "";
            loginError.textContent = "";
            successMessage.textContent = "";

            const email = emailInput.value.trim();
            const password = passwordInput.value;


            // Validation
            if (email === "") {
                emailError.textContent = "Please enter your email.";
                return;
            }

            if (password === "") {
                passwordError.textContent = "Please enter your password.";
                return;
            }


            loginBtn.disabled = true;
            loginBtn.textContent = "Logging in...";


            const formData = new FormData();

            formData.append("email", email);
            formData.append("password", password);


            try {

                const response = await fetch(
                    "backend/api/login.php",
                    {
                        method: "POST",
                        body: formData,
                        credentials: "same-origin"
                    }
                );


                // Read response as TEXT first
                const rawResponse = await response.text();

                console.log("Login status:", response.status);
                console.log("Login response:", rawResponse);


                // Convert response to JSON
                let data;

                try {
                    data = JSON.parse(rawResponse);
                } catch (jsonError) {

                    console.error("Invalid JSON:", rawResponse);

                    loginError.textContent =
                        "Server returned an invalid response. Check the browser console.";

                    return;
                }


                // Successful login
                if (response.ok && data.success === true) {

                    successMessage.textContent =
                        "Login successful! Redirecting...";

                    console.log("LOGIN SUCCESS");
                    console.log("Customer:", data.data.customer);


                    // Redirect to dashboard
                    setTimeout(function () {

                        window.location.href =
                            "customer_dashboard.html";

                    }, 700);

                } else {

                    loginError.textContent =
                        data.message || "Invalid email or password.";

                }

            } catch (error) {

                console.error("Login error:", error);

                loginError.textContent =
                    "Unable to connect to the server.";

            } finally {

                loginBtn.disabled = false;
                loginBtn.textContent = "Login to Account";

            }

        });
    }

});