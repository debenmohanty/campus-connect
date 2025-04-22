// Main JavaScript File for Campus Connect

document.addEventListener('DOMContentLoaded', function() {
    // Handle mobile navigation toggle
    setupMobileNav();
    
    // Setup image lazy loading with alt text validation
    setupLazyLoading();
    
    // Setup testimonial cards hover effects
    setupTestimonialCards();
    
    // Add keyboard navigation for interactive elements
    setupKeyboardNavigation();
    
    // Add dark mode toggle functionality
    setupDarkModeToggle();
    
    // Add focus indicators
    setupFocusIndicators();
});

// Mobile Navigation
function setupMobileNav() {
    const navToggle = document.createElement('button');
    navToggle.className = 'nav-toggle';
    navToggle.setAttribute('aria-label', 'Toggle navigation menu');
    navToggle.innerHTML = '<span></span><span></span><span></span>';
    
    const header = document.querySelector('header');
    const nav = document.querySelector('nav.container');
    
    if (header && nav) {
        header.insertBefore(navToggle, nav);
        
        navToggle.addEventListener('click', function() {
            const navLinks = document.querySelector('.nav-links');
            navLinks.classList.toggle('active');
            
            const isExpanded = navLinks.classList.contains('active');
            this.setAttribute('aria-expanded', isExpanded);
            
            if (isExpanded) {
                this.setAttribute('aria-label', 'Close navigation menu');
            } else {
                this.setAttribute('aria-label', 'Open navigation menu');
            }
        });
    }
}

// Lazy Loading Images with Accessibility
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    
                    // Ensure alt text exists for accessibility
                    if (!img.alt) {
                        console.warn('Image is missing alt text for accessibility:', img);
                        img.alt = 'Image'; // Provide basic alt text
                    }
                    
                    img.onload = () => {
                        img.removeAttribute('data-src');
                    };
                    
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    }
}

// Testimonial Cards Interaction
function setupTestimonialCards() {
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    
    testimonialCards.forEach(card => {
        // Mouse interaction
        card.addEventListener('mouseenter', function() {
            this.classList.add('active');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('active');
        });
        
        // Touch interaction for mobile
        card.addEventListener('touchstart', function() {
            testimonialCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
        }, { passive: true });
    });
}

// Keyboard Navigation
function setupKeyboardNavigation() {
    // Add keyboard navigation for cards
    const interactiveElements = document.querySelectorAll('.feature-card, .testimonial-card, .what-we-do-item, .why-choose-item');
    
    interactiveElements.forEach(element => {
        // Make elements focusable
        if (!element.getAttribute('tabindex')) {
            element.setAttribute('tabindex', '0');
        }
        
        // Add keyboard event listeners
        element.addEventListener('keydown', function(e) {
            // Enter or Space to activate
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.classList.add('active');
                
                // If there's a link inside, trigger it
                const link = this.querySelector('a');
                if (link) {
                    link.click();
                }
            }
        });
        
        element.addEventListener('keyup', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                this.classList.remove('active');
            }
        });
        
        element.addEventListener('blur', function() {
            this.classList.remove('active');
        });
    });
}

// Dark Mode Toggle
function setupDarkModeToggle() {
    // Create dark mode toggle button
    const darkModeToggle = document.createElement('button');
    darkModeToggle.className = 'dark-mode-toggle tooltip';
    darkModeToggle.setAttribute('aria-label', 'Toggle dark mode');
    darkModeToggle.innerHTML = '<i class="fas fa-moon"></i><span class="tooltip-text">Switch to dark mode</span>';
    
    // Add to the page
    const header = document.querySelector('header nav.container');
    if (header) {
        header.appendChild(darkModeToggle);
        
        // Check for user preference
        const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Check for saved preference
        const savedMode = localStorage.getItem('darkMode');
        
        if (savedMode === 'dark' || (savedMode === null && prefersDarkMode)) {
            document.body.classList.add('dark-mode');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i><span class="tooltip-text">Switch to light mode</span>';
        }
        
        // Add click event
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('darkMode', 'dark');
                this.innerHTML = '<i class="fas fa-sun"></i><span class="tooltip-text">Switch to light mode</span>';
            } else {
                localStorage.setItem('darkMode', 'light');
                this.innerHTML = '<i class="fas fa-moon"></i><span class="tooltip-text">Switch to dark mode</span>';
            }
        });
    }
}

// Focus indicators for accessibility
function setupFocusIndicators() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-user');
        }
    });
    
    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-user');
    });
}

// Add announcement for screen readers when necessary
function announceForScreenReaders(message) {
    let announcer = document.getElementById('sr-announcer');
    
    if (!announcer) {
        announcer = document.createElement('div');
        announcer.id = 'sr-announcer';
        announcer.setAttribute('aria-live', 'polite');
        announcer.classList.add('sr-only');
        document.body.appendChild(announcer);
    }
    
    announcer.textContent = message;
} 