import { createClient } from '@supabase/supabase-js';

function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client that gracefully fails when Supabase is not configured
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: any = null;

export function getSupabaseClient() {
  if (!_client) {
    _client = createSupabaseClient();
  }
  return _client;
}

// For backwards compatibility
export const supabase = {
  from: (table: string) => {
    const client = getSupabaseClient();
    if (!client) {
      // Return a mock that resolves with empty data
      return {
        select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }),
        insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }) }),
        update: () => ({ eq: () => Promise.resolve({ error: null }) }),
        delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
      };
    }
    return client.from(table);
  },
};


export type Database = {
  public: {
    Tables: {
      alerts: {
        Row: {
          id: string;
          user_address: string;
          protocol: string;
          condition: string;
          threshold: number | null;
          enabled: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_address: string;
          protocol: string;
          condition: string;
          threshold?: number | null;
          enabled?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_address?: string;
          protocol?: string;
          condition?: string;
          threshold?: number | null;
          enabled?: boolean;
          created_at?: string;
        };
      };
    };
  };
};
