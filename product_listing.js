document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // ============================================================
    // GIFTORA - PRODUCT LISTING WITH STOCK MANAGEMENT
    // ============================================================

    const CART_KEY = "giftoraCart";
    const API_URL = "backend/api/products.php";

    const productGrid = document.getElementById("productGrid");
    const noResults = document.getElementById("noResults");
    const searchInput = document.getElementById("searchInput");
    const filterButtons = document.querySelectorAll(".filter-btn");

    let products = [];
    let selectedCategory = "all";

    // ============================================================
    // CHECK REQUIRED ELEMENTS
    // ============================================================

    if (!productGrid || !noResults || !searchInput) {
        console.error(
            "GIFTORA: Required product listing elements were not found."
        );
        return;
    }

    // ============================================================
    // HELPER FUNCTIONS
    // ============================================================

    function cleanTitle(title) {
        if (!title) {
            return "Untitled Product";
        }

        return String(title).replace(/^#+\s*/, "").trim();
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
        if (
            !product ||
            product.StockQuantity === null ||
            product.StockQuantity === undefined ||
            String(product.StockQuantity).trim() === ""
        ) {
            return null;
        }

        const stock = Number(product.StockQuantity);

        if (!Number.isInteger(stock) || stock < 0) {
            return null;
        }

        return stock;
    }

    function getImagePath(imageURL) {
        if (!imageURL) {
            return "Logo.png";
        }

        let imagePath = String(imageURL).trim();

        if (/^(https?:\/\/|data:)/i.test(imagePath)) {
            return imagePath;
        }

        imagePath = imagePath.replace(/^\/+/, "");

        if (imagePath.startsWith("giftora/shop_images/")) {
            return imagePath.substring("giftora/".length);
        }

        if (imagePath.startsWith("shop_images/")) {
            return imagePath;
        }

        return "shop_images/" + imagePath;
    }

    function getCart() {
        try {
            const savedCart = localStorage.getItem(CART_KEY);

            if (!savedCart) {
                return [];
            }

            const cart = JSON.parse(savedCart);

            return Array.isArray(cart) ? cart : [];
        } catch (error) {
            console.error("Could not read cart:", error);
            return [];
        }
    }

    function saveCart(cart) {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
            return true;
        } catch (error) {
            console.error("Could not save cart:", error);
            alert("Unable to save your cart. Please try again.");
            return false;
        }
    }

    // ============================================================
    // CATEGORY FILTERING
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

    function categoryMatches(productCategory, filterCategory) {
        const category = getCategorySlug(productCategory);
        const filter = getCategorySlug(filterCategory);

        if (filter === "all") {
            return true;
        }

        const categoryAliases = {
            cards: ["greetingcards"],
            keychains: ["resinkeychains"],
            giftboxes: ["giftboxes"],
            candles: ["candles"],
            wood: ["woodengifts"],
            frames: ["photogifts", "photoframes"],
            cakes: ["cakes"]
        };

        if (categoryAliases[filter]) {
            return categoryAliases[filter].includes(category);
        }

        return category === filter;
    }

    // ============================================================
    // LOAD PRODUCTS
    // ============================================================

    async function loadProducts() {
        try {
            productGrid.innerHTML = "";

            const loading = document.createElement("div");
            loading.className = "loading-message";

            const loadingText = document.createElement("p");
            loadingText.textContent = "Loading our beautiful gifts... 🎁";

            loading.appendChild(loadingText);
            productGrid.appendChild(loading);

            noResults.style.display = "none";

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
                    "Failed to load products. HTTP " + response.status
                );
            }

            const data = await response.json();

            console.log("GIFTORA products API response:", data);

            if (!data.success || !Array.isArray(data.products)) {
                throw new Error(
                    data.message || "Invalid product API response."
                );
            }

            products = data.products;

            console.log("Products loaded:", products.length);

            displayProducts();

        } catch (error) {
            console.error("Product loading error:", error);

            productGrid.innerHTML = "";

            const message = document.createElement("div");
            message.className = "loading-message";

            const heading = document.createElement("h2");
            heading.textContent = "Unable to load products";

            const description = document.createElement("p");
            description.textContent =
                "Please check your server and try again.";

            message.appendChild(heading);
            message.appendChild(description);
            productGrid.appendChild(message);

            noResults.style.display = "none";
        }
    }

    // ============================================================
    // DISPLAY FILTERED PRODUCTS
    // ============================================================

    function displayProducts() {
        const searchText = searchInput.value.trim().toLowerCase();

        const filteredProducts = products.filter(function (product) {
            const title = cleanTitle(product.Title);

            const description = String(product.Description || "");
            const category = String(product.CategoryName || "");

            const matchesSearch =
                title.toLowerCase().includes(searchText) ||
                description.toLowerCase().includes(searchText) ||
                category.toLowerCase().includes(searchText);

            const matchesCategory =
                selectedCategory === "all" ||
                categoryMatches(category, selectedCategory);

            return matchesSearch && matchesCategory;
        });

        productGrid.innerHTML = "";

        if (filteredProducts.length === 0) {
            noResults.style.display = "block";
            return;
        }

        noResults.style.display = "none";

        filteredProducts.forEach(function (product) {
            productGrid.appendChild(createProductCard(product));
        });
    }

    // ============================================================
    // CREATE PRODUCT CARD
    // ============================================================

    function createProductCard(product) {
        const card = document.createElement("article");
        card.className = "product-card";

        // Product image.
        const imageContainer = document.createElement("div");
        imageContainer.className = "product-image";

        const image = document.createElement("img");
        image.src = getImagePath(product.ImageURL);
        image.alt = cleanTitle(product.Title);
        image.loading = "lazy";

        image.onerror = function () {
            console.error("Product image could not be loaded:", image.src);

            this.onerror = null;
            this.src = "Logo.png";
        };

        imageContainer.appendChild(image);

        const favoriteButton = document.createElement("button");
        favoriteButton.className = "product-favorite-btn";
        favoriteButton.type = "button";
        if (window.GiftoraFavorites) {
            window.GiftoraFavorites.bindButton(favoriteButton, product);
        }
        imageContainer.appendChild(favoriteButton);

        // Product information.
        const info = document.createElement("div");
        info.className = "product-info";

        const category = document.createElement("span");
        category.className = "product-category";
        category.textContent = product.CategoryName || "Gift";

        const title = document.createElement("h3");
        title.className = "product-title";
        title.textContent = cleanTitle(product.Title);

        const description = document.createElement("p");
        description.className = "product-description";
        description.textContent = product.Description || "";

        const price = document.createElement("span");
        price.className = "product-price";
        price.textContent = formatMoney(product.Price);

        // Stock display.
        const stock = document.createElement("p");
        stock.className = "product-stock";

        const stockQuantity = getStock(product);

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

        // Action buttons.
        const actions = document.createElement("div");
        actions.className = "product-actions";

        const viewButton = document.createElement("button");
        viewButton.className = "view-product-btn";
        viewButton.type = "button";
        viewButton.textContent = "View Product";

        viewButton.addEventListener("click", function () {
            const id = product.ProductID;

            if (
                id === undefined ||
                id === null ||
                String(id).trim() === ""
            ) {
                console.error("GIFTORA: Product ID is missing.", product);
                alert("Unable to open this product.");
                return;
            }

            window.location.href =
                "prduct_details.html?id=" +
                encodeURIComponent(id);
        });

        const cartButton = document.createElement("button");
        cartButton.className = "add-cart-btn";
        cartButton.type = "button";
        const isGiftBox =
            getCategorySlug(product.CategoryName) === "giftboxes";
        cartButton.textContent = isGiftBox
            ? "Choose Box Items"
            : "Add to Cart";

        if (stockQuantity === null) {
            cartButton.disabled = true;
            cartButton.textContent = "Stock Unavailable";
            cartButton.classList.add("disabled-cart-btn");
        } else if (stockQuantity === 0) {
            cartButton.disabled = true;
            cartButton.textContent = "Out of Stock";
            cartButton.classList.add("disabled-cart-btn");
        }

        cartButton.addEventListener("click", function () {
            if (isGiftBox) {
                window.location.href =
                    "prduct_details.html?id=" +
                    encodeURIComponent(product.ProductID);
                return;
            }

            addToCart(product);
        });

        // Assemble the card.
        actions.appendChild(viewButton);
        actions.appendChild(cartButton);

        info.appendChild(category);
        info.appendChild(title);
        info.appendChild(description);
        info.appendChild(price);
        info.appendChild(stock);
        info.appendChild(actions);

        card.appendChild(imageContainer);
        card.appendChild(info);

        return card;
    }

    // ============================================================
    // ADD PRODUCT TO CART
    // ============================================================

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

        const productID = Number(product.ProductID);

        if (!Number.isInteger(productID) || productID <= 0) {
            alert("Unable to identify this product.");
            return;
        }

        const cart = getCart();

        const existingItem = cart.find(function (item) {
            return Number(item.productId) === productID;
        });

        const currentQuantity = existingItem
            ? Number(existingItem.quantity)
            : 0;

        const safeCurrentQuantity =
            Number.isInteger(currentQuantity) && currentQuantity > 0
                ? currentQuantity
                : 0;

        // Check the combined cart quantity, not just one new item.
        if (safeCurrentQuantity + 1 > stockQuantity) {
            alert(
                "Sorry! Only " + stockQuantity +
                " unit(s) of this product are available. " +
                "You already have " + safeCurrentQuantity +
                " in your cart."
            );
            return;
        }

        if (existingItem) {
            existingItem.quantity = safeCurrentQuantity + 1;
            existingItem.stockQuantity = stockQuantity;
        } else {
            cart.push({
                productId: productID,
                name: cleanTitle(product.Title),
                price: Number(product.Price),
                image: product.ImageURL || "",
                quantity: 1,
                stockQuantity: stockQuantity,
                selected: true,
                personalizedName: "",
                message: ""
            });
        }

        if (!saveCart(cart)) {
            return;
        }

        updateCartCount();

        alert(
            cleanTitle(product.Title) +
            " has been added to your cart! 🛒"
        );
    }

    // ============================================================
    // UPDATE CART COUNT
    // ============================================================

    function updateCartCount() {
        const cartCountElements =
            document.querySelectorAll(".cart-count");

        const cart = getCart();

        const totalQuantity = cart.reduce(function (total, item) {
            const quantity = Number(item.quantity);

            if (Number.isInteger(quantity) && quantity > 0) {
                return total + quantity;
            }

            return total;
        }, 0);

        cartCountElements.forEach(function (element) {
            element.textContent = totalQuantity;
        });
    }

    // ============================================================
    // SEARCH
    // ============================================================

    searchInput.addEventListener("input", displayProducts);

    // ============================================================
    // CATEGORY FILTER BUTTONS
    // ============================================================

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            filterButtons.forEach(function (item) {
                item.classList.remove("active");
            });

            button.classList.add("active");

            selectedCategory = button.dataset.category || "all";

            console.log("Selected category:", selectedCategory);

            displayProducts();
        });
    });

    // ============================================================
    // INITIALIZE
    // ============================================================

    console.log("GIFTORA product listing initialized.");

    updateCartCount();
    loadProducts();
});
