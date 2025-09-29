// Sample blog data
const blogPosts = [
    {
        id: 1,
        title: "The Future of Web Development",
        excerpt: "Exploring the latest trends and technologies shaping the future of web development, from AI integration to progressive web apps.",
        category: "technology",
        date: "2024-01-15",
        readTime: "5 min read",
        image: "fas fa-code"
    },
    {
        id: 2,
        title: "Minimalist Living: Less is More",
        excerpt: "Discover how embracing minimalism can lead to a more fulfilling and stress-free lifestyle in our modern world.",
        category: "lifestyle",
        date: "2024-01-12",
        readTime: "4 min read",
        image: "fas fa-leaf"
    },
    {
        id: 3,
        title: "Hidden Gems of Southeast Asia",
        excerpt: "A travel guide to the most beautiful and lesser-known destinations in Southeast Asia that will take your breath away.",
        category: "travel",
        date: "2024-01-10",
        readTime: "7 min read",
        image: "fas fa-plane"
    },
    {
        id: 4,
        title: "The Art of Homemade Pasta",
        excerpt: "Learn the traditional Italian techniques for making perfect pasta from scratch, including tips from nonna's kitchen.",
        category: "food",
        date: "2024-01-08",
        readTime: "6 min read",
        image: "fas fa-utensils"
    },
    {
        id: 5,
        title: "JavaScript ES2024 Features You Need to Know",
        excerpt: "A comprehensive overview of the newest JavaScript features and how they can improve your development workflow.",
        category: "technology",
        date: "2024-01-05",
        readTime: "8 min read",
        image: "fas fa-laptop-code"
    },
    {
        id: 6,
        title: "Morning Routines of Successful People",
        excerpt: "Insights into the morning habits and routines that successful people swear by for productivity and well-being.",
        category: "lifestyle",
        date: "2024-01-03",
        readTime: "5 min read",
        image: "fas fa-sun"
    },
    {
        id: 7,
        title: "Solo Travel: A Journey of Self-Discovery",
        excerpt: "Why solo travel might be the best investment you make in yourself, and how to do it safely and confidently.",
        category: "travel",
        date: "2024-01-01",
        readTime: "6 min read",
        image: "fas fa-map-marked-alt"
    },
    {
        id: 8,
        title: "Farm-to-Table: The Future of Dining",
        excerpt: "Exploring the farm-to-table movement and how it's revolutionizing the way we think about food and sustainability.",
        category: "food",
        date: "2023-12-28",
        readTime: "5 min read",
        image: "fas fa-seedling"
    }
];

// DOM Elements
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.filter-btn');
const blogGrid = document.getElementById('blog-grid');
const contactForm = document.getElementById('contact-form');

// Current filter state
let currentFilter = 'all';
let currentSearch = '';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeBlog();
    initializeSearch();
    initializeFilter();
    initializeContactForm();
    initializeScrollAnimations();
    initializeNewsletter();
    initializeBlogPost();
    initializePagination();
});

// Navigation functionality
function initializeNavigation() {
    // Mobile menu toggle
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed header
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Update active navigation link on scroll
    window.addEventListener('scroll', updateActiveNavLink);
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// Blog functionality
function initializeBlog() {
    renderBlogPosts(blogPosts);
}

function renderBlogPosts(posts) {
    if (posts.length === 0) {
        blogGrid.innerHTML = `
            <div class="no-posts">
                <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <h3>No posts found</h3>
                <p>Try adjusting your search or filter criteria.</p>
            </div>
        `;
        return;
    }

    blogGrid.innerHTML = posts.map(post => `
        <article class="blog-card fade-in" data-post-id="${post.id}">
            <div class="blog-image">
                <i class="${post.image}"></i>
            </div>
            <div class="blog-content">
                <div class="blog-meta">
                    <span class="blog-category">${post.category}</span>
                    <span class="blog-date">${formatDate(post.date)}</span>
                </div>
                <h3 class="blog-title">${post.title}</h3>
                <p class="blog-excerpt">${post.excerpt}</p>
                <div class="blog-meta">
                    <span class="read-time">${post.readTime}</span>
                    <a href="blog-post.html?id=${post.id}" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        </article>
    `).join('');

    // Add click handlers to read more links
    document.querySelectorAll('.read-more').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const postId = this.closest('.blog-card').getAttribute('data-post-id');
            if (postId) {
                window.location.href = `blog-post.html?id=${postId}`;
            }
        });
    });

    // Trigger fade-in animation
    setTimeout(() => {
        document.querySelectorAll('.fade-in').forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('visible');
            }, index * 100);
        });
    }, 100);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Search functionality
function initializeSearch() {
    searchInput.addEventListener('input', function() {
        currentSearch = this.value.toLowerCase();
        filterAndSearchPosts();
    });
}

// Filter functionality
function initializeFilter() {
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update current filter
            currentFilter = this.getAttribute('data-filter');
            filterAndSearchPosts();
        });
    });
}

function filterAndSearchPosts() {
    let filteredPosts = blogPosts;

    // Apply category filter
    if (currentFilter !== 'all') {
        filteredPosts = filteredPosts.filter(post => post.category === currentFilter);
    }

    // Apply search filter
    if (currentSearch) {
        filteredPosts = filteredPosts.filter(post => 
            post.title.toLowerCase().includes(currentSearch) ||
            post.excerpt.toLowerCase().includes(currentSearch) ||
            post.category.toLowerCase().includes(currentSearch)
        );
    }

    renderBlogPosts(filteredPosts);
}

// Contact form functionality
function initializeContactForm() {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');

        // Basic validation
        if (!name || !email || !subject || !message) {
            showNotification('Please fill in all fields.', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }

        // Simulate form submission
        showNotification('Thank you for your message! I\'ll get back to you soon.', 'success');
        this.reset();
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Scroll animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe elements with fade-in class
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add smooth scrolling to all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Add loading state for better UX
function showLoading() {
    blogGrid.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
        </div>
    `;
}

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to blog cards
    document.addEventListener('mouseover', function(e) {
        if (e.target.closest('.blog-card')) {
            e.target.closest('.blog-card').style.transform = 'translateY(-5px)';
        }
    });

    document.addEventListener('mouseout', function(e) {
        if (e.target.closest('.blog-card')) {
            e.target.closest('.blog-card').style.transform = 'translateY(0)';
        }
    });

    // Add click effect to buttons
    document.querySelectorAll('.btn, .filter-btn').forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
});

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Close mobile menu with Escape key
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    }
});

// Newsletter functionality
function initializeNewsletter() {
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            if (isValidEmail(email)) {
                showNotification('Thank you for subscribing to our newsletter!', 'success');
                this.reset();
            } else {
                showNotification('Please enter a valid email address.', 'error');
            }
        });
    }
}

// Blog post functionality
function initializeBlogPost() {
    // Check if we're on a blog post page
    if (window.location.pathname.includes('blog-post.html')) {
        loadBlogPost();
        initializePostActions();
    }
}

function loadBlogPost() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    if (postId) {
        const post = blogPosts.find(p => p.id == postId);
        if (post) {
            document.getElementById('post-title').textContent = post.title;
            document.getElementById('post-excerpt').textContent = post.excerpt;
            document.getElementById('post-category').textContent = post.category;
            document.getElementById('post-date').textContent = formatDate(post.date);
            document.getElementById('post-read-time').textContent = post.readTime;
            document.getElementById('post-image-icon').className = post.image;
            document.title = `${post.title} - My Blog`;
        }
    }
}

function initializePostActions() {
    // Like button
    const likeBtn = document.getElementById('like-btn');
    if (likeBtn) {
        likeBtn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                this.innerHTML = '<i class="fas fa-heart"></i> Liked';
                showNotification('Post liked!', 'success');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                this.innerHTML = '<i class="far fa-heart"></i> Like';
            }
        });
    }

    // Share button
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            if (navigator.share) {
                navigator.share({
                    title: document.title,
                    url: window.location.href
                });
            } else {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(window.location.href).then(() => {
                    showNotification('Link copied to clipboard!', 'success');
                });
            }
        });
    }

    // Bookmark button
    const bookmarkBtn = document.getElementById('bookmark-btn');
    if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                this.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
                showNotification('Post saved!', 'success');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                this.innerHTML = '<i class="far fa-bookmark"></i> Save';
            }
        });
    }
}

// Pagination functionality
function initializePagination() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const paginationNumbers = document.getElementById('pagination-numbers');
    
    if (prevBtn && nextBtn && paginationNumbers) {
        let currentPage = 1;
        const postsPerPage = 6;
        const totalPages = Math.ceil(blogPosts.length / postsPerPage);
        
        function updatePagination() {
            // Update buttons
            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === totalPages;
            
            // Generate page numbers
            paginationNumbers.innerHTML = '';
            for (let i = 1; i <= totalPages; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.className = `pagination-number ${i === currentPage ? 'active' : ''}`;
                pageBtn.textContent = i;
                pageBtn.addEventListener('click', () => {
                    currentPage = i;
                    updatePagination();
                    renderPaginatedPosts();
                });
                paginationNumbers.appendChild(pageBtn);
            }
        }
        
        function renderPaginatedPosts() {
            const startIndex = (currentPage - 1) * postsPerPage;
            const endIndex = startIndex + postsPerPage;
            const paginatedPosts = blogPosts.slice(startIndex, endIndex);
            renderBlogPosts(paginatedPosts);
        }
        
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updatePagination();
                renderPaginatedPosts();
            }
        });
        
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                updatePagination();
                renderPaginatedPosts();
            }
        });
        
        updatePagination();
        renderPaginatedPosts();
    }
}

// URL parameter handling for category filtering
function handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    if (category && filterButtons) {
        // Set the active filter button
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-filter') === category) {
                btn.classList.add('active');
                currentFilter = category;
            }
        });
        
        // Apply the filter
        filterAndSearchPosts();
    }
}

// Add scroll-to-top functionality
window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 300) {
        if (!document.querySelector('.scroll-to-top')) {
            const scrollButton = document.createElement('button');
            scrollButton.className = 'scroll-to-top';
            scrollButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
            scrollButton.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 50px;
                height: 50px;
                background: #3498db;
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                font-size: 1.2rem;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                z-index: 1000;
                transition: all 0.3s ease;
                opacity: 0;
                transform: translateY(20px);
            `;
            
            scrollButton.addEventListener('click', function() {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
            
            document.body.appendChild(scrollButton);
            
            // Animate in
            setTimeout(() => {
                scrollButton.style.opacity = '1';
                scrollButton.style.transform = 'translateY(0)';
            }, 100);
        }
    } else {
        const scrollButton = document.querySelector('.scroll-to-top');
        if (scrollButton) {
            scrollButton.style.opacity = '0';
            scrollButton.style.transform = 'translateY(20px)';
            setTimeout(() => {
                if (scrollButton.parentNode) {
                    scrollButton.parentNode.removeChild(scrollButton);
                }
            }, 300);
        }
    }
});

// Initialize URL parameter handling
document.addEventListener('DOMContentLoaded', function() {
    handleURLParameters();
});
