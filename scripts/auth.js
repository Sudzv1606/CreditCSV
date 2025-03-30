// Function to initialize all authentication-related logic
function initializeAuth() {
    console.log("Attempting to initialize Auth Logic...");

    // Ensure supabase client is available
    if (!window.supabase) {
        console.error("Supabase client not ready in initializeAuth. Aborting.");
        return;
    }
    console.log("Supabase client found. Proceeding with auth initialization.");

    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // --- Event Listeners ---

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('errorMessage');
            errorMessage.style.display = 'none'; // Hide previous errors

            try {
                console.log('Attempting login for:', email);
                const { data, error } = await window.supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) throw error;

                console.log('Login successful:', data);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = '/CreditCSV/dashboard.html'; // Use path relative to domain root

            } catch (error) {
                console.error('Login error:', error);
                errorMessage.style.display = 'block';
                errorMessage.textContent = error.message || 'Login failed. Please check your credentials.';
            }
        });
    }

    // Handle signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('errorMessage');
            errorMessage.style.display = 'none'; // Hide previous errors

            try {
                // Check if a profile with this email already exists
                const { data: existingProfile, error: existingProfileError } = await window.supabase
                    .from('profiles')
                    .select('*')
                    .eq('email', email)
                    .single();

                if (existingProfileError && existingProfileError.code !== 'PGRST116') {
                    throw existingProfileError; // Re-throw if it's not a "no rows found" error
                }

                if (existingProfile) {
                    // A profile with this email already exists
                    errorMessage.style.display = 'block';
                    errorMessage.textContent = 'An account with this email already exists. Please try logging in or contact support.';
                    return; // Stop signup process
                }

                console.log('Attempting signup for:', email);
                const { data: authData, error: authError } = await window.supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name
                        }
                    }
                });

                if (authError) throw authError;

                console.log('Signup successful, user data:', authData.user);

                // Check if user object exists before proceeding
                if (authData.user) {
                    // Create profile (handle potential errors)
                    try {
                        const { error: profileError } = await window.supabase
                            .from('profiles')
                            .insert([
                                {
                                    user_id: authData.user.id,
                                    full_name: name,
                                    email: email // Ensure email is included if needed in profile
                                }
                            ]);

                        if (profileError) {
                            // Log profile error but continue, as user is already signed up
                            console.error('Profile creation error:', profileError);
                            // Optionally inform the user or attempt retry later
                        } else {
                             console.log('Profile created successfully for user:', authData.user.id);
                        }

                    } catch (profileCatchError) {
                         console.error('Caught profile creation exception:', profileCatchError);
                    }


                    // Store user data in localStorage
                    localStorage.setItem('user', JSON.stringify(authData.user));

                    // Redirect to dashboard
                    // No need to explicitly get session here, signup implies session creation
                    console.log('Redirecting to dashboard after signup...');
                    window.location.href = '/CreditCSV/dashboard.html'; // Use path relative to domain root
                    return; // Prevent further execution in this function
                } else {
                    console.error('Signup successful but no user data returned.');
                    errorMessage.style.display = 'block';
                    errorMessage.textContent = 'Signup completed, but failed to retrieve user details. Please try logging in.';
                }

            } catch (error) {
                console.error('Signup error:', error);
                errorMessage.style.display = 'block';
                errorMessage.textContent = error.message || 'Signup failed. Please try again.';
            }
        });
    }

    // --- Initial Checks and State Listener ---

    // Check session on initial load (after DOM is ready)
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            const { data: { session } } = await window.supabase.auth.getSession();

            // Adjust path checking for subdirectory
            const isOnLoginPage = window.location.pathname.endsWith('/CreditCSV/login.html');
            const isOnSignupPage = window.location.pathname.endsWith('/CreditCSV/signup.html');

            if (session && (isOnLoginPage || isOnSignupPage)) {
                console.log('User already logged in, redirecting from auth page to dashboard.');
                window.location.href = '/CreditCSV/dashboard.html'; // Use path relative to domain root
            }
        } catch (error) {
            console.error("Error checking initial session:", error);
        }
    });

    // Add auth state change listener
    window.supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session);
        // Adjust path checking for subdirectory
        const isOnDashboardPage = window.location.pathname.endsWith('/CreditCSV/dashboard.html');
        const isOnLoginPage = window.location.pathname.endsWith('/CreditCSV/login.html');
        const isOnSignupPage = window.location.pathname.endsWith('/CreditCSV/signup.html');

        // Add a check for session and user data before redirecting
        // Remove the SIGNED_IN redirect logic as it's now handled directly after signup
        if (event === 'SIGNED_OUT') {
            console.log('User signed out');
            localStorage.removeItem('user');
            localStorage.removeItem('pendingUserData'); // Clear any pending data
            // Redirect to homepage after logout, but only if not already on the homepage
            if (!window.location.pathname.endsWith('/CreditCSV/index.html')) {
                window.location.href = '/CreditCSV/index.html';
            } else {
                console.log("Already on homepage, not redirecting.");
            }
        } else {
            console.log('Auth state changed, but not a SIGNED_OUT event. Ignoring.');
        }
    });

} // --- End of initializeAuth function ---


// --- Wait for Supabase client ---
// Use an interval to check if window.supabase is available before initializing
const checkSupabaseAuthInterval = setInterval(() => {
    // Check for the supabase object AND the createClient function specifically
    if (typeof window.supabase !== 'undefined' && typeof window.supabase.auth !== 'undefined') {
        console.log("Supabase client (auth) is ready. Initializing auth logic.");
        clearInterval(checkSupabaseAuthInterval);
        initializeAuth(); // Call the initialization function
    } else {
        console.log("Waiting for Supabase client (auth)...");
    }
}, 100); // Check every 100ms
