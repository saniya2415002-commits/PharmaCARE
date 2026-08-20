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

// Direct Supabase Database Service Helpers
const SupabaseService = {
    // 1. User Registration directly via Supabase
    async registerUser(userData) {
        const client = getSupabaseClient();
        if (!client) throw new Error("Supabase SDK not initialized.");

        const { name, email, phone, address, password, diseases } = userData;
        const addr = address || '';

        // Check if user email already exists
        const { data: existing } = await client
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (existing) {
            throw new Error("Email already registered in Supabase.");
        }

        // Primary payload: mapping project 'address' to Supabase 'delivery_address' & 'address'
        let newUser = {
            name,
            email,
            phone,
            delivery_address: addr,
            address: addr,
            password,
            diseases: diseases || ''
        };

        let { data, error } = await client
            .from('users')
            .insert([newUser])
            .select('*')
            .single();

        // Fallback: Retry with single address column if combo payload fails
        if (error) {
            console.warn("Supabase insert with dual address columns failed, trying fallback:", error.message);
            delete newUser.address;
            const res1 = await client.from('users').insert([newUser]).select('*').single();
            if (res1.error) {
                console.error("Supabase user registration failed:", res1.error);
                throw new Error(res1.error.message || error.message);
            }
            data = res1.data;
        }

        return {
            ...data,
            address: data.delivery_address || data.address || data["delivery address"] || addr,
            delivery_address: data.delivery_address || data.address || data["delivery address"] || addr
        };
    },

    // 2. User Login directly via Supabase
    async loginUser(email, password) {
        const client = getSupabaseClient();
        if (!client) throw new Error("Supabase SDK not initialized.");

        const { data: user, error } = await client
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        if (error || !user) {
            throw new Error("Invalid email or password.");
        }

        if (user.password !== password) {
            throw new Error("Invalid email or password.");
        }

        const userAddr = user.delivery_address || user.address || user["delivery address"] || '';
        return {
            ...user,
            address: userAddr,
            delivery_address: userAddr
        };
    },

    // 3. Fetch Profile details directly via Supabase
    async getUserProfile(email) {
        const client = getSupabaseClient();
        if (!client) return null;

        const { data: user, error } = await client
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        if (error || !user) return null;

        const userAddr = user.delivery_address || user.address || user["delivery address"] || '';
        return {
            ...user,
            address: userAddr,
            delivery_address: userAddr
        };
    },

    // 4. Update Profile directly via Supabase
    async updateUserProfile(email, updateData) {
        const client = getSupabaseClient();
        if (!client) throw new Error("Supabase SDK not initialized.");

        const addr = updateData.address || updateData.delivery_address || updateData["delivery address"] || '';
        const payload = {
            name: updateData.name,
            phone: updateData.phone,
            delivery_address: addr,
            address: addr,
            diseases: updateData.diseases || ''
        };
        if (updateData.password) {
            payload.password = updateData.password;
        }

        let { error } = await client
            .from('users')
            .update(payload)
            .eq('email', email);

        if (error) {
            console.warn("Supabase update with dual address failed, trying fallback:", error.message);
            delete payload.address;
            const res1 = await client.from('users').update(payload).eq('email', email);
            if (res1.error) {
                throw new Error(res1.error.message || error.message);
            }
        }
        return true;
    },

    // 5. Create Appointment Booking directly via Supabase
    async createBooking(bookingData) {
        const client = getSupabaseClient();
        if (!client) return null;

        const payload = {
            patient_name: bookingData.patient_name,
            phone: bookingData.phone,
            email: bookingData.email || '',
            date: bookingData.date,
            doctor: bookingData.doctor,
            time_slot: bookingData.time_slot,
            status: 'confirmed'
        };

        let { data, error } = await client
            .from('bookings')
            .insert([payload])
            .select('id')
            .single();

        if (error) {
            console.warn("Supabase createBooking primary insert note:", error.message);
            // Try without select('id')
            const res1 = await client.from('bookings').insert([payload]);
            if (res1.error) {
                console.error("Supabase booking insert failed:", res1.error);
                return null;
            }
            return 'SUPA-' + Math.floor(Math.random() * 90000 + 10000);
        }
        return data ? data.id : null;
    },

    // 6. Fetch User Appointments directly via Supabase
    async getUserBookings(email, phone) {
        const client = getSupabaseClient();
        if (!client) return [];

        let query = client.from('bookings').select('*').order('date', { ascending: false });
        if (email && phone) {
            query = query.or(`email.eq.${email},phone.eq.${phone}`);
        } else if (email) {
            query = query.eq('email', email);
        } else if (phone) {
            query = query.eq('phone', phone);
        }

        const { data, error } = await query;
        if (error) {
            console.error("Supabase getUserBookings error:", error);
            return [];
        }
        return data || [];
    },

    // 7. Cancel Appointment directly via Supabase
    async cancelBooking(bookingId) {
        const client = getSupabaseClient();
        if (!client) return false;

        const { error } = await client
            .from('bookings')
            .update({ status: 'Cancelled' })
            .eq('id', bookingId);

        return !error;
    },

    // 8. Create Purchase Order Checkout directly via Supabase
    async createOrder(orderData) {
        const client = getSupabaseClient();
        if (!client) return null;

        const itemsString = (typeof orderData.items === 'string') ? orderData.items : JSON.stringify(orderData.items);
        const addr = orderData.delivery_address || orderData.address || '';

        let payload = {
            user_id: orderData.user_id || null,
            items: itemsString,
            total: orderData.total,
            delivery_address: addr,
            address: addr,
            status: orderData.status || 'shipped'
        };

        let { data, error } = await client
            .from('orders')
            .insert([payload])
            .select('id')
            .single();

        if (error) {
            console.warn("Retrying order insert due to:", error.message);
            delete payload.address;
            payload.items = Array.isArray(orderData.items) ? orderData.items : [orderData.items];
            const res1 = await client.from('orders').insert([payload]).select('id').single();
            if (res1.error) {
                console.error("Supabase createOrder failed:", res1.error);
                return null;
            }
            return res1.data ? res1.data.id : null;
        }
        return data ? data.id : null;
    },

    // 9. Fetch Orders directly via Supabase
    async getUserOrders() {
        const client = getSupabaseClient();
        if (!client) return [];

        const { data, error } = await client
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Supabase getUserOrders error:", error);
            return [];
        }
        return data || [];
    }
};

window.SupabaseService = SupabaseService;
