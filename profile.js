document.addEventListener("DOMContentLoaded", () => {

    loadProfile();

    setupProfileForm();

    setupPasswordForm();

});


/*
|--------------------------------------------------------------------------
| Load Customer Profile
|--------------------------------------------------------------------------
*/

async function loadProfile() {

    try {

        const response = await fetch(
            "backend/api/profile.php",
            {
                method: "GET",
                credentials: "same-origin"
            }
        );


        if (response.status === 401) {

            window.location.href =
                "login.html?returnUrl=profile.html";

            return;
        }


        const result =
            await response.json();


        if (!result.success) {

            alert(
                result.message ||
                "Unable to load profile."
            );

            return;
        }


        const customer =
            result.customer;


        /*
        |--------------------------------------------------------------------------
        | Fill Profile
        |--------------------------------------------------------------------------
        */

        document.getElementById(
            "displayName"
        ).textContent =
            customer.FullName;


        document.getElementById(
            "displayEmail"
        ).textContent =
            customer.Email;


        document.getElementById(
            "fullName"
        ).value =
            customer.FullName || "";


        document.getElementById(
            "email"
        ).value =
            customer.Email || "";


        document.getElementById(
            "nic"
        ).value =
            customer.NIC || "";


        document.getElementById(
            "mobileNo"
        ).value =
            customer.MobileNo || "";


        document.getElementById(
            "shippingAddress"
        ).value =
            customer.ShippingAddress || "";


        document.getElementById(
            "billingAddress"
        ).value =
            customer.BillingAddress || "";


        document.getElementById(
            "customerID"
        ).textContent =
            customer.CustomerID;


        /*
        |--------------------------------------------------------------------------
        | Format Registration Date
        |--------------------------------------------------------------------------
        */

        if (customer.CreatedAt) {

            const date =
                new Date(customer.CreatedAt);

            document.getElementById(
                "createdAt"
            ).textContent =
                date.toLocaleDateString(
                    "en-GB"
                );

        }

    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

        alert(
            "Unable to connect to the server."
        );

    }

}


/*
|--------------------------------------------------------------------------
| Update Profile
|--------------------------------------------------------------------------
*/

function setupProfileForm() {

    const form =
        document.getElementById(
            "profileForm"
        );


    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const button =
                form.querySelector(
                    ".primary-btn"
                );

            const message =
                document.getElementById(
                    "profileMessage"
                );


            button.disabled = true;

            button.textContent =
                "Saving...";

            message.textContent = "";


            try {

                const formData =
                    new FormData(form);

                formData.append(
                    "action",
                    "update_profile"
                );


                const response =
                    await fetch(
                        "backend/api/profile.php",
                        {
                            method: "POST",
                            body: formData,
                            credentials: "same-origin"
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok ||
                    !result.success) {

                    message.textContent =
                        result.message ||
                        "Unable to update profile.";

                    return;
                }


                message.textContent =
                    result.message;


                /*
                | Update displayed name
                */

                document.getElementById(
                    "displayName"
                ).textContent =
                    formData.get("fullName");


            } catch (error) {

                console.error(
                    "Profile update error:",
                    error
                );

                message.textContent =
                    "Unable to connect to the server.";

            } finally {

                button.disabled = false;

                button.textContent =
                    "Save Changes";

            }

        }
    );

}


/*
|--------------------------------------------------------------------------
| Change Password
|--------------------------------------------------------------------------
*/

function setupPasswordForm() {

    const form =
        document.getElementById(
            "passwordForm"
        );


    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const message =
                document.getElementById(
                    "passwordMessage"
                );


            const button =
                form.querySelector(
                    ".primary-btn"
                );


            const newPassword =
                document.getElementById(
                    "newPassword"
                ).value;


            const confirmPassword =
                document.getElementById(
                    "confirmPassword"
                ).value;


            /*
            |--------------------------------------------------------------------------
            | Client-side Password Check
            |--------------------------------------------------------------------------
            */

            if (newPassword.length < 8) {

                message.textContent =
                    "Password must contain at least 8 characters.";

                return;
            }


            if (!/[A-Z]/.test(newPassword)) {

                message.textContent =
                    "Password must contain an uppercase letter.";

                return;
            }


            if (!/[a-z]/.test(newPassword)) {

                message.textContent =
                    "Password must contain a lowercase letter.";

                return;
            }


            if (!/[0-9]/.test(newPassword)) {

                message.textContent =
                    "Password must contain a number.";

                return;
            }


            if (
                newPassword !==
                confirmPassword
            ) {

                message.textContent =
                    "Passwords do not match.";

                return;
            }


            button.disabled = true;

            button.textContent =
                "Changing...";

            message.textContent = "";


            try {

                const formData =
                    new FormData(form);

                formData.append(
                    "action",
                    "change_password"
                );


                const response =
                    await fetch(
                        "backend/api/profile.php",
                        {
                            method: "POST",
                            body: formData,
                            credentials: "same-origin"
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok ||
                    !result.success) {

                    message.textContent =
                        result.message ||
                        "Unable to change password.";

                    return;
                }


                message.textContent =
                    result.message;


                form.reset();


            } catch (error) {

                console.error(
                    "Password change error:",
                    error
                );

                message.textContent =
                    "Unable to connect to the server.";

            } finally {

                button.disabled = false;

                button.textContent =
                    "Change Password";

            }

        }
    );

}