document.addEventListener("DOMContentLoaded", function () {


    // =====================================================
    // ELEMENTS
    // =====================================================

    const cartItemsContainer =
        document.getElementById("cartItems");

    const emptyCart =
        document.getElementById("emptyCart");

    const totals =
        document.getElementById("totals");

    const form =
        document.getElementById("checkoutForm");

    const placeOrderBtn =
        document.getElementById("placeOrderBtn");

    const formError =
        document.getElementById("formError");

    const formSuccess =
        document.getElementById("formSuccess");

    const billingSame =
        document.getElementById("billingSame");

    const billingFields =
        document.getElementById("billingFields");

    const codDetails =
        document.getElementById("codDetails");

    const bankTransferDetails =
        document.getElementById("bankTransferDetails");

    const payhereDetails =
        document.getElementById("payhereDetails");

    const bankTransferAmount =
        document.getElementById("bankTransferAmount");

    const bankReference =
        document.getElementById("bankReference");


    // =====================================================
    // CART
    // =====================================================

    let cart = [];


    try {

        const savedCart =
            JSON.parse(
                localStorage.getItem("giftoraCart")
            );


        cart =
            Array.isArray(savedCart)
                ? savedCart
                : [];

    }

    catch (error) {

        console.error(
            "Unable to load cart:",
            error
        );

        cart = [];

    }


    // =====================================================
    // MONEY FORMAT
    // =====================================================

    function money(amount) {

        return "LKR " +
            Number(amount).toLocaleString(
                "en-LK",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );

    }


    // =====================================================
    // ERROR MESSAGE
    // =====================================================

    function showError(message) {

        formError.textContent =
            message;

        formError.style.display =
            "block";

        formSuccess.style.display =
            "none";

    }


    // =====================================================
    // SUCCESS MESSAGE
    // =====================================================

    function showSuccess(message) {

        formSuccess.textContent =
            message;

        formSuccess.style.display =
            "block";

        formError.style.display =
            "none";

    }


    // =====================================================
    // CALCULATE TOTALS
    // =====================================================

    function calculateTotals() {

        let subtotal = 0;


        cart.forEach(function (item) {

            const price =
                Number(item.price);

            const quantity =
                Number(item.quantity);


            if (
                Number.isFinite(price) &&
                price >= 0 &&
                Number.isInteger(quantity) &&
                quantity >= 1
            ) {

                subtotal +=
                    price * quantity;

            }

        });


        const shipping =
            subtotal > 0
                ? 350
                : 0;


        const total =
            subtotal + shipping;


        return {

            subtotal:
                subtotal,

            shipping:
                shipping,

            total:
                total

        };

    }


    // =====================================================
    // RENDER CART
    // =====================================================

    function renderCart() {

        cartItemsContainer.replaceChildren();


        if (cart.length === 0) {

            emptyCart.hidden =
                false;

            totals.hidden =
                true;

            placeOrderBtn.disabled =
                true;

            placeOrderBtn.textContent =
                "Your Cart Is Empty";

            return;

        }


        emptyCart.hidden =
            true;

        totals.hidden =
            false;

        placeOrderBtn.disabled =
            false;

        placeOrderBtn.textContent =
            "Place Order";


        let subtotal = 0;


        cart.forEach(function (item) {

            const price =
                Number(item.price);

            const quantity =
                Number(item.quantity);


            if (
                !Number.isFinite(price) ||
                price < 0 ||
                !Number.isInteger(quantity) ||
                quantity < 1
            ) {

                return;

            }


            const lineTotal =
                price * quantity;


            subtotal +=
                lineTotal;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "summary-item";


            const info =
                document.createElement(
                    "div"
                );


            info.className =
                "item-info";


            const name =
                document.createElement(
                    "strong"
                );


            name.textContent =
                item.name ||
                "Gift item";


            const qty =
                document.createElement(
                    "small"
                );


            qty.textContent =
                "Qty: " +
                quantity;


            const priceElement =
                document.createElement(
                    "span"
                );


            priceElement.className =
                "item-price";


            priceElement.textContent =
                money(lineTotal);


            info.append(
                name,
                qty
            );


            row.append(
                info,
                priceElement
            );


            cartItemsContainer.appendChild(
                row
            );

        });


        const shipping =
            subtotal > 0
                ? 350
                : 0;


        const total =
            subtotal + shipping;


        document.getElementById(
            "subtotal"
        ).textContent =
            money(subtotal);


        document.getElementById(
            "shipping"
        ).textContent =
            money(shipping);


        document.getElementById(
            "total"
        ).textContent =
            money(total);


        updateBankTransferAmount();


        if (subtotal <= 0) {

            placeOrderBtn.disabled =
                true;

        }

    }


    // =====================================================
    // BILLING ADDRESS
    // =====================================================

    function updateBillingFields() {

        billingFields.hidden =
            billingSame.checked;


        document.getElementById(
            "billingAddress"
        ).required =
            !billingSame.checked;


        document.getElementById(
            "billingCity"
        ).required =
            !billingSame.checked;

    }


    billingSame.addEventListener(
        "change",
        updateBillingFields
    );


    updateBillingFields();


    // =====================================================
    // GET CUSTOMER DETAILS
    // =====================================================

    function getCustomerDetails() {

        return {

            fullName:
                document
                    .getElementById("fullName")
                    .value
                    .trim(),

            phone:
                document
                    .getElementById("phone")
                    .value
                    .trim(),

            email:
                document
                    .getElementById("email")
                    .value
                    .trim(),

            address:
                document
                    .getElementById("address")
                    .value
                    .trim(),

            city:
                document
                    .getElementById("city")
                    .value
                    .trim(),

            postalCode:
                document
                    .getElementById("postalCode")
                    .value
                    .trim(),

            country:
                document
                    .getElementById("country")
                    .value,

            notes:
                document
                    .getElementById("notes")
                    .value
                    .trim()

        };

    }


    // =====================================================
    // PAYMENT UI
    // =====================================================

    function updatePaymentUI() {

        const selectedPayment =
            document.querySelector(
                'input[name="paymentMethod"]:checked'
            );


        if (!selectedPayment) {
            return;
        }


        const paymentMethod =
            selectedPayment.value;


        // Hide everything first

        codDetails.hidden =
            true;

        bankTransferDetails.hidden =
            true;

        payhereDetails.hidden =
            true;


        bankReference.required =
            false;


        // ================================================
        // COD
        // ================================================

        if (
            paymentMethod ===
            "Cash on Delivery"
        ) {

            codDetails.hidden =
                false;

        }


        // ================================================
        // BANK TRANSFER
        // ================================================

        else if (
            paymentMethod ===
            "Bank Transfer"
        ) {

            bankTransferDetails.hidden =
                false;

            bankReference.required =
                true;

            updateBankTransferAmount();

        }


        // ================================================
        // PAYHERE
        // ================================================

        else if (
            paymentMethod ===
            "PayHere"
        ) {

            payhereDetails.hidden =
                false;

        }

    }


    // =====================================================
    // UPDATE BANK TRANSFER AMOUNT
    // =====================================================

    function updateBankTransferAmount() {

        if (!bankTransferAmount) {
            return;
        }


        const totals =
            calculateTotals();


        bankTransferAmount.textContent =
            money(totals.total);

    }


    // =====================================================
    // PAYMENT RADIO EVENTS
    // =====================================================

    document
        .querySelectorAll(
            'input[name="paymentMethod"]'
        )
        .forEach(function (radio) {

            radio.addEventListener(
                "change",
                updatePaymentUI
            );

        });


    updatePaymentUI();


    // =====================================================
    // GENERATE ORDER ID
    // =====================================================

    function generateOrderId() {

        const now =
            new Date();


        const date =
            now.getTime();


        const random =
            Math.floor(
                1000 +
                Math.random() * 9000
            );


        return (
            "GFT-" +
            date +
            "-" +
            random
        );

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

    function createOrderObject(
        paymentMethod
    ) {

        const customer =
            getCustomerDetails();


        const totals =
            calculateTotals();


        const orderId =
            generateOrderId();


        const order = {

            orderId:
                orderId,

            orderDate:
                new Date().toISOString(),

            customer: {

                fullName:
                    customer.fullName,

                phone:
                    customer.phone,

                email:
                    customer.email

            },


            shippingAddress: {

                address:
                    customer.address,

                city:
                    customer.city,

                postalCode:
                    customer.postalCode,

                country:
                    customer.country

            },


            billingSameAsShipping:
                billingSame.checked,


            billingAddress:
                billingSame.checked
                    ? null
                    : {

                        address:
                            document
                                .getElementById(
                                    "billingAddress"
                                )
                                .value
                                .trim(),

                        city:
                            document
                                .getElementById(
                                    "billingCity"
                                )
                                .value
                                .trim(),

                        postalCode:
                            document
                                .getElementById(
                                    "billingPostal"
                                )
                                .value
                                .trim()

                    },


            notes:
                customer.notes,


            paymentMethod:
                paymentMethod,


            bankReference:
                paymentMethod ===
                "Bank Transfer"
                    ? bankReference.value
                        .trim()
                    : null,


            items:
                cart,


            subtotal:
                totals.subtotal,


            shipping:
                totals.shipping,


            total:
                totals.total

        };


        return order;

    }


    // =====================================================
    // PAYHERE PAYMENT
    // =====================================================

    async function startPayHerePayment() {

        const customer =
            getCustomerDetails();


        const totals =
            calculateTotals();


        const paymentData = {

            fullName:
                customer.fullName,

            phone:
                customer.phone,

            email:
                customer.email,

            address:
                customer.address,

            city:
                customer.city,

            country:
                customer.country,

            amount:
                totals.total

        };


        try {

            placeOrderBtn.disabled =
                true;


            placeOrderBtn.textContent =
                "Connecting to PayHere...";


            // -------------------------------------------------
            // Send checkout data to PHP
            // -------------------------------------------------

            const response =
                await fetch(
                    "backend/api/payhere/create_payment.php",
                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                paymentData
                            )

                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Server returned HTTP " +
                    response.status
                );

            }


            const result =
                await response.json();


            console.log(
                "PayHere response:",
                result
            );


            if (!result.success) {

                throw new Error(
                    result.message ||
                    "Unable to create PayHere payment."
                );

            }


            // -------------------------------------------------
            // Create PayHere form
            // -------------------------------------------------

            const payhereForm =
                document.createElement(
                    "form"
                );


            payhereForm.method =
                "POST";


            payhereForm.action =
                result.payment_url;


            /*
             * PayHere expects
             * application/x-www-form-urlencoded
             * form data.
             */

            const fields = {

                merchant_id:
                    result.merchant_id,

                return_url:
                    result.return_url,

                cancel_url:
                    result.cancel_url,

                notify_url:
                    result.notify_url,

                first_name:
                    result.first_name,

                last_name:
                    result.last_name,

                email:
                    result.email,

                phone:
                    result.phone,

                address:
                    result.address,

                city:
                    result.city,

                country:
                    result.country,

                order_id:
                    result.order_id,

                items:
                    result.items,

                currency:
                    result.currency,

                amount:
                    result.amount,

                hash:
                    result.hash

            };


            Object.keys(fields)
                .forEach(function (key) {

                    const input =
                        document.createElement(
                            "input"
                        );


                    input.type =
                        "hidden";


                    input.name =
                        key;


                    input.value =
                        fields[key];


                    payhereForm.appendChild(
                        input
                    );

                });


            document.body.appendChild(
                payhereForm
            );


            console.log(
                "Redirecting to PayHere..."
            );


            payhereForm.submit();

        }


        catch (error) {

            console.error(
                "PayHere Error:",
                error
            );


            showError(
                error.message ||
                "Unable to connect to PayHere."
            );


            placeOrderBtn.disabled =
                false;


            placeOrderBtn.textContent =
                "Place Order";

        }

    }


    // =====================================================
    // FORM SUBMIT
    // =====================================================

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            formError.style.display =
                "none";


            formSuccess.style.display =
                "none";


            // ==============================================
            // CHECK CART
            // ==============================================

            if (cart.length === 0) {

                showError(
                    "Your cart is empty. Please add a gift first."
                );

                return;

            }


            // ==============================================
            // HTML VALIDATION
            // ==============================================

            if (!form.reportValidity()) {

                return;

            }


            // ==============================================
            // GET PAYMENT METHOD
            // ==============================================

            const selectedPayment =
                document.querySelector(
                    'input[name="paymentMethod"]:checked'
                );


            if (!selectedPayment) {

                showError(
                    "Please select a payment method."
                );

                return;

            }


            const paymentMethod =
                selectedPayment.value;


            // ==============================================
            // PAYHERE
            // ==============================================

            if (
                paymentMethod ===
                "PayHere"
            ) {

                await startPayHerePayment();

                return;

            }


            // ==============================================
            // BANK TRANSFER VALIDATION
            // ==============================================

            if (
                paymentMethod ===
                "Bank Transfer"
            ) {

                if (
                    !bankReference.value.trim()
                ) {

                    showError(
                        "Please enter your bank transfer reference number."
                    );


                    bankReference.focus();


                    return;

                }

            }


            // ==============================================
            // CREATE ORDER
            // ==============================================

            const order =
                createOrderObject(
                    paymentMethod
                );


            // ==============================================
            // COD
            // ==============================================

            if (
                paymentMethod ===
                "Cash on Delivery"
            ) {

                order.status =
                    "Order Received";


                order.paymentStatus =
                    "Payment Pending";


                saveOrder(order);


                // Clear cart

                localStorage.removeItem(
                    "giftoraCart"
                );


                // Redirect

                window.location.href =
                    "order_confirmation.html";


                return;

            }


            // ==============================================
            // BANK TRANSFER
            // ==============================================

            if (
                paymentMethod ===
                "Bank Transfer"
            ) {

                order.status =
                    "Pending Payment Verification";


                order.paymentStatus =
                    "Bank Transfer Pending";


                saveOrder(order);


                // Clear cart

                localStorage.removeItem(
                    "giftoraCart"
                );


                // Redirect

                window.location.href =
                    "order_confirmation.html";


                return;

            }

        }
    );


    // =====================================================
    // INITIAL RENDER
    // =====================================================

    renderCart();


    updatePaymentUI();

});