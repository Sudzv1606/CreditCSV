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
            password
        });

        if (authError) throw authError;
        
        console.log('Signup successful:', authData);

        if (authData.user) {
            // Wait for the session to be established
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) throw sessionError;
            
            if (session) {
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
                
                console.log('Profile created successfully');
            }

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

// Add auth state change listener
supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state changed:', event);
    
    if (event === 'SIGNED_IN') {
        console.log('User signed in:', session.user);
        
        // Try to create profile if it doesn't exist
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
            
        if (!existingProfile) {
            const userData = JSON.parse(localStorage.getItem('pendingUserData') || '{}');
            if (userData.full_name) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            user_id: session.user.id,
                            full_name: userData.full_name,
                            email: userData.email
                        }
                    ]);
                    
                if (!profileError) {
                    localStorage.removeItem('pendingUserData');
                }
            }
        }
        
        localStorage.setItem('user', JSON.stringify(session.user));
        
        // Redirect to dashboard if on auth pages
        if (window.location.pathname.includes('/login.html') || 
            window.location.pathname.includes('/signup.html')) {
            window.location.href = getRedirectUrl();
        }
    } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        localStorage.removeItem('user');
        localStorage.removeItem('pendingUserData');
        
        // Redirect to login page if on protected pages
        if (window.location.pathname.includes('/dashboard.html')) {
            window.location.href = '/login.html';
        }
    }
});

// Store user data before signup
function storePendingUserData(name, email) {
    localStorage.setItem('pendingUserData', JSON.stringify({ full_name: name, email }));
}


