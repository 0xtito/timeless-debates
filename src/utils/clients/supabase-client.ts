import { createClient } from "@supabase/supabase-js";

// console.log(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVER_ROLE_KEY!
// );

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVER_ROLE_KEY!
);
