document.addEventListener("DOMContentLoaded", () => {

    checkLoginStatus();

});


/*
|--------------------------------------------------------------------------
| Check Login Status
|--------------------------------------------------------------------------
*/

async function checkLoginStatus() {

    try {

        const response = await fetch(
            "backend/api/check_session.php",
            {
                method: "GET",
                credentials: "same-origin"
            }
        );

        const result = await response.json();

        if (
            result.success &&
            result.loggedIn
        ) {

            showLoggedInNavigation(result.data.customer);

        } else {

            showLoggedOutNavigation();

        }

    } catch (error) {

        console.error(
            "Session check failed:",
            error
        );

        showLoggedOutNavigation();
    }
}


/*
|--------------------------------------------------------------------------
| Logged-In Navigation
|--------------------------------------------------------------------------
*/

function showLoggedInNavigation(customer) {

    const accountLink =
        document.querySelector(".account-btn");

    const registerLink =
        document.querySelector(
            'a[href="register.html"]'
        );


    /*
    | Account button
    */

    if (accountLink) {

        accountLink.href = "profile.html";

        accountLink.title =
            "My Account";

        accountLink.setAttribute(
            "aria-label",
            "My Account"
        );

    }


    /*
    | Register link becomes hidden
    */

    if (registerLink) {

        registerLink.style.display = "none";

    }


    /*
    | Create Logout button
    */

    let logoutButton =
        document.getElementById("logoutBtn");


    if (!logoutButton) {

        logoutButton =
            document.createElement("button");

        logoutButton.id = "logoutBtn";

        logoutButton.type = "button";

        logoutButton.textContent = "Logout";

        logoutButton.className = "logout-btn";


        /*
        | Put logout button after account button
        */

        if (accountLink) {

            accountLink.parentNode.insertBefore(
                logoutButton,
                accountLink.nextSibling
            );

        }

    }


    logoutButton.onclick = logoutCustomer;

}


/*
|--------------------------------------------------------------------------
| Logged-Out Navigation
|--------------------------------------------------------------------------
*/

function showLoggedOutNavigation() {

    const accountLink =
        document.querySelector(".account-btn");

    const registerLink =
        document.querySelector(
            'a[href="register.html"]'
        );

    const logoutButton =
        document.getElementById("logoutBtn");


    if (accountLink) {

        accountLink.href = "login.html";

        accountLink.title =
            "Login";

        accountLink.setAttribute(
            "aria-label",
            "Login"
        );

    }


    if (registerLink) {

        registerLink.style.display = "";

    }


    if (logoutButton) {

        logoutButton.remove();

    }

}


/*
|--------------------------------------------------------------------------
| Logout Customer
|--------------------------------------------------------------------------
*/

async function logoutCustomer() {

    try {

        const response = await fetch(
            "backend/api/logout.php",
            {
                method: "POST",
                credentials: "same-origin"
            }
        );


        const result = await response.json();


        if (result.success) {

            window.location.href =
                "home.html";

        } else {

            alert(
                result.message ||
                "Logout failed."
            );

        }

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

        alert(
            "Unable to logout. Please try again."
        );

    }

}