import { 
  users, products, categories, customers, transactions, transactionItems,
  type User, type InsertUser, type Product, type InsertProduct, 
  type Category, type InsertCategory, type Customer, type InsertCustomer,
  type Transaction, type InsertTransaction, type TransactionItem, type InsertTransactionItem,
  type TransactionWithItems, type DashboardStatsType
} from "@shared/schema";
import { db } from "./db";
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
  
  // Dashboard Stats
  getDashboardStats(): Promise<DashboardStatsType>;
  getTopProducts(limit?: number): Promise<(Product & { totalTerjual: number })[]>;
  getRecentTransactions(limit?: number): Promise<TransactionWithItems[]>;
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
      subscriptionPlan: "pro_plus",
      subscriptionStatus: "active",
      subscriptionExpiresAt: null,
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(admin.id, admin);

    // Categories
    const categories = [
      { nama: "Makanan", deskripsi: "Produk makanan dan snack" },
      { nama: "Minuman", deskripsi: "Minuman segar dan sehat" },
      { nama: "Elektronik", deskripsi: "Perangkat elektronik" },
      { nama: "Rumah Tangga", deskripsi: "Keperluan rumah tangga" },
      { nama: "Kesehatan", deskripsi: "Produk kesehatan dan kebersihan" },
    ];

    categories.forEach(cat => {
      const category: Category = {
        id: this.currentCategoryId++,
        nama: cat.nama,
        deskripsi: cat.deskripsi,
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
        kategori: prod.kategori,
        harga: prod.harga,
        stok: prod.stok,
        deskripsi: `Deskripsi untuk ${prod.nama}`,
        gambar: null,
        isActive: true,
        createdAt: new Date(),
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
      subscriptionPlan: insertUser.subscriptionPlan || "free",
      subscriptionStatus: insertUser.subscriptionStatus || "trial",
      subscriptionExpiresAt: insertUser.subscriptionExpiresAt || null,
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
      kategori: insertProduct.kategori,
      harga: insertProduct.harga,
      stok: insertProduct.stok || 0,
      deskripsi: insertProduct.deskripsi || null,
      gambar: insertProduct.gambar || null,
      isActive: insertProduct.isActive ?? true,
      createdAt: new Date(),
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

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(c => c.isActive);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const category: Category = {
      id: this.currentCategoryId++,
      nama: insertCategory.nama,
      deskripsi: insertCategory.deskripsi || null,
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
      subtotal: insertTransaction.subtotal,
      pajak: insertTransaction.pajak || "0",
      diskon: insertTransaction.diskon || "0",
      total: insertTransaction.total,
      metodePembayaran: insertTransaction.metodePembayaran,
      status: insertTransaction.status || "completed",
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
}

// DatabaseStorage implementation
export class DatabaseStorage implements IStorage {
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async updateProduct(id: number, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db
      .update(products)
      .set({ isActive: false })
      .where(eq(products.id, id));
    return result.rowCount > 0;
  }

  async getProductsByCategory(kategori: string): Promise<Product[]> {
    return await db.select().from(products).where(
      and(eq(products.kategori, kategori), eq(products.isActive, true))
    );
  }

  async searchProducts(query: string): Promise<Product[]> {
    return await db.select().from(products).where(
      and(
        sql`${products.nama} ILIKE ${`%${query}%`}`,
        eq(products.isActive, true)
      )
    );
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isActive, true));
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db
      .insert(customers)
      .values(insertCustomer)
      .returning();
    return customer;
  }

  async updateCustomer(id: number, updateData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [customer] = await db
      .update(customers)
      .set(updateData)
      .where(eq(customers.id, id))
      .returning();
    return customer || undefined;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    const result = await db
      .delete(customers)
      .where(eq(customers.id, id));
    return result.rowCount > 0;
  }

  async getTransactions(): Promise<TransactionWithItems[]> {
    const allTransactions = await db.select().from(transactions).orderBy(desc(transactions.createdAt));
    
    const result: TransactionWithItems[] = [];
    for (const transaction of allTransactions) {
      const items = await db.select().from(transactionItems).where(eq(transactionItems.transactionId, transaction.id));
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
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    if (!transaction) return undefined;
    
    const items = await db.select().from(transactionItems).where(eq(transactionItems.transactionId, id));
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
    
    const [transaction] = await db
      .insert(transactions)
      .values({
        ...insertTransaction,
        nomorTransaksi
      })
      .returning();

    const createdItems: TransactionItem[] = [];
    for (const item of items) {
      const [createdItem] = await db
        .insert(transactionItems)
        .values({
          ...item,
          transactionId: transaction.id
        })
        .returning();
      createdItems.push(createdItem);

      // Update product stock
      await db
        .update(products)
        .set({ 
          stok: sql`${products.stok} - ${item.jumlah}` 
        })
        .where(eq(products.id, item.productId));
    }

    // Update customer statistics if customer is provided
    if (transaction.customerId) {
      await db
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
    const dateTransactions = await db.select().from(transactions).where(
      and(
        gte(transactions.createdAt, startDate),
        lte(transactions.createdAt, endDate)
      )
    ).orderBy(desc(transactions.createdAt));
    
    const result: TransactionWithItems[] = [];
    for (const transaction of dateTransactions) {
      const items = await db.select().from(transactionItems).where(eq(transactionItems.transactionId, transaction.id));
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
      sum + t.items.reduce((itemSum, item) => itemSum + item.jumlah, 0), 0
    );

    // Get new customers today
    const newCustomersToday = await db.select().from(customers).where(
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
    const topProductsQuery = await db
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

    return topProductsQuery.map(item => ({
      ...item.product,
      totalTerjual: item.totalTerjual
    }));
  }

  async getRecentTransactions(limit = 5): Promise<TransactionWithItems[]> {
    const recentTransactions = await db.select().from(transactions)
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
    
    const result: TransactionWithItems[] = [];
    for (const transaction of recentTransactions) {
      const items = await db.select().from(transactionItems).where(eq(transactionItems.transactionId, transaction.id));
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
}

export const storage = new DatabaseStorage();
