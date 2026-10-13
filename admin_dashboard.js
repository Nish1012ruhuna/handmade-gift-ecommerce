const message = document.getElementById("dashboardMessage");

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function money(value) {
    return "LKR " + Number(value || 0).toLocaleString(
        "en-LK",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}

function statusClass(status) {
    return "status-" + String(status || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
}

async function loadDashboard() {
    try {
        const response = await fetch(
            "/giftora/backend/api/admin/dashboard_stats.php",
            {
                method: "GET",
                credentials: "same-origin",
                cache: "no-store"
            }
        );

        if (response.status === 401) {
            window.location.href = "/giftora/admin_login.html";
            return;
        }

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Could not load dashboard."
            );
        }

        document.getElementById("totalProducts").textContent =
            result.stats.products;

        document.getElementById("totalOrders").textContent =
            result.stats.orders;

        document.getElementById("totalCustomers").textContent =
            result.stats.customers;

        document.getElementById("lowStock").textContent =
            result.stats.lowStock;

        const body = document.getElementById("recentOrdersBody");
        const recentOrders = result.recentOrders || [];

        if (recentOrders.length === 0) {
            body.innerHTML =
                '<tr><td colspan="4">No orders found.</td></tr>';
        } else {
            body.innerHTML = recentOrders.map(order => `
                <tr>
                    <td>#${escapeHTML(order.OrderID)}</td>
                    <td>${escapeHTML(order.OrderDate)}</td>
                    <td>${money(order.TotalAmount)}</td>
                    <td>
                        <span class="status-badge ${
                            escapeHTML(statusClass(order.Status))
                        }">${escapeHTML(order.Status)}</span>
                    </td>
                </tr>
            `).join("");
        }

        message.textContent = "Dashboard data loaded successfully.";
        message.className = "message";

    } catch (error) {
        message.textContent =
            error.message || "Unable to load dashboard data.";

        message.className = "message error";
    }
}

document.getElementById("logoutButton")
    .addEventListener("click", async () => {
        const logoutButton = document.getElementById("logoutButton");

        logoutButton.disabled = true;
        message.textContent = "";

        try {
            const response = await fetch(
                "/giftora/backend/api/logout.php",
                {
                    method: "POST",
                    credentials: "same-origin",
                    cache: "no-store"
                }
            );

            if (response.status === 401) {
                window.location.href = "/giftora/admin_login.html";
                return;
            }

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Logout failed."
                );
            }

            window.location.href = "/giftora/admin_login.html";

        } catch (error) {
            message.textContent =
                error.message || "Could not log out. Please try again.";

            message.className = "message error";
            logoutButton.disabled = false;
        }
    });

loadDashboard();
