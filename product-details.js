/* =========================================
   PRODUCT IMAGE GALLERY
========================================= */

const thumbnails = document.querySelectorAll(".thumbnail");

const mainImage =
    document.getElementById("mainProductImage");


thumbnails.forEach(function (thumbnail) {

    thumbnail.addEventListener("click", function () {

        const image =
            thumbnail.getAttribute("data-image");

        mainImage.src = image;


        thumbnails.forEach(function (item) {

            item.classList.remove("active");

        });


        thumbnail.classList.add("active");

    });

});



/* =========================================
   QUANTITY
========================================= */

const decreaseButton =
    document.getElementById("decrease");

const increaseButton =
    document.getElementById("increase");

const quantityDisplay =
    document.getElementById("quantity");


let quantity = 1;


decreaseButton.addEventListener("click", function () {

    if (quantity > 1) {

        quantity--;

        quantityDisplay.textContent = quantity;

    }

});


increaseButton.addEventListener("click", function () {

    quantity++;

    quantityDisplay.textContent = quantity;

});



/* =========================================
   WISHLIST
========================================= */

const wishlistButton =
    document.getElementById("wishlistButton");

const imageWishlist =
    document.querySelector(".image-wishlist");


function toggleWishlist(button) {

    if (button.classList.contains("selected")) {

        button.classList.remove("selected");

        button.textContent = "♡";

    } else {

        button.classList.add("selected");

        button.textContent = "♥";

    }

}


wishlistButton.addEventListener("click", function () {

    toggleWishlist(wishlistButton);

});


imageWishlist.addEventListener("click", function () {

    toggleWishlist(imageWishlist);

});



/* =========================================
   ADD TO CART
========================================= */

const addToCart =
    document.getElementById("addToCart");


addToCart.addEventListener("click", function () {

    const name =
        document.getElementById("name").value;

    const message =
        document.getElementById("message").value;


    if (name.trim() === "") {

        alert("Please enter the name for personalization.");

        return;

    }


    /*
        Temporary cart system.

        Later this will be connected
        to your database.
    */

    const product = {

        name: "Personalized Greeting Card",

        price: 350,

        quantity: quantity,

        personalizedName: name,

        message: message

    };


    /*
        Get existing cart
    */

    let cart =
        JSON.parse(localStorage.getItem("giftoraCart")) || [];


    /*
        Add product
    */

    cart.push(product);


    /*
        Save cart
    */

    localStorage.setItem(
        "giftoraCart",
        JSON.stringify(cart)
    );


    /*
        Update cart count
    */

    updateCartCount();


    alert(
        "Personalized Greeting Card added to your cart!"
    );

});



/* =========================================
   CART COUNT
========================================= */

function updateCartCount() {

    const cart =
        JSON.parse(localStorage.getItem("giftoraCart")) || [];


    let totalQuantity = 0;


    cart.forEach(function (item) {

        totalQuantity += item.quantity;

    });


    const cartCount =
        document.querySelector(".cart-count");


    if (cartCount) {

        cartCount.textContent =
            totalQuantity;

    }

}


updateCartCount();



/* =========================================
   DESCRIPTION TABS
========================================= */

const tabs =
    document.querySelectorAll(".tab");

const tabContents =
    document.querySelectorAll(".tab-content");


tabs.forEach(function (tab) {

    tab.addEventListener("click", function () {

        const target =
            tab.getAttribute("data-tab");


        tabs.forEach(function (item) {

            item.classList.remove("active");

        });


        tabContents.forEach(function (content) {

            content.classList.remove("active");

        });


        tab.classList.add("active");


        document
            .getElementById(target)
            .classList.add("active");

    });

});