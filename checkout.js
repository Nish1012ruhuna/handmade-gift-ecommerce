document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // ELEMENTS
    // =====================================================

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

    // Prevent duplicate submissions
    let isSubmitting = false;

    // =====================================================
    // CART
    // =====================================================

    let cart = [];

    try {
        const savedCart = JSON.parse(
            localStorage.getItem("giftoraCart")
        );

        cart = Array.isArray(savedCart) ? savedCart : [];

    } catch (error) {
        console.error("Unable to load cart:", error);
        cart = [];
    }

    // =====================================================
    // MONEY FORMAT
    // =====================================================

    function money(amount) {
        return "LKR " + Number(amount).toLocaleString("en-LK", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // =====================================================
    // ERROR MESSAGE
    // =====================================================

    function showError(message) {
        formError.textContent = message;
        formError.style.display = "block";
        formSuccess.style.display = "none";
    }

    // =====================================================
    // SUCCESS MESSAGE
    // =====================================================

    function showSuccess(message) {
        formSuccess.textContent = message;
        formSuccess.style.display = "block";
        formError.style.display = "none";
    }

    // =====================================================
    // CALCULATE TOTALS
    // =====================================================

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
        const total = subtotal + shipping;

        return {
            subtotal: subtotal,
            shipping: shipping,
            total: total
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

        const shipping = subtotal > 0 ? 350 : 0;
        const total = subtotal + shipping;

        document.getElementById("subtotal").textContent = money(subtotal);
        document.getElementById("shipping").textContent = money(shipping);
        document.getElementById("total").textContent = money(total);

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
    // GET CUSTOMER DETAILS
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

        if (!selectedPayment) {
            return;
        }

        const paymentMethod = selectedPayment.value;

        codDetails.hidden = true;
        bankTransferDetails.hidden = true;
        payhereDetails.hidden = true;

        bankReference.required = false;

        if (paymentMethod === "Cash on Delivery") {
            codDetails.hidden = false;

        } else if (paymentMethod === "Bank Transfer") {
            bankTransferDetails.hidden = false;
            bankReference.required = true;
            updateBankTransferAmount();

        } else if (paymentMethod === "PayHere") {
            payhereDetails.hidden = false;
        }
    }

    // =====================================================
    // BANK TRANSFER AMOUNT
    // =====================================================

    function updateBankTransferAmount() {
        if (!bankTransferAmount) {
            return;
        }

        const currentTotals = calculateTotals();
        bankTransferAmount.textContent = money(currentTotals.total);
    }

    // =====================================================
    // PAYMENT RADIO EVENTS
    // =====================================================

    document.querySelectorAll('input[name="paymentMethod"]')
        .forEach(function (radio) {
            radio.addEventListener("change", updatePaymentUI);
        });

    updatePaymentUI();

    // =====================================================
    // GENERATE ORDER ID
    // =====================================================

    function generateOrderId() {
        const now = new Date();
        const date = now.getTime();

        const random = Math.floor(
            1000 + Math.random() * 9000
        );

        return "GFT-" + date + "-" + random;
    }

    // =====================================================
    // SAVE ORDER LOCALLY
    // =====================================================

    function saveOrder(order) {
        localStorage.setItem(
            "giftoraLastOrder",
            JSON.stringify(order)
        );
    }

    // =====================================================
    // CREATE ORDER OBJECT
    // =====================================================

    function createOrderObject(paymentMethod) {
        const customer = getCustomerDetails();
        const currentTotals = calculateTotals();

        return {
            orderId: generateOrderId(),
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

    // =====================================================
    // PAYHERE PAYMENT
    // =====================================================

    async function startPayHerePayment() {
        const customer = getCustomerDetails();
        const currentTotals = calculateTotals();

        if (currentTotals.total <= 0) {
            showError("Your order total must be greater than zero.");
            return;
        }

        const paymentData = {
    fullName: customer.fullName,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    city: customer.city,
    country: customer.country,

    // Send product IDs and quantities.
    // PHP will calculate the actual prices from the database.
    items: cart.map(function (item) {
        return {
            productId: Number(item.productId),
            quantity: Number(item.quantity)
        };
    })
};
        try {
            placeOrderBtn.disabled = true;
            placeOrderBtn.textContent = "Connecting to PayHere...";

            const response = await fetch(
                "backend/api/payhere/create_payment.php",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(paymentData)
                }
            );

            // Read the response as text first so that PHP errors
            // or invalid JSON can be reported clearly.
            const responseText = await response.text();

            let result;

            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error("Invalid PHP response:", responseText);

                throw new Error(
                    "The server returned an invalid response. Check create_payment.php and the PHP error log."
                );
            }

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Server returned HTTP " + response.status
                );
            }

            console.log("PayHere response:", result);

            if (!result.success) {
                throw new Error(
                    result.message ||
                    "Unable to create PayHere payment."
                );
            }

            // Check essential values before redirecting.
            const requiredFields = [
                "payment_url",
                "merchant_id",
                "return_url",
                "cancel_url",
                "notify_url",
                "first_name",
                "last_name",
                "email",
                "phone",
                "address",
                "city",
                "country",
                "order_id",
                "items",
                "currency",
                "amount",
                "hash"
            ];

            const missingFields = requiredFields.filter(function (key) {
                return (
                    result[key] === undefined ||
                    result[key] === null ||
                    String(result[key]).trim() === ""
                );
            });

            if (missingFields.length > 0) {
                console.error("Missing PayHere fields:", missingFields);

                throw new Error(
                    "The PHP response is missing required PayHere fields: " +
                    missingFields.join(", ")
                );
            }

            // Create the form required by PayHere.
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

            Object.keys(fields).forEach(function (key) {
                const input = document.createElement("input");

                input.type = "hidden";
                input.name = key;
                input.value = String(fields[key]);

                payhereForm.appendChild(input);
            });

            document.body.appendChild(payhereForm);

            console.log("Redirecting to PayHere...");

            // Submit the form to the PayHere payment page.
            payhereForm.submit();

        } catch (error) {
            console.error("PayHere Error:", error);

            showError(
                error.message ||
                "Unable to connect to PayHere. Please try again."
            );

            placeOrderBtn.disabled = false;
            placeOrderBtn.textContent = "Place Order";
        }
    }

    // =====================================================
    // FORM SUBMIT
    // =====================================================

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        formError.style.display = "none";
        formSuccess.style.display = "none";

        if (isSubmitting) {
            return;
        }

        // Check cart.
        if (cart.length === 0) {
            showError("Your cart is empty. Please add a gift first.");
            return;
        }

        // Check form fields.
        if (!form.reportValidity()) {
            return;
        }

        const selectedPayment = document.querySelector(
            'input[name="paymentMethod"]:checked'
        );

        if (!selectedPayment) {
            showError("Please select a payment method.");
            return;
        }

        const paymentMethod = selectedPayment.value;

        // PayHere payment.
        if (paymentMethod === "PayHere") {
            isSubmitting = true;

            await startPayHerePayment();

            // If the browser stays on checkout because an error
            // occurred, allow the customer to try again.
            isSubmitting = false;

            return;
        }

        // Bank transfer validation.
        if (paymentMethod === "Bank Transfer") {
            if (!bankReference.value.trim()) {
                showError(
                    "Please enter your bank transfer reference number."
                );

                bankReference.focus();
                return;
            }
        }

        isSubmitting = true;
        placeOrderBtn.disabled = true;

        try {
            const order = createOrderObject(paymentMethod);

            // Cash on Delivery.
            if (paymentMethod === "Cash on Delivery") {
                order.status = "Order Received";
                order.paymentStatus = "Payment Pending";

                saveOrder(order);

                localStorage.removeItem("giftoraCart");

                window.location.href = "order_confirmation.html";
                return;
            }

            // Bank Transfer.
            if (paymentMethod === "Bank Transfer") {
                order.status = "Pending Payment Verification";
                order.paymentStatus = "Bank Transfer Pending";

                saveOrder(order);

                localStorage.removeItem("giftoraCart");

                window.location.href = "order_confirmation.html";
                return;
            }

            showError("Please select a valid payment method.");

        } catch (error) {
            console.error("Checkout error:", error);

            showError("Unable to process your order. Please try again.");

            placeOrderBtn.disabled = false;
            isSubmitting = false;
        }
    });

    // =====================================================
    // INITIAL RENDER
    // =====================================================

    renderCart();
    updatePaymentUI();

});