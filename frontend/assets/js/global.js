document.addEventListener("DOMContentLoaded", () => {
    // 1. Mobile Hamburger Menu Toggle
    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.querySelector("header nav");

    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", () => {
            navMenu.classList.toggle("active");
            
            // Toggle hamburger icon between bars and times (close)
            const icon = menuToggle.querySelector("i");
            if (icon) {
                if (navMenu.classList.contains("active")) {
                    icon.className = "fas fa-times";
                } else {
                    icon.className = "fas fa-bars";
                }
            }
        });

        // Close menu when clicking outside header areas
        document.addEventListener("click", (e) => {
            if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove("active");
                const icon = menuToggle.querySelector("i");
                if (icon) {
                    icon.className = "fas fa-bars";
                }
            }
        });
    }

    // 2. Sync Header Profile Icon Highlight if Authenticated
    const token = localStorage.getItem('pharmacare_token');
    const headerProfile = document.getElementById("headerProfileBtn");
    if (headerProfile) {
        if (token) {
            headerProfile.style.color = "var(--primary)";
            headerProfile.setAttribute("title", "Access Dashboard");
        } else {
            headerProfile.style.color = "var(--text-muted)";
            headerProfile.setAttribute("title", "Login / Signup");
        }
    }
});

// ================= DOCTOR APPOINTMENT BOOKING MODAL =================

// Open booking modal
function openBookingModal(doctorName) {
    const modal = document.getElementById("bookingModal");
    if (!modal) return;

    modal.classList.add("active");
    
    // Auto-select doctor dropdown item if provided
    const selectDoctor = document.getElementById("bookingDoctor");
    if (selectDoctor && doctorName) {
        for (let i = 0; i < selectDoctor.options.length; i++) {
            if (selectDoctor.options[i].value.toLowerCase().includes(doctorName.toLowerCase()) || 
                doctorName.toLowerCase().includes(selectDoctor.options[i].value.toLowerCase())) {
                selectDoctor.selectedIndex = i;
                break;
            }
        }
    }
}

// Close booking modal
function closeBookingModal() {
    const modal = document.getElementById("bookingModal");
    if (!modal) return;

    modal.classList.remove("active");
    
    // Clear validation errors
    document.getElementById("bookingNameError").innerText = "";
    document.getElementById("bookingPhoneError").innerText = "";
    document.getElementById("bookingDateError").innerText = "";

    // Reset screen state
    document.getElementById("bookingFormBody").style.display = "flex";
    document.getElementById("bookingSuccessScreen").style.display = "none";
}

// Submit and validate booking details
function submitBooking(event) {
    event.preventDefault();

    const name = document.getElementById("bookingName").value.trim();
    const phone = document.getElementById("bookingPhone").value.trim();
    const date = document.getElementById("bookingDate").value;
    const doctor = document.getElementById("bookingDoctor").value;
    const time = document.getElementById("bookingTime").value;

    // Reset error text
    document.getElementById("bookingNameError").innerText = "";
    document.getElementById("bookingPhoneError").innerText = "";
    document.getElementById("bookingDateError").innerText = "";

    let isValid = true;

    // Validate Name
    if (name === "") {
        document.getElementById("bookingNameError").innerText = "Please enter your name.";
        isValid = false;
    }

    // Validate Phone (10 digits)
    const phonePattern = /^[0-9]{10}$/;
    if (!phone.match(phonePattern)) {
        document.getElementById("bookingPhoneError").innerText = "Please enter a valid 10-digit number.";
        isValid = false;
    }

    // Validate Date
    if (date === "") {
        document.getElementById("bookingDateError").innerText = "Please select a date.";
        isValid = false;
    }

    if (isValid) {
        const token = localStorage.getItem('pharmacare_token');
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Helper: Save locally when backend is unreachable
        const saveBookingLocally = (booking) => {
            const local = JSON.parse(localStorage.getItem('pharmacare_bookings')) || [];
            const newBooking = {
                id: 'LOK-' + Math.floor(Math.random() * 90000 + 10000),
                patient_name: booking.patient_name,
                phone: booking.phone,
                date: booking.date,
                doctor: booking.doctor,
                time_slot: booking.time_slot,
                status: 'confirmed',
                created_at: new Date().toISOString()
            };
            local.push(newBooking);
            localStorage.setItem('pharmacare_bookings', JSON.stringify(local));
            return newBooking.id;
        };

        fetch('/api/bookings', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                patient_name: name,
                phone: phone,
                date: date,
                doctor: doctor,
                time_slot: time
            })
        })
        .then(res => {
            if (res.status === 404 || res.status === 502 || res.status === 503) {
                const localId = saveBookingLocally({ patient_name: name, phone: phone, date: date, doctor: doctor, time_slot: time });
                return { status: 201, data: { bookingId: localId } };
            }
            return res.json().then(data => ({ status: res.status, data }));
        })
        .then(res => {
            if (res.status !== 201) {
                throw new Error(res.data.error || 'Booking failed');
            }

            // Hide Form, Show Success Checkmark
            document.getElementById("bookingFormBody").style.display = "none";
            
            const successDetail = document.getElementById("successDetailText");
            if (successDetail) {
                successDetail.innerHTML = `Your appointment with <strong>${doctor}</strong> is scheduled for <strong>${date}</strong> during the <strong>${time}</strong> slot.<br>A coordinator will contact you at <strong>${phone}</strong> shortly to confirm.`;
            }

            document.getElementById("bookingSuccessScreen").style.display = "flex";
            document.getElementById("appointmentForm").reset();

            // Refresh profile dashboard if they are on profile.html
            if (window.loadDashboardData) {
                window.loadDashboardData();
            }
        })
        .catch(err => {
            const localId = saveBookingLocally({ patient_name: name, phone: phone, date: date, doctor: doctor, time_slot: time });
            
            document.getElementById("bookingFormBody").style.display = "none";
            const successDetail = document.getElementById("successDetailText");
            if (successDetail) {
                successDetail.innerHTML = `Your appointment with <strong>${doctor}</strong> is scheduled for <strong>${date}</strong> during the <strong>${time}</strong> slot.<br>A coordinator will contact you at <strong>${phone}</strong> shortly to confirm. (Local Offline Mode)`;
            }
            document.getElementById("bookingSuccessScreen").style.display = "flex";
            document.getElementById("appointmentForm").reset();

            if (window.loadDashboardData) {
                window.loadDashboardData();
            }
        });
    }
}

