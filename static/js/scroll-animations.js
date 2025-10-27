// Apple-style Scroll Animations
class ScrollAnimations {
    constructor() {
        this.animatedElements = [];
        this.init();
    }

    init() {
        // Get all elements with scroll animation classes
        this.animatedElements = document.querySelectorAll('.scroll-animate');
        
        // Create intersection observer
        this.createObserver();
        
        // Add scroll event listener for parallax effects
        this.addScrollListener();
        
        // Initialize on page load
        this.checkInitialVisibility();
    }

    createObserver() {
        const options = {
            root: null,
            rootMargin: '0px 0px -20% 0px', // Trigger earlier when element enters viewport
            threshold: [0, 0.1] // Simplified thresholds for better performance
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                }
            });
        }, options);

        // Observe all animated elements
        this.animatedElements.forEach(element => {
            this.observer.observe(element);
        });
    }

    animateElement(element) {
        // Get delay from data attribute
        const delay = element.getAttribute('data-delay') || 0;
        
        // Use requestAnimationFrame for better performance
        requestAnimationFrame(() => {
            setTimeout(() => {
                element.classList.add('animate');
                
                // Add special effects for specific elements
                this.addSpecialEffects(element);
            }, parseInt(delay));
        });
    }

    addSpecialEffects(element) {
        // Chart hover effects
        if (element.classList.contains('chart')) {
            this.addChartEffects(element);
        }
        
        // Progress bar animations
        if (element.classList.contains('stat-item')) {
            this.animateProgressBar(element);
        }
        
        // Detection control sweep effect
        if (element.classList.contains('detection-control')) {
            setTimeout(() => {
                element.classList.add('animate');
            }, 400);
        }
    }

    addChartEffects(chartElement) {
        // Add staggered animation to chart elements
        const canvas = chartElement.querySelector('canvas');
        if (canvas) {
            canvas.style.opacity = '0';
            canvas.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                canvas.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                canvas.style.opacity = '1';
                canvas.style.transform = 'scale(1)';
            }, 50);
        }
    }

    animateProgressBar(statItem) {
        const progressFill = statItem.querySelector('.progress-fill');
        if (progressFill) {
            // Get the current width and animate from 0
            const targetWidth = progressFill.style.width || '0%';
            progressFill.style.width = '0%';
            
            setTimeout(() => {
                progressFill.style.width = targetWidth;
            }, 75);
        }
    }

    addScrollListener() {
        let ticking = false;
        
        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.box-detection');
            
            parallaxElements.forEach(element => {
                const speed = 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
            
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        });
    }

    checkInitialVisibility() {
        // Check if any elements are already in view on page load
        this.animatedElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Trigger animation when element is 90% visible (more aggressive)
            if (rect.top < windowHeight * 0.9) {
                this.animateElement(element);
            }
        });
    }

    // Method to manually trigger animations
    triggerAnimation(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            this.animateElement(element);
        });
    }

    // Method to reset animations
    resetAnimations() {
        this.animatedElements.forEach(element => {
            element.classList.remove('animate');
        });
    }
}

// Enhanced scroll effects for specific elements
class EnhancedScrollEffects {
    constructor() {
        this.init();
    }

    init() {
        this.addCalendarHoverEffects();
        this.addButtonRippleEffects();
        this.addSmoothScrolling();
    }

    addCalendarHoverEffects() {
        const calendarDates = document.querySelectorAll('.calendar .dates .date');
        
        calendarDates.forEach(date => {
            date.addEventListener('mouseenter', (e) => {
                e.target.style.transform = 'scale(1.1) translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(74, 144, 226, 0.3)';
            });
            
            date.addEventListener('mouseleave', (e) => {
                e.target.style.transform = 'scale(1) translateY(0)';
                e.target.style.boxShadow = 'none';
            });
        });
    }

    addButtonRippleEffects() {
        const buttons = document.querySelectorAll('.detection-btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.4s ease-out;
                    pointer-events: none;
                `;
                
                button.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 400);
            });
        });
    }

    addSmoothScrolling() {
        // Add smooth scrolling to anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize scroll animations
    window.scrollAnimations = new ScrollAnimations();
    window.enhancedScrollEffects = new EnhancedScrollEffects();
    
    // Add CSS for ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        .detection-btn {
            position: relative;
            overflow: hidden;
        }
    `;
    document.head.appendChild(style);
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ScrollAnimations, EnhancedScrollEffects };
}