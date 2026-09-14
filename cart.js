// ========================================
// GIFTORA - CART PAGE (WITH SELECTION FIX)
// ========================================

const CART_KEY = "giftoraCart";

// Load cart & set default selected property to true for all items
let cart = (JSON.parse(localStorage.getItem(CART_KEY)) || []).map(item => ({
    ...item,
    selected: item.selected !== undefined ? item.selected : true
}));

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
// DISPLAY CART
// ========================================

function displayCart() {
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

        const image = item.image || "Logo.png";
        const itemTotal = item.price * item.quantity;

        cartItem.innerHTML = `
            <div class="cart-item-select" style="display: flex; align-items: center; margin-right: 15px;">
                <input 
                    type="checkbox" 
                    class="item-checkbox" 
                    data-index="${index}" 
                    ${item.selected ? "checked" : ""}
                    style="width: 20px; height: 20px; cursor: pointer;"
                >
            </div>

            <div class="cart-item-image">
                <img 
                    src="${image}" 
                    alt="${item.name || 'Product'}"
                    onerror="this.src='Logo.png'"
                >
            </div>

            <div class="cart-item-details">
                <h3>${item.name || "Custom Item"}</h3>

                <p class="item-price">
                    Rs. ${Number(item.price).toLocaleString()}
                </p>

                ${item.customization ? `
                    <p class="customization">
                        <strong>Customization:</strong> ${item.customization}
                    </p>` : ""
                }

                ${item.message ? `
                    <p class="customization">
                        <strong>Message:</strong> ${item.message}
                    </p>` : ""
                }

                <div class="quantity-controls">
                    <button class="quantity-btn decrease-btn" data-index="${index}">−</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn increase-btn" data-index="${index}">+</button>
                </div>
            </div>

            <div class="cart-item-right">
                <p class="item-total">
                    Rs. ${itemTotal.toLocaleString()}
                </p>
                <button class="remove-btn" data-index="${index}">Remove</button>
            </div>
        `;

        cartContainer.appendChild(cartItem);
    });

    attachEventListeners();
    updateSummary();
}

// ========================================
// EVENT LISTENERS
// ========================================

function attachEventListeners() {
    // Checkbox selection listener
    document.querySelectorAll(".item-checkbox").forEach(checkbox => {
        checkbox.addEventListener("change", function () {
            const index = parseInt(this.dataset.index);
            cart[index].selected = this.checked;
            saveCart();
            updateSummary();
        });
    });

    // Increase Quantity listener
    document.querySelectorAll(".increase-btn").forEach(button => {
        button.addEventListener("click", function () {
            const index = parseInt(this.dataset.index);
            increaseQuantity(index);
        });
    });

    // Decrease Quantity listener
    document.querySelectorAll(".decrease-btn").forEach(button => {
        button.addEventListener("click", function () {
            const index = parseInt(this.dataset.index);
            decreaseQuantity(index);
        });
    });

    // Remove Item listener
    document.querySelectorAll(".remove-btn").forEach(button => {
        button.addEventListener("click", function () {
            const index = parseInt(this.dataset.index);
            removeItem(index);
        });
    });
}

// ========================================
// CART ACTIONS
// ========================================

function increaseQuantity(index) {
    if (!cart[index]) return;
    cart[index].quantity += 1;
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
    displayCart();
}

function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function updateCartCount() {
    let totalQuantity = 0;
    cart.forEach(item => {
        totalQuantity += item.quantity;
    });

    cartCountElements.forEach(element => {
        element.textContent = totalQuantity;
    });
}

// ========================================
// UPDATE ORDER SUMMARY (SELECTED ITEMS ONLY)
// ========================================

function updateSummary() {
    let subtotal = 0;
    let selectedItemCount = 0;

    // Calculate subtotal ONLY for checked items
    cart.forEach(item => {
        if (item.selected) {
            subtotal += item.price * item.quantity;
            selectedItemCount += item.quantity;
        }
    });

    // Delivery charge calculation
    let delivery = (subtotal > 0 && subtotal < 2000) ? 350 : 0;
    const total = subtotal + delivery;

    // Display formatted totals
    if (subtotalElement) subtotalElement.textContent = `Rs. ${subtotal.toLocaleString()}`;
    if (deliveryElement) {
        deliveryElement.textContent = (delivery === 0 && subtotal > 0) ? "FREE" : `Rs. ${delivery.toLocaleString()}`;
    }
    if (totalElement) totalElement.textContent = `Rs. ${total.toLocaleString()}`;
    if (itemCountElement) itemCountElement.textContent = `${selectedItemCount} items`;

    updateCartCount();
}

// ========================================
// CHECKOUT FUNCTIONALITY
// ========================================

if (checkoutButton) {
    checkoutButton.addEventListener("click", function () {
        const hasSelectedItems = cart.some(item => item.selected);

        if (cart.length === 0) {
            alert("Your cart is empty. Please add a product first.");
            return;
        }

        if (!hasSelectedItems) {
            alert("Please select at least one item to proceed to checkout! 🛒");
            return;
        }

        window.location.href = "checkout.html";
    });
}

// ========================================
// INITIALIZE
// ========================================

displayCart();