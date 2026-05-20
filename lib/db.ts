import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function initializeDatabase() {
  try {
    // Create departments table
    await supabase.from('departments').select('id').limit(1)
  } catch (error) {
    console.error('Database initialization error:', error)
  }
}

export interface User {
  id: string
  email: string
  username: string
  full_name: string
  department_id: string | null
  role_id: string | null
  manager_id: string | null
  is_active: boolean
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
}

export interface Letter {
  id: string
  letter_number: string
  from_department_id: string
  to_department_id: string
  subject: string
  content: string
  created_by: string
  status: string
  priority: string
  created_at: string
}
