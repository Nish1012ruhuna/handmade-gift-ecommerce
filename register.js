document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("registerForm");

    const fullName = document.getElementById("fullName");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const terms = document.getElementById("terms");

    const fullNameError = document.getElementById("fullNameError");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const confirmPasswordError =
        document.getElementById("confirmPasswordError");

    const termsError = document.getElementById("termsError");

    const successMessage =
        document.getElementById("successMessage");


    /* =========================
       SHOW / HIDE PASSWORD
    ========================= */

    const showPassword =
        document.getElementById("showPassword");

    const showConfirmPassword =
        document.getElementById("showConfirmPassword");


    showPassword.addEventListener("click", function () {

        if (password.type === "password") {

            password.type = "text";
            showPassword.textContent = "🙈";

        } else {

            password.type = "password";
            showPassword.textContent = "👁";

        }

    });


    showConfirmPassword.addEventListener("click", function () {

        if (confirmPassword.type === "password") {

            confirmPassword.type = "text";
            showConfirmPassword.textContent = "🙈";

        } else {

            confirmPassword.type = "password";
            showConfirmPassword.textContent = "👁";

        }

    });


    /* =========================
       FORM SUBMIT
    ========================= */

    form.addEventListener("submit", function (event) {

        event.preventDefault();


        // Clear previous errors

        fullNameError.textContent = "";
        emailError.textContent = "";
        passwordError.textContent = "";
        confirmPasswordError.textContent = "";
        termsError.textContent = "";

        successMessage.style.display = "none";


        let isValid = true;


        /* =========================
           FULL NAME VALIDATION
        ========================= */

        if (fullName.value.trim() === "") {

            fullNameError.textContent =
                "Please enter your full name.";

            isValid = false;

        } else if (fullName.value.trim().length < 3) {

            fullNameError.textContent =
                "Name must contain at least 3 characters.";

            isValid = false;
        }


        /* =========================
           EMAIL VALIDATION
        ========================= */

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (email.value.trim() === "") {

            emailError.textContent =
                "Please enter your email address.";

            isValid = false;

        } else if (!emailPattern.test(email.value.trim())) {

            emailError.textContent =
                "Please enter a valid email address.";

            isValid = false;
        }


        /* =========================
           PASSWORD VALIDATION
        ========================= */

        const passwordPattern =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;


        if (password.value === "") {

            passwordError.textContent =
                "Please enter a password.";

            isValid = false;

        } else if (!passwordPattern.test(password.value)) {

            passwordError.textContent =
                "Password must contain at least 8 characters, " +
                "one uppercase letter, one lowercase letter and one number.";

            isValid = false;
        }


        /* =========================
           CONFIRM PASSWORD
        ========================= */

        if (confirmPassword.value === "") {

            confirmPasswordError.textContent =
                "Please confirm your password.";

            isValid = false;

        } else if (password.value !== confirmPassword.value) {

            confirmPasswordError.textContent =
                "Passwords do not match.";

            isValid = false;
        }


        /* =========================
           TERMS
        ========================= */

        if (!terms.checked) {

            termsError.textContent =
                "Please accept the Terms & Conditions.";

            isValid = false;
        }


        /* =========================
           SUCCESS
        ========================= */

        if (isValid) {

            successMessage.style.display = "block";

            successMessage.textContent =
                "Registration details are valid! 🎉";

            console.log("Registration data:", {

                fullName: fullName.value.trim(),

                email: email.value.trim(),

                password: password.value

            });

        }

    });

});