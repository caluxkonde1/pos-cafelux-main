// POS CafeLux - Supabase Edge Function
// This function provides API endpoints for the POS system

import { serve } from "std/http/server.ts"
import { createClient } from 'supabase'
import { corsHeaders } from '../_shared/cors.ts'

console.log("POS CafeLux API function started!")

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const url = new URL(req.url)
    const path = url.pathname.replace('/pos-api', '')
    const method = req.method

    // Route handling
    switch (path) {
      case '/products':
        return await handleProducts(supabaseClient, method, req)
      
      case '/transactions':
        return await handleTransactions(supabaseClient, method, req)
      
      case '/customers':
        return await handleCustomers(supabaseClient, method, req)
      
      case '/dashboard/stats':
        return await handleDashboardStats(supabaseClient)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Endpoint not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Products handler
async function handleProducts(supabase: any, method: string, req: Request) {
  switch (method) {
    case 'GET':
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('nama')
      
      if (error) throw error
      
      return new Response(
        JSON.stringify(products),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    
    case 'POST':
      const productData = await req.json()
      const { data: newProduct, error: insertError } = await supabase
        .from('products')
        .insert([productData])
        .select()
      
      if (insertError) throw insertError
      
      return new Response(
        JSON.stringify(newProduct[0]),
        { 
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    
    default:
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
  }
}

// Transactions handler
async function handleTransactions(supabase: any, method: string, req: Request) {
  switch (method) {
    case 'GET':
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          *,
          transaction_items (
            *,
            products (nama, kode)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (error) throw error
      
      return new Response(
        JSON.stringify(transactions),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    
    case 'POST':
      const transactionData = await req.json()
      
      // Start transaction
      const { data: newTransaction, error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          nomor_transaksi: transactionData.nomor_transaksi,
          kasir_id: transactionData.kasir_id,
          customer_id: transactionData.customer_id,
          subtotal: transactionData.subtotal,
          pajak: transactionData.pajak,
          diskon: transactionData.diskon,
          total: transactionData.total,
          metode_pembayaran: transactionData.metode_pembayaran,
          status: 'completed'
        }])
        .select()
      
      if (transactionError) throw transactionError
      
      // Insert transaction items
      const items = transactionData.items.map((item: any) => ({
        transaction_id: newTransaction[0].id,
        product_id: item.product_id,
        nama_produk: item.nama_produk,
        harga: item.harga,
        jumlah: item.jumlah,
        subtotal: item.subtotal
      }))
      
      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(items)
      
      if (itemsError) throw itemsError
      
      // Update product stock
      for (const item of transactionData.items) {
        await supabase.rpc('update_product_stock', {
          product_id: item.product_id,
          quantity_sold: item.jumlah
        })
      }
      
      return new Response(
        JSON.stringify(newTransaction[0]),
        { 
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    
    default:
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
  }
}

// Customers handler
async function handleCustomers(supabase: any, method: string, req: Request) {
  switch (method) {
    case 'GET':
      const { data: customers, error } = await supabase
        .from('customers')
        .select('*')
        .order('nama')
      
      if (error) throw error
      
      return new Response(
        JSON.stringify(customers),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    
    case 'POST':
      const customerData = await req.json()
      const { data: newCustomer, error: insertError } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
      
      if (insertError) throw insertError
      
      return new Response(
        JSON.stringify(newCustomer[0]),
        { 
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    
    default:
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
  }
}

// Dashboard stats handler
async function handleDashboardStats(supabase: any) {
  try {
    // Get today's stats
    const today = new Date().toISOString().split('T')[0]
    
    const { data: stats, error } = await supabase
      .from('dashboard_stats')
      .select('*')
      .eq('tanggal', today)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    
    // If no stats for today, calculate from transactions
    if (!stats) {
      const { data: todayTransactions, error: transError } = await supabase
        .from('transactions')
        .select('total, created_at')
        .gte('created_at', today)
        .lt('created_at', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      
      if (transError) throw transError
      
      const penjualanHarian = todayTransactions.reduce((sum: number, t: any) => sum + parseFloat(t.total), 0)
      const totalTransaksi = todayTransactions.length
      
      return new Response(
        JSON.stringify({
          penjualanHarian: penjualanHarian.toString(),
          totalTransaksi,
          produkTerjual: 0,
          pelangganBaru: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    return new Response(
      JSON.stringify({
        penjualanHarian: stats.penjualan_harian.toString(),
        totalTransaksi: stats.total_transaksi,
        produkTerjual: stats.produk_terjual,
        pelangganBaru: stats.pelanggan_baru
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    throw error
  }
}
