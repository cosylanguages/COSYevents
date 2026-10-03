# Supabase Configuration for COSY Ecosystem

`shared/config/supabase.json` configures the shared authentication and Supabase database client across COSY sites.

## Configuration Schema

```json
{
  "enabled": false,
  "url": "https://your-project.supabase.co",
  "anonKey": "your-anon-key",
  "storageKey": "cosy-auth"
}
```

### Options

- `enabled` (`boolean`): Master switch for authentication features. Defaults to `false`. When `false`, all authentication logic, network calls, and login UI are completely inert and inactive.
- `url` (`string`): Public Supabase project URL (e.g., `https://xyz.supabase.co`).
- `anonKey` (`string`): Public Supabase anonymous API key (`anon`).
- `storageKey` (`string`): LocalStorage session key shared across all COSY ecosystem domains (`cosy-auth`).

## Security Notes

1. **Anon Key is Public:** The `anonKey` is safe to expose in client-side configuration. Security is strictly enforced on the Supabase backend via PostgreSQL Row Level Security (RLS) policies.
2. **NEVER Expose Service Role Key:** The `service_role` key grants administrative access and bypasses RLS policies entirely. It **MUST NEVER** appear anywhere in client-side code, configuration files, or public repositories.
