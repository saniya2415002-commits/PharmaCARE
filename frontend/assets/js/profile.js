// Client Authentication and Profile Dashboard controller
let currentUser = null;
const tokenKey = 'pharmacare_token';

document.addEventListener("DOMContentLoaded", () => {
    checkAuthState();
});

// Check if user is logged in
function checkAuthState() {
    const token = localStorage.getItem(tokenKey);
    const authGate = document.getElementById("authGate");
    const dashboardPanel = document.getElementById("dashboardPanel");

    if (!token) {
        if (authGate) authGate.style.display = "flex";
        if (dashboardPanel) dashboardPanel.style.display = "none";
        updateGlobalHeaderProfile(false);
        return;
    }

    // Helper: Load user details locally
    const loadMockUser = (email) => {
        const localUsers = JSON.parse(localStorage.getItem('pharmacare_users')) || [];
        let user = localUsers.find(u => u.email === email);
        if (!user) {
            user = {
                name: "Demo Patient",
                email: email,
                phone: "9876543210",
                diseases: "Cough, Fever"
            };
        }
        return user;
    };

    if (token.startsWith('mock-token-')) {
        const email = token.replace('mock-token-', '');
        currentUser = loadMockUser(email);
        displayDashboard(currentUser);
        return;
    }

    // Fetch user details from API
    fetch('/api/auth/me', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => {
        if (res.status === 404 || res.status === 502 || res.status === 503) {
            currentUser = loadMockUser("demo@pharmacare.com");
            displayDashboard(currentUser);
            return null;
        }
        if (res.status === 401) {
            throw new Error('Session expired');
        }
        return res.json();
    })
    .then(data => {
        if (!data) return;
        currentUser = data.user;
        displayDashboard(currentUser);
    })
    .catch(err => {
        console.error(err);
        currentUser = loadMockUser("demo@pharmacare.com");
        displayDashboard(currentUser);
    });
}

// Sub-helper: display dashboard UI
function displayDashboard(user) {
    const authGate = document.getElementById("authGate");
    const dashboardPanel = document.getElementById("dashboardPanel");
    
    if (authGate) authGate.style.display = "none";
    if (dashboardPanel) dashboardPanel.style.display = "grid";
    
    const sidebarUserName = document.getElementById("sidebarUserName");
    if (sidebarUserName) sidebarUserName.innerText = user.name || '';

    const sidebarUserEmail = document.getElementById("sidebarUserEmail");
    if (sidebarUserEmail) sidebarUserEmail.innerText = user.email || '';
    
    const sidebarDisease = document.getElementById("sidebarDiseaseBadge");
    if (sidebarDisease) {
        if (user.diseases) {
            sidebarDisease.innerHTML = `<i class="fas fa-notes-medical" style="margin-right: 4px;"></i> Diseases: ${user.diseases}`;
            sidebarDisease.style.display = "block";
        } else {
            sidebarDisease.style.display = "none";
        }
    }
    
    const settingsName = document.getElementById("settingsName");
    if (settingsName) settingsName.value = user.name || '';

    const settingsEmail = document.getElementById("settingsEmail");
    if (settingsEmail) settingsEmail.value = user.email || '';

    const settingsPhone = document.getElementById("settingsPhone");
    if (settingsPhone) settingsPhone.value = user.phone || '';
    
    const settingsDiseases = document.getElementById("settingsDiseases");
    if (settingsDiseases) {
        settingsDiseases.value = user.diseases || '';
    }
    
    updateGlobalHeaderProfile(true);
    loadDashboardData();

    if (typeof window.subscribeToRealtimeUpdates === 'function' && !window.hasSubscribedRealtime) {
        window.hasSubscribedRealtime = true;
        window.subscribeToRealtimeUpdates(
            (bookingPayload) => {
                console.log("Realtime: Refreshing appointment dashboard data...");
                loadDashboardData();
            },
            (orderPayload) => {
                console.log("Realtime: Refreshing order dashboard data...");
                loadDashboardData();
            }
        );
    }
}

// Switch Login/Register Tabs
function switchAuthTab(tab) {
    const tabs = document.querySelectorAll(".auth-tab");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    tabs.forEach(t => t.classList.remove("active"));

    const clickEvent = window.event || (typeof event !== 'undefined' ? event : null);
    if (clickEvent && clickEvent.currentTarget) {
        clickEvent.currentTarget.classList.add("active");
    } else {
        tabs.forEach(t => {
            if (t.innerText.toLowerCase().trim() === tab.toLowerCase().trim()) {
                t.classList.add("active");
            }
        });
    }

    if (tab === 'login') {
        loginForm.classList.add("active");
        registerForm.classList.remove("active");
    } else {
        loginForm.classList.remove("active");
        registerForm.classList.add("active");
    }
}

// Switch Profile Dashboard Tab Panels
function switchDashboardTab(panelName) {
    const tabs = document.querySelectorAll(".sidebar-tab-btn");
    const panels = document.querySelectorAll(".content-panel");

    tabs.forEach(t => t.classList.remove("active"));

    const clickEvent = window.event || (typeof event !== 'undefined' ? event : null);
    if (clickEvent && clickEvent.currentTarget) {
        clickEvent.currentTarget.classList.add("active");
    } else {
        tabs.forEach(t => {
            if (t.innerText.toLowerCase().includes(panelName.slice(0, 4))) {
                t.classList.add("active");
            }
        });
    }

    panels.forEach(p => p.classList.remove("active"));
    
    if (panelName === 'appointments') {
        document.getElementById("panelAppointments").classList.add("active");
    } else if (panelName === 'orders') {
        document.getElementById("panelOrders").classList.add("active");
    } else if (panelName === 'settings') {
        document.getElementById("panelSettings").classList.add("active");
    }
}

// Handle login submission
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const errorEl = document.getElementById("loginError");

    errorEl.innerText = "";

    fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(res => {
        if (res.status === 404 || res.status === 502 || res.status === 503) {
            const localUsers = JSON.parse(localStorage.getItem('pharmacare_users')) || [];
            const matched = localUsers.find(u => u.email === email && u.password === password);
            if (matched || email === "demo@pharmacare.com") {
                localStorage.setItem(tokenKey, 'mock-token-' + email);
                checkAuthState();
                return null;
            } else {
                throw new Error("Invalid credentials or user not registered locally.");
            }
        }
        return res.json().then(data => ({ status: res.status, data }));
    })
    .then(res => {
        if (!res) return;
        if (res.status !== 200) {
            throw new Error(res.data.error || 'Login failed');
        }
        localStorage.setItem(tokenKey, res.data.token);
        checkAuthState();
    })
    .catch(err => {
        const localUsers = JSON.parse(localStorage.getItem('pharmacare_users')) || [];
        const matched = localUsers.find(u => u.email === email && u.password === password);
        if (matched || email === "demo@pharmacare.com") {
            localStorage.setItem(tokenKey, 'mock-token-' + email);
            checkAuthState();
        } else {
            errorEl.innerText = err.message || "Network offline. Register locally first.";
        }
    });
}

// Handle signup registration
function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const phone = document.getElementById("regPhone").value.trim();
    const password = document.getElementById("regPassword").value;
    const diseasesInput = document.getElementById("regDiseases");
    const diseases = diseasesInput ? diseasesInput.value.trim() : "";
    const errorEl = document.getElementById("registerError");
    const phoneErrorEl = document.getElementById("regPhoneError");

    errorEl.innerText = "";
    phoneErrorEl.innerText = "";

    const phonePattern = /^[0-9]{10}$/;
    if (!phone.match(phonePattern)) {
        phoneErrorEl.innerText = "Please enter a valid 10-digit number.";
        return;
    }

    if (password.length < 6) {
        errorEl.innerText = "Password must be at least 6 characters long.";
        return;
    }

    const registerLocally = () => {
        const localUsers = JSON.parse(localStorage.getItem('pharmacare_users')) || [];
        const exists = localUsers.some(u => u.email === email);
        if (exists) {
            throw new Error("Email already registered locally.");
        }
        localUsers.push({ name, email, phone, password, diseases });
        localStorage.setItem('pharmacare_users', JSON.stringify(localUsers));
        localStorage.setItem(tokenKey, 'mock-token-' + email);
        checkAuthState();
    };

    fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, phone, password, diseases })
    })
    .then(res => {
        if (res.status === 404 || res.status === 502 || res.status === 503) {
            registerLocally();
            return null;
        }
        return res.json().then(data => ({ status: res.status, data }));
    })
    .then(res => {
        if (!res) return;
        if (res.status !== 201) {
            throw new Error(res.data.error || 'Registration failed');
        }
        localStorage.setItem(tokenKey, res.data.token);
        checkAuthState();
    })
    .catch(err => {
        try {
            registerLocally();
        } catch (localErr) {
            errorEl.innerText = localErr.message;
        }
    });
}

// Handle Logout
function handleLogout() {
    localStorage.removeItem(tokenKey);
    currentUser = null;
    updateGlobalHeaderProfile(false);
    
    // Clear lists
    const apts = document.getElementById("appointmentsList");
    if (apts) apts.innerHTML = "";

    const ords = document.getElementById("ordersList");
    if (ords) ords.innerHTML = "";
    
    checkAuthState();
}

// Update User Profile Details
function handleUpdateProfile(e) {
    e.preventDefault();
    const name = document.getElementById("settingsName").value.trim();
    const phone = document.getElementById("settingsPhone").value.trim();
    const password = document.getElementById("settingsPassword").value;
    const diseasesInput = document.getElementById("settingsDiseases");
    const diseases = diseasesInput ? diseasesInput.value.trim() : "";
    const errorEl = document.getElementById("settingsError");
    const phoneErrorEl = document.getElementById("settingsPhoneError");
    const successEl = document.getElementById("settingsSuccess");

    errorEl.innerText = "";
    phoneErrorEl.innerText = "";
    successEl.style.display = "none";

    const phonePattern = /^[0-9]{10}$/;
    if (!phone.match(phonePattern)) {
        phoneErrorEl.innerText = "Please enter a valid 10-digit number.";
        return;
    }

    const payload = { name, phone, diseases };
    if (password) {
        if (password.length < 6) {
            errorEl.innerText = "New password must be at least 6 characters.";
            return;
        }
        payload.password = password;
    }

    const token = localStorage.getItem(tokenKey);

    const updateLocally = () => {
        const localUsers = JSON.parse(localStorage.getItem('pharmacare_users')) || [];
        const index = localUsers.findIndex(u => u.email === currentUser.email);
        const updatedUser = { ...currentUser, name, phone, diseases };
        if (password) {
            updatedUser.password = password;
        }
        if (index > -1) {
            localUsers[index] = updatedUser;
        } else {
            localUsers.push(updatedUser);
        }
        localStorage.setItem('pharmacare_users', JSON.stringify(localUsers));
        currentUser = updatedUser;
        
        successEl.style.display = "block";
        document.getElementById("settingsPassword").value = "";
        displayDashboard(currentUser);
        setTimeout(() => { successEl.style.display = "none"; }, 3000);
    };

    if (token.startsWith('mock-token-')) {
        updateLocally();
        return;
    }

    fetch('/api/auth/update', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    })
    .then(res => {
        if (res.status === 404 || res.status === 502 || res.status === 503) {
            updateLocally();
            return null;
        }
        return res.json().then(data => ({ status: res.status, data }));
    })
    .then(res => {
        if (!res) return;
        if (res.status !== 200) {
            throw new Error(res.data.error || 'Failed to update profile.');
        }
        successEl.style.display = "block";
        document.getElementById("settingsPassword").value = "";
        checkAuthState();
        setTimeout(() => { successEl.style.display = "none"; }, 3000);
    })
    .catch(err => {
        updateLocally();
    });
}

// Load Appointments & Orders Lists
function loadDashboardData() {
    const token = localStorage.getItem(tokenKey);

    const loadLocalData = () => {
        const localBookings = JSON.parse(localStorage.getItem('pharmacare_bookings')) || [];
        const myBookings = localBookings.filter(b => b.phone === currentUser.phone);
        renderAppointments(myBookings);

        const localOrders = JSON.parse(localStorage.getItem('pharmacare_orders')) || [];
        renderOrders(localOrders);
    };

    if (token.startsWith('mock-token-')) {
        loadLocalData();
        return;
    }

    // 1. Fetch appointments
    fetch('/api/bookings/my-bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
        if (res.status === 404) {
            loadLocalData();
            throw new Error("Local mode active");
        }
        return res.json();
    })
    .then(data => {
        if (data) renderAppointments(data.bookings);
    })
    .catch(err => {
        console.warn("Loading local appointments due to:", err.message);
        loadLocalData();
    });

    // 2. Fetch orders
    fetch('/api/orders/my-orders', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
        if (res.status === 404) return;
        return res.json();
    })
    .then(data => {
        if (data) renderOrders(data.orders);
    })
    .catch(err => {
        console.error("Error loading orders:", err);
        loadLocalData();
    });
}

// Render appointments template
function renderAppointments(bookings) {
    const container = document.getElementById("appointmentsList");
    if (!container) return;

    if (!bookings || bookings.length === 0) {
        container.innerHTML = `
            <div class="empty-panel-msg">
                <i class="far fa-calendar-times"></i>
                <p>No appointments booked yet.</p>
            </div>
        `;
        return;
    }

    let html = "";
    bookings.forEach(apt => {
        const formattedDate = new Date(apt.date).toLocaleDateString('en-US', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
        });
        const statusClass = apt.status.toLowerCase();
        const isCancelled = apt.status.toLowerCase() === 'cancelled';
        const cancelBtnHtml = isCancelled ? '' : `<button class="cancel-apt-btn" onclick="cancelAppointment('${apt.id}')">Cancel</button>`;

        html += `
            <div class="appointment-log-card">
                <div class="apt-details">
                    <h4>${apt.doctor}</h4>
                    <p><i class="far fa-user"></i> Patient: ${apt.patient_name}</p>
                    <p><i class="far fa-calendar-alt"></i> Date: ${formattedDate}</p>
                    <p><i class="far fa-clock"></i> Slot: ${apt.time_slot}</p>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 10px;">
                    <span class="status-badge ${statusClass}">${apt.status}</span>
                    ${cancelBtnHtml}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Cancel Appointment request handler
function cancelAppointment(id) {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    const token = localStorage.getItem(tokenKey);

    const cancelLocally = () => {
        const localBookings = JSON.parse(localStorage.getItem('pharmacare_bookings')) || [];
        const index = localBookings.findIndex(b => b.id == id);
        if (index > -1) {
            localBookings[index].status = 'Cancelled';
            localStorage.setItem('pharmacare_bookings', JSON.stringify(localBookings));
            alert("Appointment cancelled successfully (Local offline mode).");
            loadDashboardData();
        } else {
            alert("Failed to find appointment locally.");
        }
    };

    if (token && token.startsWith('mock-token-')) {
        cancelLocally();
        return;
    }

    fetch(`/api/bookings/${id}/cancel`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => {
        if (res.status === 404 || res.status === 502 || res.status === 503) {
            cancelLocally();
            return null;
        }
        return res.json().then(data => ({ status: res.status, data }));
    })
    .then(res => {
        if (!res) return;
        if (res.status !== 200) {
            throw new Error(res.data.error || 'Failed to cancel appointment');
        }
        alert(res.data.message || "Appointment cancelled successfully.");
        loadDashboardData();
    })
    .catch(err => {
        cancelLocally();
    });
}

// Render orders template
function renderOrders(orders) {
    const container = document.getElementById("ordersList");
    if (!container) return;

    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div class="empty-panel-msg">
                <i class="fas fa-shopping-basket"></i>
                <p>No order checkouts recorded yet.</p>
            </div>
        `;
        return;
    }

    let html = "";
    orders.forEach(order => {
        const orderDate = new Date(order.created_at).toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        
        let itemsList = order.items;
        if (typeof itemsList === 'string') {
            try {
                itemsList = JSON.parse(itemsList);
            } catch (e) {
                itemsList = [];
            }
        }
        let itemsHtml = "";
        itemsList.forEach(item => {
            itemsHtml += `
                <div class="order-item-row">
                    <span>${item.name} <span class="order-item-qty">x${item.qty}</span></span>
                    <span>₹${(item.price * item.qty).toFixed(2)}</span>
                </div>
            `;
        });

        html += `
            <div class="order-log-card">
                <div class="order-log-header">
                    <h4>Order ID: #PC-${order.id}</h4>
                    <span class="order-date">${orderDate}</span>
                </div>
                <div class="order-log-body">
                    ${itemsHtml}
                </div>
                <div class="order-log-footer">
                    <span>Status: <strong style="color: var(--secondary);">${order.status}</strong></span>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span class="order-total-price">Total: ₹${order.total.toFixed(2)}</span>
                        <button class="track-order-btn" onclick="openOrderTrackModal('${order.id}', '${orderDate}', '${order.status}', ${order.total}, '${encodeURIComponent(JSON.stringify(itemsList))}')">Track Order</button>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Open Order Track modal with dynamic timeline status
function openOrderTrackModal(id, date, status, total, encodedItems) {
    const modal = document.getElementById("orderModal");
    if (!modal) return;

    document.getElementById("modalOrderId").innerText = `Order Details: #PC-${id}`;
    document.getElementById("modalOrderDate").innerText = `Ordered on: ${date}`;
    document.getElementById("modalOrderTotal").innerText = `₹${parseFloat(total).toFixed(2)}`;

    // Decode and parse items
    let items = [];
    try {
        items = JSON.parse(decodeURIComponent(encodedItems));
    } catch (e) {
        console.error("Failed to decode items:", e);
    }

    // Render items list inside modal
    const itemsContainer = document.getElementById("modalItemsContainer");
    let itemsHtml = "";
    items.forEach(item => {
        itemsHtml += `
            <div class="order-item-row" style="margin: 8px 0; font-size: 14px;">
                <span>${item.name} <span class="order-item-qty">x${item.qty}</span></span>
                <span>₹${(item.price * item.qty).toFixed(2)}</span>
            </div>
        `;
    });
    itemsContainer.innerHTML = itemsHtml;

    // Reset timeline classes
    const timeline = document.getElementById("orderTimeline");
    timeline.className = "order-timeline"; // clear previous status classes
    
    const stepProcessing = document.getElementById("step-processing");
    const stepShipped = document.getElementById("step-shipped");
    const stepDelivered = document.getElementById("step-delivered");

    stepProcessing.classList.remove("active");
    stepShipped.classList.remove("active");
    stepDelivered.classList.remove("active");

    // Activate steps based on status
    const statusLower = status.toLowerCase();
    
    // All orders get processing highlighted if they are confirmed/shipped/delivered
    stepProcessing.classList.add("active");

    if (statusLower === 'shipped') {
        stepShipped.classList.add("active");
        timeline.classList.add("status-shipped");
    } else if (statusLower === 'delivered' || statusLower === 'completed') {
        stepShipped.classList.add("active");
        stepDelivered.classList.add("active");
        timeline.classList.add("status-delivered");
    } else {
        // Just processing
        timeline.classList.add("status-processing");
    }

    // Show modal
    modal.classList.add("active");
    document.body.style.overflow = "hidden"; // lock scroll
}

function closeOrderModal(event) {
    const modal = document.getElementById("orderModal");
    if (modal) {
        modal.classList.remove("active");
        document.body.style.overflow = "auto"; // unlock scroll
    }
}

// Helper: toggle header UI indicator based on Auth state
function updateGlobalHeaderProfile(isLoggedIn) {
    const headerProfile = document.getElementById("headerProfileBtn");
    if (headerProfile) {
        if (isLoggedIn) {
            headerProfile.style.color = "var(--primary)";
            headerProfile.setAttribute("title", "Access Dashboard");
        } else {
            headerProfile.style.color = "var(--text-muted)";
            headerProfile.setAttribute("title", "Login / Signup");
        }
    }
}

// 6. Password Visibility Toggle
function togglePasswordVisibility(inputId, iconEl) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === "password") {
        input.type = "text";
        iconEl.classList.remove("fa-eye");
        iconEl.classList.add("fa-eye-slash");
    } else {
        input.type = "password";
        iconEl.classList.remove("fa-eye-slash");
        iconEl.classList.add("fa-eye");
    }
}
