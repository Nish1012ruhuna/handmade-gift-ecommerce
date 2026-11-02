document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // ============================================================
    // GIFTORA - PRODUCT DETAILS
    // ============================================================

    const CART_KEY = "giftoraCart";
    const API_URL = "backend/api/products.php";

    const urlParams = new URLSearchParams(window.location.search);
    const productID = urlParams.get("id");

    // ============================================================
    // HTML ELEMENTS
    // ============================================================

    const mainImage = document.getElementById("mainProductImage");
    const productTitle = document.querySelector(".product-info h1");
    const productCategory = document.querySelector(".product-category");
    const productPrice = document.querySelector(".price");
    const shortDescription = document.querySelector(".short-description");

    const quantityDisplay = document.getElementById("quantity");
    const decreaseButton = document.getElementById("decrease");
    const increaseButton = document.getElementById("increase");
    const addToCartButton = document.getElementById("addToCart");
    const giftBoxBuilder = document.getElementById("giftBoxBuilder");
    const giftBoxAddonSearch = document.getElementById("giftBoxAddonSearch");
    const giftBoxAddonList = document.getElementById("giftBoxAddonList");
    const giftBoxAddonStatus = document.getElementById("giftBoxAddonStatus");
    const giftBoxAddonCount = document.getElementById("giftBoxAddonCount");
    const giftBoxAddonTotal = document.getElementById("giftBoxAddonTotal");

    const wishlistButton = document.getElementById("wishlistButton");
    const imageWishlist = document.querySelector(".image-wishlist");
    const thumbnailContainer = document.querySelector(".thumbnail-container");

    const relatedGrid = document.getElementById("relatedGrid");

    // ============================================================
    // VARIABLES
    // ============================================================

    let product = null;
    let quantity = 1;
    let giftBoxAddonCatalog = [];
    let selectedGiftBoxAddonIds = new Set();
    let giftBoxOptionsState = "not-applicable";

    // ============================================================
    // HELPERS
    // ============================================================

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

    function getStock(item) {
        if (
            !item ||
            item.StockQuantity === null ||
            item.StockQuantity === undefined ||
            String(item.StockQuantity).trim() === ""
        ) {
            return null;
        }

        const stock = Number(item.StockQuantity);

        if (!Number.isInteger(stock) || stock < 0) {
            return null;
        }

        return stock;
    }

    function isCustomizable(item) {
        if (!item) {
            return false;
        }

        const value = item.Customizable;

        return value === true ||
            Number(value) === 1 ||
            String(value).toLowerCase() === "true";
    }

    function isGiftBox(item) {
        const category = String(item && item.CategoryName || "")
            .toLowerCase()
            .replace(/[^a-z]/g, "");

        return category === "giftbox" || category === "giftboxes";
    }

    function getSelectedGiftBoxAddons() {
        return giftBoxAddonCatalog.filter(function (addon) {
            return selectedGiftBoxAddonIds.has(Number(addon.id));
        });
    }

    function updateGiftBoxPrice() {
        if (!product || !productPrice) {
            return;
        }

        const addonTotal = getSelectedGiftBoxAddons().reduce(
            function (total, addon) {
                return total + Number(addon.price);
            },
            0
        );

        productPrice.textContent = formatMoney(
            Number(product.Price) + addonTotal
        );

        if (giftBoxAddonCount) {
            giftBoxAddonCount.textContent =
                String(selectedGiftBoxAddonIds.size);
        }

        if (giftBoxAddonTotal) {
            giftBoxAddonTotal.textContent = formatMoney(addonTotal);
        }
    }

    function filterGiftBoxAddons() {
        if (!giftBoxAddonList || !giftBoxAddonSearch) {
            return;
        }

        const query = giftBoxAddonSearch.value.trim().toLowerCase();

        giftBoxAddonList.querySelectorAll(".gift-box-addon").forEach(
            function (option) {
                option.hidden = !option.dataset.search.includes(query);
            }
        );
    }

    async function loadGiftBoxAddons() {
        if (!giftBoxBuilder || !isGiftBox(product)) {
            giftBoxOptionsState = "not-applicable";
            if (giftBoxBuilder) {
                giftBoxBuilder.hidden = true;
            }
            updateStock();
            return;
        }

        giftBoxBuilder.hidden = false;
        giftBoxOptionsState = "loading";
        giftBoxAddonStatus.textContent = "Loading gift-box items...";
        giftBoxAddonList.replaceChildren();
        updateStock();

        try {
            const response = await fetch(
                "backend/api/gift_box_addons.php",
                {
                    method: "GET",
                    cache: "no-store",
                    headers: { "Accept": "application/json" }
                }
            );
            const data = await response.json();

            if (
                !response.ok ||
                !data.success ||
                !Array.isArray(data.addons) ||
                data.addons.length === 0
            ) {
                throw new Error(
                    data.message || "Gift-box items are currently unavailable."
                );
            }

            giftBoxAddonCatalog = data.addons;
            giftBoxAddonStatus.textContent =
                (data.samplePrices
                    ? "Sample catalog: "
                    : "") +
                giftBoxAddonCatalog.length +
                " items available. Select any items to add them to your box.";

            giftBoxAddonCatalog.forEach(function (addon) {
                const label = document.createElement("label");
                label.className = "gift-box-addon";
                label.dataset.search =
                    (addon.name + " " + addon.category).toLowerCase();

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.value = String(addon.id);
                checkbox.addEventListener("change", function () {
                    const id = Number(addon.id);
                    if (checkbox.checked) {
                        selectedGiftBoxAddonIds.add(id);
                    } else {
                        selectedGiftBoxAddonIds.delete(id);
                    }
                    updateGiftBoxPrice();
                });

                const details = document.createElement("span");
                const name = document.createElement("span");
                name.textContent = addon.name + " · " + addon.category;

                const price = document.createElement("strong");
                price.textContent = formatMoney(addon.price);

                details.append(name, price);
                label.append(checkbox, details);
                giftBoxAddonList.appendChild(label);
            });

            giftBoxOptionsState = "ready";
            updateGiftBoxPrice();
            filterGiftBoxAddons();
            updateStock();
        } catch (error) {
            console.error("Unable to load gift-box items:", error);
            giftBoxAddonStatus.textContent =
                "We could not load gift-box items. Please refresh the page to try again.";
            giftBoxOptionsState = "error";
            updateStock();
        }
    }

    function getImagePath(imageURL) {
        if (!imageURL) {
            return "Logo.png";
        }

        let image = String(imageURL).trim();

        if (/^(https?:\/\/|data:)/i.test(image)) {
            return image;
        }

        image = image.replace(/^\/+/, "");

        if (image.startsWith("giftora/shop_images/")) {
            return image.substring("giftora/".length);
        }

        if (image.startsWith("shop_images/")) {
            return image;
        }

        return "shop_images/" + image;
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

    function showError(message) {
        console.error("GIFTORA:", message);

        if (productTitle) {
            productTitle.textContent = "Product unavailable";
        }

        if (shortDescription) {
            shortDescription.textContent = message;
        }

        if (addToCartButton) {
            addToCartButton.disabled = true;
            addToCartButton.textContent = "Unavailable";
        }

        if (increaseButton) {
            increaseButton.disabled = true;
        }
    }

    // ============================================================
    // UPDATE CART COUNT
    // ============================================================

    function updateCartCount() {
        const cartCountElements =
            document.querySelectorAll(".cart-count");

        const cart = getCart();

        const totalQuantity = cart.reduce(function (total, item) {
            const itemQuantity = Number(item.quantity);

            if (Number.isInteger(itemQuantity) && itemQuantity > 0) {
                return total + itemQuantity;
            }

            return total;
        }, 0);

        cartCountElements.forEach(function (element) {
            element.textContent = totalQuantity;
        });
    }

    // ============================================================
    // UPDATE STOCK AND BUTTONS
    // ============================================================

    function updateStock() {
        const stockElement = document.querySelector(".stock");

        if (!product) {
            return;
        }

        const stock = getStock(product);
        const available = stock !== null && stock > 0;

        if (stockElement) {
            if (stock === null) {
                stockElement.textContent = "Stock unavailable";
                stockElement.style.color = "#c94b4b";
            } else if (stock === 0) {
                stockElement.textContent = "Out of Stock";
                stockElement.style.color = "#c94b4b";
            } else {
                stockElement.textContent =
                    stock + (stock === 1 ? " item available" : " items available");

                stockElement.style.color = "";
            }
        }

        if (addToCartButton) {
            const waitingForGiftBoxOptions =
                isGiftBox(product) &&
                giftBoxOptionsState !== "ready";
            addToCartButton.disabled =
                !available || waitingForGiftBoxOptions;

            addToCartButton.textContent =
                stock === null
                    ? "Stock Unavailable"
                    : stock === 0
                        ? "Out of Stock"
                        : giftBoxOptionsState === "loading"
                            ? "Loading Box Items..."
                            : giftBoxOptionsState === "error"
                                ? "Options Unavailable"
                                : "Add to Cart";
        }

        if (increaseButton) {
            increaseButton.disabled = !available;
        }

        if (quantity > stock && stock !== null) {
            quantity = Math.max(1, stock);
            updateQuantityDisplay();
        }

        if (stock === null || stock === 0) {
            quantity = 1;
            updateQuantityDisplay();
        }
    }

    // ============================================================
    // UPDATE QUANTITY DISPLAY
    // ============================================================

    function updateQuantityDisplay() {
        if (quantityDisplay) {
            quantityDisplay.textContent = quantity;
        }
    }

    // ============================================================
    // LOAD PRODUCT
    // ============================================================

    async function loadProduct() {
        if (!productID || !/^\d+$/.test(productID)) {
            showError("Please select a valid product.");
            return;
        }

        try {
            const response = await fetch(
                API_URL + "?id=" +
                encodeURIComponent(productID) +
                "&t=" + Date.now(),
                {
                    method: "GET",
                    cache: "no-store",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

            if (!response.ok) {
                throw new Error("HTTP " + response.status);
            }

            const data = await response.json();

            if (!data.success || !data.product) {
                throw new Error(data.message || "Product not found.");
            }

            product = data.product;

            if (
                product.ProductID === undefined ||
                Number(product.ProductID) !== Number(productID)
            ) {
                throw new Error("The requested product could not be verified.");
            }

            displayProduct();
            updateCartCount();

        } catch (error) {
            console.error("Product loading error:", error);

            showError(
                "Unable to load this product. Please refresh the page."
            );
        }
    }

    // ============================================================
    // DISPLAY PRODUCT
    // ============================================================

    function displayProduct() {
        if (!product) {
            return;
        }

        if (productTitle) {
            productTitle.textContent =
                product.Title || "Untitled Product";
        }

        if (productCategory) {
            productCategory.textContent =
                product.CategoryName || "GIFT";
        }

        updateGiftBoxPrice();

        if (shortDescription) {
            shortDescription.textContent =
                product.Description ||
                "A beautiful handmade gift created with love.";
        }

        const imagePath = getImagePath(product.ImageURL);

        if (mainImage) {
            mainImage.src = imagePath;
            mainImage.alt = product.Title || "Product image";

            mainImage.onerror = function () {
                this.onerror = null;
                this.src = "Logo.png";
            };
        }

        createThumbnail(imagePath);
        updateCustomization();
        loadGiftBoxAddons();
        updateStock();

        if (window.GiftoraFavorites) {
            if (wishlistButton) {
                window.GiftoraFavorites.bindButton(wishlistButton, product);
            }

            if (imageWishlist) {
                window.GiftoraFavorites.bindButton(imageWishlist, product);
            }
        }

        document.title = (product.Title || "Product") + " | GIFTORA";
    }

    // ============================================================
    // PRODUCT IMAGE THUMBNAIL
    // ============================================================

    function createThumbnail(imagePath) {
        if (!thumbnailContainer) {
            return;
        }

        thumbnailContainer.innerHTML = "";

        const thumbnail = document.createElement("button");
        thumbnail.type = "button";
        thumbnail.className = "thumbnail active";
        thumbnail.setAttribute("aria-label", "View product image");

        const image = document.createElement("img");
        image.src = imagePath;
        image.alt = product.Title || "Product image";

        image.onerror = function () {
            this.onerror = null;
            this.src = "Logo.png";
        };

        thumbnail.appendChild(image);

        thumbnail.addEventListener("click", function () {
            if (mainImage) {
                mainImage.src = imagePath;
            }

            thumbnailContainer
                .querySelectorAll(".thumbnail")
                .forEach(function (item) {
                    item.classList.remove("active");
                });

            thumbnail.classList.add("active");
        });

        thumbnailContainer.appendChild(thumbnail);
    }

    // ============================================================
    // CUSTOMIZATION
    // ============================================================

    function updateCustomization() {
        const customization =
            document.querySelector(".customization");

        if (!customization || !product) {
            return;
        }

        customization.style.display =
            isCustomizable(product) ? "block" : "none";
    }

    if (giftBoxAddonSearch) {
        giftBoxAddonSearch.addEventListener("input", filterGiftBoxAddons);
    }

    // ============================================================
    // QUANTITY DECREASE
    // ============================================================

    if (decreaseButton) {
        decreaseButton.addEventListener("click", function () {
            if (quantity > 1) {
                quantity--;
                updateQuantityDisplay();
            }
        });
    }

    // ============================================================
    // QUANTITY INCREASE
    // ============================================================

    if (increaseButton) {
        increaseButton.addEventListener("click", function () {
            if (!product) {
                return;
            }

            const stock = getStock(product);

            if (stock === null || stock <= 0) {
                alert("Stock is unavailable for this product.");
                return;
            }

            if (quantity < stock) {
                quantity++;
                updateQuantityDisplay();
            } else {
                alert("You cannot select more than the available stock.");
            }
        });
    }

    // ============================================================
    // ADD TO CART
    // ============================================================

    if (addToCartButton) {
        addToCartButton.addEventListener("click", function () {
            if (!product) {
                alert("Product information is not available.");
                return;
            }

            const stock = getStock(product);

            if (stock === null) {
                alert("We could not verify the available stock.");
                return;
            }

            if (stock <= 0) {
                alert("Sorry, this product is out of stock.");
                updateStock();
                return;
            }

            if (!Number.isInteger(quantity) || quantity < 1) {
                alert("Please select a valid quantity.");
                return;
            }

            // Read personalization.
            const nameInput = document.getElementById("name");
            const messageInput = document.getElementById("message");

            const name = nameInput ? nameInput.value.trim() : "";
            const message = messageInput ? messageInput.value.trim() : "";

            if (isCustomizable(product) && nameInput && !name) {
                alert("Please enter the name for personalization.");
                nameInput.focus();
                return;
            }

            // Read the current cart.
            const cart = getCart();

            const selectedAddons = getSelectedGiftBoxAddons();
            const selectedAddonIds = selectedAddons
                .map(function (addon) {
                    return Number(addon.id);
                })
                .sort(function (left, right) {
                    return left - right;
                });

            const itemSignature = JSON.stringify({
                productId: Number(product.ProductID),
                addonIds: selectedAddonIds,
                personalizedName: name,
                message: message
            });

            const existingItem = cart.find(function (item) {
                const itemAddonIds = Array.isArray(item.giftBoxAddons)
                    ? item.giftBoxAddons.map(function (addon) {
                        return Number(addon.id);
                    }).sort(function (left, right) {
                        return left - right;
                    })
                    : [];

                return JSON.stringify({
                    productId: Number(item.productId),
                    addonIds: itemAddonIds,
                    personalizedName: item.personalizedName || "",
                    message: item.message || ""
                }) === itemSignature;
            });

            const existingQuantity = cart.reduce(
                function (total, item) {
                    if (
                        Number(item.productId) ===
                        Number(product.ProductID)
                    ) {
                        return total + Math.max(
                            0,
                            Number(item.quantity) || 0
                        );
                    }

                    return total;
                },
                0
            );

            const safeExistingQuantity =
                Number.isInteger(existingQuantity) &&
                existingQuantity > 0
                    ? existingQuantity
                    : 0;

            // Validate the TOTAL quantity in the cart.
            if (safeExistingQuantity + quantity > stock) {
                alert(
                    "Only " + stock + " item(s) are available. " +
                    "You already have " + safeExistingQuantity +
                    " in your cart."
                );
                return;
            }

            if (existingItem) {
                existingItem.quantity =
                    safeExistingQuantity + quantity;

                existingItem.stockQuantity = stock;
            } else {
                const addonTotal = selectedAddons.reduce(
                    function (total, addon) {
                        return total + Number(addon.price);
                    },
                    0
                );

                cart.push({
                    productId: Number(product.ProductID),
                    name: product.Title || "Handmade Gift",
                    basePrice: Number(product.Price),
                    price: Number(product.Price) + addonTotal,
                    image: product.ImageURL || "",
                    quantity: quantity,
                    stockQuantity: stock,
                    selected: true,
                    personalizedName: name,
                    message: message,
                    giftBoxAddons: selectedAddons.map(function (addon) {
                        return {
                            id: Number(addon.id),
                            name: addon.name,
                            price: Number(addon.price)
                        };
                    })
                });
            }

            if (!saveCart(cart)) {
                return;
            }

            updateCartCount();

            alert(
                (product.Title || "Product") +
                " has been added to your cart! 🛒"
            );
        });
    }

    // ============================================================
    // DESCRIPTION TABS
    // ============================================================

    const tabs = document.querySelectorAll(".tab");
    const tabContents = document.querySelectorAll(".tab-content");

    tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            const target = tab.getAttribute("data-tab");

            tabs.forEach(function (item) {
                item.classList.remove("active");
            });

            tabContents.forEach(function (content) {
                content.classList.remove("active");
            });

            tab.classList.add("active");

            const targetContent = document.getElementById(target);

            if (targetContent) {
                targetContent.classList.add("active");
            }
        });
    });

    // ============================================================
    // RELATED PRODUCTS
    // ============================================================

    async function loadRelatedProducts() {
        if (!relatedGrid) {
            return;
        }

        try {
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
                throw new Error("HTTP " + response.status);
            }

            const data = await response.json();

            if (!data.success || !Array.isArray(data.products)) {
                throw new Error(
                    data.message || "Invalid related-products response."
                );
            }

            const related = data.products
                .filter(function (item) {
                    return Number(item.ProductID) !== Number(productID);
                })
                .slice(0, 4);

            relatedGrid.innerHTML = "";

            if (related.length === 0) {
                relatedGrid.textContent =
                    "No related gifts are available.";
                return;
            }

            related.forEach(function (item) {
                const id = item.ProductID;

                if (id === undefined || id === null) {
                    return;
                }

                const title = item.Title || "Handmade Gift";
                const category = item.CategoryName || "GIFT COLLECTION";
                const price = Number(item.Price);
                const imagePath = getImagePath(item.ImageURL);

                const card = document.createElement("article");
                card.className = "related-card";

                const imageContainer = document.createElement("div");
                imageContainer.className = "related-image";

                const link = document.createElement("a");
                link.href =
                    "prduct_details.html?id=" +
                    encodeURIComponent(id);

                const image = document.createElement("img");
                image.src = imagePath;
                image.alt = title;
                image.loading = "lazy";

                image.onerror = function () {
                    this.onerror = null;
                    this.src = "Logo.png";
                };

                link.appendChild(image);
                imageContainer.appendChild(link);

                const heart = document.createElement("button");
                heart.type = "button";
                if (window.GiftoraFavorites) {
                    window.GiftoraFavorites.bindButton(heart, item);
                }

                imageContainer.appendChild(heart);

                const categoryText = document.createElement("p");
                categoryText.textContent = category;

                const heading = document.createElement("h3");
                heading.textContent = title;

                const priceText = document.createElement("strong");
                priceText.textContent = formatMoney(price);

                const viewLink = document.createElement("a");
                viewLink.href =
                    "prduct_details.html?id=" +
                    encodeURIComponent(id);
                viewLink.textContent = "View Product";

                card.appendChild(imageContainer);
                card.appendChild(categoryText);
                card.appendChild(heading);
                card.appendChild(priceText);
                card.appendChild(viewLink);

                relatedGrid.appendChild(card);
            });

        } catch (error) {
            console.error("Related products error:", error);

            relatedGrid.textContent =
                "Unable to load related gifts. Please refresh the page.";
        }
    }

    // ============================================================
    // INITIALIZE
    // ============================================================

    updateCartCount();
    loadProduct();
    loadRelatedProducts();
});
