import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
})

// Helper function to create a user
export async function createUser(email: string, plan: 'FREE' | 'PRO' = 'FREE') {
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        email,
        plan,
        name: null,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

// Helper function to get a user
export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*, invoices(count)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Helper function to get user by email
export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*, invoices(count)')
    .eq('email', email)
    .single()

  if (error) throw error
  return data
}

// Helper function to create an invoice
export async function createInvoice(invoiceData: any) {
  const { data, error } = await supabase
    .from('invoices')
    .insert([invoiceData])
    .select()
    .single()

  if (error) throw error
  return data
}

// Helper function to get invoices by user ID
export async function getInvoicesByUserId(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

// Helper function to get invoice by ID
export async function getInvoiceById(id: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Helper function to update invoice
export async function updateInvoice(id: string, data: any) {
  const { data: updated, error } = await supabase
    .from('invoices')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return updated
}

// Helper function to delete invoice
export async function deleteInvoice(id: string) {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

// Helper function to get invoice count for user
export async function getInvoiceCount(userId: string) {
  const { count, error } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) throw error
  return count || 0
}
