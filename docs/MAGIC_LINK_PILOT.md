# Participant Magic Link Pilot Checklist

This checklist guides facilitators and test leads through running a live pilot with 2 sessions from one club (e.g. `mind-matters`).

---

## 📋 Pre-Pilot Verification

- [ ] **1. Publish 2 Pilot Sessions**
  - Select 2 sessions (e.g., `anticipatory-grief` and `the-power-of-habits`).
  - Run validation: `node scripts/publish_to_supabase.js --validate-only private/session-exports/<session_id>.json`
  - Publish to Supabase & generate shells: `npm run session:new -- private/session-exports/<session_id>.json --club mind-matters --lang English`

- [ ] **2. Create Magic Links via Admin Interface**
  - Log into `admin/session-links.html` using a teacher or founder COSYauth account.
  - Select the pilot session from the dropdown.
  - Set expiration preset (e.g., +7 Days).
  - Add label (e.g. `Pilot Test Group A`).
  - Click **Create Magic Link**.
  - Click **Copy Link** and **Copy WhatsApp (EN/FR/IT/RU/EL)**.

- [ ] **3. Mobile Phone Test**
  - Open the generated magic link on a mobile smartphone web browser.
  - Verify that token `#k=<token>` is stripped from the address bar immediately.
  - Verify that session content (vocabulary, discussion rounds, slides) loads cleanly in `<main id="session-private">`.
  - Check slide presentation controls, scroll view toggle, and dictionary copy buttons.

- [ ] **4. Expired Link Test**
  - Create a test link set to expire in 1 minute.
  - Wait for expiration and refresh/open the link.
  - Confirm the page displays the localized expired message state ("This access link has expired.") and the WhatsApp button.

- [ ] **5. Revocation Test**
  - In `admin/session-links.html`, locate the active pilot link in the table and click **Revoke**.
  - Attempt to open the revoked magic link.
  - Confirm the page displays the localized revoked message state ("This access link has been revoked.").

- [ ] **6. Anonymous Security Verification**
  - Run `npm run verify:anon`.
  - Confirm 0 rows are returned for `session_content`, `session_sources`, and `session_access_links` under the anonymous key.
