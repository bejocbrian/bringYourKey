# BYOK - Bring Your Own Key AI Video Generator

A Next.js application for generating AI videos using your own API keys.

## Features

- 🔐 **Secure Authentication**: Custom email/password authentication with Supabase
- ✅ **Email Verification**: Required email verification before app access
- 🚫 **Disposable Email Blocking**: Prevents temporary email addresses (166+ domains)
- 🎥 **AI Video Generation**: Generate videos using various AI providers
- 🔑 **BYOK Model**: Use your own API keys for AI services
- 📊 **Dashboard**: Track your video generation history
- 🎨 **Gallery**: View and manage your generated videos

## Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier available)

## Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd project
npm install
```

### 2. Set Up Supabase

1. Go to [Supabase](https://supabase.com/) and create a new project
2. Wait for the project to be provisioned (~2 minutes)
3. Go to Project Settings > API
4. Copy the Project URL and anon/public key

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Configure Supabase Auth

In Supabase Dashboard:

1. Go to **Authentication > Providers**
2. Ensure Email provider is enabled
3. Go to **Authentication > Settings**
4. Enable "Confirm email"
5. Set Site URL to `http://localhost:3000` (for development)
6. Add redirect URLs:
   - `http://localhost:3000/**`

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Authentication System

This project uses a custom email/password authentication system with:

- **Email verification requirement**: Users must verify their email before accessing the app
- **Disposable email blocking**: Prevents signup with temporary email addresses
- **Strong password requirements**: Minimum 8 characters with uppercase, lowercase, and numbers
- **Secure session management**: HTTP-only cookies via Supabase Auth

For detailed authentication documentation, see [AUTHENTICATION.md](./AUTHENTICATION.md).

## Project Structure

```
src/
├── app/
│   ├── (main)/          # Protected main app routes
│   ├── admin/           # Separate admin area
│   ├── login/           # Login page
│   ├── signup/          # Registration page
│   └── verify/          # Email verification page
├── components/
│   ├── ui/              # Reusable UI components
│   └── layout/          # Layout components
├── lib/
│   ├── auth/            # Auth helpers and disposable domains list
│   ├── supabase/        # Supabase client configuration
│   ├── services/        # AI provider services
│   └── store/           # Zustand state management
└── middleware.ts        # Route protection middleware
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Key Technologies

- **Framework**: Next.js 14 (App Router)
- **Authentication**: Supabase Auth
- **UI Components**: Radix UI + Tailwind CSS
- **State Management**: Zustand
- **Type Safety**: TypeScript
- **Icons**: Lucide React

## Deployment

### Environment Variables

Set the following environment variables in your production environment:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

### Supabase Configuration for Production

1. Update Site URL to your production domain (e.g., `https://yourdomain.com`)
2. Add production redirect URLs:
   - `https://yourdomain.com/**`
3. Configure custom SMTP for reliable email delivery (optional but recommended)

### Deploy on Vercel

The easiest way to deploy is with [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables
4. Deploy

See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for other platforms.

## Troubleshooting

### Common Issues

**"Invalid API key" error**
- Verify environment variables are set correctly
- Restart the development server after changing `.env.local`

**Verification emails not sending**
- Check Supabase Dashboard > Authentication > Logs
- Verify "Confirm email" is enabled
- Check spam folder

**Session not persisting**
- Ensure cookies are enabled in browser
- Verify Site URL is correctly configured in Supabase

For more troubleshooting tips, see [AUTHENTICATION.md](./AUTHENTICATION.md).

## Documentation

- [AUTHENTICATION.md](./AUTHENTICATION.md) - Complete authentication system documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Security

- Never commit `.env.local` to version control
- Rotate Supabase keys regularly
- Use HTTPS in production
- Keep dependencies updated

## License

[Add your license here]

## Support

For issues or questions:
1. Check [AUTHENTICATION.md](./AUTHENTICATION.md) for auth-related issues
2. Review [Supabase Documentation](https://supabase.com/docs)
3. Open an issue on GitHub
