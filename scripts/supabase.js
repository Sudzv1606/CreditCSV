const SUPABASE_URL = 'https://xxaugrajlpugpcnbydrt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4YXVncmFqbHB1Z3BjbmJ5ZHJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNDI2NzMsImV4cCI6MjA1ODgxODY3M30.OLWq0o2I9ohhCmQA37uni73peM3bvU9EnMTI59TT41Q';

// Ensure the global supabase object from the CDN script is available
if (typeof supabase === 'undefined' || typeof supabase.createClient === 'undefined') {
    console.error('Supabase library not loaded or createClient not found.');
    // Optionally throw an error or handle this case
} else {
    // Create Supabase client using the function from the global object
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            storage: window.localStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
        }
    });

    // Export for use in other files - assign the created client instance
    window.supabase = supabaseClient;
}
