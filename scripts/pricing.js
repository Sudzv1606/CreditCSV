// Initialize auth state tracking
let isAuthenticated = false;

// Check authentication status on page load
async function checkAuthStatus() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        isAuthenticated = !!user;
    } catch (error) {
        console.error('Auth check failed:', error);
        isAuthenticated = false;
    }
}

// Handle premium subscription button click
document.getElementById('goPremiumBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    
    // First check if user is authenticated
    await checkAuthStatus();
    
    if (!isAuthenticated) {
        // If not authenticated, redirect to signup page
        window.location.href = '/signup.html?redirect=pricing';
        return;
    }

    // If authenticated, proceed with subscription flow
    try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        // Check if user already has an active subscription
        const { data: subscription, error: subscriptionError } = await supabase
            .from('subscriptions')
            .select('status')
            .eq('user_id', user.id)
            .single();

        if (subscriptionError) throw subscriptionError;

        if (subscription?.status === 'active') {
            alert('You already have an active premium subscription!');
            return;
        }

        // Redirect to checkout page
        window.location.href = '/checkout.html';

    } catch (error) {
        console.error('Subscription check failed:', error);
        alert('Something went wrong. Please try again later.');
    }
});

// Run auth check when page loads
checkAuthStatus();