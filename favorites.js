(function () {
    "use strict";

    const STORAGE_KEY = "giftoraFavorites";

    function getFavorites() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) {
                return [];
            }

            const favorites = JSON.parse(saved);
            return Array.isArray(favorites) ? favorites : [];
        } catch (error) {
            console.error("Could not read favorites:", error);
            return [];
        }
    }

    function saveFavorites(favorites) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
            window.dispatchEvent(new CustomEvent("giftora:favorites-changed"));
            return true;
        } catch (error) {
            console.error("Could not save favorites:", error);
            alert("Unable to save your favorite products. Please try again.");
            return false;
        }
    }

    function getId(product) {
        const id = product && (
            product.ProductID !== undefined
                ? product.ProductID
                : product.favoriteId !== undefined
                    ? product.favoriteId
                    : product.id
        );

        return id === undefined || id === null ? "" : String(id);
    }

    function toFavorite(product) {
        const id = getId(product);
        if (!id) {
            throw new Error("Cannot save a favorite without a product ID.");
        }

        return {
            id: id,
            name: String(product.Title || product.name || "Handmade Gift"),
            category: String(product.CategoryName || product.category || "Gift"),
            description: String(product.Description || product.description || ""),
            price: Number(product.Price !== undefined ? product.Price : product.price) || 0,
            image: String(product.ImageURL || product.image || "Logo.png")
        };
    }

    function isFavorite(product) {
        const id = getId(product);
        return getFavorites().some(function (favorite) {
            return String(favorite.id) === id;
        });
    }

    function updateButton(button, selected) {
        button.textContent = selected ? "♥" : "♡";
        button.classList.toggle("selected", selected);
        button.setAttribute("aria-pressed", String(selected));
        button.setAttribute(
            "aria-label",
            selected ? "Remove from favorites" : "Add to favorites"
        );
    }

    function bindButton(button, product) {
        button.dataset.favoriteId = getId(product);
        updateButton(button, isFavorite(product));
        button.addEventListener("click", function () {
            const favorite = toFavorite(product);
            const favorites = getFavorites();
            const index = favorites.findIndex(function (item) {
                return String(item.id) === favorite.id;
            });

            if (index >= 0) {
                favorites.splice(index, 1);
            } else {
                favorites.push(favorite);
            }

            if (saveFavorites(favorites)) {
                updateButton(button, index < 0);
            }
        });
    }

    function syncButtons() {
        document.querySelectorAll("[data-favorite-id]").forEach(function (button) {
            updateButton(button, isFavorite({
                favoriteId: button.dataset.favoriteId
            }));
        });
    }

    function bindHeaderButtons() {
        document.querySelectorAll(".wishlist-header").forEach(function (button) {
            button.setAttribute("aria-label", "View favorite products");
            button.addEventListener("click", function () {
                window.location.href = "favorites.html";
            });
        });
    }

    window.GiftoraFavorites = {
        getAll: getFavorites,
        isFavorite: isFavorite,
        bindButton: bindButton,
        save: saveFavorites
    };

    window.addEventListener("giftora:favorites-changed", syncButtons);
    bindHeaderButtons();
})();
