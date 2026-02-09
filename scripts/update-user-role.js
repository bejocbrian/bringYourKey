/**
 * Script to update a user's role in the database
 * Usage: node scripts/update-user-role.js <email> <role>
 * Example: node scripts/update-user-role.js user@example.com admin
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Get environment variables - make sure to set these before running
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kmsunnrcrpbjhwuecscr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttc3VubnJjcnBiamh3dWVjc2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMTQ2OTMsImV4cCI6MjA4NTg5MDY5M30.WNr2rEhy6h6zCvtit0ndqY7vAyjpd2qacRnGkMEZ5DY';

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

async function updateUserRole(email, role) {
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
        console.log('\n🎉 User can now log in to the admin panel!\n');
    } catch (error) {
        console.error('\n❌ Error updating user role:', error);
        process.exit(1);
    }
}

// Parse command line arguments
const email = process.argv[2];
const role = process.argv[3];

if (!email || !role) {
    console.error('❌ Usage: node scripts/update-user-role.js <email> <role>');
    console.error('   Example: node scripts/update-user-role.js user@example.com admin');
    console.error('\n   Valid roles: user, admin, superadmin');
    process.exit(1);
}

if (!['user', 'admin', 'superadmin'].includes(role)) {
    console.error(`❌ Invalid role: ${role}`);
    console.error('   Valid roles: user, admin, superadmin');
    process.exit(1);
}

updateUserRole(email, role);
