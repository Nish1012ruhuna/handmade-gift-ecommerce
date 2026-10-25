document.addEventListener("DOMContentLoaded", function () {
    loadCustomerDashboard();
    loadCustomerOrders();
    loadCustomerInquiries();
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
            'Add id="ordersContainer" to the My Orders section in customer_dashboard.html.'
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


// =====================================================
// LOAD CUSTOMER INQUIRIES AND ADMIN REPLIES
// =====================================================

async function loadCustomerInquiries() {
    const container = document.getElementById(
        "customerInquiriesContainer"
    );

    if (!container) return;

    container.textContent = "Loading your inquiries...";

    try {
        const response = await fetch(
            "backend/api/my_order_inquiries.php",
            {
                method: "GET",
                credentials: "same-origin",
                cache: "no-store",
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        if (response.status === 401 || response.status === 403) {
            window.location.href =
                "login.html?returnUrl=customer_dashboard.html";
            return;
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Unable to load your inquiries."
            );
        }

        const inquiries = Array.isArray(data.inquiries)
            ? data.inquiries
            : [];

        container.replaceChildren();

        if (inquiries.length === 0) {
            const empty = document.createElement("p");
            empty.textContent =
                "You haven't submitted any inquiries yet.";

            container.appendChild(empty);
            return;
        }

        inquiries.forEach(function (inquiry) {
            const card = document.createElement("article");

            card.style.background = "#ffffff";
            card.style.border = "1px solid #e5e9e5";
            card.style.borderRadius = "12px";
            card.style.padding = "20px";
            card.style.marginBottom = "16px";

            const heading = document.createElement("h3");
            heading.textContent =
                "Inquiry #" + inquiry.InquiryID +
                " — Order #" + inquiry.OrderID;

            const subject = document.createElement("p");
            const subjectLabel = document.createElement("strong");

            subjectLabel.textContent = "Subject: ";

            subject.append(
                subjectLabel,
                document.createTextNode(inquiry.Subject || "General")
            );

            const originalLabel = document.createElement("h4");
            originalLabel.textContent = "Your message";

            const originalMessage = document.createElement("p");
            originalMessage.style.whiteSpace = "pre-wrap";
            originalMessage.textContent = inquiry.Message || "";

            const status = document.createElement("p");
            const statusLabel = document.createElement("strong");

            statusLabel.textContent = "Status: ";

            status.append(
                statusLabel,
                document.createTextNode(inquiry.InquiryStatus || "Open")
            );

            const date = document.createElement("p");
            date.style.fontSize = "13px";
            date.style.color = "#64748b";
            date.textContent =
                "Submitted: " + formatInquiryDate(inquiry.CreatedAt);

            const replyHeading = document.createElement("h4");
            replyHeading.textContent = "GIFTORA's reply";

            const replyBox = document.createElement("div");
            replyBox.style.padding = "14px";
            replyBox.style.borderRadius = "8px";
            replyBox.style.background = "#eef6f1";
            replyBox.style.whiteSpace = "pre-wrap";
            replyBox.style.overflowWrap = "anywhere";

            card.append(
                heading,
                subject,
                originalLabel,
                originalMessage,
                status,
                date,
                replyHeading,
                replyBox
            );

            if (inquiry.AdminReply) {
                replyBox.textContent = inquiry.AdminReply;

                const replyDate = document.createElement("p");
                replyDate.style.fontSize = "12px";
                replyDate.style.color = "#64748b";
                replyDate.textContent =
                    "Replied: " + formatInquiryDate(inquiry.RepliedAt);

                card.appendChild(replyDate);
            } else {
                replyBox.textContent =
                    "Our team hasn't replied yet. Please check again later.";
            }

            container.appendChild(card);
        });
    } catch (error) {
        console.error("Customer inquiries error:", error);

        container.replaceChildren();

        const errorMessage = document.createElement("p");
        errorMessage.textContent =
            "We couldn't load your inquiries. Please refresh the page and try again.";

        container.appendChild(errorMessage);
    }
}


// =====================================================
// FORMAT INQUIRY DATE
// =====================================================

function formatInquiryDate(value) {
    if (!value) return "Not available";

    const date = new Date(String(value).replace(" ", "T"));

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}