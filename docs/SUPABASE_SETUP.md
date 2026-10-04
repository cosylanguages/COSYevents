# Supabase Ecosystem Project Setup Checklist

This guide provides step-by-step setup instructions for configuring the single Supabase project shared across the COSY ecosystem (COSYlanguages, COSYevents, COSYplatform, COSYmanuals, etc.).

---

## Step-by-Step Setup Checklist

### 1. Create Supabase Project
- Log in to [Supabase Console](https://supabase.com/dashboard).
- Click **New Project** and select your organization.
- Name: `cosy-ecosystem` (or desired project name).
- Database Password: Create and securely store a strong password.
- **Region**: Choose an **EU Region** (e.g., Frankfurt `eu-central-1` or West Europe `eu-west-1`) for low latency and data compliance.
- Select the Free or Pro Tier as required.

### 2. Configure Authentication Settings
- Navigate to **Authentication** -> **Providers** -> **Email**.
- Enable **Email Provider**.
- Enable **Magic Links** (OTP / Passwordless login).
- Enable **6-digit Email OTP Codes** for sign-in verification.
- Under **Authentication** -> **URL Configuration**:
  - Set **Site URL** to primary domain (e.g. `https://cosylanguages.github.io/COSYlanguages/`).
  - Add **Redirect URLs** for every ecosystem site:
    - `https://cosylanguages.github.io/COSYlanguages/*`
    - `https://cosylanguages.github.io/COSYevents/*`
    - `https://cosylanguages.github.io/COSYplatform/*`
    - `http://localhost:*` (for local development)

### 3. Apply Database Migrations
- Open **SQL Editor** in the Supabase Dashboard.
- All migration files inside `supabase/migrations/` must be applied in filename order (e.g. `20261003000000_ecosystem_access.sql`, then `20261003000100_security_fixes.sql`).
- Paste the SQL contents of each file into the SQL Editor and click **Run**.
- Verify that tables (`profiles`, `access_grants`, `session_catalog`, `session_content`, etc.) and RLS policies are created cleanly without errors.
- Verification Query: Run the following verification query in the SQL Editor to ensure column privileges are properly restricted:
```sql
select has_column_privilege('authenticated','public.profiles','role','UPDATE');
```
This query must return `false`.

### 4. Provision Initial Founder User
- Register the primary admin email via Auth UI or Dashboard **Authentication** -> **Users** -> **Add User**.
- Open **SQL Editor** and run:
```sql
UPDATE public.profiles
   SET role = 'founder',
       display_name = 'Ecosystem Owner'
 WHERE id = (
   SELECT id FROM auth.users WHERE email = 'owner@cosylanguages.com'
 );
```

### 5. API Keys Configuration & Security Policies
- Navigate to **Project Settings** -> **API**.
- Copy:
  - **Project URL**: (e.g., `https://xxxx.supabase.co`)
  - **anon public key**: Safe to embed in frontend static scripts.
- **CRITICAL SECURITY REQUIREMENT**:
  - **NEVER** use or commit the `service_role` key in frontend client-side code or public git repositories.
  - The `service_role` key bypasses Row Level Security (RLS) entirely and must only be used in secure backend scripts or server environment variables.

### 6. Enable Two-Factor Authentication (2FA)
- Go to your Supabase Account Settings -> **Security**.
- Enable Two-Factor Authentication (2FA / TOTP) on all admin accounts with founder access.
