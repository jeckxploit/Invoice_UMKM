import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Fallback mode if Supabase is not configured
const isConfigured = !!supabaseUrl && !!supabaseAnonKey

if (!isConfigured) {
  console.warn('⚠️ Supabase not configured. Using fallback mode.')
  console.warn('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in environment variables.')
}

export const supabase = isConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    })
  : null

// Helper types
export type User = {
  id: string
  email: string
  name: string | null
  plan: 'FREE' | 'PRO'
  created_at: string
  updated_at: string
}

export type Invoice = {
  id: string
  user_id: string
  invoice_number: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  address: string | null
  logo_url: string | null
  notes: string | null
  items: string
  total: number
  status: string
  is_pro: boolean
  has_qris: boolean
  theme_color: string
  tanggal: string
  created_at: string
  updated_at: string
}

// In-memory storage for fallback mode (development only)
const inMemoryUsers = new Map<string, User>()
const inMemoryInvoices = new Map<string, Invoice>()

// Helper function to create a user
export async function createUser(email: string, plan: 'FREE' | 'PRO' = 'FREE'): Promise<User> {
  if (!isConfigured || !supabase) {
    // Fallback mode
    const user: User = {
      id: `user_${Date.now()}`,
      email,
      name: null,
      plan,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    inMemoryUsers.set(user.id, user)
    return user
  }

  const { data, error } = await supabase
    .from('users')
    .insert([{ email, plan, name: null }])
    .select()
    .single()

  if (error) throw error
  return data
}

// Helper function to get a user by ID
export async function getUserById(id: string): Promise<User | null> {
  if (!isConfigured || !supabase) {
    // Fallback mode
    return inMemoryUsers.get(id) || null
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

// Helper function to get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  if (!isConfigured || !supabase) {
    // Fallback mode
    for (const user of inMemoryUsers.values()) {
      if (user.email === email) return user
    }
    return null
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

// Helper function to get invoice count for user
export async function getInvoiceCount(userId: string): Promise<number> {
  if (!isConfigured || !supabase) {
    // Fallback mode
    let count = 0
    for (const invoice of inMemoryInvoices.values()) {
      if (invoice.user_id === userId) count++
    }
    return count
  }

  const { count, error } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) throw error
  return count || 0
}

// Helper function to create an invoice
export async function createInvoice(invoiceData: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>): Promise<Invoice> {
  if (!isConfigured || !supabase) {
    // Fallback mode
    const invoice: Invoice = {
      ...invoiceData,
      id: `inv_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    inMemoryInvoices.set(invoice.id, invoice)
    return invoice
  }

  const { data, error } = await supabase
    .from('invoices')
    .insert([invoiceData])
    .select()
    .single()

  if (error) throw error
  return data
}

// Helper function to get invoices by user ID
export async function getInvoicesByUserId(userId: string, limit = 20): Promise<Invoice[]> {
  if (!isConfigured || !supabase) {
    // Fallback mode
    const invoices: Invoice[] = []
    for (const invoice of inMemoryInvoices.values()) {
      if (invoice.user_id === userId) {
        invoices.push(invoice)
        if (invoices.length >= limit) break
      }
    }
    return invoices
  }

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

// Helper function to delete invoice
export async function deleteInvoice(id: string): Promise<boolean> {
  if (!isConfigured || !supabase) {
    // Fallback mode
    return inMemoryInvoices.delete(id)
  }

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}
