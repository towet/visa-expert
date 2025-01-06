import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yefslewvtiooapfbumqc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllZnNsZXd2dGlvb2FwZmJ1bXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxNDE2MDcsImV4cCI6MjA1MTcxNzYwN30.Gd69Magz4sU3SAUJPLt53Jh8ewSX3CLqHrUgavIui6k';

export const supabase = createClient(supabaseUrl, supabaseKey);
