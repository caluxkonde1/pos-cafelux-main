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

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data kategori" });
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

  const httpServer = createServer(app);
  return httpServer;
}
