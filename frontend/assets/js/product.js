// 1. Category Filter Functionality
function filterCategory(category) {
    const cards = document.querySelectorAll('.card');
    const buttons = document.querySelectorAll('.filter-btn');

    // Button Active toggle
    buttons.forEach(btn => btn.classList.remove('active'));

    const clickEvent = window.event || (typeof event !== 'undefined' ? event : null);
    if (clickEvent && clickEvent.currentTarget) {
        clickEvent.currentTarget.classList.add('active');
    } else {
        buttons.forEach(btn => {
            if (btn.innerText.toLowerCase().trim() === category.toLowerCase().trim() ||
                (category === 'all' && btn.innerText.toLowerCase().trim() === 'all')) {
                btn.classList.add('active');
            }
        });
    }

    cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (category === 'all' || cardCategory === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// 2. Live Search Functionality
function filterProducts() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        const title = card.querySelector('h3').innerText.toLowerCase();
        if (title.includes(input)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// 3. Add to Cart is handled globally by cart.js

// 4. Auto-filter category on page load from URL query params
document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    if (category) {
        filterCategory(category.toLowerCase().trim());
    }
});