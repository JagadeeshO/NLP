import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gqqahcguirnuradlmjce.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxcWFoY2d1aXJudXJhZGxtamNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNTg2NjIsImV4cCI6MjA4OTkzNDY2Mn0.bL84OEQ7zxs2mxneTE6vuf6LltE5yPKawtCnE0jm-80'

export const supabase = createClient(supabaseUrl, supabaseKey)
