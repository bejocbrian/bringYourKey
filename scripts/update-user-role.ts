/**
 * Script to update a user's role in the database
 * Usage: ts-node scripts/update-user-role.ts <email> <role>
 * Example: ts-node scripts/update-user-role.ts user@example.com admin
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
    process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function updateUserRole(email: string, role: 'user' | 'admin' | 'superadmin') {
    console.log(`\n🔄 Updating role for ${email} to ${role}...`);

    try {
        // First, check if the profile exists
        const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();

        if (fetchError) {
            if (fetchError.code === 'PGRST116') {
                console.error(`❌ No profile found for email: ${email}`);
                console.log('\n💡 Tip: Make sure the user has signed up first.');
                return;
            }
            throw fetchError;
        }

        console.log('\n📋 Current profile:');
        console.log(`   Email: ${existingProfile.email}`);
        console.log(`   Current Role: ${existingProfile.role}`);
        console.log(`   Status: ${existingProfile.status}`);

        // Update the role
        const { data, error } = await supabase
            .from('profiles')
            .update({ role })
            .eq('email', email)
            .select()
            .single();

        if (error) {
            throw error;
        }

        console.log('\n✅ Successfully updated user role!');
        console.log('\n📋 Updated profile:');
        console.log(`   Email: ${data.email}`);
        console.log(`   New Role: ${data.role}`);
        console.log(`   Status: ${data.status}`);
        console.log(`   Updated At: ${data.updated_at}`);
        console.log('\n🎉 User can now log in to the admin panel!');
    } catch (error) {
        console.error('\n❌ Error updating user role:', error);
        process.exit(1);
    }
}

// Parse command line arguments
const email = process.argv[2];
const role = process.argv[3] as 'user' | 'admin' | 'superadmin';

if (!email || !role) {
    console.error('❌ Usage: ts-node scripts/update-user-role.ts <email> <role>');
    console.error('   Example: ts-node scripts/update-user-role.ts user@example.com admin');
    console.error('\n   Valid roles: user, admin, superadmin');
    process.exit(1);
}

if (!['user', 'admin', 'superadmin'].includes(role)) {
    console.error(`❌ Invalid role: ${role}`);
    console.error('   Valid roles: user, admin, superadmin');
    process.exit(1);
}

updateUserRole(email, role);
