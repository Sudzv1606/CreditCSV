const BASE_URL = 'https://sudzv1606.github.io';

function getRedirectUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('redirect') === 'pricing' ? '/pricing.html' : '/dashboard.html';
}

// Handle login form submission
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    try {
        console.log('Attempting login for:', email);
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        
        console.log('Login successful:', data);
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to dashboard with full URL
        window.location.href = `${BASE_URL}/dashboard.html`;
        
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.style.display = 'block';
        errorMessage.textContent = error.message;
    }
});

// Handle signup form submission
document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    try {
        console.log('Attempting signup for:', email);
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name
                }
            }
        });

        if (authError) throw authError;
        
        console.log('Signup successful:', authData);

        if (authData.user) {
            // Create profile
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        user_id: authData.user.id,
                        full_name: name,
                        email: email
                    }
                ]);

            if (profileError) throw profileError;
            
            // Store user data
            localStorage.setItem('user', JSON.stringify(authData.user));
            
            // Redirect to dashboard with full URL
            window.location.href = `${BASE_URL}/dashboard.html`;
        }
    } catch (error) {
        console.error('Signup error:', error);
        errorMessage.style.display = 'block';
        errorMessage.textContent = error.message;
    }
});

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        // If user is already logged in and on login/signup page, redirect to dashboard
        if (window.location.pathname.includes('/login.html') || 
            window.location.pathname.includes('/signup.html')) {
            window.location.href = `${BASE_URL}/dashboard.html`;
        }
    }
});

// Add auth state change listener
supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state changed:', event, session);
    
    if (event === 'SIGNED_IN') {
        console.log('User signed in:', session.user);
        window.location.href = `${BASE_URL}/dashboard.html`;
    } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        localStorage.removeItem('user');
        localStorage.removeItem('pendingUserData');
        window.location.href = `${BASE_URL}/login.html`;
    }
});

// Store user data before signup
function storePendingUserData(name, email) {
    localStorage.setItem('pendingUserData', JSON.stringify({ full_name: name, email }));
}





