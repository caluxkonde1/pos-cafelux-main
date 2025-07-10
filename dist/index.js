var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  categories: () => categories,
  customers: () => customers,
  dashboardStats: () => dashboardStats,
  features: () => features,
  insertCategorySchema: () => insertCategorySchema,
  insertCustomerSchema: () => insertCustomerSchema,
  insertFeatureSchema: () => insertFeatureSchema,
  insertProductSchema: () => insertProductSchema,
  insertSubscriptionPlanSchema: () => insertSubscriptionPlanSchema,
  insertTransactionItemSchema: () => insertTransactionItemSchema,
  insertTransactionSchema: () => insertTransactionSchema,
  insertUserSchema: () => insertUserSchema,
  products: () => products,
  subscriptionPlans: () => subscriptionPlans,
  transactionItems: () => transactionItems,
  transactions: () => transactions,
  users: () => users
});
import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  nama: text("nama").notNull(),
  role: text("role").notNull().default("admin"),
  // admin, kasir, pemilik
  subscriptionPlan: text("subscription_plan", { enum: ["free", "pro", "pro_plus"] }).notNull().default("free"),
  subscriptionStatus: text("subscription_status", { enum: ["active", "inactive", "trial"] }).notNull().default("trial"),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  nama: text("nama").notNull(),
  kode: text("kode").notNull().unique(),
  kategori: text("kategori").notNull(),
  harga: decimal("harga", { precision: 10, scale: 2 }).notNull(),
  stok: integer("stok").notNull().default(0),
  deskripsi: text("deskripsi"),
  gambar: text("gambar"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  nama: text("nama").notNull(),
  deskripsi: text("deskripsi"),
  isActive: boolean("is_active").notNull().default(true)
});
var customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  nama: text("nama").notNull(),
  email: text("email"),
  telepon: text("telepon"),
  alamat: text("alamat"),
  totalPembelian: decimal("total_pembelian", { precision: 12, scale: 2 }).notNull().default("0"),
  jumlahTransaksi: integer("jumlah_transaksi").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  nomorTransaksi: text("nomor_transaksi").notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id),
  kasirId: integer("kasir_id").notNull().references(() => users.id),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  pajak: decimal("pajak", { precision: 12, scale: 2 }).notNull().default("0"),
  diskon: decimal("diskon", { precision: 12, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  metodePembayaran: text("metode_pembayaran").notNull(),
  // tunai, kartu, ewallet, qris
  status: text("status").notNull().default("completed"),
  // pending, completed, cancelled
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var transactionItems = pgTable("transaction_items", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").notNull().references(() => transactions.id),
  productId: integer("product_id").notNull().references(() => products.id),
  namaProduk: text("nama_produk").notNull(),
  harga: decimal("harga", { precision: 10, scale: 2 }).notNull(),
  jumlah: integer("jumlah").notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull()
});
var dashboardStats = pgTable("dashboard_stats", {
  id: serial("id").primaryKey(),
  tanggal: timestamp("tanggal").notNull(),
  penjualanHarian: decimal("penjualan_harian", { precision: 12, scale: 2 }).notNull(),
  totalTransaksi: integer("total_transaksi").notNull(),
  produkTerjual: integer("produk_terjual").notNull(),
  pelangganBaru: integer("pelanggan_baru").notNull()
});
var subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  // "Free", "Pro", "Pro Plus"
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("IDR"),
  interval: text("interval").notNull().default("monthly"),
  // monthly, yearly
  features: jsonb("features").notNull(),
  // Array of feature names
  maxProducts: integer("max_products"),
  maxEmployees: integer("max_employees"),
  maxOutlets: integer("max_outlets"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var features = pgTable("features", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  // "basic", "analytics", "advanced", "integration"
  isActive: boolean("is_active").notNull().default(true)
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true
});
var insertCategorySchema = createInsertSchema(categories).omit({
  id: true
});
var insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  totalPembelian: true,
  jumlahTransaksi: true,
  createdAt: true
});
var insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  nomorTransaksi: true,
  createdAt: true
});
var insertTransactionItemSchema = createInsertSchema(transactionItems).omit({
  id: true
});
var insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true
});
var insertFeatureSchema = createInsertSchema(features).omit({
  id: true
});

// server/db.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
var pool = null;
var db = null;
var skipDatabase = process.env.SKIP_DATABASE === "true";
var databaseUrl = process.env.DATABASE_URL?.trim();
if (!skipDatabase && databaseUrl && databaseUrl.length > 0) {
  console.log("Connecting to Supabase database...");
  try {
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false
      }
    });
    db = drizzle(pool, { schema: schema_exports });
    console.log("Database connection initialized");
  } catch (error) {
    console.log("Failed to initialize database connection:", error instanceof Error ? error.message : String(error));
    console.log("Falling back to MemStorage");
    pool = null;
    db = null;
  }
} else {
  if (skipDatabase) {
    console.log("Database connection skipped (SKIP_DATABASE=true), using MemStorage");
  } else {
    console.log("DATABASE_URL not provided, using MemStorage instead");
  }
}

// server/storage.ts
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
var MemStorage = class {
  users;
  products;
  categories;
  customers;
  transactions;
  transactionItems;
  currentUserId;
  currentProductId;
  currentCategoryId;
  currentCustomerId;
  currentTransactionId;
  currentItemId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.products = /* @__PURE__ */ new Map();
    this.categories = /* @__PURE__ */ new Map();
    this.customers = /* @__PURE__ */ new Map();
    this.transactions = /* @__PURE__ */ new Map();
    this.transactionItems = /* @__PURE__ */ new Map();
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentCategoryId = 1;
    this.currentCustomerId = 1;
    this.currentTransactionId = 1;
    this.currentItemId = 1;
    this.initializeData();
  }
  initializeData() {
    const admin = {
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
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(admin.id, admin);
    const categories2 = [
      { nama: "Makanan", deskripsi: "Produk makanan dan snack" },
      { nama: "Minuman", deskripsi: "Minuman segar dan sehat" },
      { nama: "Elektronik", deskripsi: "Perangkat elektronik" },
      { nama: "Rumah Tangga", deskripsi: "Keperluan rumah tangga" },
      { nama: "Kesehatan", deskripsi: "Produk kesehatan dan kebersihan" }
    ];
    categories2.forEach((cat) => {
      const category = {
        id: this.currentCategoryId++,
        nama: cat.nama,
        deskripsi: cat.deskripsi,
        isActive: true
      };
      this.categories.set(category.id, category);
    });
    const products2 = [
      { nama: "Roti Tawar Sari Roti", kode: "RTW001", kategori: "Makanan", harga: "8500", stok: 50 },
      { nama: "Susu Ultra 1L", kode: "SUL001", kategori: "Minuman", harga: "12000", stok: 30 },
      { nama: "Indomie Goreng", kode: "IMG001", kategori: "Makanan", harga: "3500", stok: 100 },
      { nama: "Teh Botol Sosro", kode: "TBS001", kategori: "Minuman", harga: "5000", stok: 75 },
      { nama: "Sabun Mandi Lifebuoy", kode: "SML001", kategori: "Kesehatan", harga: "8000", stok: 40 },
      { nama: "Beras Premium 5kg", kode: "BRP001", kategori: "Makanan", harga: "65000", stok: 25 },
      { nama: "Minyak Goreng Tropical 2L", kode: "MGT001", kategori: "Rumah Tangga", harga: "28000", stok: 20 },
      { nama: "Gula Pasir 1kg", kode: "GPS001", kategori: "Makanan", harga: "15000", stok: 35 }
    ];
    products2.forEach((prod) => {
      const product = {
        id: this.currentProductId++,
        nama: prod.nama,
        kode: prod.kode,
        kategori: prod.kategori,
        harga: prod.harga,
        stok: prod.stok,
        deskripsi: `Deskripsi untuk ${prod.nama}`,
        gambar: null,
        isActive: true,
        createdAt: /* @__PURE__ */ new Date()
      };
      this.products.set(product.id, product);
    });
    const customers2 = [
      { nama: "Andi Susanto", email: "andi@email.com", telepon: "08123456789", alamat: "Jl. Merdeka No. 1" },
      { nama: "Siti Nurhaliza", email: "siti@email.com", telepon: "08234567890", alamat: "Jl. Sudirman No. 2" },
      { nama: "Budi Prasetyo", email: "budi@email.com", telepon: "08345678901", alamat: "Jl. Gatot Subroto No. 3" }
    ];
    customers2.forEach((cust) => {
      const customer = {
        id: this.currentCustomerId++,
        nama: cust.nama,
        email: cust.email,
        telepon: cust.telepon,
        alamat: cust.alamat,
        totalPembelian: "0",
        jumlahTransaksi: 0,
        createdAt: /* @__PURE__ */ new Date()
      };
      this.customers.set(customer.id, customer);
    });
  }
  // Users
  async getUsers() {
    return Array.from(this.users.values());
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }
  async createUser(insertUser) {
    const user = {
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
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(user.id, user);
    return user;
  }
  // Products
  async getProducts() {
    return Array.from(this.products.values()).filter((p) => p.isActive);
  }
  async getProduct(id) {
    return this.products.get(id);
  }
  async createProduct(insertProduct) {
    const product = {
      id: this.currentProductId++,
      nama: insertProduct.nama,
      kode: insertProduct.kode,
      kategori: insertProduct.kategori,
      harga: insertProduct.harga,
      stok: insertProduct.stok || 0,
      deskripsi: insertProduct.deskripsi || null,
      gambar: insertProduct.gambar || null,
      isActive: insertProduct.isActive ?? true,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.products.set(product.id, product);
    return product;
  }
  async updateProduct(id, updateData) {
    const product = this.products.get(id);
    if (product) {
      const updatedProduct = { ...product, ...updateData };
      this.products.set(id, updatedProduct);
      return updatedProduct;
    }
    return void 0;
  }
  async deleteProduct(id) {
    const product = this.products.get(id);
    if (product) {
      product.isActive = false;
      this.products.set(id, product);
      return true;
    }
    return false;
  }
  async getProductsByCategory(kategori) {
    return Array.from(this.products.values()).filter((p) => p.kategori === kategori && p.isActive);
  }
  async searchProducts(query) {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(
      (p) => p.isActive && (p.nama.toLowerCase().includes(lowercaseQuery) || p.kode.toLowerCase().includes(lowercaseQuery) || p.kategori.toLowerCase().includes(lowercaseQuery))
    );
  }
  // Categories
  async getCategories() {
    return Array.from(this.categories.values()).filter((c) => c.isActive);
  }
  async createCategory(insertCategory) {
    const category = {
      id: this.currentCategoryId++,
      nama: insertCategory.nama,
      deskripsi: insertCategory.deskripsi || null,
      isActive: insertCategory.isActive ?? true
    };
    this.categories.set(category.id, category);
    return category;
  }
  // Customers
  async getCustomers() {
    return Array.from(this.customers.values());
  }
  async getCustomer(id) {
    return this.customers.get(id);
  }
  async createCustomer(insertCustomer) {
    const customer = {
      id: this.currentCustomerId++,
      nama: insertCustomer.nama,
      email: insertCustomer.email || null,
      telepon: insertCustomer.telepon || null,
      alamat: insertCustomer.alamat || null,
      totalPembelian: "0",
      jumlahTransaksi: 0,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.customers.set(customer.id, customer);
    return customer;
  }
  async updateCustomer(id, updateData) {
    const customer = this.customers.get(id);
    if (customer) {
      const updatedCustomer = { ...customer, ...updateData };
      this.customers.set(id, updatedCustomer);
      return updatedCustomer;
    }
    return void 0;
  }
  async deleteCustomer(id) {
    return this.customers.delete(id);
  }
  // Transactions
  async getTransactions() {
    const transactions2 = Array.from(this.transactions.values());
    const result = [];
    for (const transaction of transactions2) {
      const items = Array.from(this.transactionItems.values()).filter(
        (item) => item.transactionId === transaction.id
      );
      const customer = transaction.customerId ? this.customers.get(transaction.customerId) : void 0;
      const kasir = this.users.get(transaction.kasirId);
      result.push({
        ...transaction,
        items,
        customer,
        kasir
      });
    }
    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  async getTransaction(id) {
    const transaction = this.transactions.get(id);
    if (!transaction) return void 0;
    const items = Array.from(this.transactionItems.values()).filter(
      (item) => item.transactionId === transaction.id
    );
    const customer = transaction.customerId ? this.customers.get(transaction.customerId) : void 0;
    const kasir = this.users.get(transaction.kasirId);
    return {
      ...transaction,
      items,
      customer,
      kasir
    };
  }
  async createTransaction(insertTransaction, items) {
    const nomorTransaksi = `T${Date.now()}`;
    const transaction = {
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
      createdAt: /* @__PURE__ */ new Date()
    };
    this.transactions.set(transaction.id, transaction);
    const transactionItems2 = [];
    for (const item of items) {
      const transactionItem = {
        ...item,
        id: this.currentItemId++,
        transactionId: transaction.id
      };
      this.transactionItems.set(transactionItem.id, transactionItem);
      transactionItems2.push(transactionItem);
      const product = this.products.get(item.productId);
      if (product) {
        product.stok -= item.jumlah;
        this.products.set(product.id, product);
      }
    }
    if (transaction.customerId) {
      const customer2 = this.customers.get(transaction.customerId);
      if (customer2) {
        customer2.totalPembelian = (parseFloat(customer2.totalPembelian) + parseFloat(transaction.total)).toString();
        customer2.jumlahTransaksi += 1;
        this.customers.set(customer2.id, customer2);
      }
    }
    const customer = transaction.customerId ? this.customers.get(transaction.customerId) : void 0;
    const kasir = this.users.get(transaction.kasirId);
    return {
      ...transaction,
      items: transactionItems2,
      customer,
      kasir
    };
  }
  async getTransactionsByDateRange(startDate, endDate) {
    const allTransactions = await this.getTransactions();
    return allTransactions.filter(
      (t) => t.createdAt >= startDate && t.createdAt <= endDate
    );
  }
  // Dashboard Stats
  async getDashboardStats() {
    const today = /* @__PURE__ */ new Date();
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
    const produkTerjual = todayTransactions.reduce(
      (sum, t) => sum + t.items.reduce((itemSum, item) => itemSum + item.jumlah, 0),
      0
    );
    const produkTerjualKemarin = yesterdayTransactions.reduce(
      (sum, t) => sum + t.items.reduce((itemSum, item) => itemSum + item.jumlah, 0),
      0
    );
    const pelangganBaru = todayTransactions.filter((t) => t.customerId).length;
    const pelangganBaruKemarin = yesterdayTransactions.filter((t) => t.customerId).length;
    const calculateGrowth = (today2, yesterday2) => {
      if (yesterday2 === 0) return today2 > 0 ? 100 : 0;
      return (today2 - yesterday2) / yesterday2 * 100;
    };
    return {
      penjualanHarian: penjualanHarian.toString(),
      totalTransaksi,
      produkTerjual,
      pelangganBaru,
      pertumbuhanPenjualan: calculateGrowth(penjualanHarian, penjualanKemarin),
      pertumbuhanTransaksi: calculateGrowth(totalTransaksi, totalTransaksiKemarin),
      pertumbuhanProduk: calculateGrowth(produkTerjual, produkTerjualKemarin),
      pertumbuhanPelanggan: calculateGrowth(pelangganBaru, pelangganBaruKemarin)
    };
  }
  async getTopProducts(limit = 5) {
    const productSales = /* @__PURE__ */ new Map();
    Array.from(this.transactionItems.values()).forEach((item) => {
      const current = productSales.get(item.productId) || 0;
      productSales.set(item.productId, current + item.jumlah);
    });
    const productsWithSales = Array.from(this.products.values()).filter((p) => p.isActive).map((product) => ({
      ...product,
      totalTerjual: productSales.get(product.id) || 0
    })).sort((a, b) => b.totalTerjual - a.totalTerjual).slice(0, limit);
    return productsWithSales;
  }
  async getRecentTransactions(limit = 5) {
    const allTransactions = await this.getTransactions();
    return allTransactions.slice(0, limit);
  }
};
var DatabaseStorage = class {
  async getUsers() {
    return await db.select().from(users);
  }
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async getProducts() {
    return await db.select().from(products).where(eq(products.isActive, true));
  }
  async getProduct(id) {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || void 0;
  }
  async createProduct(insertProduct) {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }
  async updateProduct(id, updateData) {
    const [product] = await db.update(products).set(updateData).where(eq(products.id, id)).returning();
    return product || void 0;
  }
  async deleteProduct(id) {
    const result = await db.update(products).set({ isActive: false }).where(eq(products.id, id));
    return result.rowCount > 0;
  }
  async getProductsByCategory(kategori) {
    return await db.select().from(products).where(
      and(eq(products.kategori, kategori), eq(products.isActive, true))
    );
  }
  async searchProducts(query) {
    return await db.select().from(products).where(
      and(
        sql`${products.nama} ILIKE ${`%${query}%`}`,
        eq(products.isActive, true)
      )
    );
  }
  async getCategories() {
    return await db.select().from(categories).where(eq(categories.isActive, true));
  }
  async createCategory(insertCategory) {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }
  async getCustomers() {
    return await db.select().from(customers);
  }
  async getCustomer(id) {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || void 0;
  }
  async createCustomer(insertCustomer) {
    const [customer] = await db.insert(customers).values(insertCustomer).returning();
    return customer;
  }
  async updateCustomer(id, updateData) {
    const [customer] = await db.update(customers).set(updateData).where(eq(customers.id, id)).returning();
    return customer || void 0;
  }
  async deleteCustomer(id) {
    const result = await db.delete(customers).where(eq(customers.id, id));
    return result.rowCount > 0;
  }
  async getTransactions() {
    const allTransactions = await db.select().from(transactions).orderBy(desc(transactions.createdAt));
    const result = [];
    for (const transaction of allTransactions) {
      const items = await db.select().from(transactionItems).where(eq(transactionItems.transactionId, transaction.id));
      const customer = transaction.customerId ? await this.getCustomer(transaction.customerId) : void 0;
      const kasir = await this.getUser(transaction.kasirId);
      result.push({
        ...transaction,
        items,
        customer,
        kasir
      });
    }
    return result;
  }
  async getTransaction(id) {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    if (!transaction) return void 0;
    const items = await db.select().from(transactionItems).where(eq(transactionItems.transactionId, id));
    const customer = transaction.customerId ? await this.getCustomer(transaction.customerId) : void 0;
    const kasir = await this.getUser(transaction.kasirId);
    return {
      ...transaction,
      items,
      customer,
      kasir
    };
  }
  async createTransaction(insertTransaction, items) {
    const nomorTransaksi = `T${Date.now()}`;
    const [transaction] = await db.insert(transactions).values({
      ...insertTransaction,
      nomorTransaksi
    }).returning();
    const createdItems = [];
    for (const item of items) {
      const [createdItem] = await db.insert(transactionItems).values({
        ...item,
        transactionId: transaction.id
      }).returning();
      createdItems.push(createdItem);
      await db.update(products).set({
        stok: sql`${products.stok} - ${item.jumlah}`
      }).where(eq(products.id, item.productId));
    }
    if (transaction.customerId) {
      await db.update(customers).set({
        totalPembelian: sql`${customers.totalPembelian} + ${transaction.total}`,
        jumlahTransaksi: sql`${customers.jumlahTransaksi} + 1`
      }).where(eq(customers.id, transaction.customerId));
    }
    const customer = transaction.customerId ? await this.getCustomer(transaction.customerId) : void 0;
    const kasir = await this.getUser(transaction.kasirId);
    return {
      ...transaction,
      items: createdItems,
      customer,
      kasir
    };
  }
  async getTransactionsByDateRange(startDate, endDate) {
    const dateTransactions = await db.select().from(transactions).where(
      and(
        gte(transactions.createdAt, startDate),
        lte(transactions.createdAt, endDate)
      )
    ).orderBy(desc(transactions.createdAt));
    const result = [];
    for (const transaction of dateTransactions) {
      const items = await db.select().from(transactionItems).where(eq(transactionItems.transactionId, transaction.id));
      const customer = transaction.customerId ? await this.getCustomer(transaction.customerId) : void 0;
      const kasir = await this.getUser(transaction.kasirId);
      result.push({
        ...transaction,
        items,
        customer,
        kasir
      });
    }
    return result;
  }
  async getDashboardStats() {
    const today = /* @__PURE__ */ new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const todayTransactions = await this.getTransactionsByDateRange(startOfDay, endOfDay);
    const penjualanHarian = todayTransactions.reduce((sum, t) => sum + parseFloat(t.total), 0);
    const totalTransaksi = todayTransactions.length;
    const produkTerjual = todayTransactions.reduce(
      (sum, t) => sum + t.items.reduce((itemSum, item) => itemSum + item.jumlah, 0),
      0
    );
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
      pertumbuhanPenjualan: 0,
      // TODO: Calculate growth
      pertumbuhanTransaksi: 0,
      // TODO: Calculate growth
      pertumbuhanProduk: 0,
      // TODO: Calculate growth
      pertumbuhanPelanggan: 0
      // TODO: Calculate growth
    };
  }
  async getTopProducts(limit = 5) {
    const topProductsQuery = await db.select({
      product: products,
      totalTerjual: sql`COALESCE(SUM(${transactionItems.jumlah}), 0)`
    }).from(products).leftJoin(transactionItems, eq(products.id, transactionItems.productId)).where(eq(products.isActive, true)).groupBy(products.id).orderBy(desc(sql`COALESCE(SUM(${transactionItems.jumlah}), 0)`)).limit(limit);
    return topProductsQuery.map((item) => ({
      ...item.product,
      totalTerjual: item.totalTerjual
    }));
  }
  async getRecentTransactions(limit = 5) {
    const recentTransactions = await db.select().from(transactions).orderBy(desc(transactions.createdAt)).limit(limit);
    const result = [];
    for (const transaction of recentTransactions) {
      const items = await db.select().from(transactionItems).where(eq(transactionItems.transactionId, transaction.id));
      const customer = transaction.customerId ? await this.getCustomer(transaction.customerId) : void 0;
      const kasir = await this.getUser(transaction.kasirId);
      result.push({
        ...transaction,
        items,
        customer,
        kasir
      });
    }
    return result;
  }
};
var storage = process.env.DATABASE_URL && db ? new DatabaseStorage() : new MemStorage();

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  app2.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil statistik dashboard" });
    }
  });
  app2.get("/api/dashboard/top-products", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const topProducts = await storage.getTopProducts(limit);
      res.json(topProducts);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil produk terlaris" });
    }
  });
  app2.get("/api/dashboard/recent-transactions", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const recentTransactions = await storage.getRecentTransactions(limit);
      res.json(recentTransactions);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil transaksi terbaru" });
    }
  });
  app2.get("/api/products", async (req, res) => {
    try {
      const { kategori, search } = req.query;
      let products2;
      if (search) {
        products2 = await storage.searchProducts(search);
      } else if (kategori) {
        products2 = await storage.getProductsByCategory(kategori);
      } else {
        products2 = await storage.getProducts();
      }
      res.json(products2);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data produk" });
    }
  });
  app2.get("/api/products/:id", async (req, res) => {
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
  app2.post("/api/products", async (req, res) => {
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
  app2.put("/api/products/:id", async (req, res) => {
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
  app2.delete("/api/products/:id", async (req, res) => {
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
  app2.get("/api/categories", async (req, res) => {
    try {
      const categories2 = await storage.getCategories();
      res.json(categories2);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data kategori" });
    }
  });
  app2.get("/api/customers", async (req, res) => {
    try {
      const customers2 = await storage.getCustomers();
      res.json(customers2);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data pelanggan" });
    }
  });
  app2.get("/api/customers/:id", async (req, res) => {
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
  app2.post("/api/customers", async (req, res) => {
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
  app2.put("/api/customers/:id", async (req, res) => {
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
  app2.delete("/api/customers/:id", async (req, res) => {
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
  app2.get("/api/transactions", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      let transactions2;
      if (startDate && endDate) {
        transactions2 = await storage.getTransactionsByDateRange(
          new Date(startDate),
          new Date(endDate)
        );
      } else {
        transactions2 = await storage.getTransactions();
      }
      res.json(transactions2);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data transaksi" });
    }
  });
  app2.get("/api/transactions/:id", async (req, res) => {
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
    items: z.array(insertTransactionItemSchema)
  });
  app2.post("/api/transactions", async (req, res) => {
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
  app2.get("/api/reports/sales", async (req, res) => {
    try {
      const { startDate, endDate, groupBy = "day" } = req.query;
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3);
      const end = endDate ? new Date(endDate) : /* @__PURE__ */ new Date();
      const transactions2 = await storage.getTransactionsByDateRange(start, end);
      const salesData = /* @__PURE__ */ new Map();
      transactions2.forEach((transaction) => {
        let dateKey;
        const date = new Date(transaction.createdAt);
        if (groupBy === "day") {
          dateKey = date.toISOString().split("T")[0];
        } else if (groupBy === "week") {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          dateKey = weekStart.toISOString().split("T")[0];
        } else {
          dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
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
  app2.get("/api/users", async (req, res) => {
    try {
      const users2 = await storage.getUsers();
      res.json(users2);
    } catch (error) {
      console.error("Error getting users:", error);
      res.status(500).json({ message: "Failed to get users" });
    }
  });
  app2.get("/api/subscription-plans", async (req, res) => {
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
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/seed.ts
async function seedDatabase() {
  try {
    console.log("Starting database seeding...");
    if (!db) {
      console.log("No database connection available, skipping seeding (using MemStorage)");
      return;
    }
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }
    await db.insert(users).values({
      username: "admin",
      password: "admin123",
      email: "admin@qasir.com",
      nama: "Admin Toko",
      role: "admin",
      subscriptionPlan: "pro_plus",
      subscriptionStatus: "active",
      subscriptionExpiresAt: null,
      isActive: true
    });
    const categoryIds = await db.insert(categories).values([
      { nama: "Makanan", deskripsi: "Produk makanan dan minuman", isActive: true },
      { nama: "Minuman", deskripsi: "Berbagai jenis minuman", isActive: true },
      { nama: "Snack", deskripsi: "Camilan dan makanan ringan", isActive: true },
      { nama: "Sembako", deskripsi: "Kebutuhan pokok sehari-hari", isActive: true },
      { nama: "Personal Care", deskripsi: "Produk perawatan diri", isActive: true }
    ]).returning({ id: categories.id });
    await db.insert(products).values([
      {
        nama: "Roti Tawar Sari Roti",
        kode: "P001",
        kategori: "Makanan",
        harga: "12000",
        stok: 50,
        deskripsi: "Roti tawar berkualitas untuk sarapan",
        isActive: true
      },
      {
        nama: "Indomie Goreng",
        kode: "P002",
        kategori: "Makanan",
        harga: "3500",
        stok: 100,
        deskripsi: "Mie instan rasa ayam bawang",
        isActive: true
      },
      {
        nama: "Aqua 600ml",
        kode: "P003",
        kategori: "Minuman",
        harga: "3000",
        stok: 200,
        deskripsi: "Air mineral dalam kemasan",
        isActive: true
      },
      {
        nama: "Teh Botol Sosro",
        kode: "P004",
        kategori: "Minuman",
        harga: "4500",
        stok: 80,
        deskripsi: "Teh manis dalam botol",
        isActive: true
      },
      {
        nama: "Chitato Sapi Panggang",
        kode: "P005",
        kategori: "Snack",
        harga: "8000",
        stok: 40,
        deskripsi: "Keripik kentang rasa sapi panggang",
        isActive: true
      },
      {
        nama: "Beras Premium 5kg",
        kode: "P006",
        kategori: "Sembako",
        harga: "75000",
        stok: 25,
        deskripsi: "Beras premium kualitas terbaik",
        isActive: true
      },
      {
        nama: "Minyak Goreng Tropical 1L",
        kode: "P007",
        kategori: "Sembako",
        harga: "18000",
        stok: 60,
        deskripsi: "Minyak goreng kelapa sawit",
        isActive: true
      },
      {
        nama: "Sampo Clear Men",
        kode: "P008",
        kategori: "Personal Care",
        harga: "22000",
        stok: 30,
        deskripsi: "Sampo anti ketombe untuk pria",
        isActive: true
      },
      {
        nama: "Sabun Mandi Lifebuoy",
        kode: "P009",
        kategori: "Personal Care",
        harga: "5500",
        stok: 70,
        deskripsi: "Sabun mandi antibakteri",
        isActive: true
      },
      {
        nama: "Susu Ultra Milk 250ml",
        kode: "P010",
        kategori: "Minuman",
        harga: "6500",
        stok: 90,
        deskripsi: "Susu UHT rasa plain",
        isActive: true
      }
    ]);
    await db.insert(customers).values([
      {
        nama: "Andi Susanto",
        email: "andi@email.com",
        telepon: "08123456789",
        alamat: "Jl. Sudirman No. 123, Jakarta",
        totalPembelian: "0",
        jumlahTransaksi: 0
      },
      {
        nama: "Sari Dewi",
        email: "sari@email.com",
        telepon: "08198765432",
        alamat: "Jl. Thamrin No. 456, Jakarta",
        totalPembelian: "0",
        jumlahTransaksi: 0
      },
      {
        nama: "Budi Hartono",
        email: "budi@email.com",
        telepon: "08555123456",
        alamat: "Jl. Gatot Subroto No. 789, Jakarta",
        totalPembelian: "0",
        jumlahTransaksi: 0
      },
      {
        nama: "Lisa Permata",
        email: "lisa@email.com",
        telepon: "08777888999",
        alamat: "Jl. Kuningan No. 321, Jakarta",
        totalPembelian: "0",
        jumlahTransaksi: 0
      },
      {
        nama: "Riko Pratama",
        email: "riko@email.com",
        telepon: "08333444555",
        alamat: "Jl. Senayan No. 654, Jakarta",
        totalPembelian: "0",
        jumlahTransaksi: 0
      }
    ]);
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}
var runSeed = async () => {
  try {
    await seedDatabase();
    console.log("Seeding finished");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeed();
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  await seedDatabase();
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000");
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
