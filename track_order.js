
document.addEventListener("DOMContentLoaded", async () => {
    const message = document.getElementById("trackMessage");
    const area = document.getElementById("orderArea");
    const select = document.getElementById("orderSelect");
    const details = document.getElementById("orderDetails");

    // Format prices in Sri Lankan Rupees.
    const money = value =>
        "LKR " + Number(value || 0).toLocaleString("en-LK", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    // Escape values before displaying them in HTML.
    const esc = value =>
        String(value ?? "").replace(/[&<>"']/g, ch => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[ch]));

    // Format order dates safely.
    const formatDate = (value, includeTime = false) => {
        if (!value) return "Not available";

        const date = new Date(String(value).replace(" ", "T"));

        if (Number.isNaN(date.getTime())) {
            return "Not available";
        }

        return includeTime
            ? date.toLocaleString()
            : date.toLocaleDateString();
    };

    try {
        // STEP 1: Check whether the customer is logged in.
        const sessionResponse = await fetch(
            "backend/api/check_session.php",
            {
                credentials: "same-origin",
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        const session = await sessionResponse.json();

        if (!sessionResponse.ok || !session.success) {
            throw new Error(
                session.message || "Could not check your session."
            );
        }

        if (!session.loggedIn) {
            message.innerHTML =
                'Please <a href="login.html?next=track_order.html">' +
                'sign in</a> to view your orders.';

            return;
        }

        // STEP 2: Load orders belonging to this customer.
        message.textContent = "Loading your orders…";

        const response = await fetch(
            "backend/api/orders.php",
            {
                credentials: "same-origin",
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        const data = await response.json();

        if (response.status === 401) {
            message.innerHTML =
                'Your session has expired. Please ' +
                '<a href="login.html?next=track_order.html">' +
                'sign in again</a>.';

            return;
        }

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Unable to load orders."
            );
        }

        if (!Array.isArray(data.orders) || data.orders.length === 0) {
            message.textContent =
                "No orders were found for this account yet.";

            return;
        }

        // STEP 3: Add orders to the selection list.
        message.textContent =
            "Your orders are ready. Choose an order to see its latest recorded status.";

        area.hidden = false;

        data.orders.forEach(order => {
            const option = document.createElement("option");

            option.value = order.OrderID;

            option.textContent =
                `Order #${order.OrderID} — ` +
                `${formatDate(order.OrderDate)} — ` +
                `${money(order.TotalAmount)}`;

            option.dataset.order = JSON.stringify(order);

            select.appendChild(option);
        });

        // STEP 4: Display the selected order and enquiry button.
        const render = () => {
            const option = select.options[select.selectedIndex];

            if (!option || !option.dataset.order) {
                details.innerHTML = "";
                return;
            }

            const order = JSON.parse(option.dataset.order);

            const orderID = Number(order.OrderID);

            if (!Number.isSafeInteger(orderID) || orderID <= 0) {
                details.textContent = "Invalid order information.";
                return;
            }

            // Pass the selected order ID to the enquiry page.
            const inquiryURL =
                "order_inquiry.html?order_id=" +
                encodeURIComponent(orderID);

            details.innerHTML = `
                <div class="panel">
                    <h2>Order #${esc(order.OrderID)}</h2>

                    <p>
                        <span class="status">
                            ${esc(order.Status || "Pending")}
                        </span>
                    </p>

                    <p>
                        <strong>Order date:</strong>
                        ${esc(formatDate(order.OrderDate, true))}
                    </p>

                    <p>
                        <strong>Total:</strong>
                        ${money(order.TotalAmount)}
                    </p>

                    <p>
                        <strong>Delivery address:</strong><br>
                        ${esc(order.DeliveryAddress)
                            .replace(/\n/g, "<br>")}
                    </p>

                    <p class="muted">
                        This is the latest status recorded by the store.
                        If you have a question about this order, send
                        an enquiry to our customer support team.
                    </p>

                    <a
                        href="${inquiryURL}"
                        class="btn"
                    >
                        💬 Ask About This Order
                    </a>
                </div>
            `;
        };

        // Update the details when a different order is selected.
        select.addEventListener("change", render);

        // Select the first order automatically.
        select.selectedIndex = 1;
        render();

    } catch (error) {
        console.error("Track order error:", error);

        message.textContent =
            "We couldn't load order information right now. " +
            "Please make sure XAMPP Apache and MySQL are running, " +
            "then try again.";

        message.className = "error";
    }
});
