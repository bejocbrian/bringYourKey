# Authentication Implementation

This document describes the Google-only authentication system with disposable email domain blocking that has been implemented.

## Overview

The authentication system uses NextAuth.js (v5) with Google OAuth provider and includes protection against disposable/temporary email addresses during sign-in.

## Features

- ✅ Google OAuth authentication only
- ✅ Disposable email domain blocking
- ✅ Route protection for main app
- ✅ Admin routes remain separate and unaffected
- ✅ User session management
- ✅ Sign-in/sign-out functionality
- ✅ Clean integration with existing UI

## Files Modified/Created

### New Files
- `src/lib/auth/disposable-domains.ts` - List of disposable email domains and validation function
- `src/lib/auth/nextauth.ts` - NextAuth configuration with Google provider and disposable email checking
- `src/app/api/auth/[...nextauth]/route.ts` - API route handler for NextAuth
- `src/middleware.ts` - Route protection middleware
- `src/app/login/page.tsx` - Login page with Google sign-in button
- `src/components/session-provider.tsx` - NextAuth session provider wrapper
- `src/types/next-auth.d.ts` - TypeScript declarations for NextAuth
- `src/components/ui/separator.tsx` - Separator UI component (required dependency)
- `src/components/ui/alert.tsx` - Alert UI component (required for login page)

### Modified Files
- `src/app/layout.tsx` - Added SessionProvider wrapper
- `src/components/layout/main-sidebar.tsx` - Added user info display and sign-out button
- `package.json` - Added next-auth and @radix-ui/react-separator dependencies

## Environment Variables Required

Create a `.env.local` file with the following variables:

```bash
# Google OAuth credentials
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## Setup Instructions

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
7. Copy Client ID and Client Secret to your `.env.local` file

### 2. Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### 3. Install Dependencies

```bash
npm install
```

## Route Protection

### Protected Routes
All main app routes require authentication:
- `/` (Dashboard)
- `/generate`
- `/gallery`
- `/api-keys`

### Public Routes
These routes are accessible without authentication:
- `/login`
- `/admin/*` (admin area remains separate)
- `/api/auth/*` (NextAuth endpoints)

### How It Works

1. **Middleware Protection**: The `middleware.ts` file intercepts all requests (except public routes) and checks for an active session
2. **No Session Redirect**: If no session is found, users are redirected to `/login` with a `callbackUrl` parameter
3. **Session Validation**: NextAuth validates JWT tokens and manages session state
4. **Disposable Email Check**: During sign-in, the email domain is checked against a list of disposable domains

## User Flow

### Sign-In Process
1. User visits any protected route (or `/login` directly)
2. If not authenticated, redirected to `/login`
3. User clicks "Continue with Google" button
4. Google OAuth flow initiates
5. **Disposable email check**: If email domain is in disposable list, sign-in is rejected
6. Upon successful authentication, user is redirected to original page

### Sign-Out Process
1. User clicks the sign-out button in the sidebar
2. NextAuth session is cleared
3. User is redirected to `/login`

## Disposable Email Blocking

The system includes a comprehensive list of disposable email domains from popular temporary email services including:

- 10MinuteMail
- GuerrillaMail
- Mailinator
- TempMail
- YOPmail
- MailDrop
- And many more...

### How to Test Disposable Email Blocking

1. Create a Google account with a temporary email from services like:
   - `10minutemail.com`
   - `guerrillamail.com`
   - `yopmail.com`
2. Attempt to sign in - the process should be rejected with an error message

## Customization

### Adding New Disposable Domains

Edit `src/lib/auth/disposable-domains.ts` to add new domains to the `DISPOSABLE_DOMAINS` array.

### Modifying Protected Routes

Edit `src/middleware.ts` to change which routes require authentication.

### Styling the Login Page

The login page is fully customizable. Edit `src/app/login/page.tsx` to modify the appearance.

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` file to version control
2. **HTTPS in Production**: Ensure `NEXTAUTH_URL` uses `https://` in production
3. **Secret Rotation**: Regularly rotate `NEXTAUTH_SECRET`
4. **Google OAuth Security**: Keep Google OAuth credentials secure and enable proper security settings in Google Cloud Console

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**: Ensure your Google OAuth redirect URI matches exactly: `http://localhost:3000/api/auth/callback/google`

2. **"Invalid client" error**: Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correctly set

3. **Environment variables not loading**: Ensure `.env.local` file is in the project root and run `npm run dev` to restart the development server

4. **Session not persisting**: Check that `NEXTAUTH_SECRET` is set and valid

### Development vs Production

- Development: Use `http://localhost:3000` as `NEXTAUTH_URL`
- Production: Use your actual domain with `https://`

## Testing the Implementation

1. Start the development server: `npm run dev`
2. Visit `http://localhost:3000` - you should be redirected to `/login`
3. Try to sign in with a regular Gmail account - should work
4. Try to sign in with a disposable email - should be blocked
5. Once signed in, visit protected routes directly - should work
6. Sign out and try to access protected routes - should redirect to login

## Integration Notes

The authentication system is designed to work alongside the existing admin authentication system without conflicts. The admin area (`/admin/*`) is excluded from user authentication enforcement and maintains its own separate authentication flow.