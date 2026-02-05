# Authentication Implementation

This document describes the Supabase email/password authentication system with email verification and disposable email domain blocking.

## Overview

The authentication system uses Supabase Auth with email/password credentials and includes:
- Email verification required before accessing the app
- Protection against disposable/temporary email addresses during signup
- Session management with secure cookies
- Route protection for main app routes

## Features

- ✅ Email/password authentication
- ✅ Required email verification
- ✅ Disposable email domain blocking
- ✅ Route protection for main app
- ✅ Admin routes remain separate and unaffected
- ✅ User session management
- ✅ Sign-in/sign-up/sign-out functionality
- ✅ Clean integration with existing UI

## Architecture

### Supabase Integration

The application uses Supabase Auth for:
- User registration and authentication
- Email verification workflow
- Session management via HTTP-only cookies
- Secure token handling

### Client vs Server

- **Client-side** (`src/lib/supabase/client.ts`): Used in React components for auth operations
- **Server-side** (`src/lib/supabase/server.ts`): Used in Server Components and API routes
- **Middleware** (`src/lib/supabase/middleware.ts`): Used in Next.js middleware for route protection

## Files Created/Modified

### New Files
- `src/lib/supabase/client.ts` - Browser client for Supabase
- `src/lib/supabase/server.ts` - Server client for Supabase
- `src/lib/supabase/middleware.ts` - Middleware session helper
- `src/lib/auth/disposable-domains.ts` - List of disposable email domains and validation function
- `src/app/signup/page.tsx` - Signup page with email/password
- `src/app/login/page.tsx` - Login page with email/password
- `src/app/verify/page.tsx` - Email verification page
- `src/middleware.ts` - Route protection middleware
- `src/components/supabase-provider.tsx` - Supabase user context provider

### Modified Files
- `src/app/layout.tsx` - Removed NextAuth SessionProvider
- `src/components/layout/main-sidebar.tsx` - Updated to use Supabase auth
- `.env.example` - Updated with Supabase environment variables

### Removed Files
- `src/lib/auth/nextauth.ts` - Removed NextAuth configuration
- `src/components/session-provider.tsx` - Removed NextAuth session provider
- `src/app/api/auth/[...nextauth]/route.ts` - Removed NextAuth API routes
- `src/types/next-auth.d.ts` - Removed NextAuth type declarations

## Environment Variables Required

Create a `.env.local` file with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://kmsunnrcrpbjhwuecscr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

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

### 6. Run the Application

```bash
npm run dev
```

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

### Public Routes

These routes are accessible without authentication:
- `/login`
- `/signup`
- `/verify`
- `/admin/*` (admin area remains separate)

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

### Sign-Out Process

1. User clicks the sign-out button in the sidebar
2. Supabase session is cleared
3. User is redirected to `/login`

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

## Customization

### Modifying Email Templates

### Changing Redirect URLs

Update the redirect URLs in:
- `src/app/signup/page.tsx` - `emailRedirectTo` option
- `src/app/verify/page.tsx` - Redirect after verification
- `src/middleware.ts` - Login redirect URL

For production, update the Site URL and Redirect URLs in your Supabase project settings.

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` file to version control
2. **HTTPS in Production**: Ensure your site uses `https://` in production
3. **Supabase Security**: Keep your Supabase Anon Key secure
4. **Row Level Security**: Enable RLS on your Supabase tables for additional security

## Troubleshooting

### Common Issues

1. **"Invalid login credentials" error**: Check that email and password are correct

2. **"Email not confirmed" error**: User needs to verify their email before logging in

#### 4. Middleware redirect issues
- Ensure middleware matcher pattern is correct
- Check browser console for errors
- Verify Supabase session is being properly set

4. **Session not persisting**: Check that Supabase credentials are correct and the project is active

5. **Email verification not working**: Check Supabase Auth settings to ensure email confirmation is enabled

### Development vs Production

- Development: Use `http://localhost:3000` for redirects
- Production: Update Site URL and Redirect URLs in Supabase project settings to your production domain with `https://`

## Testing the Implementation

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

## Integration Notes

The authentication system is designed to work alongside the existing admin authentication system without conflicts. The admin area (`/admin/*`) is excluded from user authentication enforcement and maintains its own separate authentication flow.
