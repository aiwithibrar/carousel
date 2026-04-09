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

-- =============================================
-- GUEST USAGE TRACKING (5 Free Trials)
-- Run this after the above setup
-- =============================================

-- 1. Create guest_usage table
CREATE TABLE IF NOT EXISTS guest_usage (
    guest_id TEXT PRIMARY KEY,
    use_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE guest_usage ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Anyone can read any guest record (needed to fetch usage on load)
CREATE POLICY "Guests can read usage"
ON guest_usage
FOR SELECT
TO anon
USING (true);

-- 4. Policy: Anyone can insert a new guest record
CREATE POLICY "Guests can insert usage"
ON guest_usage
FOR INSERT
TO anon
WITH CHECK (true);

-- 5. Policy: Anyone can update a guest record
CREATE POLICY "Guests can update usage"
ON guest_usage
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- =============================================
-- HOW GUEST TRIALS WORK:
-- 1. A unique guest_id is generated in the browser (localStorage).
-- 2. Each time the guest clicks "Generate", use_count increments.
-- 3. After 5 uses, the app prompts the guest to sign up.
-- 4. use_count is synced here for server-side durability.
-- =============================================
