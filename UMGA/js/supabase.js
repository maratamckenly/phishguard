const SUPABASE_URL = "https://lvwiyurpvevynakpksnx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_DBHi6gNA4aYkSCM33prCjw_wsUC9Nfa";

// Make sure the Supabase library loaded
if (!window.supabase) {
    console.error("PHISHGUARD: Supabase library failed to load.");
} else {
    // Create Supabase client
    const supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );

    // Make the client available to the entire application
    window.phishguardSupabase = supabaseClient;

    // Optional compatibility alias
    window.supabaseClient = supabaseClient;

    console.log("PHISHGUARD: Supabase client initialized.");
}