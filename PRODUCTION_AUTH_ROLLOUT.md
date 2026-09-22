# Portal authentication hardening rollout

Apply these steps in order. The website code expects the additive database
columns introduced by the migration.

## 1. Run the Supabase migration

In the shared Flex Fitness Supabase project, open **SQL Editor**, paste and run:

`flex-fitness-whatsapp-bot/supabase_portal_auth_hardening.sql`

The migration adds hashed OTP/session support, verification-attempt counters,
rate-limit indexes, and an `auth_events` audit table. It preserves existing
member and trainer sessions so users are not logged out during rollout.

## 2. Configure the server secret

Generate a unique authentication pepper locally:

```bash
openssl rand -hex 32
```

Add the output as `AUTH_PEPPER` in the Vercel project environment for
Production, Preview, and Development. Never expose it with a `NEXT_PUBLIC_`
prefix and never commit the value.

## 3. Deploy the website

Deploy only after steps 1 and 2. Confirm the deployment reports healthy at:

```text
https://<website-domain>/api/health
```

A healthy response has HTTP 200 and `"status":"ok"`. Configure an uptime
monitor to check this endpoint every five minutes and alert on two consecutive
failures.

## 4. Smoke-test both portals

For one active member and one active trainer:

1. Request a WhatsApp login code.
2. Verify that an incorrect code is rejected.
3. Verify that the real code logs in.
4. Refresh the authenticated page and confirm the session persists.
5. Log out and confirm the old cookie can no longer access the portal.
6. Confirm `auth_events` contains the send, failed verification, and successful
   login events.

Also confirm that a cancelled member and an inactive trainer receive the
generic request response but no WhatsApp code.

## 5. Rollback

If authentication fails after deployment, roll the Vercel deployment back to
the previous release. The database migration is additive and can safely remain
in place. Do not drop its columns during an incident.
