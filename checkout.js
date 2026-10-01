
document.addEventListener("DOMContentLoaded", function () {
    const cartItemsContainer = document.getElementById("cartItems");
    const emptyCart = document.getElementById("emptyCart");
    const totals = document.getElementById("totals");

    const form = document.getElementById("checkoutForm");
    const placeOrderBtn = document.getElementById("placeOrderBtn");

    const formError = document.getElementById("formError");
    const formSuccess = document.getElementById("formSuccess");

    const billingSame = document.getElementById("billingSame");
    const billingFields = document.getElementById("billingFields");

    let cart = [];

    // Load cart from localStorage
    try {
        const savedCart = JSON.parse(
            localStorage.getItem("giftoraCart")
        );

        cart = Array.isArray(savedCart) ? savedCart : [];
    } catch (error) {
        cart = [];
    }

    function money(amount) {
        return "LKR " + amount.toLocaleString("en-LK", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function showError(message) {
        formError.textContent = message;
        formError.style.display = "block";
        formSuccess.style.display = "none";
    }

    function renderCart() {
        cartItemsContainer.replaceChildren();

        if (cart.length === 0) {
            emptyCart.hidden = false;
            totals.hidden = true;

            placeOrderBtn.disabled = true;
            placeOrderBtn.textContent = "Your Cart Is Empty";
            return;
        }

        emptyCart.hidden = true;
        totals.hidden = false;

        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = "Place Order";

        let subtotal = 0;

        cart.forEach(function (item) {
            const price = Number(item.price);
            const quantity = Number(item.quantity);

            // Ignore malformed cart entries.
            if (
                !Number.isFinite(price) ||
                price < 0 ||
                !Number.isInteger(quantity) ||
                quantity < 1
            ) {
                return;
            }

            const lineTotal = price * quantity;
            subtotal += lineTotal;

            const row = document.createElement("div");
            row.className = "summary-item";

            const info = document.createElement("div");
            info.className = "item-info";

            const name = document.createElement("strong");
            name.textContent = item.name || "Gift item";

            const qty = document.createElement("small");
            qty.textContent = "Qty: " + quantity;

            const priceElement = document.createElement("span");
            priceElement.className = "item-price";
            priceElement.textContent = money(lineTotal);

            info.append(name, qty);
            row.append(info, priceElement);

            cartItemsContainer.appendChild(row);
        });

        // Demo delivery fee: LKR 350.
        // Change this to match your delivery policy.
        const shipping = subtotal > 0 ? 350 : 0;
        const total = subtotal + shipping;

        document.getElementById("subtotal").textContent =
            money(subtotal);

        document.getElementById("shipping").textContent =
            money(shipping);

        document.getElementById("total").textContent =
            money(total);

        if (subtotal <= 0) {
            placeOrderBtn.disabled = true;
        }
    }

    // Show/hide billing address fields
    function updateBillingFields() {
        billingFields.hidden = billingSame.checked;

        document.getElementById("billingAddress").required =
            !billingSame.checked;

        document.getElementById("billingCity").required =
            !billingSame.checked;
    }

    billingSame.addEventListener("change", updateBillingFields);
    updateBillingFields();

    // Handle checkout submission
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        formError.style.display = "none";
        formSuccess.style.display = "none";

        if (cart.length === 0) {
            showError("Your cart is empty. Please add a gift first.");
            return;
        }

        if (!form.reportValidity()) {
            return;
        }

        const orderDetails = {
            customer: {
                fullName: document.getElementById("fullName")
                    .value.trim(),

                phone: document.getElementById("phone")
                    .value.trim(),

                email: document.getElementById("email")
                    .value.trim()
            },

            shippingAddress: {
                address: document.getElementById("address")
                    .value.trim(),

                city: document.getElementById("city")
                    .value.trim(),

                postalCode: document.getElementById("postalCode")
                    .value.trim(),

                country: document.getElementById("country").value
            },

            billingSameAsShipping: billingSame.checked,

            billingAddress: billingSame.checked ? null : {
                address: document.getElementById("billingAddress")
                    .value.trim(),

                city: document.getElementById("billingCity")
                    .value.trim(),

                postalCode: document.getElementById("billingPostal")
                    .value.trim()
            },

            notes: document.getElementById("notes").value.trim(),

            paymentMethod: document.querySelector(
                'input[name="paymentMethod"]:checked'
            ).value,

            items: cart
        };

        /*
         * Frontend demonstration only.
         *
         * This does not save an order to MySQL, verify the
         * customer's login session, or process a payment.
         * Connect this to a PHP order API for real checkout.
         */

        console.log("Checkout details (demo only):", orderDetails);

        formSuccess.textContent =
            "Your details are valid! Checkout is ready to connect to the order API.";

        formSuccess.style.display = "block";
    });

    renderCart();
});