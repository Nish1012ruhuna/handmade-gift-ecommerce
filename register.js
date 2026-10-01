document.addEventListener("DOMContentLoaded", function () {


    // =========================================
    // GET FORM ELEMENTS
    // =========================================

    const form = document.getElementById("registerForm");

    const fullName = document.getElementById("fullName");
    const nic = document.getElementById("nic");
    const email = document.getElementById("email");
    const mobileNo = document.getElementById("mobileNo");

    const password = document.getElementById("password");
    const confirmPassword =
        document.getElementById("confirmPassword");

    const terms = document.getElementById("terms");

    const registerSubmit =
        document.getElementById("registerSubmit");


    // =========================================
    // ERROR ELEMENTS
    // =========================================

    const fullNameError =
        document.getElementById("fullNameError");

    const nicError =
        document.getElementById("nicError");

    const emailError =
        document.getElementById("emailError");

    const mobileError =
        document.getElementById("mobileError");

    const passwordError =
        document.getElementById("passwordError");

    const confirmPasswordError =
        document.getElementById("confirmPasswordError");

    const termsError =
        document.getElementById("termsError");


    // =========================================
    // SUCCESS MESSAGE
    // =========================================

    const successMessage =
        document.getElementById("successMessage");


    // =========================================
    // PASSWORD SHOW / HIDE
    // =========================================

    const togglePassword =
        document.getElementById("togglePassword");

    const toggleConfirmPassword =
        document.getElementById("toggleConfirmPassword");


    togglePassword.addEventListener("click", function () {

        if (password.type === "password") {

            password.type = "text";

            togglePassword.textContent = "Hide";

        } else {

            password.type = "password";

            togglePassword.textContent = "Show";

        }

    });


    toggleConfirmPassword.addEventListener("click", function () {

        if (confirmPassword.type === "password") {

            confirmPassword.type = "text";

            toggleConfirmPassword.textContent = "Hide";

        } else {

            confirmPassword.type = "password";

            toggleConfirmPassword.textContent = "Show";

        }

    });


    // =========================================
    // CLEAR ERRORS
    // =========================================

    function clearErrors() {

        fullNameError.textContent = "";
        nicError.textContent = "";
        emailError.textContent = "";
        mobileError.textContent = "";
        passwordError.textContent = "";
        confirmPasswordError.textContent = "";
        termsError.textContent = "";

        successMessage.style.display = "none";

    }


    // =========================================
    // FORM SUBMIT
    // =========================================

    form.addEventListener("submit", async function (event) {

        event.preventDefault();


        clearErrors();


        let isValid = true;


        // =====================================
        // FULL NAME
        // =====================================

        const fullNameValue =
            fullName.value.trim();


        if (fullNameValue === "") {

            fullNameError.textContent =
                "Please enter your full name.";

            isValid = false;

        } else if (fullNameValue.length < 3) {

            fullNameError.textContent =
                "Name must contain at least 3 characters.";

            isValid = false;

        }


        // =====================================
        // NIC
        // =====================================

        const nicValue =
            nic.value.trim();


        if (nicValue !== "") {

            const nicPattern =
                /^([0-9]{9}[VvXx]|[0-9]{12})$/;


            if (!nicPattern.test(nicValue)) {

                nicError.textContent =
                    "Please enter a valid NIC number.";

                isValid = false;

            }

        }


        // =====================================
        // EMAIL
        // =====================================

        const emailValue =
            email.value.trim();


        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (emailValue === "") {

            emailError.textContent =
                "Please enter your email address.";

            isValid = false;

        } else if (!emailPattern.test(emailValue)) {

            emailError.textContent =
                "Please enter a valid email address.";

            isValid = false;

        }


        // =====================================
        // MOBILE NUMBER
        // =====================================

        const mobileValue =
            mobileNo.value.trim();


        if (mobileValue !== "") {

            const mobilePattern =
                /^(?:\+94|0)?7[0-9]{8}$/;


            if (!mobilePattern.test(mobileValue)) {

                mobileError.textContent =
                    "Please enter a valid Sri Lankan mobile number.";

                isValid = false;

            }

        }


        // =====================================
        // PASSWORD
        // =====================================

        const passwordValue =
            password.value;


        const passwordPattern =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;


        if (passwordValue === "") {

            passwordError.textContent =
                "Please enter a password.";

            isValid = false;

        } else if (!passwordPattern.test(passwordValue)) {

            passwordError.textContent =
                "Password must contain at least 8 characters, " +
                "one uppercase letter, one lowercase letter " +
                "and one number.";

            isValid = false;

        }


        // =====================================
        // CONFIRM PASSWORD
        // =====================================

        if (confirmPassword.value === "") {

            confirmPasswordError.textContent =
                "Please confirm your password.";

            isValid = false;

        } else if (
            passwordValue !== confirmPassword.value
        ) {

            confirmPasswordError.textContent =
                "Passwords do not match.";

            isValid = false;

        }


        // =====================================
        // TERMS
        // =====================================

        if (!terms.checked) {

            termsError.textContent =
                "Please accept the Terms & Conditions.";

            isValid = false;

        }


        // =====================================
        // STOP IF FRONTEND VALIDATION FAILED
        // =====================================

        if (!isValid) {

            return;

        }


        // =====================================
        // PREPARE FORM DATA
        // =====================================

        const formData =
            new FormData(form);


        // =====================================
        // DISABLE BUTTON
        // =====================================

        registerSubmit.disabled = true;

        registerSubmit.textContent =
            "Creating Account...";


        try {


            // =================================
            // SEND TO PHP
            // =================================

            const response = await fetch(
                "backend/api/register.php",
                {
                    method: "POST",
                    body: formData
                }
            );


            // =================================
            // GET PHP RESPONSE
            // =================================

            const data =
                await response.json();


            // =================================
            // SUCCESS
            // =================================

            if (data.success) {

                successMessage.textContent =
                    data.message +
                    " Redirecting to login...";

                successMessage.className =
                    "success-message";

                successMessage.style.display =
                    "block";


                // Clear form

                form.reset();


                // Redirect after 2 seconds

                setTimeout(function () {

                    window.location.href =
                        "login.html";

                }, 2000);

            }


            // =================================
            // SERVER ERROR
            // =================================

            else {

                successMessage.textContent =
                    data.message;

                successMessage.className =
                    "server-error-message";

                successMessage.style.display =
                    "block";

            }


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            successMessage.textContent =
                "Unable to connect to the server. " +
                "Please make sure XAMPP Apache and MySQL are running.";

            successMessage.className =
                "server-error-message";

            successMessage.style.display =
                "block";

        }


        // =====================================
        // ENABLE BUTTON AGAIN
        // =====================================

        registerSubmit.disabled = false;

        registerSubmit.textContent =
            "Create Account";

    });

});