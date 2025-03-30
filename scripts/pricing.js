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

const BASE_URL = 'https://sudzv1606.github.io/CreditCSV';

// Handle premium subscription button click
document.getElementById('goPremiumBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    
    await checkAuthStatus();
    
    if (!isAuthenticated) {
        window.location.href = `${BASE_URL}/signup.html?redirect=pricing`;
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
        window.location.href = `${BASE_URL}/checkout.html`;

    } catch (error) {
        console.error('Subscription check failed:', error);
        alert('Something went wrong. Please try again later.');
    }
});

// Run auth check when page loads
checkAuthStatus();

