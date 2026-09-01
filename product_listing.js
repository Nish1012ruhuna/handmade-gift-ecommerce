// ==============================
// CATEGORY FILTER
// ==============================

const filterButtons =
    document.querySelectorAll(".filter-btn");

const products =
    document.querySelectorAll(".product-card");

const noResults =
    document.getElementById("noResults");


filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        // Remove active class

        filterButtons.forEach(btn => {

            btn.classList.remove("active");

        });


        // Add active class

        button.classList.add("active");


        const category =
            button.dataset.category;


        filterProducts(category);

    });

});



// ==============================
// FILTER FUNCTION
// ==============================

function filterProducts(category) {

    let visibleProducts = 0;


    products.forEach(product => {

        const productCategory =
            product.dataset.category;


        if (
            category === "all" ||
            productCategory === category
        ) {

            product.style.display = "block";

            visibleProducts++;

        }

        else {

            product.style.display = "none";

        }

    });


    // Show no results message

    if (visibleProducts === 0) {

        noResults.style.display = "block";

    }

    else {

        noResults.style.display = "none";

    }

}



// ==============================
// READ CATEGORY FROM URL
// ==============================

const urlParams =
    new URLSearchParams(
        window.location.search
    );


const selectedCategory =
    urlParams.get("category");


if (selectedCategory) {

    filterButtons.forEach(button => {

        if (
            button.dataset.category ===
            selectedCategory
        ) {

            button.click();

        }

    });

}



// ==============================
// SEARCH PRODUCTS
// ==============================

const searchInput =
    document.getElementById("searchInput");


searchInput.addEventListener("input", () => {

    const searchText =
        searchInput.value
        .toLowerCase()
        .trim();


    let visibleProducts = 0;


    products.forEach(product => {

        const productName =
            product.querySelector("h3")
            .textContent
            .toLowerCase();


        const productCategory =
            product.querySelector(".product-category")
            .textContent
            .toLowerCase();


        if (
            productName.includes(searchText) ||
            productCategory.includes(searchText)
        ) {

            product.style.display = "block";

            visibleProducts++;

        }

        else {

            product.style.display = "none";

        }

    });


    if (visibleProducts === 0) {

        noResults.style.display = "block";

    }

    else {

        noResults.style.display = "none";

    }

});



// ==============================
// WISHLIST BUTTON
// ==============================

const wishlistButtons =
    document.querySelectorAll(".wishlist-btn");


wishlistButtons.forEach(button => {

    button.addEventListener("click", () => {

        button.classList.toggle("active");


        if (
            button.classList.contains("active")
        ) {

            button.innerHTML = "♥";

        }

        else {

            button.innerHTML = "♡";

        }

    });

});



// ==============================
// ADD TO CART
// ==============================

const cartButtons =
    document.querySelectorAll(".cart-btn");


const cartCount =
    document.querySelector(".cart-count");


let cart = JSON.parse(
    localStorage.getItem("cart")
) || [];



cartButtons.forEach(button => {

    button.addEventListener("click", () => {

        const productName =
            button.dataset.product;

        const productPrice =
            button.dataset.price;


        const existingProduct =
            cart.find(product =>
                product.name === productName
            );


        if (existingProduct) {

            existingProduct.quantity++;

        }

        else {

            cart.push({

                name: productName,

                price: productPrice,

                quantity: 1

            });

        }


        // Save cart

        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );


        // Update cart count

        updateCartCount();


        // Button feedback

        const originalText =
            button.textContent;


        button.textContent =
            "Added ✓";


        setTimeout(() => {

            button.textContent =
                originalText;

        }, 1500);

    });

});



// ==============================
// UPDATE CART COUNT
// ==============================

function updateCartCount() {

    const totalItems =
        cart.reduce(
            (total, product) =>
                total + product.quantity,
            0
        );


    cartCount.textContent =
        totalItems;

}


// Run when page loads

updateCartCount();