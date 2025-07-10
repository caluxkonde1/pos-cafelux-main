import type { Express } from "express";
import { storage } from "./storage";
import { insertDiscountSchema, insertStockMovementSchema, insertOutletSchema, insertPrinterSettingSchema } from "@shared/schema";
import { z } from "zod";

export function registerEnhancedRoutes(app: Express) {
  
  // ============ AUTHENTICATION & USER MANAGEMENT ============
  
  // Login endpoint with role-based permissions
  app.post("/api/auth/login", async (req, res) => {
    try {
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
      
      // Update last login
      // await storage.updateUserLastLogin(user.id);
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        user: userWithoutPassword,
        permissions: user.permissions,
        message: "Login berhasil" 
      });
    } catch (error) {
      res.status(500).json({ message: "Gagal melakukan login" });
    }
  });
  
  // Get user permissions
  app.get("/api/auth/permissions/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }
      
      res.json({ permissions: user.permissions, role: user.role });
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil permissions" });
    }
  });
  
  // ============ OUTLET MANAGEMENT ============
  
  app.get("/api/outlets", async (req, res) => {
    try {
      const outlets = await storage.getOutlets();
      res.json(outlets);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data outlet" });
    }
  });
  
  app.post("/api/outlets", async (req, res) => {
    try {
      const validatedData = insertOutletSchema.parse(req.body);
      const outlet = await storage.createOutlet(validatedData);
      res.status(201).json(outlet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Data tidak valid", errors: error.errors });
      }
      res.status(500).json({ message: "Gagal membuat outlet" });
    }
  });
  
  // ============ STOCK MANAGEMENT ============
  
  // Get stock movements
  app.get("/api/stock-movements", async (req, res) => {
    try {
      const { productId, outletId, type, startDate, endDate } = req.query;
      const movements = await storage.getStockMovements({
        productId: productId ? parseInt(productId as string) : undefined,
        outletId: outletId ? parseInt(outletId as string) : undefined,
        type: type as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });
      res.json(movements);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data pergerakan stok" });
    }
  });
  
  // Create stock movement (manual adjustment)
  app.post("/api/stock-movements", async (req, res) => {
    try {
      const validatedData = insertStockMovementSchema.parse(req.body);
      const movement = await storage.createStockMovement(validatedData);
      res.status(201).json(movement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Data tidak valid", errors: error.errors });
      }
      res.status(500).json({ message: "Gagal membuat pergerakan stok" });
    }
  });
  
  // Get low stock products
  app.get("/api/products/low-stock", async (req, res) => {
    try {
      const { outletId } = req.query;
      const products = await storage.getLowStockProducts(
        outletId ? parseInt(outletId as string) : undefined
      );
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil produk stok rendah" });
    }
  });
  
  // ============ DISCOUNT MANAGEMENT ============
  
  app.get("/api/discounts", async (req, res) => {
    try {
      const { isActive } = req.query;
      const discounts = await storage.getDiscounts(
        isActive ? isActive === 'true' : undefined
      );
      res.json(discounts);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data diskon" });
    }
  });
  
  app.post("/api/discounts", async (req, res) => {
    try {
      const validatedData = insertDiscountSchema.parse(req.body);
      const discount = await storage.createDiscount(validatedData);
      res.status(201).json(discount);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Data tidak valid", errors: error.errors });
      }
      res.status(500).json({ message: "Gagal membuat diskon" });
    }
  });
  
  app.put("/api/discounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDiscountSchema.partial().parse(req.body);
      const discount = await storage.updateDiscount(id, validatedData);
      
      if (!discount) {
        return res.status(404).json({ message: "Diskon tidak ditemukan" });
      }
      
      res.json(discount);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Data tidak valid", errors: error.errors });
      }
      res.status(500).json({ message: "Gagal mengupdate diskon" });
    }
  });
  
  // Apply discount to transaction
  app.post("/api/discounts/apply", async (req, res) => {
    try {
      const { discountId, subtotal } = req.body;
      const result = await storage.applyDiscount(discountId, parseFloat(subtotal));
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Gagal menerapkan diskon" });
    }
  });
  
  // ============ ENHANCED REPORTS ============
  
  // Profit analysis report
  app.get("/api/reports/profit", async (req, res) => {
    try {
      const { startDate, endDate, outletId } = req.query;
      
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();
      
      const profitReport = await storage.getProfitReport(
        start, 
        end, 
        outletId ? parseInt(outletId as string) : undefined
      );
      res.json(profitReport);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil laporan profit" });
    }
  });
  
  // Stock movement report
  app.get("/api/reports/stock-movements", async (req, res) => {
    try {
      const { startDate, endDate, outletId, type } = req.query;
      
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();
      
      const report = await storage.getStockMovementReport(
        start, 
        end, 
        outletId ? parseInt(outletId as string) : undefined,
        type as string
      );
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil laporan pergerakan stok" });
    }
  });
  
  // ============ PRINTER MANAGEMENT ============
  
  app.get("/api/printer-settings", async (req, res) => {
    try {
      const { outletId } = req.query;
      const settings = await storage.getPrinterSettings(
        outletId ? parseInt(outletId as string) : undefined
      );
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil pengaturan printer" });
    }
  });
  
  app.post("/api/printer-settings", async (req, res) => {
    try {
      const validatedData = insertPrinterSettingSchema.parse(req.body);
      const setting = await storage.createPrinterSetting(validatedData);
      res.status(201).json(setting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Data tidak valid", errors: error.errors });
      }
      res.status(500).json({ message: "Gagal membuat pengaturan printer" });
    }
  });
  
  // Print receipt
  app.post("/api/print/receipt", async (req, res) => {
    try {
      const { transactionId, printerId } = req.body;
      
      const transaction = await storage.getTransaction(transactionId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaksi tidak ditemukan" });
      }
      
      // Generate receipt data
      const receiptData = await storage.generateReceiptData(transactionId);
      
      // Mark transaction as printed
      await storage.markTransactionAsPrinted(transactionId);
      
      res.json({ 
        message: "Struk berhasil dicetak",
        receiptData,
        printerId 
      });
    } catch (error) {
      res.status(500).json({ message: "Gagal mencetak struk" });
    }
  });
  
  // ============ BACKUP MANAGEMENT ============
  
  app.get("/api/backup/logs", async (req, res) => {
    try {
      const logs = await storage.getBackupLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil log backup" });
    }
  });
  
  app.post("/api/backup/create", async (req, res) => {
    try {
      const { type = 'manual', userId } = req.body;
      const backup = await storage.createBackup(type, userId);
      res.status(201).json(backup);
    } catch (error) {
      res.status(500).json({ message: "Gagal membuat backup" });
    }
  });
  
  // ============ BARCODE SCANNING ============
  
  app.get("/api/products/barcode/:barcode", async (req, res) => {
    try {
      const { barcode } = req.params;
      const product = await storage.getProductByBarcode(barcode);
      
      if (!product) {
        return res.status(404).json({ message: "Produk dengan barcode tersebut tidak ditemukan" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Gagal mencari produk berdasarkan barcode" });
    }
  });
  
  // ============ MULTI-OUTLET SYNC ============
  
  app.post("/api/sync/outlets", async (req, res) => {
    try {
      const { sourceOutletId, targetOutletId, dataTypes } = req.body;
      const result = await storage.syncOutletData(sourceOutletId, targetOutletId, dataTypes);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Gagal sinkronisasi data outlet" });
    }
  });
  
  console.log("✅ Enhanced routes registered successfully!");
}
