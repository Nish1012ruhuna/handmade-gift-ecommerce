
/*
=========================================================
 GIFTORA - CUSTOMER LOGIN JAVASCRIPT
---------------------------------------------------------
 Features:
 1. Validate email and password fields.
 2. Submit credentials to the PHP login API.
 3. Display login errors without exposing sensitive details.
 4. Toggle password visibility.
 5. Redirect to checkout after successful login when requested.
 6. Otherwise redirect to the home page.
=========================================================
*/

document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // HTML ELEMENTS
    // =====================================================

    const loginForm = document.getElementById("loginForm");

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const loginBtn = document.getElementById("loginBtn");

    const loginError = document.getElementById("loginError");
    const successMessage = document.getElementById("successMessage");

    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");

    const showPasswordBtn = document.getElementById("showPassword");

    // Stop if the expected login form does not exist.
    if (
        !loginForm ||
        !emailInput ||
        !passwordInput ||
        !loginBtn ||
        !loginError ||
        !successMessage
    ) {
        console.error("GIFTORA login form elements were not found.");
        return;
    }

    // Prevent duplicate submissions while a login request is running.
    let isSubmitting = false;

    // =====================================================
    // HELPER: DISPLAY LOGIN ERROR
    // =====================================================

    function showLoginError(message) {
        loginError.textContent = message;
        loginError.style.display = "block";

        successMessage.textContent = "";
        successMessage.style.display = "none";
    }

    // =====================================================
    // HELPER: DISPLAY SUCCESS MESSAGE
    // =====================================================

    function showLoginSuccess(message) {
        successMessage.textContent = message;
        successMessage.style.display = "block";

        loginError.textContent = "";
        loginError.style.display = "none";
    }

    // =====================================================
    // HELPER: CLEAR VALIDATION ERRORS
    // =====================================================

    function clearErrors() {
        emailError.textContent = "";
        passwordError.textContent = "";

        loginError.textContent = "";
        loginError.style.display = "none";

        successMessage.textContent = "";
        successMessage.style.display = "none";
    }

    // =====================================================
    // PASSWORD VISIBILITY TOGGLE
    // =====================================================

    if (showPasswordBtn) {
        showPasswordBtn.addEventListener("click", function () {

            // Change the input type to show or hide the password.
            const isHidden = passwordInput.type === "password";

            passwordInput.type = isHidden ? "text" : "password";

            // Update the accessible label.
            showPasswordBtn.setAttribute(
                "aria-label",
                isHidden ? "Hide password" : "Show password"
            );
        });
    }

    // =====================================================
    // VALIDATE LOGIN FIELDS
    // =====================================================

    function validateLoginForm() {
        let isValid = true;

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        emailError.textContent = "";
        passwordError.textContent = "";

        // Validate that an email was entered.
        if (!email) {
            emailError.textContent = "Please enter your email address.";
            isValid = false;

        } else {
            // Basic email-format validation.
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email)) {
                emailError.textContent =
                    "Please enter a valid email address.";

                isValid = false;
            }
        }

        // Password must not be empty.
        if (!password) {
            passwordError.textContent = "Please enter your password.";
            isValid = false;
        }

        return isValid;
    }

    // =====================================================
    // CHOOSE A SAFE REDIRECT DESTINATION
    // =====================================================
    // Never redirect directly to an arbitrary URL from a query
    // parameter. Only permit known pages in this website.

    function getRedirectDestination() {
        const params = new URLSearchParams(window.location.search);
        const requestedPage = params.get("next");

        const allowedPages = [
            "checkout.html",
            "customer_dashboard.html"
        ];

        if (allowedPages.includes(requestedPage)) {
            return requestedPage;
        }

        // Normal login destination when no safe destination is requested.
        return "home.html";
    }

    // =====================================================
    // SUBMIT LOGIN FORM
    // =====================================================

    loginForm.addEventListener("submit", async function (event) {

        // Prevent the browser from reloading the page.
        event.preventDefault();

        // Do not send multiple simultaneous login requests.
        if (isSubmitting) {
            return;
        }

        clearErrors();

        // Validate required fields before contacting PHP.
        if (!validateLoginForm()) {
            return;
        }

        isSubmitting = true;

        // Save the original button label for restoring on failure.
        const originalButtonText =
            loginBtn.textContent.trim() || "Login to Account";

        loginBtn.disabled = true;
        loginBtn.textContent = "Signing In...";

        try {

            // =================================================
            // SEND LOGIN REQUEST TO PHP
            // =================================================
            // FormData sends email and password as form fields.
            // Your PHP login endpoint must verify PasswordHash
            // with password_verify() and create a PHP session.

            const formData = new FormData();

            formData.append("email", emailInput.value.trim());
            formData.append("password", passwordInput.value);

            const response = await fetch("backend/api/login.php", {
                method: "POST",

                // Do not manually set Content-Type for FormData.
                // The browser adds the correct multipart boundary.
                body: formData,

                // Keep the PHP session cookie for authenticated requests.
                credentials: "same-origin",

                headers: {
                    "Accept": "application/json"
                }
            });

            // =================================================
            // READ PHP RESPONSE
            // =================================================

            const responseText = await response.text();

            let result;

            try {
                result = JSON.parse(responseText);

            } catch (parseError) {
                console.error(
                    "Login API returned invalid JSON:",
                    responseText
                );

                throw new Error(
                    "The server returned an unexpected response. " +
                    "Check the PHP login endpoint."
                );
            }

            // =================================================
            // CHECK LOGIN RESULT
            // =================================================
            // Both the HTTP status and JSON success flag matter.
            // Never redirect just because the server responded.

            if (!response.ok || result.success !== true) {

                // Use a generic authentication error where possible.
                // This avoids revealing whether an email is registered.
                showLoginError(
                    result.message ||
                    "Invalid email or password. Please try again."
                );

                return;
            }

            // =================================================
            // LOGIN SUCCESS
            // =================================================

            showLoginSuccess("Login successful! Redirecting...");

            // Let the server confirm authentication before navigating.
            // The PHP session cookie will be sent on the next request.
            const destination = getRedirectDestination();

            // Use replace so the browser Back button does not return
            // directly to the submitted login form.
            window.location.replace(destination);

        } catch (error) {

            // Network errors, invalid JSON, and unexpected server errors.
            console.error("GIFTORA login failed:", error);

            showLoginError(
                error.message ||
                "Unable to log in right now. Please try again."
            );

        } finally {

            // Restore the button only if the page has not navigated away.
            // This also lets the customer retry after a failed login.
            isSubmitting = false;

            loginBtn.disabled = false;
            loginBtn.textContent = originalButtonText;
        }
    });

    // =====================================================
    // CLEAR FIELD ERRORS WHILE TYPING
    // =====================================================

    emailInput.addEventListener("input", function () {
        emailError.textContent = "";
    });

    passwordInput.addEventListener("input", function () {
        passwordError.textContent = "";
    });

});
