# Authentication Implementation

This document describes the custom email/password authentication system with required email verification and disposable-email blocking, using Supabase as the production-ready user store.

## Overview

The authentication system uses Supabase Auth with email/password authentication and includes:
- Email verification requirement before granting access
- Disposable email domain blocking during signup
- Secure session management via Supabase Auth
- Route protection middleware

## Features

- ✅ Custom email/password signup and login
- ✅ Required email verification before app access
- ✅ Disposable email domain blocking (166+ domains)
- ✅ Route protection for main app
- ✅ Admin routes remain separate and unaffected
- ✅ User session management with Supabase
- ✅ Sign-in/sign-out functionality
- ✅ Resend verification email option
- ✅ Password strength validation
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

#### Supabase Configuration
- `src/lib/supabase/client.ts` - Browser client for Supabase
- `src/lib/supabase/server.ts` - Server client for Supabase
- `src/lib/supabase/middleware.ts` - Middleware helper for session management

#### Authentication Logic
- `src/lib/auth/email.ts` - Email and password validation helpers
- `src/lib/auth/disposable-domains.ts` - List of 166+ disposable email domains

#### Pages
- `src/app/signup/page.tsx` - User registration page
- `src/app/login/page.tsx` - User login page (replaced Google OAuth version)
- `src/app/verify/page.tsx` - Email verification status and resend page

#### Documentation
- `AUTHENTICATION.md` - This file

### Modified Files
- `src/middleware.ts` - Updated to use Supabase auth and enforce email verification
- `src/components/layout/main-sidebar.tsx` - Updated to use Supabase session and user data
- `package.json` - Added @supabase/supabase-js and @supabase/ssr dependencies
- `.env.example` - Updated with Supabase environment variables

## Environment Variables Required

Create a `.env.local` file with the following variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Setup Instructions

### 1. Supabase Project Setup

1. Go to [Supabase](https://supabase.com/) and create a new project
2. Wait for the project to be provisioned (takes ~2 minutes)
3. Go to Project Settings > API
4. Copy the Project URL and anon/public key to your `.env.local` file

### 2. Configure Email Authentication

1. In Supabase Dashboard, go to Authentication > Providers
2. Enable Email provider (should be enabled by default)
3. Configure email templates (optional but recommended):
   - Go to Authentication > Email Templates
   - Customize the "Confirm signup" template with your branding
   - Set the redirect URL to: `{{ .SiteURL }}/`

### 3. Email Settings

In Supabase Dashboard, go to Authentication > Settings:

1. **Email Confirmation**: Enable "Confirm email"
2. **Site URL**: Set to your production URL (for development: `http://localhost:3000`)
3. **Redirect URLs**: Add your allowed redirect URLs:
   - Development: `http://localhost:3000/**`
   - Production: `https://yourdomain.com/**`

### 4. Email Sending Configuration

Supabase provides built-in email sending for development. For production:

1. Go to Project Settings > Auth > SMTP Settings
2. Configure your own SMTP provider (recommended for production)
3. Popular options: SendGrid, AWS SES, Postmark, Mailgun

### 5. Install Dependencies

```bash
npm install
```

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
- `/login` - Login page
- `/signup` - Registration page
- `/verify` - Email verification page
- `/admin/*` - Admin area (separate authentication)

### Middleware Logic

The middleware (`src/middleware.ts`) enforces the following rules:

1. **Unauthenticated users**: Redirected to `/login` with a redirect parameter
2. **Authenticated but unverified**: Redirected to `/verify` page
3. **Authenticated and verified**: Full access to protected routes
4. **Auth pages when logged in**: Redirected to home page

## User Flow

### Sign-Up Process

1. User visits `/signup`
2. Enters name (optional), email, password, and confirms password
3. Email is validated against disposable domain list
4. Password is validated for strength requirements
5. Supabase creates user account and sends confirmation email
6. User is redirected to `/verify` page
7. User checks email and clicks verification link
8. Email is verified, user can now access the application

### Sign-In Process

1. User visits `/login` (or is redirected from protected route)
2. Enters email and password
3. Supabase validates credentials
4. If email is not verified: redirected to `/verify`
5. If email is verified: redirected to original page or home

### Email Verification Flow

1. User lands on `/verify` page (automatically after signup or if unverified)
2. Page shows user's email address
3. User can:
   - Click "I've verified my email" to check verification status
   - Click "Resend verification email" if needed
   - Click "Sign out" to return to login
4. Upon successful verification, user is redirected to home page

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

During signup, the email domain is extracted and checked against the disposable domains list. If a match is found, signup is rejected with an error message.

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

In Supabase Dashboard, go to Authentication > Email Templates to customize:
- Confirmation email
- Password recovery email
- Email change confirmation
- Magic link email

### Updating Protected Routes

Edit `src/middleware.ts` to change which routes require authentication:

```typescript
const publicRoutes = ['/login', '/signup', '/verify', '/admin']
```

### Styling Auth Pages

All auth pages use Tailwind CSS and shadcn/ui components:
- `src/app/login/page.tsx` - Login page styling
- `src/app/signup/page.tsx` - Signup page styling
- `src/app/verify/page.tsx` - Verification page styling

### Password Requirements

Edit `src/lib/auth/email.ts` to modify password validation rules:

```typescript
export function validatePassword(password: string): { valid: boolean; error?: string } {
  // Customize validation logic here
}
```

## Security Considerations

### Environment Variables
- Never commit `.env.local` to version control
- Store secrets securely in production (Vercel, AWS, etc.)
- Rotate keys regularly

### HTTPS in Production
- Always use HTTPS in production
- Configure Supabase Site URL with `https://`
- Set up proper SSL certificates

### Password Security
- Passwords are hashed by Supabase using bcrypt
- Never store passwords in plain text
- Enforce strong password requirements

### Email Verification
- Email verification is REQUIRED before app access
- Prevents fake signups and spam accounts
- Ensures valid contact information

### Session Security
- Sessions are stored in HTTP-only cookies
- Automatic session refresh via Supabase
- Secure token handling by Supabase SDK

### Rate Limiting
Supabase has built-in rate limiting for:
- Authentication attempts
- Email sending
- API requests

Configure additional limits in Supabase Dashboard if needed.

## Troubleshooting

### Common Issues

#### 1. "Invalid API key" error
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correctly set in `.env.local`
- Ensure you're using the anon/public key, not the service role key
- Restart the development server after changing environment variables

#### 2. Verification emails not sending
- Check Supabase Dashboard > Authentication > Logs for errors
- Verify SMTP settings if using custom email provider
- Check spam folder
- Ensure "Confirm email" is enabled in Auth Settings

#### 3. "Email not confirmed" redirect loop
- Clear browser cookies and try again
- Check Supabase Dashboard > Authentication > Users to verify email confirmation status
- Use "Resend verification email" button on `/verify` page

#### 4. Middleware redirect issues
- Ensure middleware matcher pattern is correct
- Check browser console for errors
- Verify Supabase session is being properly set

#### 5. Session not persisting
- Check that cookies are enabled in browser
- Verify Site URL is correctly configured in Supabase
- Ensure redirect URLs include your domain

### Development vs Production

#### Development
- Use `http://localhost:3000` as Site URL
- Supabase's built-in email service is sufficient
- Test with real email addresses (even temporary ones for testing)

#### Production
- Use `https://yourdomain.com` as Site URL
- Configure custom SMTP provider for reliable email delivery
- Set up proper domain verification for email sending
- Enable additional security features (rate limiting, captcha)

### Debugging Tips

#### Check User Status
```typescript
const { data: { user } } = await supabase.auth.getUser()
console.log('User:', user)
console.log('Email verified:', user?.email_confirmed_at)
```

#### View Session Info
```typescript
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)
```

#### Refresh Session
```typescript
const { data: { session } } = await supabase.auth.refreshSession()
console.log('Refreshed session:', session)
```

## Testing the Implementation

### Manual Testing Checklist

1. **Signup Flow**
   - [ ] Visit `/signup`
   - [ ] Try weak password (should fail)
   - [ ] Try disposable email (should fail)
   - [ ] Sign up with valid email and strong password
   - [ ] Verify redirect to `/verify` page
   - [ ] Check email inbox for verification link

2. **Email Verification**
   - [ ] Click verification link in email
   - [ ] Should redirect to home page
   - [ ] Try accessing protected routes (should work)

3. **Login Flow**
   - [ ] Sign out
   - [ ] Visit `/login`
   - [ ] Try wrong password (should fail)
   - [ ] Try correct credentials
   - [ ] Should redirect to home page

4. **Route Protection**
   - [ ] Sign out
   - [ ] Try accessing `/` (should redirect to login)
   - [ ] Try accessing `/generate` (should redirect to login)
   - [ ] Login and verify all routes work

5. **Disposable Email Blocking**
   - [ ] Try signing up with `test@mailinator.com`
   - [ ] Should show error about disposable emails

6. **Email Resend**
   - [ ] Sign up with new email
   - [ ] On `/verify` page, click "Resend verification email"
   - [ ] Should receive new email

### Automated Testing (Future)

Consider adding automated tests for:
- Email validation logic
- Password validation logic
- Disposable domain checking
- Session management
- Route protection

## Migration from NextAuth

If you were previously using NextAuth with Google OAuth:

1. **User Data**: Existing NextAuth sessions will be invalid. Users need to sign up again with email/password
2. **Database**: Supabase manages its own user database. No migration needed if you weren't storing user data
3. **Cleanup**: You can safely remove:
   - `next-auth` package
   - `src/lib/auth/nextauth.ts`
   - `src/app/api/auth/[...nextauth]/route.ts`
   - Google OAuth environment variables

## Integration Notes

The authentication system is designed to work alongside the existing admin authentication system without conflicts. The admin area (`/admin/*`) is excluded from user authentication enforcement and maintains its own separate authentication flow.

## Support

For issues with:
- **Supabase**: Check [Supabase Documentation](https://supabase.com/docs)
- **Email delivery**: Review Supabase email logs and SMTP configuration
- **General auth issues**: Review this documentation and Supabase Auth docs

## Future Enhancements

Possible improvements:
- [ ] Social login providers (Google, GitHub, etc.) via Supabase Auth
- [ ] Two-factor authentication (2FA)
- [ ] Password reset flow
- [ ] Email change workflow
- [ ] Account deletion
- [ ] OAuth provider linking
- [ ] Magic link authentication
- [ ] Session management dashboard
