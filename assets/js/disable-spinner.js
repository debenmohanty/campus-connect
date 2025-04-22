/**
 * Script to completely disable login and register button spinner animations
 */
document.addEventListener('DOMContentLoaded', function() {
    // Disable all spinners
    const spinners = document.querySelectorAll('.loading-spinner');
    spinners.forEach(spinner => {
        // Remove the spinner element completely
        spinner.remove();
    });

    // Remove loading class from any buttons that might have it
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.classList.remove('loading');
        
        // Prevent the loading class from being added in the future
        const originalAddClass = button.classList.add;
        button.classList.add = function(...classes) {
            const filteredClasses = classes.filter(c => c !== 'loading');
            if (filteredClasses.length > 0) {
                originalAddClass.apply(this, filteredClasses);
            }
        };
    });

    // Override the login form submit handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            // Prevent the default submit behavior
            e.preventDefault();
            
            // Get form data
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            
            // Simple validation
            let isValid = true;
            
            if (!email) isValid = false;
            if (!password) isValid = false;
            if (!role) isValid = false;
            
            if (isValid) {
                // Set button text without animation
                const submitBtn = this.querySelector('button[type="submit"]');
                submitBtn.querySelector('.btn-text').textContent = 'Logging in...';
                
                // Call login function from auth.js
                login(email, password, role);
            }
        }, true); // Use capture to ensure this runs first
    }
    
    // Override the register form submit handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            // Prevent the default submit behavior
            e.preventDefault();
            
            // Get basic form data
            const name = document.getElementById('fullName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const role = document.getElementById('regRole').value;
            
            // Simple validation
            let isValid = true;
            
            if (!name) isValid = false;
            if (!email) isValid = false;
            if (!password) isValid = false;
            if (!role) isValid = false;
            
            if (isValid) {
                // Set button text without animation
                const submitBtn = this.querySelector('button[type="submit"]');
                submitBtn.querySelector('.btn-text').textContent = 'Registering...';
                
                // Prepare user data based on role
                const userData = {
                    name: name,
                    email: email,
                    password: password,
                    role: role
                };
                
                // Call register function from auth.js
                register(userData);
            }
        }, true); // Use capture to ensure this runs first
    }
}); 