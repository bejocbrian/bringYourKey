# Authentication Implementation

This document describes the Supabase email/password authentication system with email verification, disposable email domain blocking, and the admin user creation + provider access system.

## Overview

The authentication system uses Supabase Auth with email/password credentials and includes:
- Email verification required before accessing the app
- Protection against disposable/temporary email addresses during signup
- Session management with secure cookies
- Route protection for main app routes
- Admin user creation via invite flow
- Provider access control per user
- Profiles table for extended user data

## Features

- ✅ Email/password authentication
- ✅ Required email verification
- ✅ Disposable email domain blocking
- ✅ Route protection for main app
- ✅ Admin routes remain separate and unaffected
- ✅ User session management
- ✅ Sign-in/sign-up/sign-out functionality
- ✅ Clean integration with existing UI
- ✅ Admin user creation via invite flow
- ✅ Provider access control per user
- ✅ Profiles table with RLS policies

## Architecture

### Supabase Integration

The application uses Supabase Auth for:
- User registration and authentication
- Email verification workflow
- Session management via HTTP-only cookies
- Secure token handling
- Admin invite flow for user creation

### Client vs Server

- **Client-side** (`src/lib/supabase/client.ts`): Used in React components for auth operations
- **Server-side** (`src/lib/supabase/server.ts`): Used in Server Components and API routes (includes anon and service role clients)
- **Middleware** (`src/lib/supabase/middleware.ts`): Used in Next.js middleware for route protection

### Profiles Table

The `profiles` table extends Supabase Auth with additional user data:

```sql
- id: UUID (references auth.users)
- email: TEXT
- full_name: TEXT
- role: 'user' | 'admin' | 'superadmin'
- status: 'active' | 'inactive' | 'suspended'
- allowed_providers: TEXT[] (array of provider IDs)
- generations_count: INTEGER
- last_active: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## Files Created/Modified

### New Files
- `src/lib/supabase/client.ts` - Browser client for Supabase
- `src/lib/supabase/server.ts` - Server client for Supabase (anon + service role)
- `src/lib/supabase/middleware.ts` - Middleware session helper
- `src/lib/auth/disposable-domains.ts` - List of disposable email domains and validation function
- `src/lib/store/profile-store.ts` - Client-side profile store for current user
- `src/app/api/admin/users/route.ts` - Admin API for listing and creating users
- `src/app/api/admin/users/[id]/route.ts` - Admin API for updating users
- `src/app/signup/page.tsx` - Signup page with email/password
- `src/app/login/page.tsx` - Login page with email/password
- `src/app/verify/page.tsx` - Email verification page
- `src/middleware.ts` - Route protection middleware
- `src/components/supabase-provider.tsx` - Supabase user context provider
- `supabase/schema.sql` - Database schema with profiles table, RLS policies, and triggers
- `.env.example` - Environment variables template

### Modified Files
- `src/app/layout.tsx` - Removed NextAuth SessionProvider
- `src/components/layout/main-sidebar.tsx` - Updated to use Supabase auth and profile store
- `src/app/(main)/generate/page.tsx` - Updated to use profile store for provider access
- `src/app/admin/users/page.tsx` - Updated to use API for user management
- `src/lib/types/index.ts` - Added Profile type

### Removed Files
- `src/lib/auth/nextauth.ts` - Removed NextAuth configuration
- `src/components/session-provider.tsx` - Removed NextAuth session provider
- `src/app/api/auth/[...nextauth]/route.ts` - Removed NextAuth API routes
- `src/types/next-auth.d.ts` - Removed NextAuth type declarations

## Environment Variables Required

Create a `.env.local` file with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Application URL (used for invite redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to Project Settings → API
4. Copy the following:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret**: `SUPABASE_SERVICE_ROLE_KEY` (Warning: Keep this secret!)

## Supabase Setup Instructions

### 1. Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project or use an existing one
3. Copy the Project URL and Anon Key from Project Settings → API
4. Add these to your `.env.local` file

### 2. Configure Email Settings

1. In Supabase Dashboard, go to Authentication → Providers → Email
2. Enable "Confirm email" to require email verification
3. Configure the Site URL: `http://localhost:3000`
4. Configure Redirect URLs: Add `http://localhost:3000/verify`

### 3. Set Up the Profiles Table

1. Go to the SQL Editor in your Supabase Dashboard
2. Create a new query
3. Copy the contents of `supabase/schema.sql` and paste it into the editor
4. Run the query

This will create:
- The `profiles` table with all necessary columns
- Row Level Security (RLS) policies for secure access
- Triggers for auto-creating profiles on signup
- Triggers for updating the `updated_at` timestamp

### 4. Create an Admin User

1. Sign up as a regular user through the app
2. Go to Supabase Dashboard → Table Editor → profiles
3. Find your user and change the `role` column to `superadmin`
4. Alternatively, run this SQL:
   ```sql
   UPDATE public.profiles 
   SET role = 'superadmin' 
   WHERE email = 'your-email@example.com';
   ```

### 5. Run the Application

```bash
npm run dev
```

## Admin User Creation Flow

### Invite Flow (Recommended)

Admins can create new users through the Admin Users page:

1. Go to `/admin/users`
2. Click "Add User"
3. Fill in user details:
   - Name
   - Email
   - Status (active/inactive/suspended)
   - Provider access (defaults to Meta Movie Gen)
   - Last active date
   - Generations count
4. Click "Create User"
5. The user receives an invite email from Supabase
6. User clicks the invite link and sets their password
7. User can now log in with their email and password

### Technical Details

- The API uses the Supabase service role key to create users via `auth.admin.inviteUserByEmail()`
- A profile is automatically created via the database trigger
- The API then updates the profile with the admin-specified settings
- Provider access is stored in the `allowed_providers` array

## Provider Access Control

### How It Works

1. Each user has an `allowed_providers` array in their profile
2. The Generate page checks this array to determine which providers the user can access
3. The MainSidebar shows provider status based on:
   - Whether the user has API keys configured
   - Whether the user has access to the provider
4. Admins can toggle provider access per user in the Admin Users page

### Provider Access States

- **Ready** (green): User has API key and access granted
- **No Key** (gray): User has access but no API key configured
- **Locked** (red): User doesn't have access to this provider

### Default Provider Access

New users are granted access to `['meta-moviegen']` by default. Admins can change this when creating or editing users.

## Password Requirements

Passwords must meet the following criteria:
- Minimum 8 characters long
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)

## Route Protection

### Protected Routes

All main app routes require authentication AND email verification:
- `/` (Dashboard)
- `/generate`
- `/gallery`
- `/api-keys`

### Admin Routes

Admin routes require an authenticated user with `admin` or `superadmin` role:
- `/admin/*`

### Public Routes

These routes are accessible without authentication:
- `/login`
- `/signup`
- `/verify`

### Middleware Logic

The middleware (`src/middleware.ts`) enforces the following rules:

1. **Middleware Protection**: The `middleware.ts` file intercepts all requests (except public routes) and checks for an active session
2. **No Session Redirect**: If no session is found, users are redirected to `/login` with a `callbackUrl` parameter
3. **Session Validation**: Supabase validates JWT tokens and manages session state
4. **Disposable Email Check**: During signup, the email domain is checked against a list of disposable domains

## User Flow

### Sign-Up Process
1. User visits `/signup`
2. User enters email and password
3. **Disposable email check**: If email domain is in disposable list, signup is rejected
4. Password must be at least 8 characters
5. Upon successful signup, user is redirected to `/verify` with email parameter
6. Verification email is sent with OTP code

### Email Verification Process
1. User receives verification email with 6-digit code
2. User enters the code on the `/verify` page
3. Upon successful verification, user is redirected to the dashboard
4. User can also request a new code if needed

### Sign-In Process
1. User visits `/login` (or is redirected from protected route)
2. User enters email and password
3. **Disposable email check**: If email domain is in disposable list, sign-in is rejected
4. **Email verification check**: If email is not verified, user is redirected to `/verify`
5. Upon successful authentication, user is redirected to original page or dashboard
6. Profile is loaded from Supabase and stored in profile store

### Sign-Out Process

1. User clicks the sign-out button in the sidebar
2. Supabase session is cleared
3. Profile store is cleared
4. User is redirected to `/login`

### Admin User Creation Process

1. Admin visits `/admin/users`
2. Admin clicks "Add User"
3. Admin fills in user details and clicks "Create User"
4. API creates user via Supabase invite
5. User receives invite email
6. User clicks invite link and sets password
7. User can now log in

## Disposable Email Blocking

The system includes a comprehensive list of 166+ disposable email domains from popular temporary email services including:

- 10MinuteMail
- GuerrillaMail
- Mailinator
- TempMail
- YOPmail
- MailDrop
- Sharklasers
- And many more...

### How It Works

1. Try to sign up with a temporary email from services like:
   - `user@10minutemail.com`
   - `user@guerrillamail.com`
   - `user@yopmail.com`
2. The signup should be rejected with an error message

### Testing Disposable Email Blocking

Try to sign up with an email from these domains:
- `test@10minutemail.com`
- `test@guerrillamail.com`
- `test@yopmail.com`
- `test@mailinator.com`

The signup should be rejected with: "Disposable email addresses are not allowed. Please use a permanent email address."

### Adding New Disposable Domains

Edit `src/lib/auth/disposable-domains.ts` and add domains to the `DISPOSABLE_DOMAINS` array:

```typescript
export const DISPOSABLE_DOMAINS = [
  // ... existing domains
  'new-disposable-domain.com',
];
```

## Row Level Security (RLS)

The profiles table has the following RLS policies:

1. **Users can read own profile**: Users can only view their own profile data
2. **Users can update own profile**: Users can update their own profile (except role/status)
3. **Admins can read all profiles**: Admins can view all user profiles
4. **Admins can update all profiles**: Admins can modify any user's profile
5. **Admins can insert profiles**: Admins can create new profiles
6. **Admins can delete profiles**: Admins can delete profiles

## Database Triggers

### Auto-create Profile on Signup

When a new user is created in `auth.users`, a trigger automatically creates a corresponding profile with:
- Default role: 'user'
- Default status: 'active'
- Default allowed_providers: ['meta-moviegen']

### Auto-update Timestamp

The `updated_at` column is automatically updated whenever a profile is modified.

## Customization

### Modifying Email Templates

Customize email templates in Supabase Dashboard → Authentication → Email Templates:
- Confirm signup
- Invite user
- Magic link
- Change email address
- Reset password

### Changing Redirect URLs

Update the redirect URLs in:
- `src/app/signup/page.tsx` - `emailRedirectTo` option
- `src/app/verify/page.tsx` - Redirect after verification
- `src/middleware.ts` - Login redirect URL
- `src/app/api/admin/users/route.ts` - Invite redirect URL

For production, update the Site URL and Redirect URLs in your Supabase project settings.

### Modifying Default Provider Access

Edit the default value in `supabase/schema.sql`:

```sql
allowed_providers TEXT[] NOT NULL DEFAULT ARRAY['meta-moviegen'],
```

And update the trigger function if needed.

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` file to version control
2. **Service Role Key**: Keep `SUPABASE_SERVICE_ROLE_KEY` absolutely secret - it has full admin access
3. **HTTPS in Production**: Ensure your site uses `https://` in production
4. **Supabase Security**: Keep your Supabase Anon Key secure
5. **Row Level Security**: RLS is enabled on the profiles table for additional security
6. **Admin Checks**: All admin API routes verify the requesting user has admin role

## Troubleshooting

### Common Issues

1. **"Invalid login credentials" error**: Check that email and password are correct

2. **"Email not confirmed" error**: User needs to verify their email before logging in

3. **"Failed to create user" error**: Check that the service role key is configured correctly

4. **Profile not loading**: 
   - Check that the profiles table was created correctly
   - Verify RLS policies are configured
   - Check browser console for errors

5. **Provider access not working**:
   - Verify the user has providers in their `allowed_providers` array
   - Check that the profile store is loading correctly
   - Ensure the user has re-logged in after provider access was granted

6. **Admin API returns 403**:
   - Verify the admin user has `role` set to 'admin' or 'superadmin'
   - Check that the user is logged in
   - Verify RLS policies allow admin access

#### 7. Middleware redirect issues
- Ensure middleware matcher pattern is correct
- Check browser console for errors
- Verify Supabase session is being properly set

8. **Session not persisting**: Check that Supabase credentials are correct and the project is active

9. **Email verification not working**: Check Supabase Auth settings to ensure email confirmation is enabled

10. **Invite email not sending**:
    - Check Supabase Auth email settings
    - Verify the service role key is correct
    - Check email provider configuration in Supabase

### Development vs Production

- Development: Use `http://localhost:3000` for redirects
- Production: Update Site URL and Redirect URLs in Supabase project settings to your production domain with `https://`

## Testing the Implementation

### Basic Authentication Flow

1. Start the development server: `npm run dev`
2. Visit `http://localhost:3000` - you should be redirected to `/login`
3. Click "Sign up" to create a new account
4. Try to sign up with a disposable email - should be blocked
5. Sign up with a valid email - should redirect to `/verify`
6. Check your email for the verification code
7. Enter the code on the verify page
8. Once verified, you should be redirected to the dashboard
9. Try to access protected routes directly - should work
10. Sign out and try to access protected routes - should redirect to login

### Admin User Creation Flow

1. Make your user an admin (via Supabase Dashboard or SQL)
2. Go to `/admin/users`
3. Click "Add User"
4. Fill in user details and create
5. Check that the user receives an invite email
6. Click the invite link and set a password
7. Log in as the new user
8. Verify provider access matches what was configured

### Provider Access Testing

1. Log in as a regular user
2. Go to Generate page
3. Verify only allowed providers are accessible
4. As admin, toggle provider access for the user
5. User should log out and back in to see changes
6. Verify the provider access is updated

## API Endpoints

### Admin Users API

#### GET /api/admin/users
- **Authentication**: Required (admin role)
- **Response**: List of all user profiles
- **Error**: 403 if not admin

#### POST /api/admin/users
- **Authentication**: Required (admin role)
- **Body**: `{ email, full_name, status, allowed_providers, generations_count, last_active }`
- **Response**: Created user profile
- **Error**: 400 for validation errors, 403 if not admin

#### PATCH /api/admin/users/[id]
- **Authentication**: Required (admin role)
- **Body**: `{ status, allowed_providers, generations_count, last_active, full_name }` (any subset)
- **Response**: Updated user profile
- **Error**: 400 for validation errors, 403 if not admin

## Integration Notes

The authentication system is designed to work alongside the existing admin authentication system without conflicts. The admin area (`/admin/*`) maintains its own authentication that checks the profile role.

The profile store (`useProfileStore`) provides a client-side cache of the current user's profile, including provider access. This is used by the Generate page and MainSidebar to control provider access.
