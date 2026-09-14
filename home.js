// ========================================
// GIFTORA - HOME PAGE JAVASCRIPT
// ========================================


// ========================================
// CART STORAGE KEY
// ========================================

const CART_KEY = "giftoraCart";


// ========================================
// LOAD CART
// ========================================

let cart =
    JSON.parse(localStorage.getItem(CART_KEY)) || [];


// ========================================
// CART BADGE
// ========================================

const cartBadges =
    document.querySelectorAll(".cart-count");


// ========================================
// UPDATE CART COUNT
// ========================================

function updateCartCount() {

    let totalQuantity = 0;


    cart.forEach(function (item) {

        totalQuantity +=
            Number(item.quantity) || 0;

    });


    cartBadges.forEach(function (badge) {

        badge.textContent =
            totalQuantity;

    });

}


// ========================================
// SAVE CART
// ========================================

function saveCart() {

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

}


// ========================================
// ADD PRODUCT TO CART
// ========================================

function addToCart(product) {


    // Check whether product already exists
    const existingProduct =
        cart.find(function (item) {

            return item.id === product.id;

        });


    // ====================================
    // PRODUCT ALREADY IN CART
    // ====================================

    if (existingProduct) {

        existingProduct.quantity += 1;

    }


    // ====================================
    // NEW PRODUCT
    // ====================================

    else {

        cart.push({

            id: product.id,

            name: product.name,

            price: product.price,

            image: product.image,

            quantity: 1

        });

    }


    // Save updated cart
    saveCart();


    // Update badge
    updateCartCount();

}


// ========================================
// HOME PAGE PRODUCTS
// ========================================

const homeProducts = [

    {
        id: 1,

        name: "Personalized Greeting Card",

        price: 350,

        image: "home_images/pr_card.png"

    },


    {
        id: 3,

        name: "Customized Resin Keychain",

        price: 950,

        image: "home_images/pr_keychain.png"

    },


    {
        id: 5,

        name: "Premium Handmade Gift Box",

        price: 2500,

        image: "home_images/pr_giftbox.png"

    },


    {
        id: 7,

        name: "Scented Handmade Candle",

        price: 1500,

        image: "home_images/pr_canddle.png"

    }

];


// ========================================
// ADD TO CART BUTTONS
// ========================================

const cartButtons =
    document.querySelectorAll(
        ".featured-products .cart-btn"
    );


cartButtons.forEach(function (button, index) {


    button.addEventListener(
        "click",
        function () {


            // Get correct product
            const product =
                homeProducts[index];


            if (!product) {
                return;
            }


            // Add product
            addToCart(product);


            // ====================================
            // BUTTON EFFECT
            // ====================================

            const originalText =
                this.textContent;


            this.textContent =
                "Added ✓";


            this.style.background =
                "#c98262";


            const currentButton =
                this;


            setTimeout(function () {

                currentButton.textContent =
                    originalText;

                currentButton.style.background =
                    "";

            }, 1500);


            // ====================================
            // MESSAGE
            // ====================================

            alert(
                product.name +
                " added to your cart! 🎁"
            );

        }
    );

});


// ========================================
// WISHLIST BUTTONS
// ========================================

const wishlistButtons =
    document.querySelectorAll(
        ".wishlist-btn"
    );


wishlistButtons.forEach(function (button) {

    button.addEventListener(
        "click",
        function () {

            if (
                this.textContent.trim() === "♡"
            ) {

                this.textContent = "♥";

            }

            else {

                this.textContent = "♡";

            }

        }
    );

});


// ========================================
// NEWSLETTER
// ========================================

const newsletterForm =
    document.querySelector(
        ".newsletter-form"
    );


if (newsletterForm) {

    newsletterForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            alert(
                "Thank you for subscribing to GIFTORA! 💌"
            );


            this.reset();

        }
    );

}


// ========================================
// SEARCH BUTTON
// ========================================

const searchButton =
    document.querySelector(
        ".search-btn"
    );


if (searchButton) {

    searchButton.addEventListener(
        "click",
        function () {


            const searchTerm =
                prompt(
                    "What gift are you looking for?"
                );


            if (
                searchTerm &&
                searchTerm.trim() !== ""
            ) {


                window.location.href =
                    "product_listing.html?search=" +
                    encodeURIComponent(
                        searchTerm
                    );

            }

        }
    );

}


// ========================================
// HEADER WISHLIST
// ========================================

const headerWishlist =
    document.querySelector(
        ".wishlist-header"
    );


if (headerWishlist) {

    headerWishlist.addEventListener(
        "click",
        function () {

            alert(
                "Your wishlist will appear here! ❤️"
            );

        }
    );

}


// ========================================
// INITIALIZE CART COUNT
// ========================================

updateCartCount();