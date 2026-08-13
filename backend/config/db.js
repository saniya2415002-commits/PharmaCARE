const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vvxeexyiixytkgqlsdmc.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2eGVleHlpaXh5dGtncWxzZG1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1OTI4NDUsImV4cCI6MjEwMjE2ODg0NX0.s9wgtG4CP9fFrHOKmE9c4-g5Wlf88QV-vhXYlZkAepE';

let supabase;

try {
    const { createClient } = require('@supabase/supabase-js');
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase JS SDK initialized successfully.');
} catch (e) {
    console.log('Using Native REST API Client for Supabase.');

    // Fallback REST Client matching Supabase Query Builder interface
    supabase = {
        from: (table) => {
            let selectFields = '*';
            let filters = [];
            let orderings = [];
            let action = 'SELECT'; // 'SELECT', 'INSERT', 'UPDATE'
            let bodyData = null;

            const builder = {
                select: (fields) => {
                    if (fields) selectFields = fields;
                    return builder;
                },
                eq: (column, value) => {
                    filters.push(`${column}=eq.${encodeURIComponent(value)}`);
                    return builder;
                },
                order: (column, options = {}) => {
                    const dir = options.ascending === false ? 'desc' : 'asc';
                    orderings.push(`${column}.${dir}`);
                    return builder;
                },
                insert: (rows) => {
                    action = 'INSERT';
                    bodyData = rows;
                    return builder;
                },
                update: (updateData) => {
                    action = 'UPDATE';
                    bodyData = updateData;
                    return builder;
                },
                maybeSingle: async () => {
                    const result = await builder.execute();
                    if (result.error) return result;
                    const data = Array.isArray(result.data) && result.data.length > 0 ? result.data[0] : null;
                    return { data, error: null };
                },
                single: async () => {
                    const result = await builder.execute();
                    if (result.error) return result;
                    const data = Array.isArray(result.data) && result.data.length > 0 ? result.data[0] : null;
                    return { data, error: null };
                },
                execute: async () => {
                    let url = `${SUPABASE_URL}/rest/v1/${table}`;
                    let method = 'GET';
                    let headers = {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    };

                    if (action === 'INSERT') {
                        method = 'POST';
                        headers['Prefer'] = 'return=representation';
                        if (selectFields) {
                            url += `?select=${encodeURIComponent(selectFields)}`;
                        }
                    } else if (action === 'UPDATE') {
                        method = 'PATCH';
                        headers['Prefer'] = 'return=representation';
                        let queryParams = [...filters];
                        if (selectFields && selectFields !== '*') {
                            queryParams.push(`select=${encodeURIComponent(selectFields)}`);
                        }
                        if (queryParams.length > 0) {
                            url += `?${queryParams.join('&')}`;
                        }
                    } else {
                        // SELECT
                        let queryParams = [`select=${encodeURIComponent(selectFields)}`];
                        if (filters.length > 0) queryParams.push(...filters);
                        if (orderings.length > 0) queryParams.push(`order=${orderings.join(',')}`);
                        url += `?${queryParams.join('&')}`;
                    }

                    try {
                        const fetchOptions = { method, headers };
                        if (bodyData !== null) {
                            fetchOptions.body = JSON.stringify(bodyData);
                        }
                        const response = await fetch(url, fetchOptions);
                        const data = await response.json();
                        if (!response.ok) return { data: null, error: data };
                        return { data, error: null };
                    } catch (err) {
                        return { data: null, error: err };
                    }
                },
                then: (resolve, reject) => {
                    return builder.execute().then(resolve, reject);
                }
            };

            return builder;
        }
    };
}

module.exports = {
    supabase,
    SUPABASE_URL,
    SUPABASE_ANON_KEY
};
