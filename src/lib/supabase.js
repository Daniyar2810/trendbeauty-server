
  import { createClient }
from '@supabase/supabase-js'

const supabaseUrl =
    'https://ougzcgwrrkktthfitzws.supabase.co'

const supabaseKey =
    'sb_publishable_aUdLPijRw2XTLf-z4SMT2w_g-Dk_aCz'

export const supabase =
    createClient(
        supabaseUrl,
        supabaseKey,
        {
            realtime: {
                params: {
                    eventsPerSecond: 10,
                },
            },
        }
    )