
 // ============================================================
 // GIFTORA - PRODUCT LISTING
 // ============================================================

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


    // Check required elements
    if (!productGrid || !noResults || !searchInput) {
        console.error(
            "GIFTORA: Required product listing elements were not found."
        );
        return;
    }


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

        if (!imageURL) {
            return "Logo.png";
        }

        let imagePath = String(imageURL).trim();

        // Remove starting slash
        imagePath = imagePath.replace(/^\/+/, "");

        // Keep existing shop_images path
        if (imagePath.startsWith("shop_images/")) {
            return imagePath;
        }

        // Add shop_images folder to the filename
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

            productGrid.innerHTML = `
                <div class="loading-message">
                    <p>Loading our beautiful gifts... 🎁</p>
                </div>
            `;

            const response = await fetch(
                API_URL + "?t=" + Date.now(),
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to load products. HTTP status: " +
                    response.status
                );
            }

            const data = await response.json();

            console.log("Products API response:", data);

            if (!data.success) {
                throw new Error(
                    data.message ||
                    "Unable to load products."
                );
            }

            products = Array.isArray(data.products)
                ? data.products
                : [];

            console.log("Products loaded:", products);

            displayProducts();

        } catch (error) {

            console.error("Product loading error:", error);

            productGrid.innerHTML = `
                <div class="loading-message">
                    <h2>Unable to load products</h2>
                    <p>
                        Please make sure the server is running
                        and try again.
                    </p>
                    <p>Error: ${error.message}</p>
                </div>
            `;

            noResults.style.display = "none";
        }
    }


    // ============================================================
    // DISPLAY PRODUCTS
    // ============================================================

    function displayProducts() {

        const searchText = searchInput.value
            .trim()
            .toLowerCase();

        const filteredProducts = products.filter(
            function (product) {

                const title = cleanTitle(product.Title);

                const description = String(
                    product.Description || ""
                );

                const category = String(
                    product.CategoryName || ""
                );

                const matchesSearch =
                    title.toLowerCase().includes(searchText) ||
                    description.toLowerCase().includes(searchText) ||
                    category.toLowerCase().includes(searchText);

                let matchesCategory = true;

                if (selectedCategory !== "all") {
                    matchesCategory =
                        getCategorySlug(category) === selectedCategory;
                }

                return matchesSearch && matchesCategory;
            }
        );

        productGrid.innerHTML = "";

        if (filteredProducts.length === 0) {
            noResults.style.display = "block";
            return;
        }

        noResults.style.display = "none";

        filteredProducts.forEach(function (product) {

            const card = createProductCard(product);

            productGrid.appendChild(card);
        });
    }


    // ============================================================
    // CREATE PRODUCT CARD
    // ============================================================

    function createProductCard(product) {

        const card = document.createElement("article");
        card.className = "product-card";


        // IMAGE
        const imageContainer = document.createElement("div");
        imageContainer.className = "product-image";

        const image = document.createElement("img");

        image.src = getImagePath(product.ImageURL);
        image.alt = cleanTitle(product.Title);
        image.loading = "lazy";

        image.onerror = function () {

            console.error(
                "Image could not be loaded:",
                image.src,
                "Database ImageURL:",
                product.ImageURL
            );

            image.onerror = null;
            image.src = "Logo.png";
        };

        imageContainer.appendChild(image);


        // PRODUCT INFO
        const info = document.createElement("div");
        info.className = "product-info";


        // CATEGORY
        const category = document.createElement("span");
        category.className = "product-category";
        category.textContent = product.CategoryName || "Gift";


        // TITLE
        const title = document.createElement("h3");
        title.className = "product-title";
        title.textContent = cleanTitle(product.Title);


        // DESCRIPTION
        const description = document.createElement("p");
        description.className = "product-description";
        description.textContent = product.Description || "";


        // PRICE
        const price = document.createElement("span");
        price.className = "product-price";
        price.textContent = formatMoney(product.Price);


        // BUTTON CONTAINER
        const actions = document.createElement("div");
        actions.className = "product-actions";


        // ========================================================
        // VIEW PRODUCT BUTTON - CORRECTED
        // ========================================================

        const viewButton = document.createElement("button");

        viewButton.className = "view-product-btn";
        viewButton.type = "button";
        viewButton.textContent = "View Product";

        viewButton.addEventListener("click", function () {

            const productID = product.ProductID;

            if (
                productID === undefined ||
                productID === null ||
                String(productID).trim() === ""
            ) {
                console.error(
                    "GIFTORA: Product ID is missing.",
                    product
                );

                alert("Unable to open this product. Product ID is missing.");
                return;
            }

            const targetURL =
                "/giftora/prduct_details.html?id=" +
                encodeURIComponent(productID);

            console.log("Opening product details:", targetURL);

            window.location.href = targetURL;
        });


        // ========================================================
        // ADD TO CART BUTTON
        // ========================================================

        const cartButton = document.createElement("button");

        cartButton.className = "add-cart-btn";
        cartButton.type = "button";
        cartButton.textContent = "Add to Cart";

        cartButton.addEventListener("click", function () {

            addToCart(product);
        });


        // ADD BUTTONS
        actions.appendChild(viewButton);
        actions.appendChild(cartButton);


        // BUILD PRODUCT CARD
        info.appendChild(category);
        info.appendChild(title);
        info.appendChild(description);
        info.appendChild(price);
        info.appendChild(actions);

        card.appendChild(imageContainer);
        card.appendChild(info);

        return card;
    }


    // ============================================================
    // SEARCH
    // ============================================================

    searchInput.addEventListener("input", function () {

        displayProducts();
    });


    // ============================================================
    // CATEGORY FILTER
    // ============================================================

    filterButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            filterButtons.forEach(function (btn) {

                btn.classList.remove("active");
            });

            button.classList.add("active");

            selectedCategory = button.dataset.category || "all";

            displayProducts();
        });
    });


    // ============================================================
    // ADD TO CART
    // ============================================================

    function addToCart(product) {

        let cart = [];

        try {

            const savedCart = localStorage.getItem("giftoraCart");

            if (savedCart) {
                cart = JSON.parse(savedCart);
            }

            if (!Array.isArray(cart)) {
                cart = [];
            }

        } catch (error) {

            console.error("Cart loading error:", error);
            cart = [];
        }


        // FIND EXISTING PRODUCT
        const existingItem = cart.find(function (item) {

            return Number(item.productId) ===
                Number(product.ProductID);
        });


        // INCREASE QUANTITY
        if (existingItem) {

            existingItem.quantity =
                (Number(existingItem.quantity) || 0) + 1;

        } else {

            // ADD NEW PRODUCT
            cart.push({

                productId: product.ProductID,

                name: cleanTitle(product.Title),

                price: Number(product.Price),

                image: product.ImageURL,

                quantity: 1
            });
        }


        // SAVE CART
        try {

            localStorage.setItem(
                "giftoraCart",
                JSON.stringify(cart)
            );

        } catch (error) {

            console.error("Unable to save cart:", error);

            alert("Unable to save your cart. Please try again.");
            return;
        }


        // UPDATE CART COUNT
        updateCartCount();


        // CONFIRMATION
        alert(
            cleanTitle(product.Title) +
            " has been added to your cart! 🛒"
        );
    }


    // ============================================================
    // CART COUNT
    // ============================================================

    function updateCartCount() {

        const cartCount = document.querySelector(".cart-count");

        if (!cartCount) {
            return;
        }

        let cart = [];

        try {

            const savedCart = localStorage.getItem("giftoraCart");

            cart = savedCart ? JSON.parse(savedCart) : [];

            if (!Array.isArray(cart)) {
                cart = [];
            }

        } catch (error) {

            console.error("Cart count loading error:", error);
            cart = [];
        }


        // CALCULATE TOTAL QUANTITY
        const totalQuantity = cart.reduce(
            function (total, item) {

                const quantity = Number(item.quantity);

                if (
                    Number.isInteger(quantity) &&
                    quantity > 0
                ) {
                    return total + quantity;
                }

                return total;
            },
            0
        );

        cartCount.textContent = totalQuantity;
    }


    // ============================================================
    // INITIALIZE
    // ============================================================

    console.log("GIFTORA product_listing.js loaded - corrected version");

    updateCartCount();

    loadProducts();

});