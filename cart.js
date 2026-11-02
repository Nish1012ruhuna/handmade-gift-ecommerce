
// ========================================
// GIFTORA - CART WITH STOCK VALIDATION
// ========================================

const CART_KEY = "giftoraCart";
const CHECKOUT_CART_KEY = "giftoraCheckoutCart";
const PRODUCTS_API = "backend/api/products.php";

function loadSavedCart() {
    try {
        const saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
        return Array.isArray(saved) ? saved : [];
    } catch (error) {
        console.error("Cart loading error:", error);
        return [];
    }
}

let cart = loadSavedCart().map(item => ({
    ...item,
    quantity: Math.max(1, Number.parseInt(item.quantity, 10) || 1),
    price: Number(item.price) || 0,
    stockQuantity: Number.isInteger(Number(item.stockQuantity))
        ? Math.max(0, Number(item.stockQuantity))
        : 0,
    selected: item.selected !== undefined ? item.selected : true
}));

let stockVerified = false;
let stockRefreshFailed = false;

// ========================================
// HTML ELEMENTS
// ========================================

const cartContainer = document.getElementById("cartContainer");
const emptyCart = document.getElementById("emptyCart");
const subtotalElement = document.getElementById("subtotal");
const deliveryElement = document.getElementById("delivery");
const totalElement = document.getElementById("total");
const itemCountElement = document.getElementById("itemCount");
const cartCountElements = document.querySelectorAll(".cart-count");
const checkoutButton = document.getElementById("checkoutBtn");

// ========================================
// MESSAGE HELPER
// ========================================

function showCartMessage(message, type = "error") {
    let element = document.getElementById("cartStockMessage");

    if (!element && cartContainer) {
        element = document.createElement("div");
        element.id = "cartStockMessage";
        element.setAttribute("role", "alert");
        cartContainer.parentNode.insertBefore(element, cartContainer);
    }

    if (element) {
        element.textContent = message;
        element.className = "cart-stock-message " + type;
        element.style.display = "block";
    } else {
        alert(message);
    }
}

function clearCartMessage() {
    const element = document.getElementById("cartStockMessage");

    if (element) {
        element.textContent = "";
        element.style.display = "none";
    }
}

// ========================================
// SAVE CART
// ========================================

function saveCart() {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateCartCount();
    } catch (error) {
        console.error("Unable to save cart:", error);
        showCartMessage("Unable to save your cart. Please try again.");
    }
}

// ========================================
// REFRESH LIVE STOCK FROM DATABASE
// ========================================

async function refreshStock() {
    try {
        const response = await fetch(
            PRODUCTS_API + "?t=" + Date.now(),
            {
                method: "GET",
                credentials: "same-origin",
                cache: "no-store",
                headers: { "Accept": "application/json" }
            }
        );

        if (!response.ok) {
            throw new Error("Could not retrieve current stock.");
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.products)) {
            throw new Error("Invalid product API response.");
        }

        const stockMap = new Map();

        data.products.forEach(product => {
            stockMap.set(
                Number(product.ProductID),
                Math.max(0, Number(product.StockQuantity) || 0)
            );
        });

        // Update the cached stock for each cart item.
        cart = cart.map(item => {
            const id = Number(item.productId);

            // Missing products are unavailable (for example, deactivated).
            const currentStock = stockMap.has(id)
                ? stockMap.get(id)
                : 0;

            return {
                ...item,
                stockQuantity: currentStock
            };
        });

        stockVerified = true;
        stockRefreshFailed = false;

        saveCart();
        displayCart();

    } catch (error) {
        console.error("Stock refresh error:", error);

        stockVerified = false;
        stockRefreshFailed = true;

        showCartMessage(
            "We couldn't verify the latest stock. Please refresh the page or try again before checkout."
        );

        if (checkoutButton) checkoutButton.disabled = true;

        displayCart();
    }
}

// ========================================
// DISPLAY CART
// ========================================

function displayCart() {
    if (!cartContainer) return;

    cartContainer.innerHTML = "";

    if (cart.length === 0) {
        if (emptyCart) emptyCart.style.display = "block";
        updateSummary();
        return;
    }

    if (emptyCart) emptyCart.style.display = "none";

    cart.forEach((item, index) => {
        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";

        const stock = Math.max(0, Number(item.stockQuantity) || 0);
        const quantity = Math.max(1, Number(item.quantity) || 1);
        const itemTotal = (Number(item.price) || 0) * quantity;

        const image = item.image || "Logo.png";

        const stockLabel = stock === 0
            ? "Out of Stock"
            : `Available stock: ${stock}`;

        const stockClass = stock === 0
            ? "out-of-stock"
            : "in-stock";

        cartItem.innerHTML = `
            <div class="cart-item-select"
                 style="display:flex;align-items:center;margin-right:15px;">
                <input
                    type="checkbox"
                    class="item-checkbox"
                    data-index="${index}"
                    ${item.selected ? "checked" : ""}
                    aria-label="Select ${escapeHTML(item.name || "product")}"
                    style="width:20px;height:20px;cursor:pointer;"
                >
            </div>

            <div class="cart-item-image">
                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(item.name || "Product")}"
                    onerror="this.onerror=null;this.src='Logo.png'"
                >
            </div>

            <div class="cart-item-details">
                <h3>${escapeHTML(item.name || "Custom Item")}</h3>

                <p class="item-price">
                    Rs. ${(Number(item.price) || 0).toLocaleString()}
                </p>

                <p class="cart-stock-label ${stockClass}">
                    ${stockLabel}
                </p>

                ${stock < quantity ? `
                    <p class="stock-message error" role="alert">
                        ${stock === 0
                            ? "This product is out of stock. Remove it to continue."
                            : `Only ${stock} item(s) are available. Reduce your quantity to continue.`}
                    </p>
                ` : ""}

                ${item.customization ? `
                    <p class="customization">
                        <strong>Customization:</strong>
                        ${escapeHTML(item.customization)}
                    </p>` : ""}

                ${item.message ? `
                    <p class="customization">
                        <strong>Message:</strong>
                        ${escapeHTML(item.message)}
                    </p>` : ""}

                ${Array.isArray(item.giftBoxAddons) && item.giftBoxAddons.length
                    ? `<div class="customization">
                        <strong>Gift box items:</strong>
                        <ul>${item.giftBoxAddons.map(addon => `
                            <li>${escapeHTML(addon.name)} — Rs. ${Number(addon.price || 0).toLocaleString()}</li>
                        `).join("")}</ul>
                    </div>`
                    : ""}

                <div class="quantity-controls">
                    <button type="button"
                        class="quantity-btn decrease-btn"
                        data-index="${index}">−</button>

                    <span class="quantity">${quantity}</span>

                    <button type="button"
                        class="quantity-btn increase-btn"
                        data-index="${index}"
                        ${stockRefreshFailed || quantity >= stock ? "disabled" : ""}>
                        +
                    </button>
                </div>
            </div>

            <div class="cart-item-right">
                <p class="item-total">
                    Rs. ${itemTotal.toLocaleString()}
                </p>

                <button type="button"
                    class="remove-btn"
                    data-index="${index}">Remove</button>
            </div>
        `;

        cartContainer.appendChild(cartItem);
    });

    attachEventListeners();
    updateSummary();
}

// Escape user/product text before inserting into HTML.
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// ========================================
// EVENT LISTENERS
// ========================================

function attachEventListeners() {
    document.querySelectorAll(".item-checkbox").forEach(checkbox => {
        checkbox.addEventListener("change", function () {
            const index = Number(this.dataset.index);
            if (!cart[index]) return;

            cart[index].selected = this.checked;

            saveCart();
            updateSummary();
        });
    });

    document.querySelectorAll(".increase-btn").forEach(button => {
        button.addEventListener("click", function () {
            increaseQuantity(Number(this.dataset.index));
        });
    });

    document.querySelectorAll(".decrease-btn").forEach(button => {
        button.addEventListener("click", function () {
            decreaseQuantity(Number(this.dataset.index));
        });
    });

    document.querySelectorAll(".remove-btn").forEach(button => {
        button.addEventListener("click", function () {
            removeItem(Number(this.dataset.index));
        });
    });
}

// ========================================
// CART ACTIONS
// ========================================

function increaseQuantity(index) {
    const item = cart[index];
    if (!item) return;

    if (stockRefreshFailed || !stockVerified) {
        showCartMessage("Please verify stock before changing quantities.");
        return;
    }

    const stock = Number(item.stockQuantity) || 0;

    if (stock === 0) {
        showCartMessage(
            `${item.name} is out of stock. You cannot increase its quantity.`
        );
        return;
    }

    if (item.quantity + 1 > stock) {
        showCartMessage(
            `Sorry, only ${stock} item(s) of ${item.name} are available.`
        );
        return;
    }

    clearCartMessage();

    item.quantity += 1;

    saveCart();
    displayCart();
}

function decreaseQuantity(index) {
    if (!cart[index]) return;

    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
    } else {
        cart.splice(index, 1);
    }

    saveCart();
    displayCart();
}

function removeItem(index) {
    if (!cart[index]) return;

    cart.splice(index, 1);

    saveCart();
    clearCartMessage();
    displayCart();
}

// ========================================
// CART COUNT
// ========================================

function updateCartCount() {
    const total = cart.reduce((sum, item) => {
        return sum + Math.max(0, Number(item.quantity) || 0);
    }, 0);

    cartCountElements.forEach(element => {
        element.textContent = total;
    });
}

// ========================================
// ORDER SUMMARY
// ========================================

function updateSummary() {
    let subtotal = 0;
    let selectedItemCount = 0;

    cart.forEach(item => {
        if (item.selected) {
            subtotal += (Number(item.price) || 0) *
                (Number(item.quantity) || 0);

            selectedItemCount += Number(item.quantity) || 0;
        }
    });

    const delivery = subtotal > 0 && subtotal < 2000 ? 350 : 0;
    const total = subtotal + delivery;

    if (subtotalElement) {
        subtotalElement.textContent = `Rs. ${subtotal.toLocaleString()}`;
    }

    if (deliveryElement) {
        deliveryElement.textContent =
            delivery === 0 && subtotal > 0
                ? "FREE"
                : `Rs. ${delivery.toLocaleString()}`;
    }

    if (totalElement) {
        totalElement.textContent = `Rs. ${total.toLocaleString()}`;
    }

    if (itemCountElement) {
        itemCountElement.textContent = `${selectedItemCount} items`;
    }

    updateCartCount();

    if (checkoutButton) {
        const hasSelectedItems = cart.some(item => item.selected);

        const hasStockProblem = cart.some(item =>
            item.selected &&
            (
                Number(item.stockQuantity) <= 0 ||
                Number(item.quantity) > Number(item.stockQuantity)
            )
        );

        checkoutButton.disabled =
            !hasSelectedItems ||
            hasStockProblem ||
            !stockVerified ||
            stockRefreshFailed;
    }
}

// ========================================
// CHECKOUT
// ========================================

if (checkoutButton) {
    checkoutButton.addEventListener("click", async function () {
        if (stockRefreshFailed || !stockVerified) {
            showCartMessage(
                "Current stock could not be verified. Refresh the page and try again."
            );
            return;
        }

        const selectedItems = cart.filter(item => item.selected);

        if (selectedItems.length === 0) {
            alert("Please select at least one item to proceed to checkout.");
            return;
        }

        const unavailableItem = selectedItems.find(item =>
            Number(item.stockQuantity) <= 0 ||
            Number(item.quantity) > Number(item.stockQuantity)
        );

        if (unavailableItem) {
            showCartMessage(
                Number(unavailableItem.stockQuantity) <= 0
                    ? `${unavailableItem.name} is out of stock. Please remove it.`
                    : `Only ${unavailableItem.stockQuantity} item(s) of ${unavailableItem.name} are available.`
            );
            return;
        }

        checkoutButton.disabled = true;

        try {
            const response = await fetch(
                "backend/api/check_session.php",
                {
                    method: "GET",
                    credentials: "same-origin",
                    headers: { "Accept": "application/json" },
                    cache: "no-store"
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error("Unable to verify your login.");
            }

            localStorage.setItem(
                CHECKOUT_CART_KEY,
                JSON.stringify(selectedItems)
            );

            if (!data.loggedIn) {
                window.location.href = "login.html?next=checkout.html";
                return;
            }

            window.location.href = "checkout.html";

        } catch (error) {
            console.error("Checkout access error:", error);

            alert("We couldn't verify your account. Please try again.");

            checkoutButton.disabled = false;
        }
    });
}

// ========================================
// INITIALIZE
// ========================================

displayCart();
refreshStock();
