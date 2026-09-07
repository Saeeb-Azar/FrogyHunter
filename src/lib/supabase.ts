import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
/** Public project URL + publishable/anon key only. Never place service_role credentials in Vite. */
export const supabase = url && key ? createClient(url, key) : null
export function checkDbError(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}
