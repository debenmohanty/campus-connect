/**
 * Login and Register page animations and interactivity
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create animated particles
    createParticles();
    
    // Setup dark mode toggle
    setupDarkMode();
    
    // Setup form toggle (login/register)
    setupFormToggle();
    
    // Setup form validation
    setupFormValidation();
    
    // Setup password strength meter
    setupPasswordStrength();
    
    // Setup accessibility features
    setupAccessibility();
});

/**
 * Create animated background particles
 */
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    const colors = ['#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6'];
    
    // Create 50 particles
    for (let i = 0; i < 50; i++) {
        const size = Math.random() * 6 + 2;
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particle.style.animationDuration = `${Math.random() * 10 + 10}s`;
        
        particlesContainer.appendChild(particle);
    }
}

/**
 * Setup dark mode toggle functionality
 */
function setupDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return;
    
    // Check for saved preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeToggle.classList.add('active');
        darkModeToggle.setAttribute('aria-checked', 'true');
    }
    
    // Toggle dark mode on click
    darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        this.classList.toggle('active');
        
        const isDarkMode = document.body.classList.contains('dark-mode');
        
        // Update ARIA state
        this.setAttribute('aria-checked', isDarkMode ? 'true' : 'false');
        
        // Save preference
        if (isDarkMode) {
            localStorage.setItem('darkMode', 'enabled');
            announceToScreenReader('Dark mode enabled');
        } else {
            localStorage.setItem('darkMode', null);
            announceToScreenReader('Dark mode disabled');
        }
    });
    
    // Toggle dark mode on keyboard interaction
    darkModeToggle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
        }
    });
}

/**
 * Setup form toggle between login and register
 */
function setupFormToggle() {
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');
    const loginToggle = document.getElementById('loginToggle');
    const registerToggle = document.getElementById('registerToggle');
    
    if (!loginForm || !registerForm || !loginToggle || !registerToggle) return;
    
    // Toggle to login form
    loginToggle.addEventListener('click', function(e) {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('email').focus();
        }, 500);
    });
    
    // Toggle to register form
    registerToggle.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('fullName').focus();
        }, 500);
    });
    
    // Keyboard accessibility for toggles
    [loginToggle, registerToggle].forEach(toggle => {
        toggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Show/hide additional fields based on role selection
    const regRoleSelect = document.getElementById('regRole');
    const studentFields = document.getElementById('studentFields');
    const companyFields = document.getElementById('companyFields');
    const facultyFields = document.getElementById('facultyFields');
    const genderField = document.getElementById('genderField');
    const dobField = document.getElementById('dobField');
    
    if (regRoleSelect && studentFields && companyFields && facultyFields) {
        regRoleSelect.addEventListener('change', function() {
            studentFields.classList.add('hidden');
            companyFields.classList.add('hidden');
            facultyFields.classList.add('hidden');
            
            // Show gender and DOB for student and faculty, hide for company
            if (this.value === 'company') {
                dobField.classList.add('hidden');
                genderField.classList.add('hidden');
            } else {
                dobField.classList.remove('hidden');
                genderField.classList.remove('hidden');
            }
            
            if (this.value === 'student') {
                studentFields.classList.remove('hidden');
                // Focus on first field after animation
                setTimeout(() => {
                    document.getElementById('collegeName').focus();
                }, 300);
            } else if (this.value === 'company') {
                companyFields.classList.remove('hidden');
                // Focus on first field after animation
                setTimeout(() => {
                    document.getElementById('companyName').focus();
                }, 300);
            } else if (this.value === 'faculty') {
                facultyFields.classList.remove('hidden');
                // Focus on first field after animation
                setTimeout(() => {
                    document.getElementById('collegeName-faculty').focus();
                }, 300);
            }
        });
    }
}

/**
 * Setup form validation
 */
function setupFormValidation() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const roleSelect = document.getElementById('role');
            let isValid = true;
            
            // Email validation
            if (!validateEmail(emailInput.value)) {
                showError(emailInput, 'Please enter a valid email address');
                isValid = false;
            } else {
                clearError(emailInput);
            }
            
            // Password validation
            if (!passwordInput.value) {
                showError(passwordInput, 'Password is required');
                isValid = false;
            } else {
                clearError(passwordInput);
            }
            
            // Role validation
            if (!roleSelect.value) {
                showError(roleSelect, 'Please select your role');
                isValid = false;
            } else {
                clearError(roleSelect);
            }
            
            if (isValid) {
                // Show loading state
                const submitBtn = this.querySelector('button[type="submit"]');
                
                // Only change text, no animation or loading class
                submitBtn.querySelector('.btn-text').textContent = 'Logging in...';
                
                // Call the login function from auth.js
                const email = emailInput.value;
                const password = passwordInput.value;
                const role = roleSelect.value;
                
                // This function is defined in auth.js
                login(email, password, role);
            }
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nameInput = document.getElementById('fullName');
            const emailInput = document.getElementById('regEmail');
            const passwordInput = document.getElementById('regPassword');
            const confirmPasswordInput = document.getElementById('confirmPassword');
            const roleSelect = document.getElementById('regRole');
            const dobInput = document.getElementById('dob');
            const genderInput = document.getElementById('gender');
            let isValid = true;
            
            // Name validation
            if (!nameInput.value.trim()) {
                showError(nameInput, 'Full name is required');
                isValid = false;
            } else {
                clearError(nameInput);
            }
            
            // Email validation
            if (!validateEmail(emailInput.value)) {
                showError(emailInput, 'Please enter a valid email address');
                isValid = false;
            } else {
                clearError(emailInput);
            }
            
            // Password validation
            if (passwordInput.value.length < 6) {
                showError(passwordInput, 'Password must be at least 6 characters');
                isValid = false;
            } else {
                clearError(passwordInput);
            }
            
            // Confirm password validation
            if (passwordInput.value !== confirmPasswordInput.value) {
                showError(confirmPasswordInput, 'Passwords do not match');
                isValid = false;
            } else {
                clearError(confirmPasswordInput);
            }
            
            // Gender validation - only required for students and faculty
            if (roleSelect.value !== 'company') {
                if (!genderInput.value) {
                    showError(genderInput, 'Please select your gender');
                    isValid = false;
                } else {
                    clearError(genderInput);
                }
            } else {
                clearError(genderInput); // Clear any error for company
            }
            
            // DOB validation - only required for students and faculty
            if (roleSelect.value !== 'company') {
                if (!dobInput.value) {
                    showError(dobInput, 'Date of birth is required');
                    isValid = false;
                } else {
                    clearError(dobInput);
                }
            } else {
                clearError(dobInput); // Clear any error for company
            }
            
            // Role validation
            if (!roleSelect.value) {
                showError(roleSelect, 'Please select your role');
                isValid = false;
            } else {
                clearError(roleSelect);
                
                // Add role-specific field validation
                if (roleSelect.value === 'student') {
                    const rollInput = document.getElementById('rollNumber');
                    const branchInput = document.getElementById('branch');
                    const collegeInput = document.getElementById('collegeName');
                    const semesterInput = document.getElementById('semester');
                    const cgpaInput = document.getElementById('cgpa');
                    const graduationInput = document.getElementById('graduation');
                    
                    if (!collegeInput.value.trim()) {
                        showError(collegeInput, 'College name is required');
                        isValid = false;
                    } else {
                        clearError(collegeInput);
                    }
                    
                    if (!branchInput.value.trim()) {
                        showError(branchInput, 'Branch is required');
                        isValid = false;
                    } else {
                        clearError(branchInput);
                    }
                    
                    if (!rollInput.value.trim()) {
                        showError(rollInput, 'Roll number is required');
                        isValid = false;
                    } else {
                        clearError(rollInput);
                    }
                    
                    if (!semesterInput.value) {
                        showError(semesterInput, 'Semester is required');
                        isValid = false;
                    } else {
                        clearError(semesterInput);
                    }
                    
                    if (cgpaInput.value && (isNaN(cgpaInput.value) || cgpaInput.value < 0 || cgpaInput.value > 10)) {
                        showError(cgpaInput, 'CGPA must be between 0 and 10');
                        isValid = false;
                    } else {
                        clearError(cgpaInput);
                    }
                    
                    if (!graduationInput.value) {
                        showError(graduationInput, 'Graduation year is required');
                        isValid = false;
                    } else {
                        clearError(graduationInput);
                    }
                } else if (roleSelect.value === 'company') {
                    const companyNameInput = document.getElementById('companyName');
                    const industryInput = document.getElementById('industry');
                    const companySizeInput = document.getElementById('companySize');
                    const websiteInput = document.getElementById('website');
                    const locationInput = document.getElementById('companyLocation');
                    const contactPersonInput = document.getElementById('contactPerson');
                    const contactPhoneInput = document.getElementById('contactPhone');
                    const descriptionInput = document.getElementById('companyDescription');
                    const establishmentYearInput = document.getElementById('establishmentYear');
                    
                    if (!companyNameInput.value.trim()) {
                        showError(companyNameInput, 'Company name is required');
                        isValid = false;
                    } else {
                        clearError(companyNameInput);
                    }
                    
                    if (!industryInput.value) {
                        showError(industryInput, 'Industry is required');
                        isValid = false;
                    } else {
                        clearError(industryInput);
                    }
                    
                    if (!companySizeInput.value) {
                        showError(companySizeInput, 'Company size is required');
                        isValid = false;
                    } else {
                        clearError(companySizeInput);
                    }
                    
                    if (websiteInput.value && !validateUrl(websiteInput.value)) {
                        showError(websiteInput, 'Please enter a valid URL');
                        isValid = false;
                    } else {
                        clearError(websiteInput);
                    }
                    
                    if (!locationInput.value.trim()) {
                        showError(locationInput, 'Location is required');
                        isValid = false;
                    } else {
                        clearError(locationInput);
                    }
                    
                    if (!contactPersonInput.value.trim()) {
                        showError(contactPersonInput, 'Contact person is required');
                        isValid = false;
                    } else {
                        clearError(contactPersonInput);
                    }
                    
                    if (contactPhoneInput.value && !validatePhone(contactPhoneInput.value)) {
                        showError(contactPhoneInput, 'Please enter a valid phone number');
                        isValid = false;
                    } else {
                        clearError(contactPhoneInput);
                    }
                    
                    if (!descriptionInput.value.trim()) {
                        showError(descriptionInput, 'Company description is required');
                        isValid = false;
                    } else if (descriptionInput.value.trim().length < 50) {
                        showError(descriptionInput, 'Description should be at least 50 characters');
                        isValid = false;
                    } else {
                        clearError(descriptionInput);
                    }
                    
                    if (establishmentYearInput.value) {
                        const year = parseInt(establishmentYearInput.value);
                        const currentYear = new Date().getFullYear();
                        if (isNaN(year) || year < 1900 || year > currentYear) {
                            showError(establishmentYearInput, `Year must be between 1900 and ${currentYear}`);
                            isValid = false;
                        } else {
                            clearError(establishmentYearInput);
                        }
                    } else {
                        clearError(establishmentYearInput);
                    }
                } else if (roleSelect.value === 'faculty') {
                    const collegeInput = document.getElementById('collegeName-faculty');
                    const designationInput = document.getElementById('designation');
                    const branchInput = document.getElementById('branch-faculty');
                    const empIdInput = document.getElementById('empId');
                    const qualificationInput = document.getElementById('qualification');
                    const experienceInput = document.getElementById('experience');
                    
                    if (!collegeInput.value.trim()) {
                        showError(collegeInput, 'College name is required');
                        isValid = false;
                    } else {
                        clearError(collegeInput);
                    }
                    
                    if (!designationInput.value.trim()) {
                        showError(designationInput, 'Designation is required');
                        isValid = false;
                    } else {
                        clearError(designationInput);
                    }
                    
                    if (!branchInput.value.trim()) {
                        showError(branchInput, 'Department is required');
                        isValid = false;
                    } else {
                        clearError(branchInput);
                    }
                    
                    if (!empIdInput.value.trim()) {
                        showError(empIdInput, 'Employee ID is required');
                        isValid = false;
                    } else {
                        clearError(empIdInput);
                    }
                    
                    if (!qualificationInput.value.trim()) {
                        showError(qualificationInput, 'Qualification is required');
                        isValid = false;
                    } else {
                        clearError(qualificationInput);
                    }
                    
                    if (experienceInput.value && (isNaN(experienceInput.value) || experienceInput.value < 0)) {
                        showError(experienceInput, 'Please enter valid experience');
                        isValid = false;
                    } else {
                        clearError(experienceInput);
                    }
                }
            }
            
            if (isValid) {
                // Show loading state
                const submitBtn = this.querySelector('button[type="submit"]');
                const loadingSpinner = submitBtn.querySelector('.loading-spinner');
                
                // Remove all spinner-related code
                if (loadingSpinner) {
                    // Remove the spinner element completely
                    loadingSpinner.remove();
                }
                
                // Just change text, don't add loading class
                submitBtn.querySelector('.btn-text').textContent = 'Registering...';
                
                // Prepare user data
                const userData = {
                    name: nameInput.value.trim(),
                    email: emailInput.value.trim(),
                    password: passwordInput.value,
                    role: roleSelect.value
                };
                
                // Add gender and DOB conditionally for non-company roles
                if (roleSelect.value !== 'company') {
                    userData.gender = genderInput.value;
                    userData.dob = dobInput.value;
                }
                
                // Add role-specific fields
                if (roleSelect.value === 'student') {
                    userData.collegeName = document.getElementById('collegeName').value.trim();
                    userData.branch = document.getElementById('branch').value.trim();
                    userData.rollNumber = document.getElementById('rollNumber').value.trim();
                    userData.semester = document.getElementById('semester').value;
                    userData.cgpa = document.getElementById('cgpa').value;
                    userData.skills = document.getElementById('skills').value.trim();
                    userData.graduationYear = document.getElementById('graduation').value;
                } else if (roleSelect.value === 'company') {
                    userData.companyName = document.getElementById('companyName').value.trim();
                    userData.industry = document.getElementById('industry').value;
                    userData.companySize = document.getElementById('companySize').value;
                    userData.website = document.getElementById('website').value.trim();
                    userData.location = document.getElementById('companyLocation').value.trim();
                    userData.contactPerson = document.getElementById('contactPerson').value.trim();
                    userData.contactPhone = document.getElementById('contactPhone').value.trim();
                    userData.description = document.getElementById('companyDescription').value.trim();
                    userData.establishmentYear = document.getElementById('establishmentYear').value;
                    
                    // Get recruitment preferences
                    const recruitmentPreferences = [];
                    if (document.getElementById('fullTime').checked) recruitmentPreferences.push('fullTime');
                    if (document.getElementById('internship').checked) recruitmentPreferences.push('internship');
                    if (document.getElementById('contract').checked) recruitmentPreferences.push('contract');
                    userData.recruitmentPreferences = recruitmentPreferences;
                } else if (roleSelect.value === 'faculty') {
                    userData.collegeName = document.getElementById('collegeName-faculty').value.trim();
                    userData.designation = document.getElementById('designation').value.trim();
                    userData.branch = document.getElementById('branch-faculty').value.trim();
                    userData.empId = document.getElementById('empId').value.trim();
                    userData.qualification = document.getElementById('qualification').value.trim();
                    userData.experience = document.getElementById('experience').value.trim();
                }
                
                // If auth.js has a register function
                if (typeof register === 'function') {
                    register(userData);
                } else {
                    // Demo purposes only - simulate registration
                    setTimeout(() => {
                        // Show success state
                        registerForm.classList.add('form-submitted');
                        announceToScreenReader('Registration successful! Please login.');
                        
                        // Reset and redirect to login after 3 seconds
                        setTimeout(() => {
                            registerForm.classList.remove('form-submitted');
                            submitBtn.querySelector('.btn-text').textContent = 'Register';
                            document.getElementById('loginToggle').click();
                        }, 3000);
                    }, 2000);
                }
            }
        });
    }
}

/**
 * Setup password strength meter
 */
function setupPasswordStrength() {
    const passwordInput = document.getElementById('regPassword');
    if (!passwordInput) return;
    
    // Create strength indicator if it doesn't exist
    let strengthIndicator = passwordInput.parentNode.querySelector('.password-strength');
    if (!strengthIndicator) {
        strengthIndicator = document.createElement('div');
        strengthIndicator.className = 'password-strength';
        passwordInput.parentNode.appendChild(strengthIndicator);
    }
    
    // Create strength text if it doesn't exist
    let strengthText = passwordInput.parentNode.querySelector('.strength-text');
    if (!strengthText) {
        strengthText = document.createElement('small');
        strengthText.className = 'strength-text';
        strengthText.style.display = 'block';
        strengthText.style.marginTop = '5px';
        strengthText.style.color = 'var(--label-color)';
        passwordInput.parentNode.appendChild(strengthText);
    }
    
    // Update strength indicator on input
    passwordInput.addEventListener('input', function() {
        const strength = getPasswordStrength(this.value);
        
        // Update indicator
        strengthIndicator.className = 'password-strength';
        
        if (this.value.length === 0) {
            strengthIndicator.style.width = '0';
            strengthText.textContent = '';
            passwordInput.setAttribute('aria-describedby', '');
        } else if (strength < 2) {
            strengthIndicator.classList.add('strength-weak');
            strengthText.textContent = 'Weak password';
            strengthText.style.color = '#e74c3c';
            passwordInput.setAttribute('aria-describedby', 'password-strength-desc');
        } else if (strength < 4) {
            strengthIndicator.classList.add('strength-medium');
            strengthText.textContent = 'Medium strength password';
            strengthText.style.color = '#f39c12';
            passwordInput.setAttribute('aria-describedby', 'password-strength-desc');
        } else {
            strengthIndicator.classList.add('strength-strong');
            strengthText.textContent = 'Strong password';
            strengthText.style.color = '#2ecc71';
            passwordInput.setAttribute('aria-describedby', 'password-strength-desc');
        }
        
        // Update ARIA description
        strengthText.id = 'password-strength-desc';
    });
}

/**
 * Setup accessibility features
 */
function setupAccessibility() {
    // Add ARIA attributes to forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const formId = form.id;
        if (!formId) return;
        
        const formTitle = form.closest('div').querySelector('h1');
        if (!formTitle) return;
        
        formTitle.id = `${formId}Title`;
        form.setAttribute('aria-labelledby', `${formId}Title`);
    });
    
    // Add ARIA attributes to form groups
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        const input = group.querySelector('input, select');
        const errorMsg = group.querySelector('.error-message');
        
        if (input && errorMsg) {
            const inputId = input.id;
            const errorId = errorMsg.id || `${inputId}Error`;
            
            errorMsg.id = errorId;
            
            // Set or update aria-describedby
            const currentDescribedBy = input.getAttribute('aria-describedby') || '';
            const describedByIds = currentDescribedBy.split(' ').filter(id => id.trim() !== '');
            
            if (!describedByIds.includes(errorId)) {
                describedByIds.push(errorId);
                input.setAttribute('aria-describedby', describedByIds.join(' '));
            }
            
            input.setAttribute('aria-invalid', 'false');
        }
    });
    
    // Ensure the dark mode toggle is accessible
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.setAttribute('role', 'switch');
        darkModeToggle.setAttribute('aria-checked', document.body.classList.contains('dark-mode') ? 'true' : 'false');
        darkModeToggle.setAttribute('aria-label', 'Toggle dark mode');
        darkModeToggle.setAttribute('tabindex', '0');
    }
    
    // Make form toggle links accessible
    const toggleLinks = document.querySelectorAll('.toggle-link');
    toggleLinks.forEach(link => {
        link.setAttribute('role', 'button');
        link.setAttribute('tabindex', '0');
    });
}

/**
 * Helper function to validate email format
 */
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

/**
 * Helper function to validate URL format
 */
function validateUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Helper function to validate phone number format
 * Basic validation - accepts numbers, spaces, dashes, plus, and parentheses
 */
function validatePhone(phone) {
    const re = /^[0-9+\-() ]+$/;
    return re.test(phone) && phone.length >= 8;
}

/**
 * Helper function to show error message
 */
function showError(input, message) {
    const formGroup = input.parentElement;
    const errorDisplay = formGroup.querySelector('.error-message');
    
    formGroup.classList.add('error');
    input.setAttribute('aria-invalid', 'true');
    
    if (errorDisplay) {
        errorDisplay.textContent = message;
        errorDisplay.style.display = 'block';
    }
    
    // Announce error to screen readers
    announceToScreenReader(message);
}

/**
 * Helper function to clear error message
 */
function clearError(input) {
    const formGroup = input.parentElement;
    const errorDisplay = formGroup.querySelector('.error-message');
    
    formGroup.classList.remove('error');
    input.setAttribute('aria-invalid', 'false');
    
    if (errorDisplay) {
        errorDisplay.textContent = '';
        errorDisplay.style.display = 'none';
    }
}

/**
 * Helper function to calculate password strength
 * Returns a score from 0-5
 */
function getPasswordStrength(password) {
    let score = 0;
    
    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) score++; // Has uppercase
    if (/[0-9]/.test(password)) score++;  // Has number
    if (/[^A-Za-z0-9]/.test(password)) score++; // Has special char
    
    return score;
}

/**
 * Helper function to announce messages to screen readers
 */
function announceToScreenReader(message) {
    // Create or get the live region
    let liveRegion = document.getElementById('a11y-announce');
    
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'a11y-announce';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
    }
    
    // Set the message
    liveRegion.textContent = message;
    
    // Clear after 3 seconds
    setTimeout(() => {
        liveRegion.textContent = '';
    }, 3000);
} 