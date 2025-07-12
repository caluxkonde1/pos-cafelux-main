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
import * as fs from 'fs';
import * as path from 'path';

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

export class PersistentFileStorage implements IStorage {
  private dataPath: string;
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
    this.dataPath = './local-data';
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

    this.ensureDataDirectory();
    this.loadData();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
      console.log('📁 Created local data directory');
    }
  }

  private loadData() {
    try {
      // Load users
      const usersFile = path.join(this.dataPath, 'users.json');
      if (fs.existsSync(usersFile)) {
        const usersData = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
        usersData.forEach((user: User) => {
          this.users.set(user.id, user);
          this.currentUserId = Math.max(this.currentUserId, user.id + 1);
        });
      }

      // Load categories
      const categoriesFile = path.join(this.dataPath, 'categories.json');
      if (fs.existsSync(categoriesFile)) {
        const categoriesData = JSON.parse(fs.readFileSync(categoriesFile, 'utf8'));
        categoriesData.forEach((category: Category) => {
          this.categories.set(category.id, category);
          this.currentCategoryId = Math.max(this.currentCategoryId, category.id + 1);
        });
      }

      // Load products
      const productsFile = path.join(this.dataPath, 'products.json');
      if (fs.existsSync(productsFile)) {
        const productsData = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
        productsData.forEach((product: Product) => {
          this.products.set(product.id, product);
          this.currentProductId = Math.max(this.currentProductId, product.id + 1);
        });
      }

      // Load customers
      const customersFile = path.join(this.dataPath, 'customers.json');
      if (fs.existsSync(customersFile)) {
        const customersData = JSON.parse(fs.readFileSync(customersFile, 'utf8'));
        customersData.forEach((customer: Customer) => {
          this.customers.set(customer.id, customer);
          this.currentCustomerId = Math.max(this.currentCustomerId, customer.id + 1);
        });
      }

      // Load transactions
      const transactionsFile = path.join(this.dataPath, 'transactions.json');
      if (fs.existsSync(transactionsFile)) {
        const transactionsData = JSON.parse(fs.readFileSync(transactionsFile, 'utf8'));
        transactionsData.forEach((transaction: Transaction) => {
          this.transactions.set(transaction.id, transaction);
          this.currentTransactionId = Math.max(this.currentTransactionId, transaction.id + 1);
        });
      }

      // Load transaction items
      const transactionItemsFile = path.join(this.dataPath, 'transaction_items.json');
      if (fs.existsSync(transactionItemsFile)) {
        const transactionItemsData = JSON.parse(fs.readFileSync(transactionItemsFile, 'utf8'));
        transactionItemsData.forEach((item: TransactionItem) => {
          this.transactionItems.set(item.id, item);
          this.currentItemId = Math.max(this.currentItemId, item.id + 1);
        });
      }

      console.log('📂 Loaded data from local files');
      
      // Initialize with sample data if empty
      if (this.users.size === 0) {
        this.initializeData();
      }
    } catch (error) {
      console.log('⚠️ Error loading data, initializing with sample data:', error);
      this.initializeData();
    }
  }

  private saveData() {
    try {
      // Save users
      const usersData = Array.from(this.users.values());
      fs.writeFileSync(path.join(this.dataPath, 'users.json'), JSON.stringify(usersData, null, 2));

      // Save categories
      const categoriesData = Array.from(this.categories.values());
      fs.writeFileSync(path.join(this.dataPath, 'categories.json'), JSON.stringify(categoriesData, null, 2));

      // Save products
      const productsData = Array.from(this.products.values());
      fs.writeFileSync(path.join(this.dataPath, 'products.json'), JSON.stringify(productsData, null, 2));

      // Save customers
      const customersData = Array.from(this.customers.values());
      fs.writeFileSync(path.join(this.dataPath, 'customers.json'), JSON.stringify(customersData, null, 2));

      // Save transactions
      const transactionsData = Array.from(this.transactions.values());
      fs.writeFileSync(path.join(this.dataPath, 'transactions.json'), JSON.stringify(transactionsData, null, 2));

      // Save transaction items
      const transactionItemsData = Array.from(this.transactionItems.values());
      fs.writeFileSync(path.join(this.dataPath, 'transaction_items.json'), JSON.stringify(transactionItemsData, null, 2));

      console.log('💾 Data saved to local files');
    } catch (error) {
      console.error('❌ Error saving data:', error);
    }
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

    // Save initial data
    this.saveData();
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
    this.saveData();
    return user;
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
    this.saveData();
    console.log('✅ Category saved to persistent storage:', category);
    return category;
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
    this.saveData();
    return product;
  }

  async updateProduct(id: number, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (product) {
      const updatedProduct = { ...product, ...updateData };
      this.products.set(id, updatedProduct);
      this.saveData();
      return updatedProduct;
    }
    return undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const product = this.products.get(id);
    if (product) {
      product.isActive = false;
      this.products.set(id, product);
      this.saveData();
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
    this.saveData();
    return customer;
  }

  async updateCustomer(id: number, updateData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (customer) {
      const updatedCustomer = { ...customer, ...updateData };
      this.customers.set(id, updatedCustomer);
      this.saveData();
      return updatedCustomer;
    }
    return undefined;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    const deleted = this.customers.delete(id);
    if (deleted) {
      this.saveData();
    }
    return deleted;
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

    this.saveData();

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

  async markTransactionAsPrinted(id: number): Promise<boolean> {
    const transaction = this.transactions.get(id);
    if (transaction) {
      transaction.isPrinted = true;
      this.transactions.set(id, transaction);
      this.saveData();
      return true;
    }
    return false;
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
