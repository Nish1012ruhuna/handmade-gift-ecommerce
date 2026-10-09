document.addEventListener("DOMContentLoaded", function () {

    // ============================================================
    // GET PRODUCT ID FROM URL
    // ============================================================

    const urlParams = new URLSearchParams(window.location.search);

    const productID = urlParams.get("id");


    // ============================================================
    // ELEMENTS
    // ============================================================

    const mainImage =
        document.getElementById("mainProductImage");

    const productTitle =
        document.querySelector(".product-info h1");

    const productCategory =
        document.querySelector(".product-category");

    const productPrice =
        document.querySelector(".price");

    const shortDescription =
        document.querySelector(".short-description");

    const quantityDisplay =
        document.getElementById("quantity");

    const decreaseButton =
        document.getElementById("decrease");

    const increaseButton =
        document.getElementById("increase");

    const addToCartButton =
        document.getElementById("addToCart");

    const wishlistButton =
        document.getElementById("wishlistButton");

    const imageWishlist =
        document.querySelector(".image-wishlist");

    const cartCount =
        document.querySelector(".cart-count");

    const thumbnailContainer =
        document.querySelector(".thumbnail-container");


    // ============================================================
    // VARIABLES
    // ============================================================

    let product = null;

    let quantity = 1;


    // ============================================================
    // CHECK PRODUCT ID
    // ============================================================

    if (!productID) {

        showError("No product was selected.");

        return;
    }


    // ============================================================
    // API URL
    // ============================================================

    const API_URL =
        "backend/api/products.php?id=" +
        encodeURIComponent(productID);


    // ============================================================
    // LOAD PRODUCT
    // ============================================================

    async function loadProduct() {

        try {

            console.log(
                "Loading product ID:",
                productID
            );


            const response =
                await fetch(
                    API_URL + "&t=" + Date.now(),
                    {
                        method: "GET",
                        cache: "no-store"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Product request failed. HTTP " +
                    response.status
                );
            }


            const data =
                await response.json();


            console.log(
                "Product API response:",
                data
            );


            if (!data.success) {

                throw new Error(
                    data.message ||
                    "Product not found."
                );
            }


            product =
                data.product;


            console.log(
                "Product loaded:",
                product
            );


            // Display product
            displayProduct();


        } catch (error) {

            console.error(
                "Product loading error:",
                error
            );


            showError(
                "Unable to load this product. " +
                error.message
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


        // --------------------------------------------------------
        // TITLE
        // --------------------------------------------------------

        if (productTitle) {

            productTitle.textContent =
                product.Title || "Untitled Product";

        }


        // --------------------------------------------------------
        // CATEGORY
        // --------------------------------------------------------

        if (productCategory) {

            productCategory.textContent =
                product.CategoryName || "GIFT";

        }


        // --------------------------------------------------------
        // PRICE
        // --------------------------------------------------------

        if (productPrice) {

            productPrice.textContent =
                formatMoney(product.Price);

        }


        // --------------------------------------------------------
        // DESCRIPTION
        // --------------------------------------------------------

        if (shortDescription) {

            shortDescription.textContent =
                product.Description ||
                "A beautiful handmade gift created with love.";

        }


        // --------------------------------------------------------
        // MAIN IMAGE
        // --------------------------------------------------------

        const imagePath =
            getImagePath(product.ImageURL);


        if (mainImage) {

            mainImage.src =
                imagePath;

            mainImage.alt =
                product.Title || "Product image";


            mainImage.onerror = function () {

                this.onerror = null;

                this.src = "Logo.png";

            };

        }


        // --------------------------------------------------------
        // THUMBNAILS
        // --------------------------------------------------------

        createThumbnail(imagePath);


        // --------------------------------------------------------
        // STOCK
        // --------------------------------------------------------

        updateStock();


        // --------------------------------------------------------
        // CUSTOMIZATION
        // --------------------------------------------------------

        updateCustomization();


        // --------------------------------------------------------
        // PAGE TITLE
        // --------------------------------------------------------

        document.title =
            product.Title +
            " | GIFTORA";

    }


    // ============================================================
    // IMAGE PATH
    // ============================================================

    function getImagePath(imageURL) {

        if (!imageURL) {

            return "Logo.png";

        }


        let image =
            String(imageURL).trim();


        /*
         * If database already contains:
         *
         * shop_images/card.jpg
         *
         * don't add shop_images again.
         */

        if (
            image.startsWith("shop_images/") ||
            image.startsWith("http://") ||
            image.startsWith("https://") ||
            image.startsWith("data:")
        ) {

            return image;

        }


        return "shop_images/" + image;

    }


    // ============================================================
    // CREATE THUMBNAIL
    // ============================================================

    function createThumbnail(imagePath) {

        if (!thumbnailContainer) {

            return;

        }


        // Remove old hard-coded thumbnails
        thumbnailContainer.innerHTML = "";


        const thumbnail =
            document.createElement("button");


        thumbnail.type =
            "button";


        thumbnail.className =
            "thumbnail active";


        thumbnail.setAttribute(
            "data-image",
            imagePath
        );


        const image =
            document.createElement("img");


        image.src =
            imagePath;


        image.alt =
            product.Title || "Product image";


        image.onerror = function () {

            this.onerror = null;

            this.src = "Logo.png";

        };


        thumbnail.appendChild(image);


        thumbnail.addEventListener(
            "click",
            function () {

                if (mainImage) {

                    mainImage.src =
                        imagePath;

                }


                document
                    .querySelectorAll(".thumbnail")
                    .forEach(function (item) {

                        item.classList.remove(
                            "active"
                        );

                    });


                thumbnail.classList.add(
                    "active"
                );

            }
        );


        thumbnailContainer.appendChild(
            thumbnail
        );

    }


    // ============================================================
    // FORMAT MONEY
    // ============================================================

    function formatMoney(amount) {

        const number =
            Number(amount);


        if (!Number.isFinite(number)) {

            return "LKR 0.00";

        }


        return "LKR " +
            number.toLocaleString(
                "en-LK",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );

    }


    // ============================================================
    // STOCK
    // ============================================================

    function updateStock() {

        const stockElement =
            document.querySelector(".stock");


        if (!stockElement || !product) {

            return;

        }


        const stock =
            Number(product.StockQuantity);


        if (stock <= 0) {

            stockElement.textContent =
                "Out of Stock";

            stockElement.style.color =
                "#c94b4b";


            if (addToCartButton) {

                addToCartButton.disabled =
                    true;

                addToCartButton.textContent =
                    "Out of Stock";

            }

        } else {

            stockElement.textContent =
                stock +
                " items available";


            if (addToCartButton) {

                addToCartButton.disabled =
                    false;

                addToCartButton.textContent =
                    "Add to Cart";

            }

        }

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


        /*
         * Customizable = 1
         */

        if (product.Customizable) {

            customization.style.display =
                "block";

        } else {

            customization.style.display =
                "none";

        }

    }


    // ============================================================
    // QUANTITY - DECREASE
    // ============================================================

    if (decreaseButton) {

        decreaseButton.addEventListener(
            "click",
            function () {

                if (quantity > 1) {

                    quantity--;

                    updateQuantityDisplay();

                }

            }
        );

    }


    // ============================================================
    // QUANTITY - INCREASE
    // ============================================================

    if (increaseButton) {

        increaseButton.addEventListener(
            "click",
            function () {

                if (!product) {

                    return;

                }


                const stock =
                    Number(product.StockQuantity);


                if (quantity < stock) {

                    quantity++;

                    updateQuantityDisplay();

                } else {

                    alert(
                        "You cannot add more than the available stock."
                    );

                }

            }
        );

    }


    // ============================================================
    // UPDATE QUANTITY DISPLAY
    // ============================================================

    function updateQuantityDisplay() {

        if (quantityDisplay) {

            quantityDisplay.textContent =
                quantity;

        }

    }


    // ============================================================
    // WISHLIST
    // ============================================================

    function toggleWishlist(button) {

        if (!button) {

            return;

        }


        if (
            button.classList.contains(
                "selected"
            )
        ) {

            button.classList.remove(
                "selected"
            );

            button.textContent =
                "♡";

        } else {

            button.classList.add(
                "selected"
            );

            button.textContent =
                "♥";

        }

    }


    if (wishlistButton) {

        wishlistButton.addEventListener(
            "click",
            function () {

                toggleWishlist(
                    wishlistButton
                );

            }
        );

    }


    if (imageWishlist) {

        imageWishlist.addEventListener(
            "click",
            function () {

                toggleWishlist(
                    imageWishlist
                );

            }
        );

    }


    // ============================================================
    // ADD TO CART
    // ============================================================

    if (addToCartButton) {

        addToCartButton.addEventListener(
            "click",
            function () {

                if (!product) {

                    alert(
                        "Product information is not available."
                    );

                    return;

                }


                const stock =
                    Number(product.StockQuantity);


                if (stock <= 0) {

                    alert(
                        "Sorry, this product is out of stock."
                    );

                    return;

                }


                if (quantity > stock) {

                    alert(
                        "Only " +
                        stock +
                        " item(s) are available."
                    );

                    return;

                }


                // ------------------------------------------------
                // PERSONALIZATION
                // ------------------------------------------------

                const nameInput =
                    document.getElementById("name");

                const messageInput =
                    document.getElementById("message");


                const name =
                    nameInput
                        ? nameInput.value.trim()
                        : "";


                const message =
                    messageInput
                        ? messageInput.value.trim()
                        : "";


                /*
                 * Only require personalization
                 * if the product is customizable.
                 */

                if (
                    product.Customizable &&
                    nameInput &&
                    name === ""
                ) {

                    alert(
                        "Please enter the name for personalization."
                    );

                    nameInput.focus();

                    return;

                }


                // ------------------------------------------------
                // GET EXISTING CART
                // ------------------------------------------------

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

                    console.error(
                        "Cart loading error:",
                        error
                    );

                    cart = [];

                }


                // ------------------------------------------------
                // CHECK EXISTING PRODUCT
                // ------------------------------------------------

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


                if (existingItem) {

                    existingItem.quantity =
                        Number(
                            existingItem.quantity
                        ) + quantity;


                    /*
                     * Update customization
                     * if provided.
                     */

                    if (name) {

                        existingItem.personalizedName =
                            name;

                    }


                    if (message) {

                        existingItem.message =
                            message;

                    }

                } else {

                    cart.push({

                        productId:
                            Number(
                                product.ProductID
                            ),

                        name:
                            product.Title,

                        price:
                            Number(
                                product.Price
                            ),

                        image:
                            product.ImageURL,

                        quantity:
                            quantity,

                        personalizedName:
                            name,

                        message:
                            message

                    });

                }


                // ------------------------------------------------
                // SAVE CART
                // ------------------------------------------------

                localStorage.setItem(
                    "giftoraCart",
                    JSON.stringify(cart)
                );


                // Update cart count
                updateCartCount();


                alert(
                    product.Title +
                    " has been added to your cart! 🛒"
                );

            }
        );

    }


    // ============================================================
    // CART COUNT
    // ============================================================

    function updateCartCount() {

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


        const totalQuantity =
            cart.reduce(
                function (total, item) {

                    const itemQuantity =
                        Number(
                            item.quantity
                        );


                    if (
                        Number.isFinite(
                            itemQuantity
                        ) &&
                        itemQuantity > 0
                    ) {

                        return total +
                            itemQuantity;

                    }


                    return total;

                },
                0
            );


        cartCount.textContent =
            totalQuantity;

    }


    // ============================================================
    // DESCRIPTION TABS
    // ============================================================

    const tabs =
        document.querySelectorAll(".tab");

    const tabContents =
        document.querySelectorAll(
            ".tab-content"
        );


    tabs.forEach(
        function (tab) {

            tab.addEventListener(
                "click",
                function () {

                    const target =
                        tab.getAttribute(
                            "data-tab"
                        );


                    tabs.forEach(
                        function (item) {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    tabContents.forEach(
                        function (content) {

                            content.classList.remove(
                                "active"
                            );

                        }
                    );


                    tab.classList.add(
                        "active"
                    );


                    const targetContent =
                        document.getElementById(
                            target
                        );


                    if (targetContent) {

                        targetContent.classList.add(
                            "active"
                        );

                    }

                }
            );

        }
    );



    
    // ============================================================
    // LOAD RELATED PRODUCTS
    // ============================================================

    async function loadRelatedProducts() {
        const relatedGrid =
            document.getElementById("relatedGrid");

        if (!relatedGrid) return;

        try {
            const response = await fetch(
                "backend/api/products.php?t=" + Date.now(),
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

            if (!response.ok) {
                throw new Error(
                    "HTTP error: " + response.status
                );
            }

            const data = await response.json();

            console.log("Related products API:", data);

            // Support common product-list response formats.
            let products = [];

            if (Array.isArray(data)) {
                products = data;
            } else if (Array.isArray(data.products)) {
                products = data.products;
            } else if (Array.isArray(data.data)) {
                products = data.data;
            } else if (Array.isArray(data.product)) {
                products = data.product;
            }

            // Exclude the product currently being viewed.
            const related = products
                .filter(function (item) {
                    const id =
                        item.ProductID ??
                        item.productId ??
                        item.id;

                    return String(id) !== String(productID);
                })
                .slice(0, 4);

            if (related.length === 0) {
                relatedGrid.innerHTML =
                    "<p>No related gifts are available.</p>";
                return;
            }

            relatedGrid.innerHTML = "";

            related.forEach(function (item) {
                const id =
                    item.ProductID ??
                    item.productId ??
                    item.id;

                const title =
                    item.Title ??
                    item.title ??
                    item.ProductName ??
                    item.Name ??
                    "Handmade Gift";

                const category =
                    item.CategoryName ??
                    item.category ??
                    "GIFT COLLECTION";

                const price =
                    Number(item.Price ?? item.price ?? 0);

                const imageURL =
                    item.ImageURL ??
                    item.imageURL ??
                    item.image ??
                    "";

                const imagePath = getImagePath(imageURL);

                const card = document.createElement("div");
                card.className = "related-card";

                const imageContainer =
                    document.createElement("div");

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
                heart.textContent = "♡";
                heart.setAttribute(
                    "aria-label",
                    "Add " + title + " to wishlist"
                );

                heart.addEventListener("click", function () {
                    if (heart.textContent === "♡") {
                        heart.textContent = "♥";
                        heart.style.color = "#d95f62";
                    } else {
                        heart.textContent = "♡";
                        heart.style.color = "";
                    }
                });

                imageContainer.appendChild(heart);

                const categoryText =
                    document.createElement("p");
                categoryText.textContent = category;

                const heading = document.createElement("h3");
                heading.textContent = title;

                const priceText =
                    document.createElement("strong");

                priceText.textContent =
                    "Rs. " + price.toLocaleString("en-LK", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });

                const viewLink =
                    document.createElement("a");

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
            console.error(
                "Could not load related products:",
                error
            );

            relatedGrid.innerHTML =
                "<p>Unable to load related gifts. " +
                "Please refresh the page.</p>";
        }
    }




    // ============================================================
    // INITIALIZE
    // ============================================================

    updateCartCount();

    loadProduct();

});