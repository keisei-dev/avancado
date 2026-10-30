# Member authentication

The member login and signup screens follow the `UserAuth` layout in
[JoyIsHappii/pet_demo](https://github.com/JoyIsHappii/pet_demo). That repository's
Homepage is `https://pet-demo-one.vercel.app`. Authentication uses Supabase,
rather than the reference application's in-memory demo accounts.

## Setup

1. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
   `DATABASE_URL` in `.env.local`. Apply the existing Prisma migrations.
2. Enable the Email provider and email/password signup in Supabase Authentication.
   Enable Confirm email for the email-verification flow.
3. Set Supabase's Site URL to the app's origin. Add these allowed Redirect URLs
   for each environment (replace the local origin for production):
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/callback?next=/reset-password`
4. Optionally set `NEXT_PUBLIC_SITE_URL` to the canonical origin. Without it,
   auth Server Actions use the request's Origin header.
5. Use Supabase's standard confirmation/recovery email templates, preserving
   `{{ .ConfirmationURL }}`. Configure email delivery in Supabase as needed.

The callback exchanges the PKCE code for a cookie session. Open the email link
in the same browser where registration or recovery was requested. Invalid,
expired, reused links or a missing browser verifier return to login with an
error. External callback destinations are rejected.

## Behavior

- `/signup`: first/last name, email, a password of at least eight characters,
  and terms/privacy consent. Server-side validation runs as well as browser
  validation. Supabase may enforce a stronger password policy.
- With email confirmation enabled, signup shows an inbox message. Confirmation
  returns to `/auth/callback`, creates the application profile, and opens `/`.
  When confirmation is disabled, a returned session signs the user in directly.
- The application profile is provisioned only for an authenticated, confirmed
  Supabase user with signup name/consent metadata. Retrying login can finish
  provisioning after a temporary database failure. Roles and verification flags
  come from database defaults; existing profiles are never overwritten.
- `/login`: password authentication, profile availability check, then `/`.
  Existing seeded accounts work when their application User ID matches their
  real Supabase Auth ID. The seed does not create Auth passwords/accounts.
- Hidden accounts cannot complete member login. The header reads a validated
  session and the database profile, and its account menu supports logout.
- Forgot password opens a modal and sends a real recovery email. The callback
  opens `/reset-password`; that action validates the session and matching new
  passwords, updates Supabase, and signs out before the next login.
- Session refresh uses the existing Supabase proxy. Supabase's cookie session
  persists across browser restarts until expiry or logout; no nonfunctional
  “Keep me signed in” switch or public demo password is displayed.

New profile creation is deferred until confirmed authentication, so unconfirmed
signups do not create application User rows. The member flow does not change
admin login or the access policy of existing feature pages. Future data mutations
must independently validate the current user and resource ownership.

## Verification

Run `npm run typecheck` and `npm run build`.

Manual integration check with a real test account:

1. Register at `/signup`; verify missing consent and short-password errors.
2. Open the confirmation email in the same browser; verify `/` shows your name.
3. Reload, then log out from the account menu; verify guest navigation returns.
4. Log in with an incorrect password, then the correct password.
5. Use Forgot password, open its email, set matching new passwords, and log in
   with the new password.
6. Check the corresponding application User row has `USER` and `ACTIVE`, then
   verify a `HIDDEN` test account cannot log in.
7. Check `/login` and `/signup` at phone and desktop widths.
