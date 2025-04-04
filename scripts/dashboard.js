// Base URL is removed as we will use relative paths for navigation.
// const BASE_URL = 'https://sudzv1606.github.io/CreditCSV';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session) {
            console.log('No session found, redirecting to login');
            window.location.href = '/CreditCSV/login.html'; // Use path relative to domain root
            return;
        }

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;

        if (!user) {
            console.log('No authenticated user found');
            window.location.href = '/CreditCSV/login.html'; // Use path relative to domain root
            return;
        }

        console.log('Dashboard initialized for user:', user.email);
        console.log("User object:", user); // ADDED LOGGING

        // Initialize user info display
        updateUserInfoDisplay(user);
        
        // Initialize usage stats
        await updateUsageStats();
        
        // Check for abandoned checkout
        checkAbandonedCheckout();
        
        // Remove real-time subscription for usage updates as it's based on the non-existent conversions table
        /* supabase
            .channel('conversions')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'conversions',
                filter: `user_id=eq.${user.id}`
            }, () => {
                updateUsageStats();
            })
            .subscribe();
        */

    } catch (error) {
        console.error('Dashboard initialization error:', error);
        // Redirect to login on auth/session errors
        if (error.message?.includes('auth') || error.message?.includes('session')) {
            window.location.href = '/CreditCSV/login.html'; // Use path relative to domain root
        }
    }
});

async function updateUsageStats() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get current month's usage from the profiles table
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('conversion_count')
            .eq('user_id', user.id)
            .single();

        if (error) throw error;

        const currentUsage = profile?.conversion_count || 0;
        const maxUsage = 10; // Free tier limit
        
        // Update UI
        const currentUsageElement = document.getElementById('currentUsage');
        const maxUsageElement = document.getElementById('maxUsage');
        const progressBar = document.getElementById('usageProgress');
        const warningElement = document.getElementById('usageWarning');
        
        if (currentUsageElement) currentUsageElement.textContent = currentUsage;
        if (maxUsageElement) maxUsageElement.textContent = maxUsage;
        
        // Update progress bar
        if (progressBar) {
            const percentage = Math.min((currentUsage / maxUsage) * 100, 100);
            progressBar.style.width = `${percentage}%`;
        }
        
        // Show warning if close to limit
        if (warningElement) {
            if (currentUsage >= maxUsage * 0.8) {
                warningElement.textContent = `You're approaching your monthly limit. Upgrade to Premium for unlimited conversions!`;
                warningElement.style.display = 'block';
            } else {
                warningElement.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Failed to fetch usage stats:', error);
    }
}
// Base URL is removed as we will use relative paths for navigation.
// const BASE_URL = 'https://sudzv1606.github.io/CreditCSV';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session) {
            console.log('No session found, redirecting to login');
            window.location.href = '/CreditCSV/login.html'; // Use path relative to domain root
            return;
        }

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;

        if (!user) {
            console.log('No authenticated user found');
            window.location.href = '/CreditCSV/login.html'; // Use path relative to domain root
            return;
        }

        console.log('Dashboard initialized for user:', user.email);

        // Initialize user menu
        initializeUserMenu(user);
        
        // Initialize usage stats
        await updateUsageStats();
        
        // Check for abandoned checkout
        checkAbandonedCheckout();
        
        // Remove real-time subscription for usage updates as it's based on the non-existent conversions table
        /* supabase
            .channel('conversions')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'conversions',
                filter: `user_id=eq.${user.id}`
            }, () => {
                updateUsageStats();
            })
            .subscribe();
        */

    } catch (error) {
        console.error('Dashboard initialization error:', error);
        // Redirect to login on auth/session errors
        if (error.message?.includes('auth') || error.message?.includes('session')) {
            window.location.href = '/CreditCSV/login.html'; // Use path relative to domain root
        }
    }
});

async function updateUsageStats() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get current month's usage
        const { data: usage, error } = await supabase
            .from('conversions')
            .select('count')
            .eq('user_id', user.id)
            .gte('created_at', new Date(new Date().setDate(1)).toISOString())
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        const currentUsage = usage?.count || 0;
        const maxUsage = 10; // Free tier limit
        
        // Update UI
        const currentUsageElement = document.getElementById('currentUsage');
        const maxUsageElement = document.getElementById('maxUsage');
        const progressBar = document.getElementById('usageProgress');
        const warningElement = document.getElementById('usageWarning');
        
        if (currentUsageElement) currentUsageElement.textContent = currentUsage;
        if (maxUsageElement) maxUsageElement.textContent = maxUsage;
        
        // Update progress bar
        if (progressBar) {
            const percentage = Math.min((currentUsage / maxUsage) * 100, 100);
            progressBar.style.width = `${percentage}%`;
        }
        
        // Show warning if close to limit
        if (warningElement) {
            if (currentUsage >= maxUsage * 0.8) {
                warningElement.textContent = `You're approaching your monthly limit. Upgrade to Premium for unlimited conversions!`;
                warningElement.style.display = 'block';
            } else {
                warningElement.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Failed to fetch usage stats:', error);
    }
}

function checkAbandonedCheckout() {
    const hasAbandonedCheckout = localStorage.getItem('abandonedCheckout');
    if (hasAbandonedCheckout) {
        document.getElementById('cartBanner').style.display = 'block';
    }
}

function updateUserInfoDisplay(user) {
    const userInitialElement = document.querySelector('.user-initial');
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    const logoutBtn = document.getElementById('logoutBtn');

    if (!userInitialElement || !userEmailDisplay || !logoutBtn) {
        console.error('User info elements not found.');
        return;
    }

    // Set user initial and email
    if (user.email) {
        userInitialElement.textContent = user.email[0].toUpperCase();
        userEmailDisplay.textContent = user.email;
    } else {
        userInitialElement.textContent = '?'; // Fallback if email is missing
        userEmailDisplay.textContent = 'No email found';
    }

    // Handle logout - keep the logout logic as is
    logoutBtn.addEventListener('click', async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            console.log('User logged out successfully.');
            window.location.href = '/CreditCSV/index.html'; // Explicitly redirect to homepage
        } catch (error) {
            console.error('Logout failed:', error);
            alert('Logout failed. Please try again.');
        }
    });
}

// Handle upgrade button click
document.getElementById('upgradeBtn')?.addEventListener('click', () => {
    // TODO: Implement checkout flow or redirect to pricing/signup
    // window.location.href = '/checkout.html'; // Changed from BASE_URL - checkout.html does not exist
    console.warn('Checkout page redirect disabled: checkout.html does not exist.');
    alert('Checkout functionality is not yet implemented.'); // Placeholder feedback
});

// Handle resume checkout button click
document.getElementById('resumeCheckoutBtn')?.addEventListener('click', () => {
    // TODO: Implement checkout flow or redirect to pricing/signup
    // window.location.href = '/checkout.html'; // Changed from BASE_URL - checkout.html does not exist
    console.warn('Checkout page redirect disabled: checkout.html does not exist.');
    alert('Checkout functionality is not yet implemented.'); // Placeholder feedback
    localStorage.removeItem('abandonedCheckout');
});

// Make updateUsageStats available globally
window.updateUsageStats = updateUsageStats;
