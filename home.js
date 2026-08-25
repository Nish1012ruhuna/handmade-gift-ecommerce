
// CART COUNT


let cartCount = Number(localStorage.getItem("cartCount")) || 0;

const cartBadge = document.querySelector(".cart-count");

if (cartBadge) {
    cartBadge.textContent = cartCount;
}


// WISHLIST BUTTONS

const wishlistButtons =
    document.querySelectorAll(".wishlist-btn");


wishlistButtons.forEach((button) => {

    button.addEventListener("click", function () {

        if (this.textContent.trim() === "♡") {

            this.textContent = "♥";

        } else {

            this.textContent = "♡";

        }

    });

});


// ADD TO CART
const cartButtons =
    document.querySelectorAll(".cart-btn");


cartButtons.forEach((button) => {

    button.addEventListener("click", function () {

        // Increase cart count
        cartCount++;

        // Save count
        localStorage.setItem(
            "cartCount",
            cartCount
        );

        // Update cart badge
        if (cartBadge) {

            cartBadge.textContent =
                cartCount;

        }


        // Get product name
        const productName =
            this.dataset.product;


        // Change button temporarily
        const originalText =
            this.textContent;

        this.textContent = "Added ✓";

        this.style.background = "#c98262";


        setTimeout(() => {

            this.textContent =
                originalText;

            this.style.background = "";

        }, 1500);


        // Show message
        alert(
            productName +
            " added to your cart! 🎁"
        );

    });

});


// NEWSLETTER

const newsletterForm =
    document.querySelector(".newsletter-form");


if (newsletterForm) {

    newsletterForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const email =
                this.querySelector(
                    'input[type="email"]'
                ).value;


            alert(
                "Thank you for subscribing to GIFTORA! 💌"
            );


            this.reset();

        }
    );

}


// SEARCH BUTTON

const searchButton =
    document.querySelector(".search-btn");


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
                    "shop.html?search=" +
                    encodeURIComponent(
                        searchTerm
                    );

            }

        }
    );

}


// HEADER WISHLIST


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