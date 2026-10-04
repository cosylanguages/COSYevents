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

### 3. Configure Email Delivery (Required)
Without custom SMTP, Supabase built-in email service only sends authentication emails to members of the project's own team (organization) and enforces a very low rate limit (e.g., 3–4 emails per hour). Without custom SMTP, external students will never receive login codes.

- Navigate to **Authentication** -> **SMTP Settings**.
- Enable **Custom SMTP**.
- Recommended free/tier providers (check current provider pages for updated plan limits):
  - **Brevo** (formerly Sendinblue) free plan
  - **Resend** free plan (requires a verified custom domain)
  - **Mailjet** free plan
- **Domain & Deliverability Advice**: Use a sender email address on a custom domain that you control with properly configured SPF, DKIM, and DMARC DNS records. Avoid using free webmail addresses (like `@gmail.com` or `@yahoo.com`) as sender addresses, as DMARC policies will cause delivery failures.

### 4. Make the Sign-In Email Show the 6-Digit Code
- Navigate to **Authentication** -> **Email Templates** -> **Magic Link**.
- Edit the template so the body contains `{{ .Token }}`.

#### Example Email Template (Copy-Paste)
**Subject**:
```text
Your COSYlanguages login code: {{ .Token }}
```

**Plain Text Body**:
```text
Your 6-digit login code for the COSYlanguages Ecosystem is:

{{ .Token }}

This code will expire shortly. If you did not request this code, please ignore this email.
```

**Short HTML Body**:
```html
<h2>COSYlanguages Ecosystem</h2>
<p>Your 6-digit login code is:</p>
<p style="font-size: 1.5rem; font-weight: bold; letter-spacing: 4px; color: #233827;">{{ .Token }}</p>
<p>This code expires shortly. If you did not request it, you can safely ignore this email.</p>
```

### 5. Apply Database Migrations
- Open **SQL Editor** in the Supabase Dashboard.
- All migration files inside `supabase/migrations/` must be applied in filename order:
  1. `20261003000000_ecosystem_access.sql`
  2. `20261003000100_security_fixes.sql`
  3. `20261003000200_profile_input_limits.sql`
- Paste the SQL contents of each file into the SQL Editor in order and click **Run**.
- Any new migrations created in the future must also be applied strictly in filename order.
- Verify that tables (`profiles`, `access_grants`, `session_catalog`, `session_content`, etc.) and RLS policies are created cleanly without errors.
- Verification Queries: Run the following verification queries in the SQL Editor to ensure security rules and check constraints are in place:
```sql
-- 1. Check that role escalation via UPDATE is blocked for authenticated users:
select has_column_privilege('authenticated','public.profiles','role','UPDATE');
-- Must return: false

-- 2. Check that profile input check constraints exist:
select conname from pg_constraint where conrelid = 'public.profiles'::regclass and contype = 'c';
-- Must include: profiles_display_name_len and profiles_ui_lang_valid
```

### 6. Provision Initial Founder User
- Register the primary admin email via Auth UI or Dashboard **Authentication** -> **Users** -> **Add User**.
- Note: The user account must exist in Supabase Auth (sign in once or add the user in the dashboard) before running the UPDATE query below, or zero rows will be matched.
- ⚠️ **WARNING**: Replace `YOUR_REAL_EMAIL` with your actual registered email address before running the SQL query below.
- Open **SQL Editor** and run:
```sql
UPDATE public.profiles
   SET role = 'founder',
       display_name = 'Ecosystem Owner'
 WHERE id = (
   SELECT id FROM auth.users WHERE email = 'YOUR_REAL_EMAIL'
 );
```

### 7. API Keys Configuration & Security Policies
- Navigate to **Project Settings** -> **API**.
- Copy:
  - **Project URL**: (e.g., `https://xxxx.supabase.co`)
  - **anon public key**: Safe to embed in frontend static scripts.
- **CRITICAL SECURITY REQUIREMENT**:
  - **NEVER** use or commit the `service_role` key in frontend client-side code or public git repositories.
  - The `service_role` key bypasses Row Level Security (RLS) entirely and must only be used in secure backend scripts or server environment variables.

### 8. Enable Two-Factor Authentication (2FA)
- Go to your Supabase Account Settings -> **Security**.
- Enable Two-Factor Authentication (2FA / TOTP) on all admin accounts with founder access.

---

## Before Enabling Accounts for Students Checklist

Before switching `"enabled": true` in `shared/config/supabase.json`, complete the following pre-launch verification checklist:

1. **Privacy Notice Verification**: Ensure `privacy.html` and `fr/privacy.html` data controller details are fully completed (run `npm run check-placeholders` if present).
2. **Custom SMTP Delivery Test**: Send a test login code to an external non-team email address to confirm delivery succeeds.
3. **Admin 2FA Security**: Confirm Two-Factor Authentication (2FA) is active on all founder accounts.
4. **Config Commit**: Update `shared/config/supabase.json` with `"enabled": true` and commit only when all steps above are verified.
