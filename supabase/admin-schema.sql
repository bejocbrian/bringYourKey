-- Admin Schema & Initial Data
-- Run this in Supabase SQL Editor to set up the admin panel backend

-- ==========================================
-- 1. Helper Functions (Fixes RLS Recursion)
-- ==========================================

-- Function to check if user is admin (non-recursive)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is superadmin (non-recursive)
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role = 'superadmin'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 2. Feature Flags
-- ==========================================

CREATE TABLE IF NOT EXISTS public.feature_flags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  category TEXT CHECK (category IN ('core', 'experimental', 'provider')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Everyone can read feature flags (needed for client-side checks)
CREATE POLICY "Everyone can read feature flags"
  ON public.feature_flags FOR SELECT
  USING (true);

-- Only admins can modify
CREATE POLICY "Admins can modify feature flags"
  ON public.feature_flags FOR ALL
  USING (public.is_admin());

-- ==========================================
-- 3. Provider Configurations
-- ==========================================

CREATE TABLE IF NOT EXISTS public.provider_configs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  rate_limit_rpm INTEGER DEFAULT 60,
  rate_limit_rph INTEGER DEFAULT 1000,
  cost_per_generation DECIMAL(10,4) DEFAULT 0.0,
  cost_currency TEXT DEFAULT 'USD',
  max_duration INTEGER DEFAULT 10,
  min_duration INTEGER DEFAULT 1,
  supported_ratios TEXT[] DEFAULT ARRAY['16:9', '9:16', '1:1'],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.provider_configs ENABLE ROW LEVEL SECURITY;

-- Everyone can read provider configs (needed for generation page)
CREATE POLICY "Everyone can read provider configs"
  ON public.provider_configs FOR SELECT
  USING (true);

-- Only admins can modify
CREATE POLICY "Admins can modify provider configs"
  ON public.provider_configs FOR ALL
  USING (public.is_admin());

-- ==========================================
-- 4. App Settings
-- ==========================================

CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
CREATE POLICY "Everyone can read app settings"
  ON public.app_settings FOR SELECT
  USING (true);

-- Only admins can modify
CREATE POLICY "Admins can modify app settings"
  ON public.app_settings FOR ALL
  USING (public.is_admin());

-- ==========================================
-- 5. Generations
-- ==========================================

CREATE TABLE IF NOT EXISTS public.generations (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  provider TEXT NOT NULL,
  prompt TEXT NOT NULL,
  duration INTEGER,
  aspect_ratio TEXT,
  status TEXT CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  result_url TEXT,
  error TEXT,
  cost DECIMAL(10,4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- Users can read their own generations
CREATE POLICY "Users can read own generations"
  ON public.generations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own generations
CREATE POLICY "Users can insert own generations"
  ON public.generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all generations
CREATE POLICY "Admins can read all generations"
  ON public.generations FOR SELECT
  USING (public.is_admin());

-- ==========================================
-- 6. Profile Policies Fix (Recursion Fix)
-- ==========================================

-- Drop old recursive policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

-- Recreate with non-recursive function
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Superadmins can update user roles"
  ON public.profiles FOR UPDATE
  USING (public.is_superadmin());

-- ==========================================
-- 7. Seed Initial Data
-- ==========================================

-- Feature Flags
INSERT INTO public.feature_flags (id, name, description, enabled, category)
VALUES 
  ('video-generation', 'Video Generation', 'Enable core video generation features', true, 'core'),
  ('gallery', 'Video Gallery', 'Enable the public/private gallery of generated videos', true, 'core'),
  ('dark-mode', 'Dark Mode', 'Enable dark mode theme for all users', false, 'core'),
  ('batch-generation', 'Batch Generation', 'Allow users to generate multiple videos at once', false, 'experimental')
ON CONFLICT (id) DO NOTHING;

-- Provider Configs
INSERT INTO public.provider_configs (id, name, enabled, is_default, rate_limit_rpm, cost_per_generation, max_duration, supported_ratios)
VALUES 
  ('google-veo', 'Google Veo', true, true, 10, 0.10, 60, ARRAY['16:9', '9:16', '1:1']),
  ('meta-moviegen', 'Meta MovieGen', true, false, 5, 0.15, 30, ARRAY['16:9', '9:16']),
  ('runway-gen3', 'Runway Gen-3', true, false, 15, 0.20, 10, ARRAY['16:9'])
ON CONFLICT (id) DO NOTHING;

-- Default App Settings
INSERT INTO public.app_settings (key, value)
VALUES 
  ('theme', '{"primaryColor": "#6366f1", "darkMode": true}'::jsonb),
  ('defaults', '{"provider": "google-veo", "duration": 5, "aspectRatio": "16:9"}'::jsonb),
  ('storage', '{"maxGenerationsPerUser": 100, "autoDeleteAfterDays": 30}'::jsonb)
ON CONFLICT (key) DO NOTHING;
