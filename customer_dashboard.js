document.addEventListener("DOMContentLoaded", function () {

    loadCustomerDashboard();

});


async function loadCustomerDashboard() {

    try {

        const response = await fetch("backend/api/profile.php", {
            method: "GET",
            credentials: "same-origin"
        });

        const data = await response.json();

        if (!response.ok || !data.success) {

            window.location.href =
                "login.html?returnUrl=customer_dashboard.html";

            return;
        }

        const customer = data.customer;

        document.getElementById("customerName").textContent =
            customer.FullName;

        document.getElementById("customerID").textContent =
            customer.CustomerID;

        document.getElementById("fullName").textContent =
            customer.FullName;

        document.getElementById("email").textContent =
            customer.Email;

        document.getElementById("mobile").textContent =
            customer.MobileNo || "Not added";

        document.getElementById("nic").textContent =
            customer.NIC || "Not added";

        document.getElementById("shippingAddress").textContent =
            customer.ShippingAddress || "No shipping address added yet.";

        document.getElementById("billingAddress").textContent =
            customer.BillingAddress || "No billing address added yet.";

        if (customer.CreatedAt) {

            const date = new Date(customer.CreatedAt);

            document.getElementById("createdAt").textContent =
                date.toLocaleDateString("en-GB");

        }

    } catch (error) {

        console.error("Dashboard error:", error);

    }

}