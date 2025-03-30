// Base URL is removed as we will use relative paths for navigation.
// const BASE_URL = 'https://sudzv1606.github.io/CreditCSV';

// This function is unused and relies on the removed BASE_URL. Commenting out.
/*
function getRedirectUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    // Using relative paths now
    return urlParams.get('redirect') === 'pricing' ? '/pricing.html' : '/dashboard.html';
}
*/

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

        // Redirect to dashboard using a relative path
        window.location.href = '/dashboard.html'; // Changed from BASE_URL

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
            
            // Set session explicitly
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;
            
            if (session) {
                // Redirect to dashboard using a relative path
                window.location.href = '/dashboard.html'; // Changed from BASE_URL
            }
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
    
    // Determine the base path dynamically if needed, or assume root relative paths work.
    // For GitHub Pages, pathname might be /CreditCSV/login.html. For root deployment, it's /login.html.
    // Using endsWith is safer than includes for matching specific pages.
    const isOnLoginPage = window.location.pathname.endsWith('/login.html');
    const isOnSignupPage = window.location.pathname.endsWith('/signup.html');
    // Adjust if deployed in a subdirectory like /CreditCSV/
    // const isOnLoginPage = window.location.pathname.endsWith('/CreditCSV/login.html');
    // const isOnSignupPage = window.location.pathname.endsWith('/CreditCSV/signup.html');

    if (session) {
        // If user is already logged in and on login/signup page, redirect to dashboard
        if (isOnLoginPage || isOnSignupPage) {
            window.location.href = '/dashboard.html'; // Changed from BASE_URL
        }
    }
});

// Add auth state change listener
supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state changed:', event, session);
    
    const isOnDashboardPage = window.location.pathname.endsWith('/dashboard.html');
    // Adjust if deployed in a subdirectory like /CreditCSV/
    // const isOnDashboardPage = window.location.pathname.endsWith('/CreditCSV/dashboard.html');

    if (event === 'SIGNED_IN') {
        console.log('User signed in:', session.user);
        // Redirect to dashboard if not already there
        if (!isOnDashboardPage) {
            window.location.href = '/dashboard.html'; // Changed from BASE_URL
        }
    } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        localStorage.removeItem('user');
        localStorage.removeItem('pendingUserData');
        // Redirect to login page
        window.location.href = '/login.html'; // Changed from BASE_URL
    }
});

// This function is unused. Commenting out.
/*
function storePendingUserData(name, email) {
    localStorage.setItem('pendingUserData', JSON.stringify({ full_name: name, email }));
}
*/
