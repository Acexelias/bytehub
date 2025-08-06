// base44Client.js
// The original Base44 client has been removed as part of the self-hosting
// migration. This file now re-exports the Supabase client to maintain
// compatibility with any lingering imports. You should replace any
// references to `base44` with direct imports from `supabaseClient`.

import { supabase } from './supabaseClient';

/**
 * A minimal stub mimicking the old Base44 client. The `entities` and
 * `integrations` namespaces are intentionally left empty; consumers should
 * import from `entities.js` and `integrations.js` instead. Auth methods
 * are provided directly from the Supabase client.
 */
export const base44 = {
  entities: {},
  integrations: {},
  auth: supabase.auth,
};

export default base44;
