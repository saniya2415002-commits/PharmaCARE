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
    'Antiseptic Healing Cream': { price: 85.00, image: 'assets/images/product_antiseptic.png' },
    'Vitamin C Chewable': { price: 95.00, image: 'assets/images/product_vitamin_c.png' },
    'Digestion Enzyme Syrup': { price: 140.00, image: 'assets/images/product_digestion.png' },
    'Ibuprofen Painkiller': { price: 65.00, image: 'assets/images/product_ibuprofen.png' },
    'Amoxicillin Antibiotic': { price: 180.00, image: 'assets/images/product_amoxicillin.png' },
    'Moisturizing Aloe Gel': { price: 110.00, image: 'assets/images/product_aloe.png' },
    'Iron & Folic Acid': { price: 150.00, image: 'assets/images/product_iron.png' },
    'Calcium Vitamin D3': { price: 220.00, image: 'assets/images/product_calcium.png' },
    'Allergy Relief Relief': { price: 75.00, image: 'assets/images/product_allergy.png' },
    'B-Complex Energy Booster': { price: 160.00, image: 'assets/images/product_bcomplex.png' },
    'Soothing Throat Syrup': { price: 90.00, image: 'assets/images/product_throat_syrup.png' },
    'Muscle Pain Relief Cream': { price: 125.00, image: 'assets/images/product_muscle_pain.png' },
    'Omega-3 Fish Oil Capsules': { price: 310.00, image: 'assets/images/product_omega3.png' }
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

function requestDeliveryAddress(savedAddress) {
    return new Promise(resolve => {
        const existingModal = document.getElementById('deliveryAddressModal');
        if (existingModal) existingModal.remove();

        const overlay = document.createElement('div');
        overlay.id = 'deliveryAddressModal';
        overlay.className = 'delivery-address-overlay active';
        overlay.innerHTML = `
            <div class="delivery-address-dialog" role="dialog" aria-modal="true" aria-labelledby="deliveryAddressTitle">
                <button type="button" class="delivery-address-close" aria-label="Close">&times;</button>
                <div class="delivery-address-icon"><i class="fas fa-map-marker-alt"></i></div>
                <h2 id="deliveryAddressTitle">Where should we deliver?</h2>
                <p class="delivery-address-copy">Confirm your delivery address before placing this order.</p>
                <label for="deliveryAddressInput">Delivery address</label>
                <textarea id="deliveryAddressInput" rows="3" placeholder="Enter your complete delivery address" required></textarea>
                <p class="delivery-address-error" role="alert" hidden>Please enter a delivery address.</p>
                <div class="delivery-address-actions">
                    <button type="button" class="delivery-address-cancel">Cancel</button>
                    <button type="button" class="delivery-address-confirm">Use this address</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const input = overlay.querySelector('#deliveryAddressInput');
        const error = overlay.querySelector('.delivery-address-error');
        const close = () => {
            overlay.remove();
            resolve(null);
        };
        const confirm = () => {
            const address = input.value.trim();
            if (!address) {
                error.hidden = false;
                input.focus();
                return;
            }
            localStorage.setItem('pharmacare_address', address);
            overlay.remove();
            resolve(address);
        };

        input.value = savedAddress || '';
        overlay.querySelector('.delivery-address-close').addEventListener('click', close);
        overlay.querySelector('.delivery-address-cancel').addEventListener('click', close);
        overlay.querySelector('.delivery-address-confirm').addEventListener('click', confirm);
        overlay.addEventListener('click', event => {
            if (event.target === overlay) close();
        });
        input.addEventListener('input', () => {
            error.hidden = true;
        });
        input.addEventListener('keydown', event => {
            if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) confirm();
        });
        input.focus();
    });
}

function requestFakePayment(total) {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.id = 'fakePaymentModal';
        overlay.className = 'delivery-address-overlay active';
        overlay.innerHTML = `
            <div class="delivery-address-dialog fake-payment-dialog" role="dialog" aria-modal="true" aria-labelledby="fakePaymentTitle">
                <button type="button" class="delivery-address-close" aria-label="Close">&times;</button>
                <div class="delivery-address-icon"><i class="fas fa-lock"></i></div>
                <span class="demo-payment-label">Demo payment</span>
                <h2 id="fakePaymentTitle">Choose how to pay</h2>
                <p class="delivery-address-copy">Order total: <strong>₹${total.toFixed(2)}</strong>. This is a simulated checkout; no money will be charged.</p>
                <div class="fake-payment-methods" role="group" aria-label="Payment method">
                    <button type="button" class="fake-payment-method active" data-method="card"><i class="fas fa-credit-card"></i><span>Card</span></button>
                    <button type="button" class="fake-payment-method" data-method="upi"><i class="fas fa-mobile-alt"></i><span>UPI</span></button>
                    <button type="button" class="fake-payment-method" data-method="cod"><i class="fas fa-hand-holding-usd"></i><span>Cash on delivery</span></button>
                </div>
                <div class="fake-payment-fields" data-fields="card">
                    <label for="fakeCardNumber">Card number</label>
                    <input id="fakeCardNumber" inputmode="numeric" maxlength="19" placeholder="4242 4242 4242 4242" autocomplete="off">
                    <div class="fake-payment-row">
                        <div><label for="fakeCardExpiry">Expiry</label><input id="fakeCardExpiry" maxlength="5" placeholder="MM/YY" autocomplete="off"></div>
                        <div><label for="fakeCardCvv">CVV</label><input id="fakeCardCvv" inputmode="numeric" maxlength="3" placeholder="123" autocomplete="off"></div>
                    </div>
                </div>
                <div class="fake-payment-fields" data-fields="upi" hidden>
                    <label for="fakeUpiId">UPI ID</label>
                    <input id="fakeUpiId" placeholder="name@upi" autocomplete="off">
                </div>
                <p class="delivery-address-error" role="alert" hidden>Complete the payment details to continue.</p>
                <div class="delivery-address-actions">
                    <button type="button" class="delivery-address-cancel">Cancel</button>
                    <button type="button" class="delivery-address-confirm fake-payment-submit">Pay ₹${total.toFixed(2)}</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const error = overlay.querySelector('.delivery-address-error');
        const close = () => {
            overlay.remove();
            resolve(false);
        };
        const selectedMethod = () => overlay.querySelector('.fake-payment-method.active').dataset.method;
        const isValid = () => {
            if (selectedMethod() === 'cod') return true;
            if (selectedMethod() === 'upi') return /^[^\s@]+@[^\s@]+$/.test(overlay.querySelector('#fakeUpiId').value.trim());
            return overlay.querySelector('#fakeCardNumber').value.replace(/\s/g, '').length >= 12 &&
                /^\d{2}\/\d{2}$/.test(overlay.querySelector('#fakeCardExpiry').value.trim()) &&
                /^\d{3}$/.test(overlay.querySelector('#fakeCardCvv').value.trim());
        };

        overlay.querySelectorAll('.fake-payment-method').forEach(methodButton => {
            methodButton.addEventListener('click', () => {
                overlay.querySelectorAll('.fake-payment-method').forEach(button => button.classList.remove('active'));
                methodButton.classList.add('active');
                overlay.querySelectorAll('.fake-payment-fields').forEach(fields => {
                    fields.hidden = fields.dataset.fields !== methodButton.dataset.method;
                });
                overlay.querySelector('.fake-payment-submit').innerText = methodButton.dataset.method === 'cod' ? 'Place order' : `Pay ₹${total.toFixed(2)}`;
                error.hidden = true;
            });
        });
        overlay.querySelector('.delivery-address-close').addEventListener('click', close);
        overlay.querySelector('.delivery-address-cancel').addEventListener('click', close);
        overlay.querySelector('.fake-payment-submit').addEventListener('click', () => {
            if (!isValid()) {
                error.hidden = false;
                return;
            }
            const submitButton = overlay.querySelector('.fake-payment-submit');
            submitButton.disabled = true;
            submitButton.innerText = 'Processing...';
            setTimeout(() => {
                overlay.remove();
                resolve(true);
            }, 700);
        });
        overlay.addEventListener('click', event => {
            if (event.target === overlay) close();
        });
        overlay.querySelector('#fakeCardNumber').focus();
    });
}

// Handle Order Checkout
async function handleCheckout() {
    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    // Retrieve current user and delivery address
    let currentUser = null;
    try {
        currentUser = JSON.parse(localStorage.getItem('pharmacare_user')) || null;
    } catch (e) {}

    let userAddress = currentUser ? (currentUser.delivery_address || currentUser.address || '') : (localStorage.getItem('pharmacare_address') || '');
    userAddress = await requestDeliveryAddress(userAddress);
    if (!userAddress) return;

    const paymentConfirmed = await requestFakePayment(total);
    if (!paymentConfirmed) return;

    if (currentUser) {
        currentUser.delivery_address = userAddress;
        localStorage.setItem('pharmacare_user', JSON.stringify(currentUser));
    }
    let userId = currentUser ? currentUser.id : null;

    const token = localStorage.getItem('pharmacare_token');
    const headers = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Helper: Save locally when backend is unreachable
    const saveOrderLocally = (items, totalVal, addr) => {
        const local = JSON.parse(localStorage.getItem('pharmacare_orders')) || [];
        const newId = Math.floor(Math.random() * 90000 + 10000);
        const newOrder = {
            id: newId,
            user_id: userId,
            items: JSON.stringify(items),
            total: totalVal,
            delivery_address: addr,
            address: addr,
            status: 'shipped',
            created_at: new Date().toISOString()
        };
        local.push(newOrder);
        localStorage.setItem('pharmacare_orders', JSON.stringify(local));
        return newId;
    };

    const saveOrderWithSupabaseOrLocal = async () => {
        const orderPayload = {
            user_id: userId,
            items: cart,
            total: total,
            delivery_address: userAddress,
            address: userAddress
        };
        if (window.SupabaseService) {
            try {
                const supaId = await window.SupabaseService.createOrder(orderPayload);
                if (supaId) {
                    saveOrderLocally(cart, total, userAddress);
                    return supaId;
                }
            } catch (e) {
                console.warn("Supabase create order error:", e);
            }
        }
        return saveOrderLocally(cart, total, userAddress);
    };

    fetch('/api/orders', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            items: cart,
            total: total,
            user_id: userId,
            delivery_address: userAddress,
            address: userAddress
        })
    })
    .then(async res => {
        if (res.status === 404 || res.status === 502 || res.status === 503) {
            const oId = await saveOrderWithSupabaseOrLocal();
            return { status: 201, data: { orderId: oId } };
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

        alert(`🎉 Purchase Successful!\nOrder ID: #LC-${res.data.orderId}\nTotal Order Value: ₹${total.toFixed(2)}\n\nThank you for choosing LIFECORE. Your medicines will be shipped shortly.`);

        // Refresh profile dashboard if they are on profile.html
        if (window.loadDashboardData) {
            window.loadDashboardData();
        }
    })
    .catch(async err => {
        const oId = await saveOrderWithSupabaseOrLocal();

        cart = [];
        saveCart();
        updateCartBadge();
        renderCart();
        toggleCart();

        alert(`🎉 Purchase Successful!\nOrder ID: #LC-${oId}\nTotal Order Value: ₹${total.toFixed(2)}\n\nThank you for choosing LIFECORE. Your medicines will be shipped shortly.`);

        if (window.loadDashboardData) {
            window.loadDashboardData();
        }
    });
}
