document.addEventListener('DOMContentLoaded', () => {
    // If user is already logged in, redirect to the main app
    if (sessionStorage.getItem('roamr_currentUser')) {
        window.location.href = 'index.html';
        return;
    }

    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');
    const loginForm = document.querySelector('.login-form');
    const signupForm = document.querySelector('.signup-form');

    // Apply theme from localStorage
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
    }

    showSignupLink.addEventListener('click', () => {
        loginForm.style.display = 'none';
        signupForm.style.display = 'flex';
    });

    showLoginLink.addEventListener('click', () => {
        signupForm.style.display = 'none';
        loginForm.style.display = 'flex';
    });

    // Sign Up
    document.getElementById('signup-btn').addEventListener('click', () => {
        const username = document.getElementById('signup-username').value.trim();
        const password = document.getElementById('signup-password').value.trim();
        const signupMessage = document.getElementById('signup-message');

        if (!username || !password) {
            signupMessage.textContent = 'Please fill out all fields.';
            signupMessage.className = 'message error';
            return;
        }

        // In a real app, hash the password. For this demo, we store it directly.
        localStorage.setItem(`roamr_user_${username}`, password);
        signupMessage.textContent = 'Sign-up successful! Please log in.';
        signupMessage.className = 'message success';
        
        // Switch to login form after a short delay
        setTimeout(() => {
            signupForm.style.display = 'none';
            loginForm.style.display = 'flex';
            document.getElementById('login-username').value = username;
            signupMessage.textContent = '';
        }, 2000);
    });

    // Login
    document.getElementById('login-btn').addEventListener('click', () => {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const loginMessage = document.getElementById('login-message');

        if (!username || !password) {
            loginMessage.textContent = 'Please fill out all fields.';
            loginMessage.className = 'message error';
            return;
        }

        const storedPassword = localStorage.getItem(`roamr_user_${username}`);

        if (storedPassword && storedPassword === password) {
            // Login successful
            sessionStorage.setItem('roamr_currentUser', username);
            window.location.href = 'index.html'; // Redirect to the main app
        } else {
            // Login failed
            loginMessage.textContent = 'Invalid username or password.';
            loginMessage.className = 'message error';
        }
    });
});
