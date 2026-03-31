-- =============================================
-- CarouselForge — NEW Supabase Database Setup 
-- (Email-Only Access System)
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Note: This will delete the old table and any old requests!
-- =============================================

-- 1. Completely delete the old table and its broken security rules
DROP TABLE IF EXISTS approved_users;

-- 2. Create the clean new table (Notice: NO token column needed!)
CREATE TABLE approved_users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable Security
ALTER TABLE approved_users ENABLE ROW LEVEL SECURITY;

-- 4. Policy: Anyone can submit an access request (INSERT email)
CREATE POLICY "Anyone can request access"
ON approved_users
FOR INSERT
TO anon
WITH CHECK (true);

-- 5. Policy: Anyone can check if an email is approved (SELECT)
CREATE POLICY "Anyone can validate emails"
ON approved_users
FOR SELECT
TO anon
USING (is_active = true);

-- 6. Insert your main email immediately so you have access
-- (Change 'owner@example.com' to your real email address!)
INSERT INTO approved_users (email, is_active)
VALUES ('owner@example.com', true);

-- =============================================
-- HOW TO USE:
-- 1. Go to Table Editor -> approved_users
-- 2. See a request? Change "is_active" from FALSE to TRUE.
-- 3. They are instantly unlocked!
-- =============================================
