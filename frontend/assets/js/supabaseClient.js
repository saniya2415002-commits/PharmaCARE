// Supabase Client Initialization & Realtime Subscription helper
const SUPABASE_URL = 'https://vvxeexyiixytkgqlsdmc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2eGVleHlpaXh5dGtncWxzZG1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1OTI4NDUsImV4cCI6MjEwMjE2ODg0NX0.s9wgtG4CP9fFrHOKmE9c4-g5Wlf88QV-vhXYlZkAepE';

let supabaseClient = null;

function getSupabaseClient() {
    if (!supabaseClient && window.supabase) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return supabaseClient;
}

window.getSupabaseClient = getSupabaseClient;

// Subscribe to Realtime Postgres Changes for bookings & orders
function subscribeToRealtimeUpdates(onBookingChange, onOrderChange) {
    const client = getSupabaseClient();
    if (!client) {
        console.warn("Supabase SDK not loaded on window.");
        return null;
    }

    const channel = client
        .channel('pharmacare-realtime-channel')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'bookings' },
            (payload) => {
                console.log('Realtime Booking Change Received:', payload);
                if (typeof onBookingChange === 'function') {
                    onBookingChange(payload);
                }
            }
        )
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders' },
            (payload) => {
                console.log('Realtime Order Change Received:', payload);
                if (typeof onOrderChange === 'function') {
                    onOrderChange(payload);
                }
            }
        )
        .subscribe((status) => {
            console.log('Supabase Realtime Subscription Status:', status);
        });

    return channel;
}

window.subscribeToRealtimeUpdates = subscribeToRealtimeUpdates;
