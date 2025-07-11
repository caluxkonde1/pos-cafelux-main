import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertCustomerSchema, insertTransactionSchema, insertTransactionItemSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Dashboard Stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil statistik dashboard" });
    }
  });

  app.get("/api/dashboard/top-products", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const topProducts = await storage.getTopProducts(limit);
      res.json(topProducts);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil produk terlaris" });
    }
  });

  app.get("/api/dashboard/recent-transactions", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const recentTransactions = await storage.getRecentTransactions(limit);
      res.json(recentTransactions);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil transaksi terbaru" });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const { kategori, search } = req.query;
      
      let products;
      if (search) {
        products = await storage.searchProducts(search as string);
      } else if (kategori) {
        products = await storage.getProductsByCategory(kategori as string);
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data produk" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Produk tidak ditemukan" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data produk" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Data tidak valid", errors: error.errors });
      }
      res.status(500).json({ message: "Gagal membuat produk" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, validatedData);
      
      if (!product) {
        return res.status(404).json({ message: "Produk tidak ditemukan" });
      }
      
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Data tidak valid", errors: error.errors });
      }
      res.status(500).json({ message: "Gagal mengupdate produk" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id);
      
      if (!success) {
        return res.status(404).json({ message: "Produk tidak ditemukan" });
      }
      
      res.json({ message: "Produk berhasil dihapus" });
    } catch (error) {
      res.status(500).json({ message: "Gagal menghapus produk" });
    }
  });

  // Update product stock (role-based access)
  app.patch("/api/products/:id/stock", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { stok, userRole } = req.body;
      
      // Check role-based access
      if (!userRole || (userRole !== 'pemilik' && userRole !== 'admin')) {
        return res.status(403).json({ 
          message: "Akses ditolak. Hanya pemilik dan admin yang dapat mengubah stok." 
        });
      }
      
      // Validate stock value
      if (typeof stok !== 'number' || stok < 0) {
        return res.status(400).json({ 
          message: "Stok harus berupa angka positif." 
        });
      }
      
      const product = await storage.updateProduct(id, { stok });
      
      if (!product) {
        return res.status(404).json({ message: "Produk tidak ditemukan" });
      }
      
      res.json({ 
        message: "Stok berhasil diperbarui",
        product 
      });
    } catch (error) {
      console.error("Error updating stock:", error);
      res.status(500).json({ message: "Gagal mengupdate stok" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data kategori" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const { nama, deskripsi, warna } = req.body;
      
      if (!nama) {
        return res.status(400).json({ message: "Nama kategori wajib diisi" });
      }

      const newCategory = {
        nama,
        deskripsi: deskripsi || "",
        warna: warna || "#ef4444",
        sort_order: Date.now()
      };

      // For now, return mock success response
      // In production, you would save to database
      const category = {
        id: Date.now(),
        ...newCategory
      };

      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Gagal membuat kategori" });
    }
  });

  // Customers
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data pelanggan" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      
      if (!customer) {
        return res.status(404).json({ message: "Pelanggan tidak ditemukan" });
      }
      
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data pelanggan" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Data tidak valid", errors: error.errors });
      }
      res.status(500).json({ message: "Gagal membuat pelanggan" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, validatedData);
      
      if (!customer) {
        return res.status(404).json({ message: "Pelanggan tidak ditemukan" });
      }
      
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Data tidak valid", errors: error.errors });
      }
      res.status(500).json({ message: "Gagal mengupdate pelanggan" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCustomer(id);
      
      if (!success) {
        return res.status(404).json({ message: "Pelanggan tidak ditemukan" });
      }
      
      res.json({ message: "Pelanggan berhasil dihapus" });
    } catch (error) {
      res.status(500).json({ message: "Gagal menghapus pelanggan" });
    }
  });

  // Transactions
  app.get("/api/transactions", async (req, res) => {
    try {
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
      
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data transaksi" });
    }
  });

  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.getTransaction(id);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaksi tidak ditemukan" });
      }
      
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data transaksi" });
    }
  });

  const createTransactionSchema = z.object({
    transaction: insertTransactionSchema,
    items: z.array(insertTransactionItemSchema),
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = createTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(
        validatedData.transaction,
        validatedData.items
      );
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Data tidak valid", errors: error.errors });
      }
      res.status(500).json({ message: "Gagal membuat transaksi" });
    }
  });

  // Reports
  app.get("/api/reports/sales", async (req, res) => {
    try {
      const { startDate, endDate, groupBy = 'day' } = req.query;
      
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();
      
      const transactions = await storage.getTransactionsByDateRange(start, end);
      
      // Group by day, week, or month
      const salesData = new Map<string, { date: string; total: number; transactions: number }>();
      
      transactions.forEach(transaction => {
        let dateKey: string;
        const date = new Date(transaction.createdAt);
        
        if (groupBy === 'day') {
          dateKey = date.toISOString().split('T')[0];
        } else if (groupBy === 'week') {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          dateKey = weekStart.toISOString().split('T')[0];
        } else { // month
          dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        }
        
        const existing = salesData.get(dateKey) || { date: dateKey, total: 0, transactions: 0 };
        existing.total += parseFloat(transaction.total);
        existing.transactions += 1;
        salesData.set(dateKey, existing);
      });
      
      const result = Array.from(salesData.values()).sort((a, b) => a.date.localeCompare(b.date));
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil laporan penjualan" });
    }
  });

  // Users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error("Error getting users:", error);
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  // Subscription Plans
  app.get("/api/subscription-plans", async (req, res) => {
    try {
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
      res.json(plans);
    } catch (error) {
      console.error("Error getting subscription plans:", error);
      res.status(500).json({ message: "Failed to get subscription plans" });
    }
  });

  // Wallet Integration Routes
  app.post("/api/wallet/integrate/:provider", async (req, res) => {
    try {
      const { provider } = req.params;
      const { merchantId, callbackUrl } = req.body;

      if (!['gopay', 'dana'].includes(provider)) {
        return res.status(400).json({ message: "Provider tidak didukung" });
      }

      // Simulate wallet integration API call
      const integrationData = {
        gopay: {
          integrationUrl: `https://api.gopay.co.id/merchant/integrate?merchant_id=${merchantId}&callback=${encodeURIComponent(callbackUrl)}`,
          apiKey: "GOPAY_API_KEY_DEMO",
          merchantCode: "QASIR_GP_001"
        },
        dana: {
          integrationUrl: `https://api.dana.id/merchant/register?merchant_id=${merchantId}&callback=${encodeURIComponent(callbackUrl)}`,
          apiKey: "DANA_API_KEY_DEMO", 
          merchantCode: "QASIR_DN_001"
        }
      };

      // In production, you would make actual API calls to GoPay/Dana
      // For demo purposes, we return mock integration URLs
      res.json({
        success: true,
        provider,
        integrationUrl: integrationData[provider as keyof typeof integrationData].integrationUrl,
        message: `Integrasi ${provider.toUpperCase()} berhasil dimulai`
      });

    } catch (error) {
      console.error("Wallet integration error:", error);
      res.status(500).json({ message: "Gagal mengintegrasikan wallet" });
    }
  });

  app.post("/api/wallet/callback", async (req, res) => {
    try {
      const { provider, status, merchantId, accessToken } = req.body;

      // Handle callback from wallet providers
      if (status === 'success') {
        // Store integration data in database
        // In production, you would save this to your database
        console.log(`${provider} integration successful for merchant ${merchantId}`);
        
        res.json({
          success: true,
          message: `Integrasi ${provider} berhasil diselesaikan`
        });
      } else {
        res.status(400).json({
          success: false,
          message: `Integrasi ${provider} gagal`
        });
      }

    } catch (error) {
      console.error("Wallet callback error:", error);
      res.status(500).json({ message: "Gagal memproses callback wallet" });
    }
  });

  app.get("/api/wallet/balance/:provider", async (req, res) => {
    try {
      const { provider } = req.params;

      // Mock wallet balance data
      const balanceData = {
        gopay: {
          balance: 2500000,
          currency: "IDR",
          lastUpdated: new Date().toISOString()
        },
        dana: {
          balance: 1750000,
          currency: "IDR", 
          lastUpdated: new Date().toISOString()
        }
      };

      res.json({
        success: true,
        provider,
        data: balanceData[provider as keyof typeof balanceData] || { balance: 0, currency: "IDR" }
      });

    } catch (error) {
      console.error("Get wallet balance error:", error);
      res.status(500).json({ message: "Gagal mengambil saldo wallet" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
