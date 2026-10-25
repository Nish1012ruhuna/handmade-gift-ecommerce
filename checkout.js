
/*
=========================================================
 GIFTORA - CHECKOUT JAVASCRIPT
---------------------------------------------------------
 Features:
 1. Verify the customer's PHP session.
 2. Load saved customer details from the database.
 3. Load selected cart items.
 4. Display the order summary.
 5. Handle billing address and payment method selection.
 6. Submit COD and bank-transfer orders to PHP.
 7. Start the existing PayHere payment flow.
 8. Preserve unpurchased items in the cart.
=========================================================
*/

document.addEventListener("DOMContentLoaded", async function () {

    // =====================================================
    // HTML ELEMENTS
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
    const bankTransferDetails =
        document.getElementById("bankTransferDetails");
    const payhereDetails = document.getElementById("payhereDetails");

    const bankTransferAmount =
        document.getElementById("bankTransferAmount");
    const bankReference = document.getElementById("bankReference");

    // Stop safely if the expected checkout HTML is missing.
    if (
        !form ||
        !placeOrderBtn ||
        !cartItemsContainer ||
        !formError ||
        !formSuccess
    ) {
        console.error("Checkout HTML is missing required elements.");
        return;
    }

    // =====================================================
    // STATE
    // =====================================================

    let isSubmitting = false;
    let cart = [];

    // =====================================================
    // HELPER FUNCTIONS
    // =====================================================

    // Format prices in Sri Lankan rupees.
    function money(amount) {
        return "LKR " + Number(amount).toLocaleString("en-LK", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // Display an error message to the customer.
    function showError(message) {
        formError.textContent = message;
        formError.style.display = "block";
        formSuccess.style.display = "none";
    }

    // Display a success message.
    function showSuccess(message) {
        formSuccess.textContent = message;
        formSuccess.style.display = "block";
        formError.style.display = "none";
    }

    // Read JSON responses safely.
    async function readJsonResponse(response, description) {
        const responseText = await response.text();

        let data;

        try {
            data = JSON.parse(responseText);
        } catch (error) {
            console.error(description + " returned invalid JSON:", responseText);
            throw new Error(
                "The server returned an invalid response. Please try again."
            );
        }

        return data;
    }

    // =====================================================
    // STEP 1: VERIFY CUSTOMER LOGIN
    // =====================================================
    // This is a navigation safeguard. PHP must also protect
    // profile, order, and payment endpoints independently.

    try {
        const response = await fetch("backend/api/check_session.php", {
            method: "GET",
            credentials: "same-origin",
            headers: {
                "Accept": "application/json"
            }
        });

        const sessionData = await readJsonResponse(
            response,
            "Session check"
        );

        if (!response.ok || !sessionData.success) {
            throw new Error("Unable to verify your login session.");
        }

        // Redirect guests to login and return here after login.
        if (!sessionData.loggedIn) {
            window.location.replace("login.html?next=checkout.html");
            return;
        }

    } catch (error) {
        console.error("Session verification failed:", error);

        showError(
            "We could not verify your account. Please log in and try again."
        );

        placeOrderBtn.disabled = true;
        return;
    }

    // =====================================================
    // STEP 2: LOAD CUSTOMER PROFILE FROM DATABASE
    // =====================================================
    // profile.php gets the customer ID from the PHP session.
    // The browser does not choose which customer's profile to load.

    try {
        const response = await fetch("backend/api/profile.php", {
            method: "GET",
            credentials: "same-origin",
            headers: {
                "Accept": "application/json"
            }
        });

        const profileData = await readJsonResponse(
            response,
            "Customer profile"
        );

        if (
            !response.ok ||
            !profileData.success ||
            !profileData.customer
        ) {
            if (response.status === 401 || response.status === 403) {
                window.location.replace(
                    "login.html?next=checkout.html"
                );
                return;
            }

            throw new Error(
                profileData.message || "Unable to load your customer details."
            );
        }

        const customer = profileData.customer;

        // Fill customer information from the saved database profile.
        document.getElementById("fullName").value =
            customer.FullName || "";

        document.getElementById("email").value =
            customer.Email || "";

        document.getElementById("phone").value =
            customer.MobileNo || "";

        // ShippingAddress is stored as one text field in this database.
        // It is placed in the street-address field.
        document.getElementById("address").value =
            customer.ShippingAddress || "";

        // Fill the billing street address when available.
        document.getElementById("billingAddress").value =
            customer.BillingAddress || "";

    } catch (error) {
        console.error("Unable to load customer profile:", error);

        showError(
            "We could not load your saved details. Please try again."
        );

        placeOrderBtn.disabled = true;
        return;
    }

    // =====================================================
    // STEP 3: LOAD THE SELECTED CART ITEMS
    // =====================================================
    // cart.js saves selected products under giftoraCheckoutCart.
    // Fall back to giftoraCart for older saved sessions.

    try {
        const checkoutCart = localStorage.getItem("giftoraCheckoutCart");
        const mainCart = localStorage.getItem("giftoraCart");

        const parsedCart = checkoutCart
            ? JSON.parse(checkoutCart)
            : JSON.parse(mainCart || "[]");

        cart = Array.isArray(parsedCart)
            ? parsedCart.filter(function (item) {
                return item &&
                    Number.isInteger(Number(item.quantity)) &&
                    Number(item.quantity) >= 1 &&
                    Number.isFinite(Number(item.price)) &&
                    Number(item.price) >= 0;
            })
            : [];

    } catch (error) {
        console.error("Unable to load cart:", error);
        cart = [];
    }

    // =====================================================
    // STEP 4: CALCULATE DISPLAY TOTALS
    // =====================================================
    // These totals are for display only.
    // create_order.php must calculate the real total using DB prices.

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

        // Keep the checkout display aligned with create_order.php.
        // Update this rule in BOTH places if your shipping policy changes.
        const shipping = subtotal > 0 ? 350 : 0;

        return {
            subtotal: subtotal,
            shipping: shipping,
            total: subtotal + shipping
        };
    }

    // =====================================================
    // STEP 5: RENDER THE CART SUMMARY
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

        cart.forEach(function (item) {
            const quantity = Number(item.quantity);
            const price = Number(item.price);

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
            priceElement.textContent = money(price * quantity);

            info.append(name, qty);
            row.append(info, priceElement);
            cartItemsContainer.appendChild(row);
        });

        const currentTotals = calculateTotals();

        document.getElementById("subtotal").textContent =
            money(currentTotals.subtotal);

        document.getElementById("shipping").textContent =
            money(currentTotals.shipping);

        document.getElementById("total").textContent =
            money(currentTotals.total);

        updateBankTransferAmount();

        if (currentTotals.subtotal <= 0) {
            placeOrderBtn.disabled = true;
        }
    }

    // =====================================================
    // STEP 6: CUSTOMER FORM DETAILS
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

    // Build a readable delivery address for the existing PHP order API.
    function buildDeliveryAddress(customer) {
        return [
            customer.address,
            customer.city,
            customer.postalCode,
            customer.country
        ].filter(Boolean).join(", ");
    }

    // =====================================================
    // STEP 7: BILLING ADDRESS
    // =====================================================

    function updateBillingFields() {
        const sameAsShipping = billingSame.checked;

        billingFields.hidden = sameAsShipping;

        document.getElementById("billingAddress").required =
            !sameAsShipping;

        document.getElementById("billingCity").required =
            !sameAsShipping;
    }

    billingSame.addEventListener("change", updateBillingFields);
    updateBillingFields();

    // =====================================================
    // STEP 8: PAYMENT METHOD UI
    // =====================================================

    function updateBankTransferAmount() {
        if (bankTransferAmount) {
            bankTransferAmount.textContent =
                money(calculateTotals().total);
        }
    }

    function updatePaymentUI() {
        const selectedPayment = document.querySelector(
            'input[name="paymentMethod"]:checked'
        );

        if (!selectedPayment) {
            return;
        }

        codDetails.hidden = true;
        bankTransferDetails.hidden = true;
        payhereDetails.hidden = true;

        bankReference.required = false;

        if (selectedPayment.value === "Cash on Delivery") {
            codDetails.hidden = false;

        } else if (selectedPayment.value === "Bank Transfer") {
            bankTransferDetails.hidden = false;
            bankReference.required = true;
            updateBankTransferAmount();

        } else if (selectedPayment.value === "PayHere") {
            payhereDetails.hidden = false;
        }
    }

    document.querySelectorAll('input[name="paymentMethod"]').forEach(
        function (radio) {
            radio.addEventListener("change", updatePaymentUI);
        }
    );

    // =====================================================
    // STEP 9: ORDER INFORMATION FOR CONFIRMATION PAGE
    // =====================================================
    // This object is for display after checkout only.
    // It is NOT the authoritative database order record.

    function createOrderObject(paymentMethod, orderId, serverTotals) {
        const customer = getCustomerDetails();
        const currentTotals = serverTotals || calculateTotals();

        return {
            orderId: orderId || null,
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

            billingAddress: billingSame.checked
                ? null
                : {
                    address: document.getElementById(
                        "billingAddress"
                    ).value.trim(),

                    city: document.getElementById(
                        "billingCity"
                    ).value.trim(),

                    postalCode: document.getElementById(
                        "billingPostal"
                    ).value.trim()
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
        localStorage.setItem(
            "giftoraLastOrder",
            JSON.stringify(order)
        );
    }

    // =====================================================
    // STEP 10: REMOVE ONLY PURCHASED CART QUANTITIES
    // =====================================================
    // This prevents unchecked products from disappearing.
    // Product IDs should be present on all cart products.

    function removePurchasedItemsFromCart() {
        let mainCart = [];

        try {
            mainCart = JSON.parse(
                localStorage.getItem("giftoraCart") || "[]"
            );

            if (!Array.isArray(mainCart)) {
                mainCart = [];
            }

        } catch (error) {
            console.error("Unable to read the main cart:", error);
            return;
        }

        cart.forEach(function (purchasedItem) {
            const purchasedId = Number(
                purchasedItem.productId ?? purchasedItem.ProductID
            );

            const purchasedQuantity = Number(purchasedItem.quantity);

            if (!Number.isInteger(purchasedId) || purchasedId <= 0) {
                console.warn(
                    "A purchased item has no valid product ID. " +
                    "It was not removed from the main cart."
                );
                return;
            }

            const cartItem = mainCart.find(function (item) {
                const itemId = Number(
                    item.productId ?? item.ProductID
                );

                return itemId === purchasedId;
            });

            if (!cartItem) {
                return;
            }

            const remainingQuantity =
                Number(cartItem.quantity) - purchasedQuantity;

            if (remainingQuantity > 0) {
                cartItem.quantity = remainingQuantity;
            } else {
                mainCart = mainCart.filter(function (item) {
                    const itemId = Number(
                        item.productId ?? item.ProductID
                    );

                    return itemId !== purchasedId;
                });
            }
        });

        localStorage.setItem(
            "giftoraCart",
            JSON.stringify(mainCart)
        );

        // Clear the temporary checkout selection.
        localStorage.removeItem("giftoraCheckoutCart");
    }

    // =====================================================
    // STEP 11: START PAYHERE PAYMENT
    // =====================================================
    // Your PHP endpoint must derive the customer from the
    // session, validate products/prices, and generate the hash.

    async function startPayHerePayment() {
        const customer = getCustomerDetails();

        if (!calculateTotals().total || calculateTotals().total <= 0) {
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
                    productId: Number(
                        item.productId ?? item.ProductID
                    ),
                    quantity: Number(item.quantity)
                };
            })
        };

        // Reject malformed product IDs before calling the API.
        if (paymentData.items.some(function (item) {
            return !Number.isInteger(item.productId) ||
                item.productId <= 0 ||
                !Number.isInteger(item.quantity) ||
                item.quantity < 1;
        })) {
            throw new Error(
                "Some cart items have invalid product IDs. " +
                "Please remove and add those products again."
            );
        }

        const response = await fetch(
            "backend/api/payhere/create_payment.php",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                credentials: "same-origin",
                body: JSON.stringify(paymentData)
            }
        );

        const result = await readJsonResponse(
            response,
            "PayHere payment"
        );

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Unable to create PayHere payment."
            );
        }

        // Verify the required fields before submitting to PayHere.
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
            return result[key] === undefined ||
                result[key] === null ||
                String(result[key]).trim() === "";
        });

        if (missingFields.length > 0) {
            throw new Error(
                "The PayHere response is missing: " +
                missingFields.join(", ")
            );
        }

        // Build the payment form from the server response.
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

        // The browser now navigates to the payment provider.
        payhereForm.submit();
    }

    // =====================================================
    // STEP 12: CREATE COD OR BANK TRANSFER ORDER
    // =====================================================
    // create_order.php validates product IDs, stock, and prices
    // against MySQL and takes the customer ID from the session.

    async function createDatabaseOrder(paymentMethod) {
        const customer = getCustomerDetails();

        const deliveryAddress = buildDeliveryAddress(customer);

        if (!deliveryAddress.trim()) {
            throw new Error("Please enter your delivery address.");
        }

        const orderData = {
            deliveryAddress: deliveryAddress,

            paymentMethod: paymentMethod,

            bankReference: paymentMethod === "Bank Transfer"
                ? bankReference.value.trim()
                : "",

            items: cart.map(function (item) {
                return {
                    productId: Number(
                        item.productId ?? item.ProductID
                    ),
                    quantity: Number(item.quantity)
                };
            })
        };

        // Validate cart IDs and quantities before sending the request.
        if (
            orderData.items.length === 0 ||
            orderData.items.some(function (item) {
                return !Number.isInteger(item.productId) ||
                    item.productId <= 0 ||
                    !Number.isInteger(item.quantity) ||
                    item.quantity < 1;
            })
        ) {
            throw new Error(
                "Some cart items are missing valid product IDs " +
                "or quantities. Please add the products again."
            );
        }

        const response = await fetch("backend/api/create_order.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify(orderData)
        });

        const result = await readJsonResponse(
            response,
            "Create order"
        );

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Unable to save your order."
            );
        }

        // Use the database-generated order ID and totals.
        const order = createOrderObject(
            paymentMethod,
            result.orderId,
            {
                subtotal: Number(result.subtotal),
                shipping: Number(result.shipping),
                total: Number(result.total)
            }
        );

        order.status = "Pending";

        order.paymentStatus =
            paymentMethod === "Cash on Delivery"
                ? "Payment Pending"
                : "Bank Transfer Pending";

        saveOrder(order);

        // Remove only the quantities that were ordered.
        removePurchasedItemsFromCart();

        // Navigate only after the API confirms order creation.
        window.location.href = "order_confirmation.html";
    }

    // =====================================================
    // STEP 13: SUBMIT CHECKOUT FORM
    // =====================================================

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        formError.style.display = "none";
        formSuccess.style.display = "none";

        if (isSubmitting) {
            return;
        }

        if (cart.length === 0) {
            showError("Your cart is empty. Please add a gift first.");
            return;
        }

        // Use built-in HTML required-field validation.
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

        if (
            paymentMethod === "Bank Transfer" &&
            !bankReference.value.trim()
        ) {
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
            console.error("Checkout submission failed:", error);

            showError(
                error.message ||
                "Unable to process your order. Please try again."
            );

            placeOrderBtn.disabled = false;
            placeOrderBtn.textContent = "Place Order";

            isSubmitting = false;
        }
    });

    // =====================================================
    // STEP 14: INITIALIZE CHECKOUT
    // =====================================================

    renderCart();
    updatePaymentUI();

});
