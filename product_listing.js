//product listing
document.addEventListener("DOMContentLoaded", function () {

    // ============================================================
    // ELEMENTS
    // ============================================================

    const productGrid =
        document.getElementById("productGrid");

    const noResults =
        document.getElementById("noResults");

    const searchInput =
        document.getElementById("searchInput");

    const filterButtons =
        document.querySelectorAll(".filter-btn");


    // ============================================================
    // VARIABLES
    // ============================================================

    let products = [];

    let selectedCategory = "all";


    // ============================================================
    // API
    // ============================================================

    const API_URL = "backend/api/products.php";


    // ============================================================
    // CLEAN PRODUCT TITLE
    // ============================================================

    function cleanTitle(title) {

        if (!title) {
            return "Untitled Product";
        }

        return String(title)
            .replace(/^#+\s*/, "")
            .trim();
    }


    // ============================================================
    // FORMAT MONEY
    // ============================================================

    function formatMoney(amount) {

        const number = Number(amount);

        if (!Number.isFinite(number)) {
            return "LKR 0.00";
        }

        return "LKR " +
            number.toLocaleString("en-LK", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
    }


    // ============================================================
    // IMAGE PATH
    // ============================================================

    function getImagePath(imageURL) {

        // If there is no image
        if (!imageURL) {
            return "Logo.png";
        }


        let imagePath =
            String(imageURL).trim();


        // Remove starting slash
        imagePath =
            imagePath.replace(/^\/+/, "");


        /*
         * Database may contain:
         *
         * giftbox1.jpg
         *
         * OR
         *
         * shop_images/giftbox1.jpg
         *
         * We handle both.
         */

        if (
            imagePath.startsWith("shop_images/")
        ) {

            return imagePath;

        }


        return "shop_images/" + imagePath;
    }


    // ============================================================
    // CATEGORY SLUG
    // ============================================================

    function getCategorySlug(categoryName) {

        if (!categoryName) {
            return "";
        }

        return String(categoryName)
            .toLowerCase()
            .trim()
            .replace(/&/g, "and")
            .replace(/[^a-z0-9]+/g, "");
    }


    // ============================================================
    // LOAD PRODUCTS
    // ============================================================

    async function loadProducts() {

        try {

            // Loading message
            productGrid.innerHTML = `
                <div class="loading-message">
                    <p>
                        Loading our beautiful gifts... 🎁
                    </p>
                </div>
            `;


            // Request latest database data
            const response = await fetch(
                API_URL + "?t=" + Date.now(),
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


            // Check HTTP response
            if (!response.ok) {

                throw new Error(
                    "Failed to load products. HTTP status: " +
                    response.status
                );
            }


            // Convert to JSON
            const data =
                await response.json();


            console.log(
                "Products API response:",
                data
            );


            // Check API response
            if (!data.success) {

                throw new Error(
                    data.message ||
                    "Unable to load products."
                );
            }


            // Store products
            products =
                Array.isArray(data.products)
                    ? data.products
                    : [];


            console.log(
                "Products loaded:",
                products
            );


            // Display products
            displayProducts();


        } catch (error) {

            console.error(
                "Product loading error:",
                error
            );


            productGrid.innerHTML = `
                <div class="loading-message">

                    <h2>
                        Unable to load products
                    </h2>

                    <p>
                        Please make sure the server
                        is running and try again.
                    </p>

                    <p>
                        Error: ${error.message}
                    </p>

                </div>
            `;


            noResults.style.display = "none";
        }
    }


    // ============================================================
    // DISPLAY PRODUCTS
    // ============================================================

    function displayProducts() {

        const searchText =
            searchInput.value
                .trim()
                .toLowerCase();


        // Filter products
        const filteredProducts =
            products.filter(function (product) {

                const title =
                    cleanTitle(product.Title);

                const description =
                    String(
                        product.Description || ""
                    );

                const category =
                    String(
                        product.CategoryName || ""
                    );


                // Search
                const matchesSearch =

                    title
                        .toLowerCase()
                        .includes(searchText)

                    ||

                    description
                        .toLowerCase()
                        .includes(searchText)

                    ||

                    category
                        .toLowerCase()
                        .includes(searchText);


                // Category
                let matchesCategory = true;


                if (
                    selectedCategory !== "all"
                ) {

                    matchesCategory =
                        getCategorySlug(
                            category
                        ) === selectedCategory;
                }


                return (
                    matchesSearch &&
                    matchesCategory
                );

            });


        // Clear grid
        productGrid.innerHTML = "";


        // No products
        if (
            filteredProducts.length === 0
        ) {

            noResults.style.display = "block";

            return;
        }


        // Hide no-result message
        noResults.style.display = "none";


        // Create cards
        filteredProducts.forEach(
            function (product) {

                const card =
                    createProductCard(product);

                productGrid.appendChild(card);

            }
        );
    }


    // ============================================================
    // CREATE PRODUCT CARD
    // ============================================================

    function createProductCard(product) {

        const card =
            document.createElement("article");

        card.className =
            "product-card";


        // ========================================================
        // IMAGE
        // ========================================================

        const imageContainer =
            document.createElement("div");

        imageContainer.className =
            "product-image";


        const image =
            document.createElement("img");


        // Get correct image path
        image.src =
            getImagePath(
                product.ImageURL
            );


        // Product title
        const productTitle =
            cleanTitle(product.Title);


        image.alt =
            productTitle;


        image.loading =
            "lazy";


        // Image error
        image.onerror =
            function () {

                console.error(
                    "Image could not be loaded:",
                    image.src,
                    "Database ImageURL:",
                    product.ImageURL
                );


                image.onerror = null;

                image.src =
                    "Logo.png";
            };


        imageContainer.appendChild(image);


        // ========================================================
        // PRODUCT INFO
        // ========================================================

        const info =
            document.createElement("div");

        info.className =
            "product-info";


        // ========================================================
        // CATEGORY
        // ========================================================

        const category =
            document.createElement("span");

        category.className =
            "product-category";


        category.textContent =
            product.CategoryName || "Gift";


        // ========================================================
        // TITLE
        // ========================================================

        const title =
            document.createElement("h3");

        title.className =
            "product-title";


        title.textContent =
            productTitle;


        // ========================================================
        // DESCRIPTION
        // ========================================================

        const description =
            document.createElement("p");

        description.className =
            "product-description";


        description.textContent =
            product.Description || "";


        // ========================================================
        // PRICE
        // ========================================================

        const price =
            document.createElement("span");

        price.className =
            "product-price";


        price.textContent =
            formatMoney(
                product.Price
            );


        // ========================================================
        // BUTTON CONTAINER
        // ========================================================

        const actions =
            document.createElement("div");

        actions.className =
            "product-actions";


        // ========================================================
        // VIEW PRODUCT BUTTON
        // ========================================================

        const viewButton =
            document.createElement("button");

        viewButton.className =
            "view-product-btn";


        viewButton.type =
            "button";


        viewButton.textContent =
            "View Product";


        viewButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "prduct_details.html?id=" +
                    encodeURIComponent(
                        product.ProductID
                    );

            }
        );


        // ========================================================
        // ADD TO CART BUTTON
        // ========================================================

        const cartButton =
            document.createElement("button");

        cartButton.className =
            "add-cart-btn";


        cartButton.type =
            "button";


        cartButton.textContent =
            "Add to Cart";


        cartButton.addEventListener(
            "click",
            function () {

                addToCart(product);

            }
        );


        // Add buttons
        actions.appendChild(
            viewButton
        );

        actions.appendChild(
            cartButton
        );


        // ========================================================
        // BUILD CARD
        // ========================================================

        info.appendChild(
            category
        );

        info.appendChild(
            title
        );

        info.appendChild(
            description
        );

        info.appendChild(
            price
        );

        info.appendChild(
            actions
        );


        card.appendChild(
            imageContainer
        );

        card.appendChild(
            info
        );


        return card;
    }


    // ============================================================
    // SEARCH
    // ============================================================

    searchInput.addEventListener(
        "input",
        function () {

            displayProducts();

        }
    );


    // ============================================================
    // CATEGORY FILTER
    // ============================================================

    filterButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    // Remove active class
                    filterButtons.forEach(
                        function (btn) {

                            btn.classList.remove(
                                "active"
                            );

                        }
                    );


                    // Add active class
                    button.classList.add(
                        "active"
                    );


                    // Get category
                    selectedCategory =
                        button.dataset.category;


                    // Refresh products
                    displayProducts();

                }
            );

        }
    );


    // ============================================================
    // ADD TO CART
    // ============================================================

    function addToCart(product) {

        let cart = [];


        try {

            const savedCart =
                localStorage.getItem(
                    "giftoraCart"
                );


            if (savedCart) {

                cart =
                    JSON.parse(savedCart);
            }


            if (!Array.isArray(cart)) {

                cart = [];
            }

        } catch (error) {

            console.error(
                "Cart loading error:",
                error
            );

            cart = [];
        }


        // Check existing product
        const existingItem =
            cart.find(
                function (item) {

                    return Number(
                        item.productId
                    ) === Number(
                        product.ProductID
                    );

                }
            );


        // Increase quantity
        if (existingItem) {

            existingItem.quantity =
                Number(
                    existingItem.quantity
                ) + 1;

        }

        // Add new product
        else {

            cart.push({

                productId:
                    product.ProductID,

                name:
                    cleanTitle(
                        product.Title
                    ),

                price:
                    Number(
                        product.Price
                    ),

                image:
                    product.ImageURL,

                quantity:
                    1

            });

        }


        // Save cart
        localStorage.setItem(
            "giftoraCart",
            JSON.stringify(cart)
        );


        // Update cart count
        updateCartCount();


        // Confirmation
        alert(
            cleanTitle(product.Title) +
            " has been added to your cart! 🛒"
        );
    }


    // ============================================================
    // CART COUNT
    // ============================================================

    function updateCartCount() {

        const cartCount =
            document.querySelector(
                ".cart-count"
            );


        if (!cartCount) {
            return;
        }


        let cart = [];


        try {

            const savedCart =
                localStorage.getItem(
                    "giftoraCart"
                );


            cart =
                savedCart
                    ? JSON.parse(savedCart)
                    : [];


            if (!Array.isArray(cart)) {
                cart = [];
            }

        } catch (error) {

            cart = [];
        }


        // Total quantity
        const totalQuantity =
            cart.reduce(
                function (
                    total,
                    item
                ) {

                    const quantity =
                        Number(
                            item.quantity
                        );


                    if (
                        Number.isInteger(
                            quantity
                        ) &&
                        quantity > 0
                    ) {

                        return total +
                            quantity;
                    }


                    return total;

                },
                0
            );


        cartCount.textContent =
            totalQuantity;
    }


    // ============================================================
    // INITIALIZE
    // ============================================================

    updateCartCount();

    loadProducts();

});