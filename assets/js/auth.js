// Local Authentication System for Campus Connect
// This simplified version works entirely in the browser for demonstration purposes

// Initialize localStorage with empty users object if it doesn't exist
if (!localStorage.getItem('registeredUsers')) {
    localStorage.setItem('registeredUsers', JSON.stringify({}));
}

// Register a new user
async function register(userData) {
    try {
        console.log('Registering user:', userData);
        
        // Get existing users
        let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
        
        // Check if email already exists
        const emailExists = Object.values(registeredUsers).some(user => 
            user.email === userData.email
        );
        
        if (emailExists) {
            throw new Error('Email already registered');
        }
        
        // Generate a user ID
        const userId = Date.now().toString();
        
        // Create a new user object with clean data
        const newUser = {
            id: userId,
            name: userData.name || '',
            email: userData.email || '',
            password: userData.password || '',
            role: userData.role || 'student',
            registeredAt: new Date().toISOString()
        };
        
        // Add role-specific fields
        if (userData.role === 'student') {
            newUser.rollNumber = userData.rollNumber || '';
            newUser.branch = userData.branch || '';
            newUser.collegeName = userData.collegeName || '';
            newUser.semester = userData.semester || '';
            newUser.cgpa = userData.cgpa || '';
            newUser.skills = userData.skills || '';
            newUser.graduationYear = userData.graduation || '';
        } else if (userData.role === 'company') {
            newUser.companyName = userData.companyName || '';
            newUser.industry = userData.industry || '';
            newUser.companySize = userData.companySize || '';
            newUser.website = userData.website || '';
            newUser.companyLocation = userData.companyLocation || '';
        } else if (userData.role === 'faculty') {
            newUser.collegeName = userData['collegeName-faculty'] || '';
            newUser.designation = userData.designation || '';
            newUser.department = userData['branch-faculty'] || '';
            newUser.empId = userData.empId || '';
        }
        
        // Add user to registered users
        registeredUsers[userId] = newUser;
        
        // Save to localStorage
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        
        console.log('Registration successful for:', userData.email);
        alert('Registration successful! You can now login with your email and password.');
        
        // Redirect to login page
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Registration error:', error);
        
        // Reset button
        const registerBtn = document.querySelector('#registerForm button[type="submit"]');
        if (registerBtn) {
            registerBtn.querySelector('.btn-text').textContent = 'Register';
        }
        
        alert(error.message || 'Registration failed. Please try again.');
    }
}

// Login function
async function login(email, password, role) {
    try {
        console.log('Login attempt for:', email, 'with role:', role);
        
        // Get registered users
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
        
        // Find matching user
        const matchingUser = Object.values(registeredUsers).find(user => 
            user.email === email && 
            user.password === password && 
            user.role === role
        );
        
        if (!matchingUser) {
            throw new Error('Invalid email, password, or role. Please try again.');
        }
        
        // Generate simple token for demo purposes
        const token = `token_${Date.now()}`;
        
        // Store auth data in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(matchingUser));
        
        console.log('Login successful for:', email);
            
            // Redirect based on role
            switch(role) {
                case 'student':
                    window.location.href = 'dashboard-student.html';
                    break;
                case 'company':
                    window.location.href = 'dashboard-company.html';
                    break;
                case 'faculty':
                    window.location.href = 'dashboard-faculty.html';
                    break;
                default:
                    window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Login error:', error);
        
        // Reset button
        const loginBtn = document.querySelector('#loginForm button[type="submit"]');
        if (loginBtn) {
            loginBtn.querySelector('.btn-text').textContent = 'Login';
        }
        
        alert(error.message || 'Login failed. Please check your credentials.');
    }
}

// Logout function
function logout() {
    // Remove auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to home
    window.location.href = 'index.html';
}

// Check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Get auth token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth module initialized');
    
    // Toggle between login and register forms
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');
    const loginToggle = document.getElementById('loginToggle');
    const registerToggle = document.getElementById('registerToggle');

    if (loginToggle && registerToggle) {
        loginToggle.addEventListener('click', function(e) {
            e.preventDefault();
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        });

        registerToggle.addEventListener('click', function(e) {
            e.preventDefault();
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
        });
    }

    // Show/hide additional fields based on role
    const regRoleSelect = document.getElementById('regRole');
    const studentFields = document.getElementById('studentFields');
    const companyFields = document.getElementById('companyFields');
    const facultyFields = document.getElementById('facultyFields');

    if (regRoleSelect) {
        regRoleSelect.addEventListener('change', function() {
            // Hide all role-specific fields first
            if (studentFields) studentFields.classList.add('hidden');
            if (companyFields) companyFields.classList.add('hidden');
            if (facultyFields) facultyFields.classList.add('hidden');
            
            // Show fields based on selected role
            if (this.value === 'student' && studentFields) {
                    studentFields.classList.remove('hidden');
            } else if (this.value === 'company' && companyFields) {
                    companyFields.classList.remove('hidden');
            } else if (this.value === 'faculty' && facultyFields) {
                facultyFields.classList.remove('hidden');
            }
        });
    }

    // Login form submission
    const loginFormEl = document.getElementById('loginForm');
    if (loginFormEl) {
        loginFormEl.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            const loginBtn = this.querySelector('button[type="submit"]');
            if (loginBtn) {
                loginBtn.querySelector('.btn-text').textContent = 'Logging in...';
            }
            
            // Get form data
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            
            // Validate
            if (!email || !password || !role) {
                alert('Please fill in all fields');
                if (loginBtn) {
                    loginBtn.querySelector('.btn-text').textContent = 'Login';
                }
                return;
            }
            
            // Attempt login
            login(email, password, role);
        });
    }

    // Register form submission
    const registerFormEl = document.getElementById('registerForm');
    if (registerFormEl) {
        registerFormEl.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            const registerBtn = this.querySelector('button[type="submit"]');
            if (registerBtn) {
                registerBtn.querySelector('.btn-text').textContent = 'Registering...';
            }
            
            // Basic validation
            const role = document.getElementById('regRole').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (!email || !password || !role) {
                alert('Please fill in all required fields');
                if (registerBtn) {
                    registerBtn.querySelector('.btn-text').textContent = 'Register';
                }
                return;
            }
            
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                if (registerBtn) {
                    registerBtn.querySelector('.btn-text').textContent = 'Register';
                }
                return;
            }
            
            // Collect all form data
            const formData = {};
            const formElements = registerFormEl.elements;
            
            for (let i = 0; i < formElements.length; i++) {
                const element = formElements[i];
                if (element.name && element.name !== '') {
                    // Skip buttons and elements without names
                    if (element.type !== 'submit' && element.type !== 'button') {
                        formData[element.name] = element.value;
                    }
                }
            }
            
            // Register user
            register(formData);
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Check if user is already logged in on login page
    if (window.location.pathname.includes('login.html') && isAuthenticated()) {
        const user = getCurrentUser();
        if (user) {
            // Redirect to appropriate dashboard
            switch(user.role) {
                case 'student':
                    window.location.href = 'dashboard-student.html';
                    break;
                case 'company':
                    window.location.href = 'dashboard-company.html';
                    break;
                case 'faculty':
                    window.location.href = 'dashboard-faculty.html';
                    break;
                default:
                    break;
            }
        }
    }
}); 