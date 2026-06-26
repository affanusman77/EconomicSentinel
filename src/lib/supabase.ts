import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(url, key);

export type JoinApplication = {
  name: string;
  email: string;
  whatsapp: string;
  institution: string;
  help_with: string[];
  why: string;
  hours: string;
  available: string;
  portfolio: string;
  anything_else: string;
};

export type InternshipApplication = {
  name: string;
  email: string;
  whatsapp: string;
  location: string;
  institution: string;
  module: string;
  why_module: string;
  experience: string;
  can_commit: string;
  hear_about: string;
  fee_waiver: string;
};
