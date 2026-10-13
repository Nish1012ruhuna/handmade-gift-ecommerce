
document.addEventListener("DOMContentLoaded", function () {
    loadCustomerDashboard();
    loadCustomerOrders();
});


// =====================================================
// LOAD CUSTOMER PROFILE
// =====================================================

async function loadCustomerDashboard() {
    try {
        const response = await fetch("backend/api/profile.php", {
            method: "GET",
            credentials: "same-origin",
            cache: "no-store"
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            window.location.href =
                "login.html?returnUrl=customer_dashboard.html";
            return;
        }

        const customer = data.customer;

        setText("customerName", customer.FullName || "Customer");
        setText("customerID", customer.CustomerID ?? "");
        setText("fullName", customer.FullName || "Not available");
        setText("email", customer.Email || "Not available");
        setText("mobile", customer.MobileNo || "Not added");
        setText("nic", customer.NIC || "Not added");

        setText(
            "shippingAddress",
            customer.ShippingAddress || "No shipping address added yet."
        );

        setText(
            "billingAddress",
            customer.BillingAddress || "No billing address added yet."
        );

        if (customer.CreatedAt) {
            const date = new Date(customer.CreatedAt);

            setText(
                "createdAt",
                Number.isNaN(date.getTime())
                    ? customer.CreatedAt
                    : date.toLocaleDateString("en-GB")
            );
        }

    } catch (error) {
        console.error("Dashboard profile error:", error);
    }
}


// =====================================================
// LOAD CUSTOMER ORDERS
// =====================================================

async function loadCustomerOrders() {
    const container = document.getElementById("ordersContainer");

    if (!container) {
        console.warn(
            "Add id=\"ordersContainer\" to the My Orders section in customer_dashboard.html."
        );
        return;
    }

    container.textContent = "Loading your orders...";

    try {
        const response = await fetch("backend/api/orders.php", {
            method: "GET",
            credentials: "same-origin",
            cache: "no-store"
        });

        const data = await response.json();

        if (response.status === 401 || response.status === 403) {
            window.location.href =
                "login.html?returnUrl=customer_dashboard.html";
            return;
        }

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to load your orders.");
        }

        const orders = Array.isArray(data.orders) ? data.orders : [];

        container.replaceChildren();

        if (orders.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.textContent = "You haven't placed any orders yet.";
            container.appendChild(emptyMessage);
            return;
        }

        orders.forEach(function (order) {
            const card = document.createElement("div");
            card.className = "customer-order-card";

            const heading = document.createElement("h3");
            heading.textContent = "Order #" + order.OrderID;

            const date = document.createElement("p");
            date.textContent =
                "Date: " + formatOrderDate(order.OrderDate);

            const total = document.createElement("p");
            total.textContent =
                "Total: " + formatMoney(order.TotalAmount);

            const status = document.createElement("p");
            status.textContent =
                "Status: " + (order.Status || "Pending");

            const address = document.createElement("p");
            address.textContent =
                "Delivery address: " +
                (order.DeliveryAddress || "Not available");

            card.append(heading, date, total, status, address);
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Customer orders error:", error);

        container.replaceChildren();

        const errorMessage = document.createElement("p");
        errorMessage.textContent =
            "We couldn't load your orders. Please refresh the page and try again.";

        container.appendChild(errorMessage);
    }
}


// =====================================================
// HELPER FUNCTIONS
// =====================================================

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

function formatOrderDate(value) {
    if (!value) return "Not available";

    const date = new Date(String(value).replace(" ", "T"));

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-GB");
}

function formatMoney(value) {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return "LKR 0.00";
    }

    return "LKR " + amount.toLocaleString("en-LK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
