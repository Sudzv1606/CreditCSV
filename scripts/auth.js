function getRedirectUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('redirect') === 'pricing' ? '/pricing.html' : '/dashboard.html';
}

// Check if user is already logged in
async function checkAuth() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.log('No active session found');
            return false;
        }

        if (session) {
            // If we're on the login page and already authenticated, redirect to dashboard
            if (window.location.pathname.includes('/login.html') || 
                window.location.pathname.includes('/signup.html')) {
                window.location.href = '/dashboard.html';
            }
            return true;
        }
        
        return false;
    } catch (error) {
        console.log('Auth check failed:', error.message);
        return false;
    }
}

// Check authentication status
async function checkAuthStatus() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.log('No active session');
            return false;
        }

        if (session?.user) {
            console.log('Currently logged in user:', session.user);
            
            // Check if user exists in profiles table
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
                
            if (profileError) {
                console.log('Profile fetch failed:', profileError.message);
            } else {
                console.log('User profile:', profile);
            }
            
            return true;
        } else {
            console.log('No user currently logged in');
            return false;
        }
    } catch (error) {
        console.log('Auth check failed:', error.message);
        return false;
    }
}

// Initialize auth state tracking
let isAuthenticated = false;

// Add auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event);
    isAuthenticated = !!session;
    
    if (event === 'SIGNED_IN') {
        console.log('User signed in:', session.user);
        localStorage.setItem('user', JSON.stringify(session.user));
    } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        localStorage.removeItem('user');
    }
});

// Run auth check when page loads
document.addEventListener('DOMContentLoaded', async () => {
    isAuthenticated = await checkAuth();
    console.log('Initial auth state:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
});

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
        window.location.href = getRedirectUrl();
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
            // Create profile with user_id instead of id
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        user_id: authData.user.id,  // Changed from id to user_id
                        full_name: name,
                        email: email
                    }
                ]);

            if (profileError) throw profileError;
            
            console.log('Profile created successfully');

            // Redirect based on email verification status
            if (authData.user.confirmationSentAt) {
                window.location.href = '/email-verification.html';
            } else {
                window.location.href = getRedirectUrl();
            }
        }
    } catch (error) {
        console.error('Signup error:', error);
        errorMessage.style.display = 'block';
        errorMessage.textContent = error.message;
    }
});

// You can call this function on page load
document.addEventListener('DOMContentLoaded', checkAuthStatus);





