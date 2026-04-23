import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Donation {
  id: string;
  description: string;
  date: string;
  category: string;
  condition: string;
  quantity: number;
  value: number;
  notes?: string;
  photo_url?: string;
  created_at: string;
}
