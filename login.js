document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");

    const email = document.getElementById("email");

    const password = document.getElementById("password");

    const emailError =
        document.getElementById("emailError");

    const passwordError =
        document.getElementById("passwordError");

    const loginError =
        document.getElementById("loginError");

    const successMessage =
        document.getElementById("successMessage");


    /* =========================
       SHOW / HIDE PASSWORD
    ========================= */

    const showPassword =
        document.getElementById("showPassword");

    showPassword.addEventListener("click", function () {

        if (password.type === "password") {

            password.type = "text";

            showPassword.textContent = "🙈";

        } else {

            password.type = "password";

            showPassword.textContent = "👁";

        }

    });


    /* =========================
       LOGIN FORM
    ========================= */

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();


        // Clear previous messages

        emailError.textContent = "";

        passwordError.textContent = "";

        loginError.style.display = "none";

        successMessage.style.display = "none";


        let isValid = true;


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

        if (password.value === "") {

            passwordError.textContent =
                "Please enter your password.";

            isValid = false;
        }


        /* =========================
           SUCCESS
        ========================= */

        if (isValid) {

            successMessage.textContent =
                "Login details are valid! 🎉";

            successMessage.style.display = "block";

            console.log("Login data:", {

                email: email.value.trim(),

                password: password.value

            });

        }

    });

});