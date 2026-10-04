document.addEventListener("DOMContentLoaded", function () {


    // =====================================================
    // PAYHERE SANDBOX CONFIGURATION
    // =====================================================

    const PAYHERE_MERCHANT_ID =
        "YOUR_MERCHANT_ID";


    const PAYHERE_MERCHANT_SECRET =
        "YOUR_MERCHANT_SECRET";


    /*
     * Your project folder is currently:
     *
     * Gift Shop
     *
     * If you rename the folder to GiftShop,
     * change this to:
     *
     * http://localhost/GiftShop
     */

    const BASE_URL =
        "http://localhost/Gift%20Shop";


    // =====================================================
    // GET HTML ELEMENTS
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


    // =====================================================
    // CART VARIABLES
    // =====================================================

    let cart = [];


    // This stores the final amount
    // including delivery fee.

    let checkoutTotal = 0;


    // =====================================================
    // LOAD CART FROM LOCAL STORAGE
    // =====================================================

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
            "Could not load cart:",
            error
        );

        cart = [];

    }


    // =====================================================
    // FORMAT MONEY
    // =====================================================

    function money(amount) {

        return "LKR " +
            amount.toLocaleString(
                "en-LK",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );

    }


    // =====================================================
    // SHOW ERROR
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
    // SHOW SUCCESS
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
    // RENDER CART
    // =====================================================

    function renderCart() {

        cartItemsContainer.replaceChildren();


        // -----------------------------------------------
        // EMPTY CART
        // -----------------------------------------------

        if (cart.length === 0) {

            emptyCart.hidden = false;

            totals.hidden = true;

            placeOrderBtn.disabled = true;

            placeOrderBtn.textContent =
                "Your Cart Is Empty";

            checkoutTotal = 0;

            return;

        }


        emptyCart.hidden = true;

        totals.hidden = false;

        placeOrderBtn.disabled = false;

        placeOrderBtn.textContent =
            "Place Order";


        // -----------------------------------------------
        // CALCULATE SUBTOTAL
        // -----------------------------------------------

        let subtotal = 0;


        cart.forEach(function (item) {

            const price =
                Number(item.price);


            const quantity =
                Number(item.quantity);


            // Ignore invalid items

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


            subtotal += lineTotal;


            // -------------------------------------------
            // CREATE CART ITEM ROW
            // -------------------------------------------

            const row =
                document.createElement("div");


            row.className =
                "summary-item";


            const info =
                document.createElement("div");


            info.className =
                "item-info";


            const name =
                document.createElement("strong");


            name.textContent =
                item.name || "Gift item";


            const qty =
                document.createElement("small");


            qty.textContent =
                "Qty: " + quantity;


            const priceElement =
                document.createElement("span");


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


        // =================================================
        // DELIVERY FEE
        // =================================================

        const shipping =
            subtotal > 0
                ? 350
                : 0;


        // =================================================
        // FINAL TOTAL
        // =================================================

        const total =
            subtotal + shipping;


        // Save total so PayHere can use it

        checkoutTotal =
            total;


        // =================================================
        // DISPLAY TOTALS
        // =================================================

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
    // PAYHERE PAYMENT
    // =====================================================

    function payWithPayHere(orderDetails) {


        // -----------------------------------------------
        // CHECK CREDENTIALS
        // -----------------------------------------------

        if (

            PAYHERE_MERCHANT_ID ===
                "YOUR_MERCHANT_ID" ||

            PAYHERE_MERCHANT_SECRET ===
                "YOUR_MERCHANT_SECRET"

        ) {

            showError(
                "PayHere is not configured yet. Please add your Merchant ID and Merchant Secret."
            );

            return;

        }


        // -----------------------------------------------
        // MERCHANT DETAILS
        // -----------------------------------------------

        const merchantId =
            PAYHERE_MERCHANT_ID;


        const merchantSecret =
            PAYHERE_MERCHANT_SECRET;


        // -----------------------------------------------
        // AMOUNT
        //
        // PayHere requires exactly 2 decimals.
        //
        // Example:
        //
        // 2500
        //
        // becomes:
        //
        // 2500.00
        // -----------------------------------------------

        const amount =
            Number(checkoutTotal)
                .toFixed(2);


        const currency =
            "LKR";


        // -----------------------------------------------
        // CREATE UNIQUE ORDER ID
        // -----------------------------------------------

        const orderId =
            "GIFTORA-" +
            Date.now();


        // -----------------------------------------------
        // CUSTOMER NAME
        // -----------------------------------------------

        const fullName =
            orderDetails.customer.fullName
                .trim();


        const nameParts =
            fullName.split(/\s+/);


        const firstName =
            nameParts[0] ||
            "Customer";


        const lastName =
            nameParts
                .slice(1)
                .join(" ") ||
            "Customer";


        // =================================================
        // PAYHERE HASH
        // =================================================

        /*
         * Step 1
         *
         * MD5 Merchant Secret
         */

        const hashedSecret =
            CryptoJS.MD5(
                merchantSecret
            )
            .toString()
            .toUpperCase();


        /*
         * Step 2
         *
         * Build hash string
         */

        const hashString =
            merchantId +
            orderId +
            amount +
            currency +
            hashedSecret;


        /*
         * Step 3
         *
         * Final MD5 hash
         */

        const hash =
            CryptoJS.MD5(
                hashString
            )
            .toString()
            .toUpperCase();


        console.log(
            "PayHere Order ID:",
            orderId
        );


        console.log(
            "PayHere Amount:",
            amount
        );


        console.log(
            "PayHere Hash:",
            hash
        );


        // =================================================
        // CREATE PAYHERE FORM
        // =================================================

        const payhereForm =
            document.createElement("form");


        payhereForm.method =
            "POST";


        payhereForm.action =
            "https://sandbox.payhere.lk/pay/checkout";


        // =================================================
        // HELPER FUNCTION
        // =================================================

        function addField(
            name,
            value
        ) {

            const input =
                document.createElement("input");


            input.type =
                "hidden";


            input.name =
                name;


            input.value =
                value;


            payhereForm.appendChild(
                input
            );

        }


        // =================================================
        // MERCHANT ID
        // =================================================

        addField(
            "merchant_id",
            merchantId
        );


        // =================================================
        // RETURN URL
        // =================================================

        addField(
            "return_url",
            BASE_URL +
            "/success.html"
        );


        // =================================================
        // CANCEL URL
        // =================================================

        addField(
            "cancel_url",
            BASE_URL +
            "/cancel.html"
        );


        // =================================================
        // NOTIFICATION URL
        // =================================================

        addField(
            "notify_url",
            BASE_URL +
            "/backend/api/payhere/notify.php"
        );


        // =================================================
        // ORDER ID
        // =================================================

        addField(
            "order_id",
            orderId
        );


        // =================================================
        // ITEMS
        // =================================================

        const itemsDescription =
            orderDetails.items
                .map(function (item) {

                    return (
                        item.name +
                        " x" +
                        item.quantity
                    );

                })
                .join(", ");


        addField(
            "items",
            itemsDescription
        );


        // =================================================
        // AMOUNT
        // =================================================

        addField(
            "amount",
            amount
        );


        // =================================================
        // CURRENCY
        // =================================================

        addField(
            "currency",
            currency
        );


        // =================================================
        // CUSTOMER FIRST NAME
        // =================================================

        addField(
            "first_name",
            firstName
        );


        // =================================================
        // CUSTOMER LAST NAME
        // =================================================

        addField(
            "last_name",
            lastName
        );


        // =================================================
        // EMAIL
        // =================================================

        addField(
            "email",
            orderDetails.customer.email
        );


        // =================================================
        // PHONE
        // =================================================

        addField(
            "phone",
            orderDetails.customer.phone
        );


        // =================================================
        // ADDRESS
        // =================================================

        addField(
            "address",
            orderDetails.shippingAddress.address
        );


        // =================================================
        // CITY
        // =================================================

        addField(
            "city",
            orderDetails.shippingAddress.city
        );


        // =================================================
        // COUNTRY
        // =================================================

        addField(
            "country",
            orderDetails.shippingAddress.country
        );


        // =================================================
        // SECURITY HASH
        // =================================================

        addField(
            "hash",
            hash
        );


        // =================================================
        // SUBMIT FORM TO PAYHERE
        // =================================================

        document.body.appendChild(
            payhereForm
        );


        payhereForm.submit();

    }


    // =====================================================
    // CHECKOUT FORM SUBMISSION
    // =====================================================

    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            // ---------------------------------------------
            // CLEAR MESSAGES
            // ---------------------------------------------

            formError.style.display =
                "none";


            formSuccess.style.display =
                "none";


            // ---------------------------------------------
            // CHECK CART
            // ---------------------------------------------

            if (cart.length === 0) {

                showError(
                    "Your cart is empty. Please add a gift first."
                );

                return;

            }


            // ---------------------------------------------
            // VALIDATE FORM
            // ---------------------------------------------

            if (!form.reportValidity()) {

                return;

            }


            // ---------------------------------------------
            // GET PAYMENT METHOD
            // ---------------------------------------------

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


            // ---------------------------------------------
            // COLLECT ORDER DETAILS
            // ---------------------------------------------

            const orderDetails = {


                customer: {

                    fullName:
                        document.getElementById(
                            "fullName"
                        )
                        .value
                        .trim(),


                    phone:
                        document.getElementById(
                            "phone"
                        )
                        .value
                        .trim(),


                    email:
                        document.getElementById(
                            "email"
                        )
                        .value
                        .trim()

                },


                shippingAddress: {

                    address:
                        document.getElementById(
                            "address"
                        )
                        .value
                        .trim(),


                    city:
                        document.getElementById(
                            "city"
                        )
                        .value
                        .trim(),


                    postalCode:
                        document.getElementById(
                            "postalCode"
                        )
                        .value
                        .trim(),


                    country:
                        document.getElementById(
                            "country"
                        )
                        .value

                },


                billingSameAsShipping:
                    billingSame.checked,


                billingAddress:
                    billingSame.checked
                        ? null
                        : {

                            address:
                                document.getElementById(
                                    "billingAddress"
                                )
                                .value
                                .trim(),


                            city:
                                document.getElementById(
                                    "billingCity"
                                )
                                .value
                                .trim(),


                            postalCode:
                                document.getElementById(
                                    "billingPostal"
                                )
                                .value
                                .trim()

                        },


                notes:
                    document.getElementById(
                        "notes"
                    )
                    .value
                    .trim(),


                paymentMethod:
                    selectedPayment.value,


                items:
                    cart

            };


            console.log(
                "Checkout details:",
                orderDetails
            );


            // =================================================
            // PAYHERE
            // =================================================

            if (
                orderDetails.paymentMethod ===
                "PayHere"
            ) {

                payWithPayHere(
                    orderDetails
                );

                return;

            }


            // =================================================
            // CASH ON DELIVERY / BANK TRANSFER
            // =================================================

            showSuccess(
                "Your order has been placed successfully!"
            );


        }
    );


    // =====================================================
    // INITIALIZE
    // =====================================================

    renderCart();

});