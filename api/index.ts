import 'dotenv/config';

// Import storage and schemas
import { storage } from '../server/storage';
import { insertProductSchema, insertCustomerSchema, insertTransactionSchema, insertTransactionItemSchema, insertDiscountSchema, insertStockMovementSchema, insertOutletSchema, insertPrinterSettingSchema } from '../shared/schema';
import { z } from 'zod';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method } = req;
  const path = url?.replace('/api', '') || '';

  try {
    // Dashboard Stats
    if (path === '/dashboard/stats' && method === 'GET') {
      const stats = await storage.getDashboardStats();
      return res.json(stats);
    }

    if (path === '/dashboard/top-products' && method === 'GET') {
      const limit = parseInt(req.query.limit as string) || 5;
      const topProducts = await storage.getTopProducts(limit);
      return res.json(topProducts);
    }

    if (path === '/dashboard/recent-transactions' && method === 'GET') {
      const limit = parseInt(req.query.limit as string) || 5;
      const recentTransactions = await storage.getRecentTransactions(limit);
      return res.json(recentTransactions);
    }

    // Products
    if (path === '/products' && method === 'GET') {
      const { kategori, search } = req.query;
      
      let products;
      if (search) {
        products = await storage.searchProducts(search as string);
      } else if (kategori) {
        products = await storage.getProductsByCategory(kategori as string);
      } else {
        products = await storage.getProducts();
      }
      
      return res.json(products);
    }

    if (path.startsWith('/products/') && method === 'GET') {
      const id = parseInt(path.split('/')[2]);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Produk tidak ditemukan" });
      }
      
      return res.json(product);
    }

    if (path === '/products' && method === 'POST') {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      return res.status(201).json(product);
    }

    // Categories
    if (path === '/categories' && method === 'GET') {
      const categories = await storage.getCategories();
      return res.json(categories);
    }

    // Customers
    if (path === '/customers' && method === 'GET') {
      const customers = await storage.getCustomers();
      return res.json(customers);
    }

    if (path === '/customers' && method === 'POST') {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      return res.status(201).json(customer);
    }

    // Transactions
    if (path === '/transactions' && method === 'GET') {
      const { startDate, endDate } = req.query;
      
      let transactions;
      if (startDate && endDate) {
        transactions = await storage.getTransactionsByDateRange(
          new Date(startDate as string),
          new Date(endDate as string)
        );
      } else {
        transactions = await storage.getTransactions();
      }
      
      return res.json(transactions);
    }

    if (path === '/transactions' && method === 'POST') {
      const createTransactionSchema = z.object({
        transaction: insertTransactionSchema,
        items: z.array(insertTransactionItemSchema),
      });
      
      const validatedData = createTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(
        validatedData.transaction,
        validatedData.items
      );
      return res.status(201).json(transaction);
    }

    // Auth
    if (path === '/auth/login' && method === 'POST') {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username dan password harus diisi" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Username atau password salah" });
      }
      
      if (!user.isActive) {
        return res.status(401).json({ message: "Akun tidak aktif" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      return res.json({ 
        user: userWithoutPassword,
        permissions: user.permissions,
        message: "Login berhasil" 
      });
    }

    // Users
    if (path === '/users' && method === 'GET') {
      const users = await storage.getUsers();
      return res.json(users);
    }

    // Subscription Plans
    if (path === '/subscription-plans' && method === 'GET') {
      const plans = [
        {
          id: "free",
          name: "Free",
          price: 0,
          currency: "IDR",
          interval: "selamanya",
          features: [
            "Sistem kasir POS",
            "Terima semua jenis pembayaran digital dengan QRIS",
            "Dapat melakukan scan produk dengan mudah",
            "Laporan dasar penjualan dengan rentang tanggal 30 hari",
            "Kelola 50 produk",
            "Mengelola 1 outlet",
            "Pantau 2 pegawai"
          ],
          maxProducts: 50,
          maxEmployees: 2,
          maxOutlets: 1,
          isActive: true
        },
        {
          id: "pro",
          name: "Pro",
          price: 57577,
          currency: "IDR",
          interval: "bulan",
          features: [
            "Semua fitur Free",
            "Analisis usaha dengan laporan penjualan lebih lengkap",
            "Periode akses laporan sesuai masa aktivasi langganan",
            "Kelola produk tak terbatas",
            "Lebih cuan dengan jual produk lebih banyak",
            "Kelola diskon",
            "Export produk",
            "Pajak per produk",
            "Pantau pegawai tak terbatas",
            "Otomatis pegawai"
          ],
          maxProducts: null,
          maxEmployees: null,
          maxOutlets: 1,
          isActive: true
        },
        {
          id: "pro_plus",
          name: "Pro Plus",
          price: 92154,
          currency: "IDR",
          interval: "bulan",
          features: [
            "Semua fitur Pro",
            "Api kassa di struk",
            "Track pesanan langganan terdepat ke dapur",
            "Catatan pembarangan struk",
            "Catat uang PO pesanan",
            "Monitor analisis pesanan",
            "Label berdasarkan tipe pembayaran",
            "Branding logo usaha di struk",
            "Kelola bundel",
            "Pengingat kedaluwarsa produk",
            "Kelola harga grosir",
            "Multi-outlet management"
          ],
          maxProducts: null,
          maxEmployees: null,
          maxOutlets: null,
          isActive: true
        }
      ];
      return res.json(plans);
    }

    // Default 404
    return res.status(404).json({ message: "API endpoint not found" });

  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Data tidak valid", errors: error.errors });
    }
    
    return res.status(500).json({ message: "Internal server error" });
  }
}
