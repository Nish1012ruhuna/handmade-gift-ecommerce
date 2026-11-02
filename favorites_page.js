document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const grid = document.getElementById("favoritesGrid");
    const emptyState = document.getElementById("emptyFavorites");

    if (!grid || !emptyState || !window.GiftoraFavorites) {
        console.error("GIFTORA: The favorites page could not be initialized.");
        return;
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
        if (image.startsWith("home_images/") || image === "Logo.png") {
            return image;
        }

        if (image.startsWith("giftora/shop_images/")) {
            return image.substring("giftora/".length);
        }

        return image.startsWith("shop_images/") ? image : "shop_images/" + image;
    }

    function renderFavorites() {
        const favorites = window.GiftoraFavorites.getAll();
        grid.replaceChildren();
        emptyState.hidden = favorites.length > 0;

        favorites.forEach(function (favorite) {
            const card = document.createElement("article");
            card.className = "favorite-card";

            const imageContainer = document.createElement("div");
            imageContainer.className = "favorite-image";

            const image = document.createElement("img");
            image.src = getImagePath(favorite.image);
            image.alt = favorite.name || "Favorite gift";
            image.loading = "lazy";
            image.onerror = function () {
                this.onerror = null;
                this.src = "Logo.png";
            };

            const removeButton = document.createElement("button");
            removeButton.className = "favorite-remove";
            removeButton.type = "button";
            removeButton.textContent = "♥";
            removeButton.setAttribute("aria-label", "Remove " + favorite.name + " from favorites");
            window.GiftoraFavorites.bindButton(removeButton, {
                favoriteId: favorite.id
            });

            imageContainer.appendChild(image);
            imageContainer.appendChild(removeButton);

            const info = document.createElement("div");
            info.className = "favorite-info";

            const category = document.createElement("p");
            category.textContent = favorite.category || "Gift";

            const title = document.createElement("h2");
            title.textContent = favorite.name || "Handmade Gift";

            const price = document.createElement("strong");
            price.className = "favorite-price";
            price.textContent = "LKR " + Number(favorite.price || 0).toLocaleString("en-LK", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

            info.appendChild(category);
            info.appendChild(title);
            info.appendChild(price);

            if (/^\d+$/.test(String(favorite.id))) {
                const viewLink = document.createElement("a");
                viewLink.className = "favorite-view";
                viewLink.href = "prduct_details.html?id=" + encodeURIComponent(favorite.id);
                viewLink.textContent = "View Product";
                info.appendChild(viewLink);
            }

            card.appendChild(imageContainer);
            card.appendChild(info);
            grid.appendChild(card);
        });
    }

    renderFavorites();
    window.addEventListener("giftora:favorites-changed", renderFavorites);
});
