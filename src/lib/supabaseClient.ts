// This file is deprecated. Please use the new Supabase client utilities:
// - For client components: import { createClient } from '@/lib/supabase/client'
// - For server components: import { createClient } from '@/lib/supabase/server'

import { createClient as createBrowserClient } from '@/lib/supabase/client'

// Export for backward compatibility
export const supabase = createBrowserClient()
