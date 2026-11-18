
const sampleProducts = [
    {
        id: 1,
        name: "Samsung Smartphone",
        price: 8500,
        category: "Electronics",
        seller: "Arun",
        description: "Good condition, 128GB storage.",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
        isMine: false
    },
    {
        id: 2,
        name: "Wooden Study Table",
        price: 2500,
        category: "Furniture",
        seller: "Kumar",
        description: "Strong wooden table, lightly used.",
        image: "https://images.unsplash.com/photo-1499933374294-4584851497cc?w=500",
        isMine: false
    },
    {
        id: 3,
        name: "Bluetooth Headphones",
        price: 1200,
        category: "Electronics",
        seller: "Priya",
        description: "Excellent sound quality.",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        isMine: false
    },
    {
        id: 4,
        name: "Engineering Books",
        price: 500,
        category: "Books",
        seller: "Vijay",
        description: "Useful college textbooks.",
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500",
        isMine: false
    },
    {
        id: 5,
        name: "Casual Shoes",
        price: 700,
        category: "Fashion",
        seller: "Rahul",
        description: "Comfortable shoes, good condition.",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
        isMine: false
    }
];

let products = JSON.parse(localStorage.getItem("reuseProducts")) || sampleProducts;
let cart = JSON.parse(localStorage.getItem("reuseCart")) || [];
let favorites = JSON.parse(localStorage.getItem("reuseFavorites")) || [];

const productList = document.getElementById("product-list");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const sellForm = document.getElementById("sell-form");

function saveData() {
    localStorage.setItem("reuseProducts", JSON.stringify(products));
    localStorage.setItem("reuseCart", JSON.stringify(cart));
    localStorage.setItem("reuseFavorites", JSON.stringify(favorites));
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function displayProducts() {
    const searchText = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;

    const filteredProducts = products.filter(product => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchText) ||
            product.description.toLowerCase().includes(searchText);

        const matchesCategory =
            selectedCategory === "All" ||
            product.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    productList.innerHTML = "";

    if (filteredProducts.length === 0) {
        productList.innerHTML =
            '<p class="empty-message">No products found.</p>';
        return;
    }

    filteredProducts.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";

        const safeImage = escapeHTML(product.image || "");

        card.innerHTML = `
            <img src="${safeImage}"
                 alt="${escapeHTML(product.name)}"
                 onerror="this.src='https://placehold.co/500x300?text=No+Image'">

            <div class="product-info">
                <h3>${escapeHTML(product.name)}</h3>
                <p class="price">₹${Number(product.price).toLocaleString("en-IN")}</p>
                <p>Category: ${escapeHTML(product.category)}</p>
                <p>Seller: ${escapeHTML(product.seller)}</p>
                <p>${escapeHTML(product.description)}</p>

                <div class="product-actions">
                    <button class="add-btn"
                        onclick="addToCart(${product.id})">
                        Add to Cart
                    </button>

                    <button class="favorite-btn"
                        onclick="toggleFavorite(${product.id})">
                        ${favorites.includes(product.id) ? "♥" : "♡"}
                    </button>

                    ${product.isMine ? `
                        <button class="delete-btn"
                            onclick="deleteProduct(${product.id})">
                            Delete
                        </button>
                    ` : ""}
                </div>
            </div>
        `;

        productList.appendChild(card);
    });
}

sellForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const newProduct = {
        id: Date.now(),
        name: document.getElementById("product-name").value.trim(),
        price: Number(document.getElementById("product-price").value),
        category: document.getElementById("product-category").value,
        seller: document.getElementById("seller-name").value.trim(),
        image: document.getElementById("product-image").value.trim() ||
            "https://placehold.co/500x300?text=Used+Product",
        description: document.getElementById("product-description").value.trim(),
        isMine: true
    };

    if (!newProduct.name || !newProduct.seller ||
        !newProduct.description || newProduct.price <= 0) {
        alert("Please enter valid product details.");
        return;
    }

    products.unshift(newProduct);

    saveData();
    displayProducts();
    sellForm.reset();

    alert("Your product has been published successfully!");
    document.getElementById("products").scrollIntoView();
});

function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) {
        return;
    }

    products = products.filter(product => product.id !== id);
    cart = cart.filter(item => item.id !== id);
    favorites = favorites.filter(fav => fav !== id);

    saveData();
    displayProducts();
    displayCart();
}

function addToCart(id) {
    const product = products.find(product => product.id === id);

    if (!product) return;

    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id: id, quantity: 1 });
    }

    saveData();
    displayCart();

    alert(product.name + " added to cart!");
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);

    saveData();
    displayCart();
}

function displayCart() {
    const cartItems = document.getElementById("cart-items");
    let total = 0;
    let count = 0;

    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML =
            '<p class="empty-message">Your cart is empty.</p>';
    }

    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);

        if (!product) return;

        const itemTotal = product.price * item.quantity;
        total += itemTotal;
        count += item.quantity;

        const row = document.createElement("div");
        row.className = "cart-item";

        row.innerHTML = `
            <div>
                <strong>${escapeHTML(product.name)}</strong>
                <p>₹${product.price.toLocaleString("en-IN")} × ${item.quantity}</p>
            </div>

            <strong>₹${itemTotal.toLocaleString("en-IN")}</strong>

            <button onclick="removeFromCart(${product.id})">
                Remove
            </button>
        `;

        cartItems.appendChild(row);
    });

    document.getElementById("cart-total").textContent =
        total.toLocaleString("en-IN");

    document.getElementById("cart-count").textContent = count;
}

function toggleFavorite(id) {
    if (favorites.includes(id)) {
        favorites = favorites.filter(item => item !== id);
    } else {
        favorites.push(id);
    }

    saveData();
    displayProducts();
}

document.getElementById("checkout-btn").addEventListener("click", () => {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    alert("Demo checkout successful! Total: ₹" +
        document.getElementById("cart-total").textContent);

    cart = [];
    saveData();
    displayCart();
});

searchInput.addEventListener("input", displayProducts);
categoryFilter.addEventListener("change", displayProducts);

// Initial page display
displayProducts();
displayCart();
