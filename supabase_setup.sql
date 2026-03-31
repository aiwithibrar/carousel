-- =============================================
-- CarouselForge — Supabase Database Setup
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- =============================================

-- 1. Create the approved_users table
CREATE TABLE IF NOT EXISTS approved_users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    token TEXT UNIQUE,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE approved_users ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Anyone can submit an access request (INSERT email only)
CREATE POLICY "Anyone can request access"
ON approved_users
FOR INSERT
TO anon
WITH CHECK (true);

-- 4. Policy: Anyone can check if a token is valid (SELECT approved only)
CREATE POLICY "Anyone can validate tokens"
ON approved_users
FOR SELECT
TO anon
USING (is_active = true AND token IS NOT NULL);

-- 5. Insert your master token (change 'your-email@example.com' to your email)
INSERT INTO approved_users (email, token, is_active)
VALUES ('owner@example.com', 'OWNER_MASTER_KEY', true);

-- =============================================
-- HOW TO USE (from Supabase Dashboard → Table Editor):
--
-- TO APPROVE a user:
--   1. Find their row (status is_active = false)
--   2. Set is_active = true
--   3. That's it! They can now unlock the app using their email address.
--
-- TO REVOKE access:
--   1. Find their row
--   2. Set is_active = false
--   That's it — they're locked out immediately
--
-- TO SEE all requests:
--   Go to Table Editor → approved_users
--   Rows with is_active=false = pending requests
-- =============================================
