import { createClient } from '@supabase/supabase-js'

// Get Supabase URL and API Key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  console.log('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Auth helper functions
export const auth = {
  signUp: async (email: string, password: string, userData?: any) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
  },

  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password
    })
  },

  signInWithGoogle: async () => {
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
  },

  signInWithPhone: async (phone: string) => {
    return await supabase.auth.signInWithOtp({
      phone
    })
  },

  verifyOtp: async (phone: string, token: string) => {
    return await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    })
  },

  signOut: async () => {
    return await supabase.auth.signOut()
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helper functions for direct Supabase queries
export const db = {
  // Categories
  getCategories: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('nama')
    
    if (error) throw error
    return data
  },

  createCategory: async (category: any) => {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  updateCategory: async (id: number, updates: any) => {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  deleteCategory: async (id: number) => {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: false })
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  // Products
  getProducts: async (filters?: { kategori?: string; search?: string }) => {
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
    
    if (filters?.kategori) {
      query = query.eq('kategori', filters.kategori)
    }
    
    if (filters?.search) {
      query = query.or(`nama.ilike.%${filters.search}%,kode.ilike.%${filters.search}%`)
    }
    
    const { data, error } = await query.order('nama')
    
    if (error) throw error
    return data
  },

  getProduct: async (id: number) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  createProduct: async (product: any) => {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  updateProduct: async (id: number, updates: any) => {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  deleteProduct: async (id: number) => {
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  // Customers
  getCustomers: async (filters?: { search?: string }) => {
    let query = supabase
      .from('customers')
      .select('*')
    
    if (filters?.search) {
      query = query.or(`nama.ilike.%${filters.search}%,email.ilike.%${filters.search}%,telepon.ilike.%${filters.search}%`)
    }
    
    const { data, error } = await query.order('nama')
    
    if (error) throw error
    return data
  },

  createCustomer: async (customer: any) => {
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  updateCustomer: async (id: number, updates: any) => {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  deleteCustomer: async (id: number) => {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  // Transactions
  getTransactions: async (filters?: { startDate?: string; endDate?: string; status?: string }) => {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        customer:customers(*),
        kasir:users(*),
        items:transaction_items(*)
      `)
    
    if (filters?.startDate && filters?.endDate) {
      query = query
        .gte('created_at', filters.startDate)
        .lte('created_at', filters.endDate)
    }
    
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  getTransaction: async (id: number) => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        customer:customers(*),
        kasir:users(*),
        items:transaction_items(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  createTransaction: async (transaction: any, items: any[]) => {
    // Start a transaction
    const { data: newTransaction, error: transactionError } = await supabase
      .from('transactions')
      .insert([{
        ...transaction,
        nomor_transaksi: `T${Date.now()}`
      }])
      .select()
      .single()
    
    if (transactionError) throw transactionError
    
    // Insert transaction items
    const itemsWithTransactionId = items.map(item => ({
      ...item,
      transaction_id: newTransaction.id
    }))
    
    const { error: itemsError } = await supabase
      .from('transaction_items')
      .insert(itemsWithTransactionId)
    
    if (itemsError) throw itemsError
    
    // Update product stock using RPC function
    for (const item of items) {
      const { error: stockError } = await supabase.rpc('update_product_stock', {
        product_id: item.product_id,
        quantity_sold: item.jumlah
      })
      
      if (stockError) console.error('Stock update error:', stockError)
    }
    
    // Update customer stats if customer exists
    if (transaction.customer_id) {
      const { error: customerError } = await supabase.rpc('update_customer_stats', {
        customer_id: transaction.customer_id,
        transaction_total: parseFloat(transaction.total)
      })
      
      if (customerError) console.error('Customer stats update error:', customerError)
    }
    
    return newTransaction
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    
    // Get today's transactions
    const { data: todayTransactions, error } = await supabase
      .from('transactions')
      .select('*, items:transaction_items(*)')
      .gte('created_at', startOfDay.toISOString())
      .lt('created_at', endOfDay.toISOString())
    
    if (error) throw error
    
    const penjualanHarian = todayTransactions.reduce((sum, t) => sum + parseFloat(t.total), 0)
    const totalTransaksi = todayTransactions.length
    const produkTerjual = todayTransactions.reduce((sum, t) => 
      sum + t.items.reduce((itemSum: number, item: any) => itemSum + item.jumlah, 0), 0
    )
    
    // Get new customers today
    const { data: newCustomers } = await supabase
      .from('customers')
      .select('id')
      .gte('created_at', startOfDay.toISOString())
      .lt('created_at', endOfDay.toISOString())
    
    return {
      penjualanHarian: penjualanHarian.toString(),
      totalTransaksi,
      produkTerjual,
      pelangganBaru: newCustomers?.length || 0,
      pertumbuhanPenjualan: 0, // TODO: Calculate growth
      pertumbuhanTransaksi: 0,
      pertumbuhanProduk: 0,
      pertumbuhanPelanggan: 0
    }
  },

  // Users/Employees
  getUsers: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', true)
      .order('nama')
    
    if (error) throw error
    return data
  },

  createUser: async (user: any) => {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  updateUser: async (id: number, updates: any) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  deleteUser: async (id: number) => {
    const { error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}

export default supabase
