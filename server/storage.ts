import { 
  users, products, categories, customers, transactions, transactionItems,
  outlets, stockMovements, discounts, backupLogs, printerSettings,
  type User, type InsertUser, type Product, type InsertProduct, 
  type Category, type InsertCategory, type Customer, type InsertCustomer,
  type Transaction, type InsertTransaction, type TransactionItem, type InsertTransactionItem,
  type TransactionWithItems, type DashboardStatsType, type Outlet, type InsertOutlet,
  type StockMovement, type InsertStockMovement, type Discount, type InsertDiscount,
  type BackupLog, type InsertBackupLog, type PrinterSetting, type InsertPrinterSetting
} from "@shared/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  getProductsByCategory(kategori: string): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  getProductByBarcode(barcode: string): Promise<Product | undefined>;
  getLowStockProducts(outletId?: number): Promise<Product[]>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;
  
  // Transactions
  getTransactions(): Promise<TransactionWithItems[]>;
  getTransaction(id: number): Promise<TransactionWithItems | undefined>;
  createTransaction(transaction: InsertTransaction, items: InsertTransactionItem[]): Promise<TransactionWithItems>;
  getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<TransactionWithItems[]>;
  markTransactionAsPrinted(id: number): Promise<boolean>;
  
  // Dashboard Stats
  getDashboardStats(): Promise<DashboardStatsType>;
  getTopProducts(limit?: number): Promise<(Product & { totalTerjual: number })[]>;
  getRecentTransactions(limit?: number): Promise<TransactionWithItems[]>;
  
  // Outlets
  getOutlets(): Promise<Outlet[]>;
  getOutlet(id: number): Promise<Outlet | undefined>;
  createOutlet(outlet: InsertOutlet): Promise<Outlet>;
  
  // Stock Movements
  getStockMovements(filters: {
    productId?: number;
    outletId?: number;
    type?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<StockMovement[]>;
  createStockMovement(movement: InsertStockMovement): Promise<StockMovement>;
  
  // Discounts
  getDiscounts(isActive?: boolean): Promise<Discount[]>;
  getDiscount(id: number): Promise<Discount | undefined>;
  createDiscount(discount: InsertDiscount): Promise<Discount>;
  updateDiscount(id: number, discount: Partial<InsertDiscount>): Promise<Discount | undefined>;
  applyDiscount(discountId: number, subtotal: number): Promise<{ discountAmount: number; finalTotal: number }>;
  
  // Reports
  getProfitReport(startDate: Date, endDate: Date, outletId?: number): Promise<any>;
  getStockMovementReport(startDate: Date, endDate: Date, outletId?: number, type?: string): Promise<any>;
  
  // Printer Settings
  getPrinterSettings(outletId?: number): Promise<PrinterSetting[]>;
  createPrinterSetting(setting: InsertPrinterSetting): Promise<PrinterSetting>;
  generateReceiptData(transactionId: number): Promise<any>;
  
  // Backup
  getBackupLogs(): Promise<BackupLog[]>;
  createBackup(type: string, userId?: number): Promise<BackupLog>;
  
  // Multi-outlet sync
  syncOutletData(sourceOutletId: number, targetOutletId: number, dataTypes: string[]): Promise<any>;
  
  // Cash Entries
  getCashEntries(date?: string): Promise<any[]>;
  addCashEntry(entry: any): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private categories: Map<number, Category>;
  private customers: Map<number, Customer>;
  private transactions: Map<number, Transaction>;
  private transactionItems: Map<number, TransactionItem>;
  
  private currentUserId: number;
  private currentProductId: number;
  private currentCategoryId: number;
  private currentCustomerId: number;
  private currentTransactionId: number;
  private currentItemId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.categories = new Map();
    this.customers = new Map();
    this.transactions = new Map();
    this.transactionItems = new Map();
    
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentCategoryId = 1;
    this.currentCustomerId = 1;
    this.currentTransactionId = 1;
    this.currentItemId = 1;

    this.initializeData();
  }

  private initializeData() {
    // Initialize sample data
    const admin: User = {
      id: this.currentUserId++,
      username: "admin",
      password: "admin123",
      email: "admin@qasir.com",
      nama: "Admin Toko",
      role: "admin",
      outletId: null,
      subscriptionPlan: "pro_plus",
      subscriptionStatus: "active",
      subscriptionExpiresAt: null,
      permissions: {},
      lastLogin: null,
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(admin.id, admin);

    // Categories
    const categories = [
      { nama: "Makanan", deskripsi: "Produk makanan dan snack", warna: "#ef4444" },
      { nama: "Minuman", deskripsi: "Minuman segar dan sehat", warna: "#10b981" },
      { nama: "Elektronik", deskripsi: "Perangkat elektronik", warna: "#3b82f6" },
      { nama: "Rumah Tangga", deskripsi: "Keperluan rumah tangga", warna: "#f59e0b" },
      { nama: "Kesehatan", deskripsi: "Produk kesehatan dan kebersihan", warna: "#8b5cf6" },
    ];

    categories.forEach(cat => {
      const category: Category = {
        id: this.currentCategoryId++,
        nama: cat.nama,
        deskripsi: cat.deskripsi,
        warna: cat.warna,
        sort_order: this.currentCategoryId,
        isActive: true,
      };
      this.categories.set(category.id, category);
    });

    // Products
    const products = [
      { nama: "Roti Tawar Sari Roti", kode: "RTW001", kategori: "Makanan", harga: "8500", stok: 50 },
      { nama: "Susu Ultra 1L", kode: "SUL001", kategori: "Minuman", harga: "12000", stok: 30 },
      { nama: "Indomie Goreng", kode: "IMG001", kategori: "Makanan", harga: "3500", stok: 100 },
      { nama: "Teh Botol Sosro", kode: "TBS001", kategori: "Minuman", harga: "5000", stok: 75 },
      { nama: "Sabun Mandi Lifebuoy", kode: "SML001", kategori: "Kesehatan", harga: "8000", stok: 40 },
      { nama: "Beras Premium 5kg", kode: "BRP001", kategori: "Makanan", harga: "65000", stok: 25 },
      { nama: "Minyak Goreng Tropical 2L", kode: "MGT001", kategori: "Rumah Tangga", harga: "28000", stok: 20 },
      { nama: "Gula Pasir 1kg", kode: "GPS001", kategori: "Makanan", harga: "15000", stok: 35 },
    ];

    products.forEach(prod => {
      const product: Product = {
        id: this.currentProductId++,
        nama: prod.nama,
        kode: prod.kode,
        barcode: null,
        kategoriId: 1, // Default to first category
        kategori: prod.kategori,
        harga: prod.harga,
        hargaBeli: null,
        stok: prod.stok,
        stokMinimal: 5,
        satuan: "pcs",
        deskripsi: `Deskripsi untuk ${prod.nama}`,
        gambar: null,
        pajak: "0",
        diskonMaksimal: "0",
        outletId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.products.set(product.id, product);
    });

    // Customers
    const customers = [
      { nama: "Andi Susanto", email: "andi@email.com", telepon: "08123456789", alamat: "Jl. Merdeka No. 1" },
      { nama: "Siti Nurhaliza", email: "siti@email.com", telepon: "08234567890", alamat: "Jl. Sudirman No. 2" },
      { nama: "Budi Prasetyo", email: "budi@email.com", telepon: "08345678901", alamat: "Jl. Gatot Subroto No. 3" },
    ];

    customers.forEach(cust => {
      const customer: Customer = {
        id: this.currentCustomerId++,
        nama: cust.nama,
        email: cust.email,
        telepon: cust.telepon,
        alamat: cust.alamat,
        totalPembelian: "0",
        jumlahTransaksi: 0,
        createdAt: new Date(),
      };
      this.customers.set(customer.id, customer);
    });
  }

  // Users
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.currentUserId++,
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email,
      nama: insertUser.nama,
      role: insertUser.role || "kasir",
      outletId: insertUser.outletId || null,
      subscriptionPlan: insertUser.subscriptionPlan || "free",
      subscriptionStatus: insertUser.subscriptionStatus || "trial",
      subscriptionExpiresAt: insertUser.subscriptionExpiresAt || null,
      permissions: insertUser.permissions || {},
      lastLogin: null,
      isActive: insertUser.isActive ?? true,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.isActive);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const product: Product = {
      id: this.currentProductId++,
      nama: insertProduct.nama,
      kode: insertProduct.kode,
      barcode: insertProduct.barcode || null,
      kategoriId: insertProduct.kategoriId,
      kategori: insertProduct.kategori,
      harga: insertProduct.harga,
      hargaBeli: insertProduct.hargaBeli || null,
      stok: insertProduct.stok || 0,
      stokMinimal: insertProduct.stokMinimal || 5,
      satuan: insertProduct.satuan || "pcs",
      deskripsi: insertProduct.deskripsi || null,
      gambar: insertProduct.gambar || null,
      pajak: insertProduct.pajak || "0",
      diskonMaksimal: insertProduct.diskonMaksimal || "0",
      outletId: insertProduct.outletId || null,
      isActive: insertProduct.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(product.id, product);
    return product;
  }

  async updateProduct(id: number, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (product) {
      const updatedProduct = { ...product, ...updateData };
      this.products.set(id, updatedProduct);
      return updatedProduct;
    }
    return undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const product = this.products.get(id);
    if (product) {
      product.isActive = false;
      this.products.set(id, product);
      return true;
    }
    return false;
  }

  async getProductsByCategory(kategori: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.kategori === kategori && p.isActive);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(p => 
      p.isActive && (
        p.nama.toLowerCase().includes(lowercaseQuery) ||
        p.kode.toLowerCase().includes(lowercaseQuery) ||
        p.kategori.toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(p => p.barcode === barcode && p.isActive);
  }

  async getLowStockProducts(outletId?: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => 
      p.isActive && p.stok <= p.stokMinimal
    );
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(c => c.isActive);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const category: Category = {
      id: this.currentCategoryId++,
      nama: insertCategory.nama,
      deskripsi: insertCategory.deskripsi || null,
      warna: insertCategory.warna || "#ef4444",
      sort_order: this.currentCategoryId,
      isActive: insertCategory.isActive ?? true,
    };
    this.categories.set(category.id, category);
    return category;
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const customer: Customer = {
      id: this.currentCustomerId++,
      nama: insertCustomer.nama,
      email: insertCustomer.email || null,
      telepon: insertCustomer.telepon || null,
      alamat: insertCustomer.alamat || null,
      totalPembelian: "0",
      jumlahTransaksi: 0,
      createdAt: new Date(),
    };
    this.customers.set(customer.id, customer);
    return customer;
  }

  async updateCustomer(id: number, updateData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (customer) {
      const updatedCustomer = { ...customer, ...updateData };
      this.customers.set(id, updatedCustomer);
      return updatedCustomer;
    }
    return undefined;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    return this.customers.delete(id);
  }

  // Transactions
  async getTransactions(): Promise<TransactionWithItems[]> {
    const transactions = Array.from(this.transactions.values());
    const result: TransactionWithItems[] = [];

    for (const transaction of transactions) {
      const items = Array.from(this.transactionItems.values()).filter(
        item => item.transactionId === transaction.id
      );
      const customer = transaction.customerId ? this.customers.get(transaction.customerId) : undefined;
      const kasir = this.users.get(transaction.kasirId)!;

      result.push({
        ...transaction,
        items,
        customer,
        kasir,
      });
    }

    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getTransaction(id: number): Promise<TransactionWithItems | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;

    const items = Array.from(this.transactionItems.values()).filter(
      item => item.transactionId === transaction.id
    );
    const customer = transaction.customerId ? this.customers.get(transaction.customerId) : undefined;
    const kasir = this.users.get(transaction.kasirId)!;

    return {
      ...transaction,
      items,
      customer,
      kasir,
    };
  }

  async createTransaction(insertTransaction: InsertTransaction, items: InsertTransactionItem[]): Promise<TransactionWithItems> {
    const nomorTransaksi = `T${Date.now()}`;
    
    const transaction: Transaction = {
      id: this.currentTransactionId++,
      nomorTransaksi,
      customerId: insertTransaction.customerId || null,
      kasirId: insertTransaction.kasirId,
      outletId: insertTransaction.outletId || null,
      subtotal: insertTransaction.subtotal,
      pajak: insertTransaction.pajak || "0",
      diskon: insertTransaction.diskon || "0",
      diskonPersen: insertTransaction.diskonPersen || "0",
      total: insertTransaction.total,
      metodePembayaran: insertTransaction.metodePembayaran,
      jumlahBayar: insertTransaction.jumlahBayar || null,
      kembalian: insertTransaction.kembalian || "0",
      catatan: insertTransaction.catatan || null,
      status: insertTransaction.status || "completed",
      isPrinted: false,
      createdAt: new Date(),
    };
    
    this.transactions.set(transaction.id, transaction);

    // Add items
    const transactionItems: TransactionItem[] = [];
    for (const item of items) {
      const transactionItem: TransactionItem = {
        ...item,
        id: this.currentItemId++,
        transactionId: transaction.id,
      };
      this.transactionItems.set(transactionItem.id, transactionItem);
      transactionItems.push(transactionItem);

      // Update product stock
      const product = this.products.get(item.productId);
      if (product) {
        product.stok -= item.jumlah;
        this.products.set(product.id, product);
      }
    }

    // Update customer stats if applicable
    if (transaction.customerId) {
      const customer = this.customers.get(transaction.customerId);
      if (customer) {
        customer.totalPembelian = (parseFloat(customer.totalPembelian) + parseFloat(transaction.total)).toString();
        customer.jumlahTransaksi += 1;
        this.customers.set(customer.id, customer);
      }
    }

    const customer = transaction.customerId ? this.customers.get(transaction.customerId) : undefined;
    const kasir = this.users.get(transaction.kasirId)!;

    return {
      ...transaction,
      items: transactionItems,
      customer,
      kasir,
    };
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<TransactionWithItems[]> {
    const allTransactions = await this.getTransactions();
    return allTransactions.filter(t => 
      t.createdAt >= startDate && t.createdAt <= endDate
    );
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStatsType> {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const todayTransactions = await this.getTransactionsByDateRange(
      new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
    );

    const yesterdayTransactions = await this.getTransactionsByDateRange(
      new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
      new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59)
    );

    const penjualanHarian = todayTransactions.reduce((sum, t) => sum + parseFloat(t.total), 0);
    const penjualanKemarin = yesterdayTransactions.reduce((sum, t) => sum + parseFloat(t.total), 0);
    
    const totalTransaksi = todayTransactions.length;
    const totalTransaksiKemarin = yesterdayTransactions.length;

    const produkTerjual = todayTransactions.reduce((sum, t) => 
      sum + t.items.reduce((itemSum, item) => itemSum + item.jumlah, 0), 0
    );
    const produkTerjualKemarin = yesterdayTransactions.reduce((sum, t) => 
      sum + t.items.reduce((itemSum, item) => itemSum + item.jumlah, 0), 0
    );

    // New customers today (simplified - assume all transactions today are from new customers)
    const pelangganBaru = todayTransactions.filter(t => t.customerId).length;
    const pelangganBaruKemarin = yesterdayTransactions.filter(t => t.customerId).length;

    const calculateGrowth = (today: number, yesterday: number) => {
      if (yesterday === 0) return today > 0 ? 100 : 0;
      return ((today - yesterday) / yesterday) * 100;
    };

    return {
      penjualanHarian: penjualanHarian.toString(),
      totalTransaksi,
      produkTerjual,
      pelangganBaru,
      pertumbuhanPenjualan: calculateGrowth(penjualanHarian, penjualanKemarin),
      pertumbuhanTransaksi: calculateGrowth(totalTransaksi, totalTransaksiKemarin),
      pertumbuhanProduk: calculateGrowth(produkTerjual, produkTerjualKemarin),
      pertumbuhanPelanggan: calculateGrowth(pelangganBaru, pelangganBaruKemarin),
    };
  }

  async getTopProducts(limit = 5): Promise<(Product & { totalTerjual: number })[]> {
    const productSales = new Map<number, number>();

    // Calculate total sales for each product
    Array.from(this.transactionItems.values()).forEach(item => {
      const current = productSales.get(item.productId) || 0;
      productSales.set(item.productId, current + item.jumlah);
    });

    // Get products with sales data
    const productsWithSales = Array.from(this.products.values())
      .filter(p => p.isActive)
      .map(product => ({
        ...product,
        totalTerjual: productSales.get(product.id) || 0,
      }))
      .sort((a, b) => b.totalTerjual - a.totalTerjual)
      .slice(0, limit);

    return productsWithSales;
  }

  async getRecentTransactions(limit = 5): Promise<TransactionWithItems[]> {
    const allTransactions = await this.getTransactions();
    return allTransactions.slice(0, limit);
  }

  async markTransactionAsPrinted(id: number): Promise<boolean> {
    const transaction = this.transactions.get(id);
    if (transaction) {
      transaction.isPrinted = true;
      this.transactions.set(id, transaction);
      return true;
    }
    return false;
  }

  // Outlets - Mock implementation
  async getOutlets(): Promise<Outlet[]> {
    return [{ 
      id: 1, 
      nama: "Outlet Utama", 
      alamat: "Jl. Utama No. 1", 
      telepon: null,
      email: null,
      kodeOutlet: "OUT001",
      isActive: true, 
      createdAt: new Date() 
    }];
  }

  async getOutlet(id: number): Promise<Outlet | undefined> {
    if (id === 1) {
      return { 
        id: 1, 
        nama: "Outlet Utama", 
        alamat: "Jl. Utama No. 1", 
        telepon: null,
        email: null,
        kodeOutlet: "OUT001",
        isActive: true, 
        createdAt: new Date() 
      };
    }
    return undefined;
  }

  async createOutlet(outlet: InsertOutlet): Promise<Outlet> {
    return { 
      id: Date.now(), 
      nama: outlet.nama,
      alamat: outlet.alamat,
      telepon: outlet.telepon || null,
      email: outlet.email || null,
      kodeOutlet: outlet.kodeOutlet,
      isActive: outlet.isActive ?? true,
      createdAt: new Date() 
    };
  }

  // Stock Movements - Mock implementation
  async getStockMovements(filters: any): Promise<StockMovement[]> {
    return [];
  }

  async createStockMovement(movement: InsertStockMovement): Promise<StockMovement> {
    return { 
      id: Date.now(), 
      type: movement.type,
      productId: movement.productId,
      quantity: movement.quantity,
      quantityBefore: movement.quantityBefore,
      quantityAfter: movement.quantityAfter,
      userId: movement.userId,
      outletId: movement.outletId || null,
      reason: movement.reason || null,
      referenceId: movement.referenceId || null,
      catatan: movement.catatan || null,
      createdAt: new Date() 
    };
  }

  // Discounts - Mock implementation
  async getDiscounts(isActive?: boolean): Promise<Discount[]> {
    return [];
  }

  async getDiscount(id: number): Promise<Discount | undefined> {
    return undefined;
  }

  async createDiscount(discount: InsertDiscount): Promise<Discount> {
    return { 
      id: Date.now(), 
      nama: discount.nama,
      type: discount.type,
      value: discount.value,
      minPurchase: discount.minPurchase || null,
      maxDiscount: discount.maxDiscount || null,
      startDate: discount.startDate || null,
      endDate: discount.endDate || null,
      isActive: discount.isActive ?? true,
      createdAt: new Date() 
    };
  }

  async updateDiscount(id: number, discount: Partial<InsertDiscount>): Promise<Discount | undefined> {
    return undefined;
  }

  async applyDiscount(discountId: number, subtotal: number): Promise<{ discountAmount: number; finalTotal: number }> {
    return { discountAmount: 0, finalTotal: subtotal };
  }

  // Reports - Mock implementation
  async getProfitReport(startDate: Date, endDate: Date, outletId?: number): Promise<any> {
    return { profit: 0, revenue: 0, cost: 0 };
  }

  async getStockMovementReport(startDate: Date, endDate: Date, outletId?: number, type?: string): Promise<any> {
    return [];
  }

  // Printer Settings - Mock implementation
  async getPrinterSettings(outletId?: number): Promise<PrinterSetting[]> {
    return [];
  }

  async createPrinterSetting(setting: InsertPrinterSetting): Promise<PrinterSetting> {
    return { 
      id: Date.now(), 
      outletId: setting.outletId,
      printerName: setting.printerName,
      printerType: setting.printerType,
      paperSize: setting.paperSize || "80mm",
      isActive: setting.isActive ?? true,
      isDefault: setting.isDefault ?? false,
      settings: setting.settings || {},
      createdAt: new Date() 
    };
  }

  async generateReceiptData(transactionId: number): Promise<any> {
    return { receiptData: "Mock receipt data" };
  }

  // Backup - Mock implementation
  async getBackupLogs(): Promise<BackupLog[]> {
    return [];
  }

  async createBackup(type: string, userId?: number): Promise<BackupLog> {
    return { 
      id: Date.now(), 
      type, 
      userId: userId || null, 
      status: "completed", 
      filePath: null,
      fileSize: null,
      errorMessage: null,
      createdAt: new Date() 
    };
  }

  // Multi-outlet sync - Mock implementation
  async syncOutletData(sourceOutletId: number, targetOutletId: number, dataTypes: string[]): Promise<any> {
    return { success: true, message: "Sync completed" };
  }

  // Cash Entries - Mock implementation
  async getCashEntries(date?: string): Promise<any[]> {
    // Mock cash entries data
    const mockEntries = [
      {
        id: 1,
        tanggal: date || new Date().toISOString().split('T')[0],
        waktu: "09:00:00",
        jenis: 'masuk',
        kategori: "Modal Awal",
        deskripsi: "Modal kas awal hari",
        jumlah: 500000,
        saldo: 500000,
        kasir: "Admin Toko",
        referensi: null,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        tanggal: date || new Date().toISOString().split('T')[0],
        waktu: "10:30:22",
        jenis: 'masuk',
        kategori: "Penjualan",
        deskripsi: "Penjualan tunai",
        jumlah: 25000,
        saldo: 525000,
        kasir: "Admin Toko",
        referensi: "T1752132320001",
        createdAt: new Date().toISOString()
      }
    ];
    
    return mockEntries.filter(entry => !date || entry.tanggal === date);
  }

  async addCashEntry(entry: any): Promise<any> {
    // Mock implementation - return the entry with an ID
    return {
      id: Date.now(),
      ...entry,
      saldo: 500000, // Mock saldo calculation
      kasir: "Admin Toko",
      createdAt: new Date().toISOString()
    };
  }
}

// DatabaseStorage implementation
export class DatabaseStorage implements IStorage {
  // Import database connection
  private db = require("./db").db;

  async getUsers(): Promise<User[]> {
    return await this.db.select().from(users);
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getProducts(): Promise<Product[]> {
    return await this.db.select().from(products).where(eq(products.isActive, true));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await this.db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await this.db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async updateProduct(id: number, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await this.db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await this.db
      .update(products)
      .set({ isActive: false })
      .where(eq(products.id, id));
    return result.rowCount > 0;
  }

  async getProductsByCategory(kategori: string): Promise<Product[]> {
    return await this.db.select().from(products).where(
      and(eq(products.kategori, kategori), eq(products.isActive, true))
    );
  }

  async searchProducts(query: string): Promise<Product[]> {
    return await this.db.select().from(products).where(
      and(
        sql`${products.nama} ILIKE ${`%${query}%`}`,
        eq(products.isActive, true)
      )
    );
  }

  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    const [product] = await this.db.select().from(products).where(
      and(eq(products.barcode, barcode), eq(products.isActive, true))
    );
    return product || undefined;
  }

  async getLowStockProducts(outletId?: number): Promise<Product[]> {
    let query = this.db.select().from(products).where(
      and(
        eq(products.isActive, true),
        sql`${products.stok} <= ${products.stokMinimal}`
      )
    );
    
    if (outletId) {
      query = query.where(eq(products.outletId, outletId));
    }
    
    return await query;
  }

  async getCategories(): Promise<Category[]> {
    return await this.db.select().from(categories).where(eq(categories.isActive, true));
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await this.db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async getCustomers(): Promise<Customer[]> {
    return await this.db.select().from(customers);
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await this.db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await this.db
      .insert(customers)
      .values(insertCustomer)
      .returning();
    return customer;
  }

  async updateCustomer(id: number, updateData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [customer] = await this.db
      .update(customers)
      .set(updateData)
      .where(eq(customers.id, id))
      .returning();
    return customer || undefined;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    const result = await this.db
      .delete(customers)
      .where(eq(customers.id, id));
    return result.rowCount > 0;
  }

  async getTransactions(): Promise<TransactionWithItems[]> {
    const allTransactions = await this.db.select().from(transactions).orderBy(desc(transactions.createdAt));
    
    const result: TransactionWithItems[] = [];
    for (const transaction of allTransactions) {
      const items = await this.db.select().from(transactionItems).where(eq(transactionItems.transactionId, transaction.id));
      const customer = transaction.customerId ? await this.getCustomer(transaction.customerId) : undefined;
      const kasir = await this.getUser(transaction.kasirId);
      
      result.push({
        ...transaction,
        items,
        customer,
        kasir: kasir!
      });
    }
    
    return result;
  }

  async getTransaction(id: number): Promise<TransactionWithItems | undefined> {
    const [transaction] = await this.db.select().from(transactions).where(eq(transactions.id, id));
    if (!transaction) return undefined;
    
    const items = await this.db.select().from(transactionItems).where(eq(transactionItems.transactionId, id));
    const customer = transaction.customerId ? await this.getCustomer(transaction.customerId) : undefined;
    const kasir = await this.getUser(transaction.kasirId);
    
    return {
      ...transaction,
      items,
      customer,
      kasir: kasir!
    };
  }

  async createTransaction(insertTransaction: InsertTransaction, items: InsertTransactionItem[]): Promise<TransactionWithItems> {
    const nomorTransaksi = `T${Date.now()}`;
    
    const [transaction] = await this.db
      .insert(transactions)
      .values({
        ...insertTransaction,
        nomorTransaksi
      })
      .returning();

    const createdItems: TransactionItem[] = [];
    for (const item of items) {
      const [createdItem] = await this.db
        .insert(transactionItems)
        .values({
          ...item,
          transactionId: transaction.id
        })
        .returning();
      createdItems.push(createdItem);

      // Update product stock
      await this.db
        .update(products)
        .set({ 
          stok: sql`${products.stok} - ${item.jumlah}` 
        })
        .where(eq(products.id, item.productId));
    }

    // Update customer statistics if customer is provided
    if (transaction.customerId) {
      await this.db
        .update(customers)
        .set({
          totalPembelian: sql`${customers.totalPembelian} + ${transaction.total}`,
          jumlahTransaksi: sql`${customers.jumlahTransaksi} + 1`
        })
        .where(eq(customers.id, transaction.customerId));
    }

    const customer = transaction.customerId ? await this.getCustomer(transaction.customerId) : undefined;
    const kasir = await this.getUser(transaction.kasirId);

    return {
      ...transaction,
      items: createdItems,
      customer,
      kasir: kasir!
    };
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<TransactionWithItems[]> {
    const dateTransactions = await this.db.select().from(transactions).where(
      and(
        gte(transactions.createdAt, startDate),
        lte(transactions.createdAt, endDate)
      )
    ).orderBy(desc(transactions.createdAt));
    
    const result: TransactionWithItems[] = [];
    for (const transaction of dateTransactions) {
      const items = await this.db.select().from(transactionItems).where(eq(transactionItems.transactionId, transaction.id));
      const customer = transaction.customerId ? await this.getCustomer(transaction.customerId) : undefined;
      const kasir = await this.getUser(transaction.kasirId);
      
      result.push({
        ...transaction,
        items,
        customer,
        kasir: kasir!
      });
    }
    
    return result;
  }

  async markTransactionAsPrinted(id: number): Promise<boolean> {
    const result = await this.db
      .update(transactions)
      .set({ isPrinted: true })
      .where(eq(transactions.id, id));
    return result.rowCount > 0;
  }

  async getDashboardStats(): Promise<DashboardStatsType> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get today's transactions
    const todayTransactions = await this.getTransactionsByDateRange(startOfDay, endOfDay);
    
    // Calculate stats
    const penjualanHarian = todayTransactions.reduce((sum, t) => sum + parseFloat(t.total), 0);
    const totalTransaksi = todayTransactions.length;
    const produkTerjual = todayTransactions.reduce((sum, t) => 
      sum + t.items.reduce((itemSum: number, item: any) => itemSum + item.jumlah, 0), 0
    );

    // Get new customers today
    const newCustomersToday = await this.db.select().from(customers).where(
      and(
        gte(customers.createdAt, startOfDay),
        lte(customers.createdAt, endOfDay)
      )
    );

    return {
      penjualanHarian: penjualanHarian.toString(),
      totalTransaksi,
      produkTerjual,
      pelangganBaru: newCustomersToday.length,
      pertumbuhanPenjualan: 0, // TODO: Calculate growth
      pertumbuhanTransaksi: 0, // TODO: Calculate growth
      pertumbuhanProduk: 0, // TODO: Calculate growth
      pertumbuhanPelanggan: 0, // TODO: Calculate growth
    };
  }

  async getTopProducts(limit = 5): Promise<(Product & { totalTerjual: number })[]> {
    const topProductsQuery = await this.db
      .select({
        product: products,
        totalTerjual: sql<number>`COALESCE(SUM(${transactionItems.jumlah}), 0)`,
      })
      .from(products)
      .leftJoin(transactionItems, eq(products.id, transactionItems.productId))
      .where(eq(products.isActive, true))
      .groupBy(products.id)
      .orderBy(desc(sql`COALESCE(SUM(${transactionItems.jumlah}), 0)`))
      .limit(limit);

    return topProductsQuery.map((item: any) => ({
      ...item.product,
      totalTerjual: item.totalTerjual
    }));
  }

  async getRecentTransactions(limit = 5): Promise<TransactionWithItems[]> {
    const recentTransactions = await this.db.select().from(transactions)
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
    
    const result: TransactionWithItems[] = [];
    for (const transaction of recentTransactions) {
      const items = await this.db.select().from(transactionItems).where(eq(transactionItems.transactionId, transaction.id));
      const customer = transaction.customerId ? await this.getCustomer(transaction.customerId) : undefined;
      const kasir = await this.getUser(transaction.kasirId);
      
      result.push({
        ...transaction,
        items,
        customer,
        kasir: kasir!
      });
    }
    
    return result;
  }

  // Outlets
  async getOutlets(): Promise<Outlet[]> {
    return await this.db.select().from(outlets).where(eq(outlets.isActive, true));
  }

  async getOutlet(id: number): Promise<Outlet | undefined> {
    const [outlet] = await this.db.select().from(outlets).where(eq(outlets.id, id));
    return outlet || undefined;
  }

  async createOutlet(insertOutlet: InsertOutlet): Promise<Outlet> {
    const [outlet] = await this.db
      .insert(outlets)
      .values(insertOutlet)
      .returning();
    return outlet;
  }

  // Stock Movements
  async getStockMovements(filters: {
    productId?: number;
    outletId?: number;
    type?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<StockMovement[]> {
    let query = this.db.select().from(stockMovements);
    
    const conditions = [];
    if (filters.productId) conditions.push(eq(stockMovements.productId, filters.productId));
    if (filters.outletId) conditions.push(eq(stockMovements.outletId, filters.outletId));
    if (filters.type) conditions.push(eq(stockMovements.type, filters.type));
    if (filters.startDate) conditions.push(gte(stockMovements.createdAt, filters.startDate));
    if (filters.endDate) conditions.push(lte(stockMovements.createdAt, filters.endDate));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(stockMovements.createdAt));
  }

  async createStockMovement(insertMovement: InsertStockMovement): Promise<StockMovement> {
    const [movement] = await this.db
      .insert(stockMovements)
      .values(insertMovement)
      .returning();
    return movement;
  }

  // Discounts
  async getDiscounts(isActive?: boolean): Promise<Discount[]> {
    let query = this.db.select().from(discounts);
    if (isActive !== undefined) {
      query = query.where(eq(discounts.isActive, isActive));
    }
    return await query.orderBy(desc(discounts.createdAt));
  }

  async getDiscount(id: number): Promise<Discount | undefined> {
    const [discount] = await this.db.select().from(discounts).where(eq(discounts.id, id));
    return discount || undefined;
  }

  async createDiscount(insertDiscount: InsertDiscount): Promise<Discount> {
    const [discount] = await this.db
      .insert(discounts)
      .values(insertDiscount)
      .returning();
    return discount;
  }

  async updateDiscount(id: number, updateData: Partial<InsertDiscount>): Promise<Discount | undefined> {
    const [discount] = await this.db
      .update(discounts)
      .set(updateData)
      .where(eq(discounts.id, id))
      .returning();
    return discount || undefined;
  }

  async applyDiscount(discountId: number, subtotal: number): Promise<{ discountAmount: number; finalTotal: number }> {
    const discount = await this.getDiscount(discountId);
    if (!discount || !discount.isActive) {
      return { discountAmount: 0, finalTotal: subtotal };
    }

    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = (subtotal * parseFloat(discount.value)) / 100;
      if (discount.maxDiscount && discountAmount > parseFloat(discount.maxDiscount)) {
        discountAmount = parseFloat(discount.maxDiscount);
      }
    } else {
      discountAmount = parseFloat(discount.value);
    }

    return {
      discountAmount,
      finalTotal: subtotal - discountAmount
    };
  }

  // Reports
  async getProfitReport(startDate: Date, endDate: Date, outletId?: number): Promise<any> {
    // Implementation for profit report
    return { profit: 0, revenue: 0, cost: 0 };
  }

  async getStockMovementReport(startDate: Date, endDate: Date, outletId?: number, type?: string): Promise<any> {
    return await this.getStockMovements({ startDate, endDate, outletId, type });
  }

  // Printer Settings
  async getPrinterSettings(outletId?: number): Promise<PrinterSetting[]> {
    let query = this.db.select().from(printerSettings).where(eq(printerSettings.isActive, true));
    if (outletId) {
      query = query.where(eq(printerSettings.outletId, outletId));
    }
    return await query;
  }

  async createPrinterSetting(insertSetting: InsertPrinterSetting): Promise<PrinterSetting> {
    const [setting] = await this.db
      .insert(printerSettings)
      .values(insertSetting)
      .returning();
    return setting;
  }

  async generateReceiptData(transactionId: number): Promise<any> {
    const transaction = await this.getTransaction(transactionId);
    return { transaction, receiptData: "Receipt data generated" };
  }

  // Backup
  async getBackupLogs(): Promise<BackupLog[]> {
    return await this.db.select().from(backupLogs).orderBy(desc(backupLogs.createdAt));
  }

  async createBackup(type: string, userId?: number): Promise<BackupLog> {
    const [backup] = await this.db
      .insert(backupLogs)
      .values({
        type,
        userId: userId || null,
        status: "completed",
        filePath: null,
        fileSize: null,
        errorMessage: null
      })
      .returning();
    return backup;
  }

  // Multi-outlet sync
  async syncOutletData(sourceOutletId: number, targetOutletId: number, dataTypes: string[]): Promise<any> {
    return { success: true, message: "Sync completed", dataTypes };
  }

  // Cash Entries
  async getCashEntries(date?: string): Promise<any[]> {
    // For now, return mock data since we don't have cash_entries table yet
    // TODO: Implement actual database query when cash_entries table is created
    const mockEntries = [
      {
        id: 1,
        tanggal: date || new Date().toISOString().split('T')[0],
        waktu: "09:00:00",
        jenis: 'masuk',
        kategori: "Modal Awal",
        deskripsi: "Modal kas awal hari",
        jumlah: 500000,
        saldo: 500000,
        kasir: "Admin Toko",
        referensi: null,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        tanggal: date || new Date().toISOString().split('T')[0],
        waktu: "10:30:22",
        jenis: 'masuk',
        kategori: "Penjualan",
        deskripsi: "Penjualan tunai",
        jumlah: 25000,
        saldo: 525000,
        kasir: "Admin Toko",
        referensi: "T1752132320001",
        createdAt: new Date().toISOString()
      }
    ];
    
    return mockEntries.filter(entry => !date || entry.tanggal === date);
  }

  async addCashEntry(entry: any): Promise<any> {
    // For now, return mock data since we don't have cash_entries table yet
    // TODO: Implement actual database insert when cash_entries table is created
    return {
      id: Date.now(),
      ...entry,
      saldo: 500000, // Mock saldo calculation
      kasir: "Admin Toko",
      createdAt: new Date().toISOString()
    };
  }
}

// Initialize storage based on environment variables and database connection
let storage: IStorage;

// Import database connection and persistent storage
import { db, isDatabaseConnected, getDatabaseStatus } from "./db";
import { PersistentFileStorage } from "./persistent-storage";

try {
  // Check if we should use database or file storage
  const useDatabase = process.env.USE_LOCAL_DB === 'true' || process.env.DATABASE_URL;
  
  if (useDatabase && isDatabaseConnected()) {
    console.log("🗄️ Using DatabaseStorage (PostgreSQL)");
    storage = new DatabaseStorage();
  } else if (useDatabase && !isDatabaseConnected()) {
    console.log("⚠️ Database configured but not connected, falling back to PersistentFileStorage");
    storage = new PersistentFileStorage();
  } else {
    console.log("📁 Using PersistentFileStorage (local file-based storage)");
    storage = new PersistentFileStorage();
  }
} catch (error) {
  console.log("⚠️ Failed to initialize storage, using MemStorage:", error);
  storage = new MemStorage();
}

export { storage };
