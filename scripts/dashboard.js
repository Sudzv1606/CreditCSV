document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check authentication
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
            console.log('No authenticated user found');
            window.location.href = '/login.html';
            return;
        }

        // Initialize user menu
        initializeUserMenu(user);
        
        // Initialize usage stats
        await updateUsageStats();
        
        // Set up real-time subscription for usage updates
        supabase
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
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        window.location.href = '/login.html';
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

function initializeUserMenu(user) {
    const userInitial = document.querySelector('.user-initial');
    userInitial.textContent = user.email[0].toUpperCase();
    
    // Add dropdown menu
    const userMenu = document.getElementById('userMenuBtn');
    userMenu.addEventListener('click', () => {
        // Toggle dropdown menu
    });
}

// Handle upgrade button click
document.getElementById('upgradeBtn').addEventListener('click', () => {
    window.location.href = '/checkout.html';
});

// Handle resume checkout button click
document.getElementById('resumeCheckoutBtn')?.addEventListener('click', () => {
    window.location.href = '/checkout.html';
    localStorage.removeItem('abandonedCheckout');
});

// Make updateUsageStats available globally
window.updateUsageStats = updateUsageStats;


