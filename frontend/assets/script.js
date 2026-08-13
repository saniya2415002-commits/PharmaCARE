// Tab Switcher Function
function openTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));

    // Remove active class from all buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));

    // Show active tab
    document.getElementById(tabName).classList.add('active');
    
    const clickEvent = window.event || (typeof event !== 'undefined' ? event : null);
    if (clickEvent && clickEvent.currentTarget) {
        clickEvent.currentTarget.classList.add('active');
    } else {
        tabButtons.forEach(btn => {
            if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(tabName)) {
                btn.classList.add('active');
            }
        });
    }
}


// Simple Counter Animation & Image Slider
document.addEventListener('DOMContentLoaded', () => {
    // 1. Counter Animation
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        let count = 0;
        const speed = target / 50;

        const updateCount = () => {
            count += speed;
            if (count < target) {
                counter.innerText = Math.ceil(count);
                setTimeout(updateCount, 30);
            } else {
                counter.innerText = target + '+';
            }
        };
        updateCount();
    });

    // 2. Slider Carousel Functionality
    const slides = document.querySelectorAll('.slider .slide');
    const prevBtn = document.getElementById('prevSlideBtn');
    const nextBtn = document.getElementById('nextSlideBtn');
    
    if (slides.length > 0) {
        let currentSlide = 0;
        let slideInterval;
        
        const showSlide = (index) => {
            slides.forEach(slide => slide.classList.remove('active'));
            slides[index].classList.add('active');
        };
        
        const nextSlide = () => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        };
        
        const prevSlide = () => {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        };
        
        const startSlideShow = () => {
            slideInterval = setInterval(nextSlide, 5000);
        };
        
        const resetSlideInterval = () => {
            clearInterval(slideInterval);
            startSlideShow();
        };
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                resetSlideInterval();
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                resetSlideInterval();
            });
        }
        
        startSlideShow();
    }

    // 3. Reviews Carousel Functionality
    const track = document.getElementById('reviewsTrack');
    const prevReviewBtn = document.getElementById('prevReviewBtn');
    const nextReviewBtn = document.getElementById('nextReviewBtn');
    
    if (track) {
        let reviewIndex = 0;
        
        const getCardsPerView = () => {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        };
        
        const updateReviewPosition = () => {
            const cards = track.querySelectorAll('.review-card');
            if (cards.length === 0) return;
            const cardsPerView = getCardsPerView();
            const maxIndex = Math.max(0, cards.length - cardsPerView);
            
            if (reviewIndex > maxIndex) {
                reviewIndex = maxIndex;
            }
            
            const cardWidth = cards[0].getBoundingClientRect().width;
            const gap = 30; // matches CSS gap
            const offset = reviewIndex * (cardWidth + gap);
            track.style.transform = `translateX(-${offset}px)`;
        };
        
        if (nextReviewBtn) {
            nextReviewBtn.addEventListener('click', () => {
                const cards = track.querySelectorAll('.review-card');
                const cardsPerView = getCardsPerView();
                const maxIndex = Math.max(0, cards.length - cardsPerView);
                
                if (reviewIndex < maxIndex) {
                    reviewIndex++;
                    updateReviewPosition();
                }
            });
        }
        
        if (prevReviewBtn) {
            prevReviewBtn.addEventListener('click', () => {
                if (reviewIndex > 0) {
                    reviewIndex--;
                    updateReviewPosition();
                }
            });
        }
        
        window.addEventListener('resize', updateReviewPosition);
        setTimeout(updateReviewPosition, 100);
    }

    // 4. Offer Slider Carousel Functionality
    const prevOfferBtn = document.getElementById('prevOfferBtn');
    const nextOfferBtn = document.getElementById('nextOfferBtn');
    const offerSlides = document.querySelectorAll('.offer-slide');

    if (offerSlides.length > 0) {
        let offerIndex = 0;
        let offerInterval;

        const showOfferSlide = (index) => {
            offerSlides.forEach(slide => slide.classList.remove('active'));
            offerSlides[index].classList.add('active');
        };

        const nextOfferSlide = () => {
            offerIndex = (offerIndex + 1) % offerSlides.length;
            showOfferSlide(offerIndex);
        };

        const prevOfferSlide = () => {
            offerIndex = (offerIndex - 1 + offerSlides.length) % offerSlides.length;
            showOfferSlide(offerIndex);
        };

        const startOfferInterval = () => {
            offerInterval = setInterval(nextOfferSlide, 5000);
        };

        const resetOfferInterval = () => {
            clearInterval(offerInterval);
            startOfferInterval();
        };

        if (nextOfferBtn) {
            nextOfferBtn.addEventListener('click', () => {
                nextOfferSlide();
                resetOfferInterval();
            });
        }

        if (prevOfferBtn) {
            prevOfferBtn.addEventListener('click', () => {
                prevOfferSlide();
                resetOfferInterval();
            });
        }

        startOfferInterval();
    }

    // 5. Blogs Slider Carousel Functionality
    const blogsTrack = document.getElementById('blogsTrack');
    const prevBlogBtn = document.getElementById('prevBlogBtn');
    const nextBlogBtn = document.getElementById('nextBlogBtn');

    if (blogsTrack) {
        let blogIndex = 0;

        const getBlogCardsPerView = () => {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        };

        const updateBlogPosition = () => {
            const cards = blogsTrack.querySelectorAll('.blog-card');
            if (cards.length === 0) return;
            const cardsPerView = getBlogCardsPerView();
            const maxIndex = Math.max(0, cards.length - cardsPerView);

            if (blogIndex > maxIndex) {
                blogIndex = maxIndex;
            }

            const cardWidth = cards[0].getBoundingClientRect().width;
            const gap = 30; // matches CSS gap
            const offset = blogIndex * (cardWidth + gap);
            blogsTrack.style.transform = `translateX(-${offset}px)`;
        };

        if (nextBlogBtn) {
            nextBlogBtn.addEventListener('click', () => {
                const cards = blogsTrack.querySelectorAll('.blog-card');
                const cardsPerView = getBlogCardsPerView();
                const maxIndex = Math.max(0, cards.length - cardsPerView);

                if (blogIndex < maxIndex) {
                    blogIndex++;
                    updateBlogPosition();
                }
            });
        }

        if (prevBlogBtn) {
            prevBlogBtn.addEventListener('click', () => {
                if (blogIndex > 0) {
                    blogIndex--;
                    updateBlogPosition();
                }
            });
        }

        window.addEventListener('resize', updateBlogPosition);
        setTimeout(updateBlogPosition, 100);
    }

    // 6. Disease-Based Product Recommendations
    const initializeDiseaseRecommendations = () => {
        const token = localStorage.getItem('pharmacare_token');
        const heading = document.querySelector('.section-heading');
        const cards = document.querySelectorAll('.products .card, .products-grid-section .card');

        if (!token || cards.length === 0) {
            return;
        }

        const getUserDiseases = () => {
            if (token.startsWith('mock-token-')) {
                const email = token.replace('mock-token-', '');
                const localUsers = JSON.parse(localStorage.getItem('pharmacare_users')) || [];
                const user = localUsers.find(u => u.email === email);
                return Promise.resolve(user ? user.diseases : 'cough, fever');
            }
            return fetch('/api/auth/me', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => {
                if (!res.ok) throw new Error('Not logged in');
                return res.json();
            })
            .then(data => (data && data.user ? data.user.diseases : ''));
        };

        getUserDiseases()
        .then(diseases => {
            if (!diseases) return;

            const userDiseases = diseases.toLowerCase();
            
            // Map product names to disease keywords
            const productMappings = {
                'paracetamol': ['fever', 'pain', 'headache', 'body ache', 'cold', 'flu'],
                'cough': ['cough', 'cold', 'throat', 'bronchitis'],
                'multivitamin': ['vitamin', 'immunity', 'weakness', 'energy', 'deficiency'],
                'antiseptic': ['wound', 'cut', 'infection', 'injury', 'burn', 'skin', 'creams'],
                'vitamin c': ['scurvy', 'immunity', 'cold', 'vitamin c'],
                'pain relief': ['sprain', 'muscle', 'joint', 'back pain', 'pain'],
                'antacid': ['acidity', 'gas', 'indigestion', 'heartburn', 'stomach']
            };

            let matchCount = 0;

            cards.forEach(card => {
                const titleEl = card.querySelector('h3');
                if (!titleEl) return;
                const productName = titleEl.innerText.toLowerCase();
                let isRecommended = false;

                for (const [prodKey, keywords] of Object.entries(productMappings)) {
                    if (productName.includes(prodKey)) {
                        isRecommended = keywords.some(keyword => userDiseases.includes(keyword));
                        break;
                    }
                }

                if (isRecommended) {
                    matchCount++;
                    if (!card.querySelector('.rec-badge')) {
                        const badge = document.createElement('span');
                        badge.className = 'rec-badge';
                        badge.innerHTML = '<i class="fas fa-star" style="margin-right: 4px;"></i> Recommended';
                        badge.style.cssText = 'display: inline-block; background: #22c55e; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;';
                        
                        titleEl.parentNode.insertBefore(badge, titleEl);
                        card.style.borderColor = '#22c55e';
                        card.style.boxShadow = '0 10px 25px -5px rgba(34, 197, 94, 0.15), 0 8px 10px -6px rgba(34, 197, 94, 0.15)';
                        card.style.order = '-1';
                    }
                }
            });

            if (matchCount > 0 && heading) {
                heading.innerText = `Personalized Recommendations For You`;
            }
        })
        .catch(err => {
            console.log("Failed to fetch diseases for recommendations:", err.message);
        });
    };

    initializeDiseaseRecommendations();
});