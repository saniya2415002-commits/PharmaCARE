// 1. Gallery Category Filter
function filterGallery(category, evt) {
    const items = document.querySelectorAll('.gallery-item');
    const buttons = document.querySelectorAll('.filter-btn');

    buttons.forEach(btn => btn.classList.remove('active'));

    const targetEvent = evt || (typeof event !== 'undefined' ? event : null);
    if (targetEvent && targetEvent.currentTarget) {
        targetEvent.currentTarget.classList.add('active');
    } else {
        buttons.forEach(btn => {
            if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(category)) {
                btn.classList.add('active');
            }
        });
    }

    items.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (category === 'all' || itemCategory === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// 2. Open Lightbox Popup
function openLightbox(imgSrc, captionText) {
    const modal = document.getElementById('lightboxModal');
    const modalImg = document.getElementById('lightboxImg');
    const modalCaption = document.getElementById('lightboxCaption');

    modal.style.display = 'flex';
    modalImg.src = imgSrc;
    modalCaption.innerText = captionText;
}

// 3. Close Lightbox Popup
function closeLightbox() {
    document.getElementById('lightboxModal').style.display = 'none';
}

// Close when clicking outside image
window.onclick = function(event) {
    const modal = document.getElementById('lightboxModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};