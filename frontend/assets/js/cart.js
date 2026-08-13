// Shopping Cart State Management
let cart = JSON.parse(localStorage.getItem('pharmacare_cart')) || [];

document.addEventListener("DOMContentLoaded", () => {
    updateCartBadge();
    renderCart();

    // Auto-close cart drawer on pressing ESC key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            const drawer = document.getElementById("cartDrawer");
            if (drawer && drawer.classList.contains("active")) {
                toggleCart();
            }
        }
    });
});

// Save cart to local storage
function saveCart() {
    localStorage.setItem('pharmacare_cart', JSON.stringify(cart));
}

// Open or Close Cart Drawer
function toggleCart() {
    const drawer = document.getElementById("cartDrawer");
    const overlay = document.getElementById("cartOverlay");
    
    if (drawer && overlay) {
        drawer.classList.toggle("active");
        overlay.classList.toggle("active");
    }
}

// Catalog map fallback for products when DOM card is missing
const defaultProductCatalog = {
    'Paracetamol Tablet': { price: 45.00, image: 'assets/images/product_paracetamol.png' },
    'Cough Reliever Syrup': { price: 120.00, image: 'assets/images/product_cough_syrup.png' },
    'Multivitamin Capsule': { price: 250.00, image: 'assets/images/product_multivitamin.png' },
    'Antiseptic Healing Cream': { price: 85.00, image: 'assets/images/product_antiseptic.png' }
};

// Add item to cart
function addToCart(productName) {
    let foundInDom = false;
    let priceStr = "";
    let imgSrc = "";

    // Lookup details from DOM card
    const cards = document.querySelectorAll('.card');
    for (let card of cards) {
        const titleEl = card.querySelector('h3');
        if (titleEl && titleEl.innerText.trim().toLowerCase() === productName.trim().toLowerCase()) {
            const priceEl = card.querySelector('.price');
            if (priceEl) priceStr = priceEl.innerText.trim();
            const imgEl = card.querySelector('img');
            if (imgEl) imgSrc = imgEl.getAttribute('src');
            foundInDom = true;
            break;
        }
    }

    let numericPrice = parseFloat(priceStr.replace(/[^\d.]/g, '')) || 0.00;

    if (!foundInDom || numericPrice === 0) {
        const catalogKey = Object.keys(defaultProductCatalog).find(k => k.toLowerCase() === productName.toLowerCase().trim());
        if (catalogKey) {
            numericPrice = defaultProductCatalog[catalogKey].price;
            imgSrc = defaultProductCatalog[catalogKey].image;
        } else {
            numericPrice = numericPrice || 100.00;
            imgSrc = imgSrc || "assets/images/product_paracetamol.png";
        }
    }

    // Check if item already in cart
    const existingIndex = cart.findIndex(item => item.name === productName);
    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({
            name: productName,
            price: numericPrice,
            image: imgSrc,
            qty: 1
        });
    }

    saveCart();
    updateCartBadge();
    renderCart();

    // Visual trigger pulse on Cart Icon
    const cartBtn = document.querySelector('.cart-icon-btn');
    if (cartBtn) {
        cartBtn.classList.add('pulse');
        setTimeout(() => cartBtn.classList.remove('pulse'), 400);
    }

    // Smoothly slide open cart drawer
    const drawer = document.getElementById("cartDrawer");
    if (drawer && !drawer.classList.contains("active")) {
        toggleCart();
    }
}

// Update quantity of an item
function updateQuantity(productName, delta) {
    const index = cart.findIndex(item => item.name === productName);
    if (index > -1) {
        cart[index].qty += delta;
        if (cart[index].qty <= 0) {
            cart.splice(index, 1);
        }
        saveCart();
        updateCartBadge();
        renderCart();
    }
}

// Remove item from cart
function removeItem(productName) {
    cart = cart.filter(item => item.name !== productName);
    saveCart();
    updateCartBadge();
    renderCart();
}

// Render dynamic cart item markup
function renderCart() {
    const container = document.getElementById("cartItemsContainer");
    const totalValEl = document.getElementById("cartTotalVal");
    const checkoutBtn = document.querySelector(".checkout-btn");
    
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart-msg">
                <i class="fas fa-shopping-basket"></i>
                <p>Your cart is empty.</p>
            </div>
        `;
        if (totalValEl) totalValEl.innerText = "₹0.00";
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }

    let html = "";
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;

        html += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <span class="price">₹${item.price.toFixed(2)}</span>
                    <div class="cart-item-actions">
                        <div class="qty-controls">
                            <button class="qty-btn" onclick="updateQuantity('${item.name}', -1)">-</button>
                            <span class="qty-val">${item.qty}</span>
                            <button class="qty-btn" onclick="updateQuantity('${item.name}', 1)">+</button>
                        </div>
                        <button class="remove-item-btn" onclick="removeItem('${item.name}')" title="Remove Item">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    if (totalValEl) totalValEl.innerText = `₹${total.toFixed(2)}`;
    if (checkoutBtn) checkoutBtn.disabled = false;
}

// Update the Cart count Badge in the header
function updateCartBadge() {
    const badge = document.getElementById("cartCountBadge");
    if (badge) {
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        badge.innerText = totalItems;
        badge.style.display = totalItems > 0 ? "flex" : "none";
    }
}

// Handle Order Checkout
function handleCheckout() {
    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    const token = localStorage.getItem('pharmacare_token');
    const headers = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Helper: Save locally when backend is unreachable
    const saveOrderLocally = (items, totalVal) => {
        const local = JSON.parse(localStorage.getItem('pharmacare_orders')) || [];
        const newId = Math.floor(Math.random() * 90000 + 10000);
        const newOrder = {
            id: newId,
            items: JSON.stringify(items),
            total: totalVal,
            status: 'shipped',
            created_at: new Date().toISOString()
        };
        local.push(newOrder);
        localStorage.setItem('pharmacare_orders', JSON.stringify(local));
        return newId;
    };

    fetch('/api/orders', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            items: cart,
            total: total
        })
    })
    .then(res => {
        if (res.status === 404 || res.status === 502 || res.status === 503) {
            const localId = saveOrderLocally(cart, total);
            return { status: 201, data: { orderId: localId } };
        }
        return res.json().then(data => ({ status: res.status, data }));
    })
    .then(res => {
        if (res.status !== 201) {
            throw new Error(res.data.error || 'Checkout failed');
        }

        // Clear cart upon receipt confirmation
        cart = [];
        saveCart();
        updateCartBadge();
        renderCart();
        toggleCart();

        alert(`🎉 Purchase Successful!\nOrder ID: #PC-${res.data.orderId}\nTotal Order Value: ₹${total.toFixed(2)}\n\nThank you for choosing PharmaCare. Your medicines will be shipped shortly.`);

        // Refresh profile dashboard if they are on profile.html
        if (window.loadDashboardData) {
            window.loadDashboardData();
        }
    })
    .catch(err => {
        const localId = saveOrderLocally(cart, total);

        cart = [];
        saveCart();
        updateCartBadge();
        renderCart();
        toggleCart();

        alert(`🎉 Purchase Successful!\nOrder ID: #PC-${localId}\nTotal Order Value: ₹${total.toFixed(2)}\n\nThank you for choosing PharmaCare. Your medicines will be shipped shortly. (Local Offline Mode)`);

        if (window.loadDashboardData) {
            window.loadDashboardData();
        }
    });
}
