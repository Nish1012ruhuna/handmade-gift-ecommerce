
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
    const codDetails = document.getElementById("codDetails");
    const bankTransferDetails = document.getElementById("bankTransferDetails");
    const payhereDetails = document.getElementById("payhereDetails");
    const bankTransferAmount = document.getElementById("bankTransferAmount");
    const bankReference = document.getElementById("bankReference");

    let isSubmitting = false;
    let cart = [];

    // =====================================================
    // LOAD CART
    // =====================================================

    try {
        const savedCart = JSON.parse(localStorage.getItem("giftoraCart"));
        cart = Array.isArray(savedCart) ? savedCart : [];
    } catch (error) {
        console.error("Unable to load cart:", error);
        cart = [];
    }

    // =====================================================
    // HELPERS
    // =====================================================

    function money(amount) {
        return "LKR " + Number(amount).toLocaleString("en-LK", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function showError(message) {
        formError.textContent = message;
        formError.style.display = "block";
        formSuccess.style.display = "none";
    }

    function showSuccess(message) {
        formSuccess.textContent = message;
        formSuccess.style.display = "block";
        formError.style.display = "none";
    }

    function calculateTotals() {
        let subtotal = 0;

        cart.forEach(function (item) {
            const price = Number(item.price);
            const quantity = Number(item.quantity);

            if (
                Number.isFinite(price) &&
                price >= 0 &&
                Number.isInteger(quantity) &&
                quantity >= 1
            ) {
                subtotal += price * quantity;
            }
        });

        const shipping = subtotal > 0 ? 350 : 0;

        return {
            subtotal: subtotal,
            shipping: shipping,
            total: subtotal + shipping
        };
    }

    // =====================================================
    // RENDER CART
    // =====================================================

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
            name.textContent = item.name || item.title || "Gift item";

            const qty = document.createElement("small");
            qty.textContent = "Qty: " + quantity;

            const priceElement = document.createElement("span");
            priceElement.className = "item-price";
            priceElement.textContent = money(lineTotal);

            info.append(name, qty);
            row.append(info, priceElement);
            cartItemsContainer.appendChild(row);
        });

        const shipping = subtotal > 0 ? 350 : 0;

        document.getElementById("subtotal").textContent = money(subtotal);
        document.getElementById("shipping").textContent = money(shipping);
        document.getElementById("total").textContent = money(subtotal + shipping);

        updateBankTransferAmount();

        if (subtotal <= 0) {
            placeOrderBtn.disabled = true;
        }
    }

    // =====================================================
    // BILLING ADDRESS
    // =====================================================

    function updateBillingFields() {
        billingFields.hidden = billingSame.checked;

        document.getElementById("billingAddress").required =
            !billingSame.checked;

        document.getElementById("billingCity").required =
            !billingSame.checked;
    }

    billingSame.addEventListener("change", updateBillingFields);
    updateBillingFields();

    // =====================================================
    // CUSTOMER DETAILS
    // =====================================================

    function getCustomerDetails() {
        return {
            fullName: document.getElementById("fullName").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            email: document.getElementById("email").value.trim(),
            address: document.getElementById("address").value.trim(),
            city: document.getElementById("city").value.trim(),
            postalCode: document.getElementById("postalCode").value.trim(),
            country: document.getElementById("country").value,
            notes: document.getElementById("notes").value.trim()
        };
    }

    // =====================================================
    // PAYMENT UI
    // =====================================================

    function updatePaymentUI() {
        const selectedPayment = document.querySelector(
            'input[name="paymentMethod"]:checked'
        );

        if (!selectedPayment) return;

        const method = selectedPayment.value;

        codDetails.hidden = true;
        bankTransferDetails.hidden = true;
        payhereDetails.hidden = true;

        bankReference.required = false;

        if (method === "Cash on Delivery") {
            codDetails.hidden = false;
        } else if (method === "Bank Transfer") {
            bankTransferDetails.hidden = false;
            bankReference.required = true;
            updateBankTransferAmount();
        } else if (method === "PayHere") {
            payhereDetails.hidden = false;
        }
    }

    function updateBankTransferAmount() {
        if (bankTransferAmount) {
            bankTransferAmount.textContent = money(calculateTotals().total);
        }
    }

    document.querySelectorAll('input[name="paymentMethod"]').forEach(
        function (radio) {
            radio.addEventListener("change", updatePaymentUI);
        }
    );

    updatePaymentUI();

    // =====================================================
    // LOCAL ORDER DETAILS FOR CONFIRMATION PAGE
    // =====================================================

    function createOrderObject(paymentMethod) {
        const customer = getCustomerDetails();
        const currentTotals = calculateTotals();

        return {
            orderId: null,
            orderDate: new Date().toISOString(),
            customer: {
                fullName: customer.fullName,
                phone: customer.phone,
                email: customer.email
            },
            shippingAddress: {
                address: customer.address,
                city: customer.city,
                postalCode: customer.postalCode,
                country: customer.country
            },
            billingSameAsShipping: billingSame.checked,
            billingAddress: billingSame.checked ? null : {
                address: document.getElementById("billingAddress").value.trim(),
                city: document.getElementById("billingCity").value.trim(),
                postalCode: document.getElementById("billingPostal").value.trim()
            },
            notes: customer.notes,
            paymentMethod: paymentMethod,
            bankReference: paymentMethod === "Bank Transfer"
                ? bankReference.value.trim()
                : null,
            items: cart,
            subtotal: currentTotals.subtotal,
            shipping: currentTotals.shipping,
            total: currentTotals.total
        };
    }

    function saveOrder(order) {
        localStorage.setItem("giftoraLastOrder", JSON.stringify(order));
    }

    // =====================================================
    // PAYHERE — KEEP EXISTING INTEGRATION
    // =====================================================

    async function startPayHerePayment() {
        const customer = getCustomerDetails();
        const currentTotals = calculateTotals();

        if (currentTotals.total <= 0) {
            throw new Error("Your order total must be greater than zero.");
        }

        const paymentData = {
            fullName: customer.fullName,
            phone: customer.phone,
            email: customer.email,
            address: customer.address,
            city: customer.city,
            country: customer.country,
            items: cart.map(function (item) {
                return {
                    productId: Number(item.productId ?? item.ProductID),
                    quantity: Number(item.quantity)
                };
            })
        };

        const response = await fetch(
            "backend/api/payhere/create_payment.php",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify(paymentData)
            }
        );

        const responseText = await response.text();
        let result;

        try {
            result = JSON.parse(responseText);
        } catch (error) {
            console.error("Invalid PayHere response:", responseText);
            throw new Error("The server returned an invalid PayHere response.");
        }

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to create PayHere payment.");
        }

        const requiredFields = [
            "payment_url", "merchant_id", "return_url", "cancel_url",
            "notify_url", "first_name", "last_name", "email", "phone",
            "address", "city", "country", "order_id", "items",
            "currency", "amount", "hash"
        ];

        const missingFields = requiredFields.filter(function (key) {
            return result[key] === undefined ||
                result[key] === null ||
                String(result[key]).trim() === "";
        });

        if (missingFields.length) {
            throw new Error(
                "Missing PayHere fields: " + missingFields.join(", ")
            );
        }

        const payhereForm = document.createElement("form");
        payhereForm.method = "POST";
        payhereForm.action = result.payment_url;

        const fields = {
            merchant_id: result.merchant_id,
            return_url: result.return_url,
            cancel_url: result.cancel_url,
            notify_url: result.notify_url,
            first_name: result.first_name,
            last_name: result.last_name,
            email: result.email,
            phone: result.phone,
            address: result.address,
            city: result.city,
            country: result.country,
            order_id: result.order_id,
            items: result.items,
            currency: result.currency,
            amount: result.amount,
            hash: result.hash
        };

        Object.entries(fields).forEach(function ([key, value]) {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = String(value);
            payhereForm.appendChild(input);
        });

        document.body.appendChild(payhereForm);
        payhereForm.submit();
    }

    // =====================================================
    // SAVE COD / BANK TRANSFER ORDER TO DATABASE
    // =====================================================

    async function createDatabaseOrder(paymentMethod) {
        const customer = getCustomerDetails();

        const order = createOrderObject(paymentMethod);

        const deliveryAddress = [
            customer.address,
            customer.city,
            customer.postalCode,
            customer.country
        ].filter(Boolean).join(", ");

        const orderData = {
            deliveryAddress: deliveryAddress,
            paymentMethod: paymentMethod,
            bankReference: paymentMethod === "Bank Transfer"
                ? bankReference.value.trim()
                : "",
            items: cart.map(function (item) {
                return {
                    productId: Number(item.productId ?? item.ProductID),
                    quantity: Number(item.quantity)
                };
            })
        };

        if (!orderData.items.length ||
            orderData.items.some(function (item) {
                return !Number.isInteger(item.productId) ||
                    item.productId <= 0 ||
                    !Number.isInteger(item.quantity) ||
                    item.quantity < 1;
            })) {
            throw new Error(
                "Some cart items are missing valid product IDs or quantities. Please remove them and add the products again."
            );
        }

        const response = await fetch("backend/api/create_order.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify(orderData)
        });

        const responseText = await response.text();
        let result;

        try {
            result = JSON.parse(responseText);
        } catch (error) {
            console.error("Invalid order API response:", responseText);
            throw new Error(
                "The server returned an invalid response while saving your order."
            );
        }

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to save your order.");
        }

        // The database-generated ID is the real order ID.
        order.orderId = result.orderId;
        order.databaseOrderId = result.orderId;
        order.status = "Pending";
        order.paymentStatus = paymentMethod === "Cash on Delivery"
            ? "Payment Pending"
            : "Bank Transfer Pending";

        saveOrder(order);
        localStorage.removeItem("giftoraCart");

        window.location.href = "order_confirmation.html";
    }

    // =====================================================
    // FORM SUBMISSION
    // =====================================================

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        formError.style.display = "none";
        formSuccess.style.display = "none";

        if (isSubmitting) return;

        if (cart.length === 0) {
            showError("Your cart is empty. Please add a gift first.");
            return;
        }

        if (!form.reportValidity()) return;

        const selectedPayment = document.querySelector(
            'input[name="paymentMethod"]:checked'
        );

        if (!selectedPayment) {
            showError("Please select a payment method.");
            return;
        }

        const paymentMethod = selectedPayment.value;

        if (paymentMethod === "Bank Transfer" &&
            !bankReference.value.trim()) {
            showError("Please enter your bank transfer reference number.");
            bankReference.focus();
            return;
        }

        isSubmitting = true;
        placeOrderBtn.disabled = true;
        placeOrderBtn.textContent = "Processing Order...";

        try {
            if (paymentMethod === "PayHere") {
                await startPayHerePayment();
                return;
            }

            if (
                paymentMethod === "Cash on Delivery" ||
                paymentMethod === "Bank Transfer"
            ) {
                await createDatabaseOrder(paymentMethod);
                return;
            }

            throw new Error("Please select a valid payment method.");

        } catch (error) {
            console.error("Checkout error:", error);
            showError(error.message || "Unable to process your order. Please try again.");

            placeOrderBtn.disabled = false;
            placeOrderBtn.textContent = "Place Order";
            isSubmitting = false;
        }
    });

    // =====================================================
    // INITIALISE PAGE
    // =====================================================

    renderCart();
    updatePaymentUI();
});
