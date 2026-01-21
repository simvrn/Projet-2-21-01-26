import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iknningfrnyypwqlnqov.supabase.co';
const supabaseKey = 'sb_publishable_VPhRwxQyZwZvq0IdV8jbyg_E0Xr8yLC';

export const supabase = createClient(supabaseUrl, supabaseKey);
