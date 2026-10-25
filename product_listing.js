
<<<<<<< Updated upstream
 // ============================================================
 // GIFTORA - PRODUCT LISTING
 // ============================================================
=======
/* ============================================================
   GIFTORA - PRODUCT LISTING WITH STOCK MANAGEMENT
   ============================================================ */
>>>>>>> Stashed changes

document.addEventListener("DOMContentLoaded", function () {
    const productGrid = document.getElementById("productGrid");
    const noResults = document.getElementById("noResults");
    const searchInput = document.getElementById("searchInput");
    const filterButtons = document.querySelectorAll(".filter-btn");

<<<<<<< Updated upstream
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

=======
    const CART_KEY = "giftoraCart";
>>>>>>> Stashed changes
    const API_URL = "backend/api/products.php";

    let products = [];
    let selectedCategory = "all";

    if (!productGrid || !noResults || !searchInput) {
        console.error(
            "GIFTORA: Required product listing elements were not found."
        );
        return;
    }

    /* ========================================================
       HELPER FUNCTIONS
       ======================================================== */

    function cleanTitle(title) {
        if (!title) return "Untitled Product";

        return String(title)
            .replace(/^#+\s*/, "")
            .trim();
    }

    function formatMoney(amount) {
        const number = Number(amount);

        if (!Number.isFinite(number)) {
            return "LKR 0.00";
        }

        return "LKR " + number.toLocaleString("en-LK", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function getStock(product) {
        const stock = Number(product.StockQuantity);

        if (
            product.StockQuantity === null ||
            product.StockQuantity === undefined ||
            product.StockQuantity === "" ||
            !Number.isInteger(stock) ||
            stock < 0
        ) {
            return null;
        }

        return stock;
    }

    function getImagePath(imageURL) {
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
        if (!imageURL) {
            return "Logo.png";
        }

        let imagePath = String(imageURL).trim();

<<<<<<< Updated upstream
        // Remove starting slash
        imagePath = imagePath.replace(/^\/+/, "");

        // Keep existing shop_images path
        if (imagePath.startsWith("shop_images/")) {
            return imagePath;
        }

        // Add shop_images folder to the filename
=======
        if (/^https?:\/\//i.test(imagePath)) {
            return imagePath;
        }

        imagePath = imagePath.replace(/^\/+/, "");

        if (imagePath.startsWith("shop_images/")) {
            return imagePath;
        }

>>>>>>> Stashed changes
        return "shop_images/" + imagePath;
    }

    function getCategorySlug(categoryName) {
        if (!categoryName) return "";

        return String(categoryName)
            .toLowerCase()
            .trim()
            .replace(/&/g, "and")
            .replace(/[^a-z0-9]+/g, "");
    }

    /* ========================================================
       LOAD PRODUCTS FROM DATABASE API
       ======================================================== */

    async function loadProducts() {
        try {
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
            productGrid.innerHTML = `
                <div class="loading-message">
                    <p>Loading our beautiful gifts... 🎁</p>
                </div>
            `;

<<<<<<< Updated upstream
=======
            noResults.style.display = "none";

>>>>>>> Stashed changes
            const response = await fetch(
                API_URL + "?t=" + Date.now(),
                {
                    method: "GET",
                    cache: "no-store",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to load products. HTTP status: " +
                    response.status
                );
            }

            const data = await response.json();

<<<<<<< Updated upstream
            console.log("Products API response:", data);
=======
            console.log("GIFTORA products API response:", data);
>>>>>>> Stashed changes

            if (!data.success) {
                throw new Error(
                    data.message || "Unable to load products."
                );
            }

            products = Array.isArray(data.products)
                ? data.products
                : [];

            console.log("Products loaded:", products);

            displayProducts();

        } catch (error) {
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
            console.error("Product loading error:", error);

            productGrid.innerHTML = `
                <div class="loading-message">
                    <h2>Unable to load products</h2>
                    <p>
<<<<<<< Updated upstream
                        Please make sure the server is running
                        and try again.
                    </p>
                    <p>Error: ${error.message}</p>
=======
                        Please check your server and database connection.
                    </p>
                    <p>${error.message}</p>
>>>>>>> Stashed changes
                </div>
            `;

            noResults.style.display = "none";
        }
    }

    /* ========================================================
       DISPLAY PRODUCTS AND APPLY FILTERS
       ======================================================== */

    function displayProducts() {
        const searchText = searchInput.value
            .trim()
            .toLowerCase();

<<<<<<< Updated upstream
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
=======
        const filteredProducts = products.filter(function (product) {
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
        });
>>>>>>> Stashed changes

        productGrid.innerHTML = "";

        if (filteredProducts.length === 0) {
            noResults.style.display = "block";
            return;
        }

        noResults.style.display = "none";

        filteredProducts.forEach(function (product) {
<<<<<<< Updated upstream

            const card = createProductCard(product);

            productGrid.appendChild(card);
=======
            productGrid.appendChild(createProductCard(product));
>>>>>>> Stashed changes
        });
    }

    /* ========================================================
       CREATE PRODUCT CARD
       ======================================================== */

    function createProductCard(product) {
        const card = document.createElement("article");
        card.className = "product-card";

<<<<<<< Updated upstream
        const card = document.createElement("article");
        card.className = "product-card";
=======
        /* Product image */

        const imageContainer = document.createElement("div");
        imageContainer.className = "product-image";
>>>>>>> Stashed changes

        const image = document.createElement("img");
        image.src = getImagePath(product.ImageURL);
        image.alt = cleanTitle(product.Title);
        image.loading = "lazy";

<<<<<<< Updated upstream
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
=======
        image.onerror = function () {
            console.error(
                "Product image could not be loaded:",
                image.src
>>>>>>> Stashed changes
            );

            image.onerror = null;
            image.src = "Logo.png";
        };

        imageContainer.appendChild(image);

        /* Product information */

<<<<<<< Updated upstream
        // PRODUCT INFO
        const info = document.createElement("div");
        info.className = "product-info";
=======
        const info = document.createElement("div");
        info.className = "product-info";

        const category = document.createElement("span");
        category.className = "product-category";
        category.textContent = product.CategoryName || "Gift";

        const title = document.createElement("h3");
        title.className = "product-title";
        title.textContent = cleanTitle(product.Title);
>>>>>>> Stashed changes

        const description = document.createElement("p");
        description.className = "product-description";
        description.textContent = product.Description || "";

<<<<<<< Updated upstream
        // CATEGORY
        const category = document.createElement("span");
        category.className = "product-category";
        category.textContent = product.CategoryName || "Gift";
=======
        const price = document.createElement("span");
        price.className = "product-price";
        price.textContent = formatMoney(product.Price);

        /* Stock information */

        const stock = document.createElement("p");
        stock.className = "product-stock";
>>>>>>> Stashed changes

        const stockQuantity = getStock(product);

<<<<<<< Updated upstream
        // TITLE
        const title = document.createElement("h3");
        title.className = "product-title";
        title.textContent = cleanTitle(product.Title);
=======
        if (stockQuantity === null) {
            stock.textContent = "Stock unavailable";
            stock.classList.add("stock-unknown");
        } else if (stockQuantity === 0) {
            stock.textContent = "Out of Stock";
            stock.classList.add("out-of-stock");
        } else {
            stock.textContent =
                "In Stock: " + stockQuantity;

            stock.classList.add("in-stock");
        }

        /* Product action buttons */

        const actions = document.createElement("div");
        actions.className = "product-actions";

        const viewButton = document.createElement("button");
        viewButton.className = "view-product-btn";
        viewButton.type = "button";
        viewButton.textContent = "View Product";
>>>>>>> Stashed changes

        viewButton.addEventListener("click", function () {
            const productID = product.ProductID;

<<<<<<< Updated upstream
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

=======
>>>>>>> Stashed changes
            if (
                productID === undefined ||
                productID === null ||
                String(productID).trim() === ""
            ) {
                console.error(
                    "GIFTORA: Product ID is missing.",
                    product
                );

<<<<<<< Updated upstream
                alert("Unable to open this product. Product ID is missing.");
                return;
            }

            const targetURL =
                "/giftora/prduct_details.html?id=" +
                encodeURIComponent(productID);

            console.log("Opening product details:", targetURL);

            window.location.href = targetURL;
        });
=======
                alert("Unable to open this product.");
                return;
            }
>>>>>>> Stashed changes

            /*
             * Keep your existing product-details filename here.
             * Correct the filename if your actual HTML file differs.
             */
            const targetURL =
                "/giftora/prduct_details.html?id=" +
                encodeURIComponent(productID);

            window.location.href = targetURL;
        });

        const cartButton = document.createElement("button");
<<<<<<< Updated upstream

        cartButton.className = "add-cart-btn";
        cartButton.type = "button";
        cartButton.textContent = "Add to Cart";

        cartButton.addEventListener("click", function () {

            addToCart(product);
        });
=======
        cartButton.className = "add-cart-btn";
        cartButton.type = "button";
        cartButton.textContent = "Add to Cart";

        if (stockQuantity === 0) {
            cartButton.disabled = true;
            cartButton.textContent = "Out of Stock";
            cartButton.classList.add("disabled-cart-btn");
        } else if (stockQuantity === null) {
            cartButton.disabled = true;
            cartButton.textContent = "Stock Unavailable";
            cartButton.classList.add("disabled-cart-btn");
        }
>>>>>>> Stashed changes

        cartButton.addEventListener("click", function () {
            addToCart(product);
        });

<<<<<<< Updated upstream
        // ADD BUTTONS
        actions.appendChild(viewButton);
        actions.appendChild(cartButton);
=======
        /* Assemble card */
>>>>>>> Stashed changes

        actions.appendChild(viewButton);
        actions.appendChild(cartButton);

<<<<<<< Updated upstream
        // BUILD PRODUCT CARD
=======
>>>>>>> Stashed changes
        info.appendChild(category);
        info.appendChild(title);
        info.appendChild(description);
        info.appendChild(price);
<<<<<<< Updated upstream
=======
        info.appendChild(stock);
>>>>>>> Stashed changes
        info.appendChild(actions);

        card.appendChild(imageContainer);
        card.appendChild(info);

        return card;
    }

<<<<<<< Updated upstream

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
=======
    /* ========================================================
       ADD PRODUCT TO CART
       ======================================================== */
>>>>>>> Stashed changes

    function addToCart(product) {
        const stockQuantity = getStock(product);

        if (stockQuantity === null) {
            alert(
                "We couldn't verify the stock for this product. " +
                "Please try again later."
            );
            return;
        }

        if (stockQuantity <= 0) {
            alert("Sorry, this product is out of stock.");
            return;
        }

        let cart = [];

        try {
            const savedCart = localStorage.getItem(CART_KEY);

<<<<<<< Updated upstream
            const savedCart = localStorage.getItem("giftoraCart");

            if (savedCart) {
                cart = JSON.parse(savedCart);
            }
=======
            cart = savedCart ? JSON.parse(savedCart) : [];
>>>>>>> Stashed changes

            if (!Array.isArray(cart)) {
                cart = [];
            }
        } catch (error) {
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
            console.error("Cart loading error:", error);
            cart = [];
        }

        const existingItem = cart.find(function (item) {
            return Number(item.productId) ===
                Number(product.ProductID);
        });

<<<<<<< Updated upstream
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
=======
        const currentQuantity = existingItem
            ? Number(existingItem.quantity) || 0
            : 0;

        if (currentQuantity + 1 > stockQuantity) {
            alert(
                "Sorry! Only " + stockQuantity +
                " unit(s) of this product are available."
            );
            return;
        }

        if (existingItem) {
            existingItem.quantity = currentQuantity + 1;
            existingItem.stockQuantity = stockQuantity;
        } else {
            cart.push({
                productId: product.ProductID,
                name: cleanTitle(product.Title),
                price: Number(product.Price),
                image: product.ImageURL,
                quantity: 1,
                stockQuantity: stockQuantity,
                selected: true
>>>>>>> Stashed changes
            });
        }

        try {
            localStorage.setItem(
                CART_KEY,
                JSON.stringify(cart)
            );
        } catch (error) {
            console.error("Unable to save cart:", error);

<<<<<<< Updated upstream
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
=======
            alert(
                "Unable to save your cart. Please try again."
            );
            return;
        }

        updateCartCount();

>>>>>>> Stashed changes
        alert(
            cleanTitle(product.Title) +
            " has been added to your cart! 🛒"
        );
    }

    /* ========================================================
       UPDATE CART COUNT
       ======================================================== */

    function updateCartCount() {
<<<<<<< Updated upstream

        const cartCount = document.querySelector(".cart-count");

        if (!cartCount) {
            return;
        }
=======
        const cartCount = document.querySelectorAll(".cart-count");
>>>>>>> Stashed changes

        let cart = [];

        try {
<<<<<<< Updated upstream

            const savedCart = localStorage.getItem("giftoraCart");

=======
            const savedCart = localStorage.getItem(CART_KEY);
>>>>>>> Stashed changes
            cart = savedCart ? JSON.parse(savedCart) : [];

            if (!Array.isArray(cart)) {
                cart = [];
            }
        } catch (error) {
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
            console.error("Cart count loading error:", error);
            cart = [];
        }

        const totalQuantity = cart.reduce(function (total, item) {
            const quantity = Number(item.quantity);

<<<<<<< Updated upstream
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
=======
            if (
                Number.isInteger(quantity) &&
                quantity > 0
            ) {
                return total + quantity;
            }

            return total;
        }, 0);

        cartCount.forEach(function (element) {
            element.textContent = totalQuantity;
        });
>>>>>>> Stashed changes
    }

    /* ========================================================
       SEARCH AND CATEGORY FILTERS
       ======================================================== */

    searchInput.addEventListener("input", displayProducts);

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            filterButtons.forEach(function (btn) {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            selectedCategory =
                button.dataset.category || "all";

            displayProducts();
        });
    });

    /* ========================================================
       INITIALIZE PAGE
       ======================================================== */

    console.log(
        "GIFTORA product listing with stock management loaded."
    );

    console.log("GIFTORA product_listing.js loaded - corrected version");

    updateCartCount();
    loadProducts();
});
