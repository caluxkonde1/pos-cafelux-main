var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  backupLogs: () => backupLogs,
  categories: () => categories,
  customers: () => customers,
  dashboardStats: () => dashboardStats,
  discounts: () => discounts,
  features: () => features,
  insertBackupLogSchema: () => insertBackupLogSchema,
  insertCategorySchema: () => insertCategorySchema,
  insertCustomerSchema: () => insertCustomerSchema,
  insertDiscountSchema: () => insertDiscountSchema,
  insertFeatureSchema: () => insertFeatureSchema,
  insertOutletSchema: () => insertOutletSchema,
  insertPrinterSettingSchema: () => insertPrinterSettingSchema,
  insertProductSchema: () => insertProductSchema,
  insertStockMovementSchema: () => insertStockMovementSchema,
  insertSubscriptionPlanSchema: () => insertSubscriptionPlanSchema,
  insertTransactionItemSchema: () => insertTransactionItemSchema,
  insertTransactionSchema: () => insertTransactionSchema,
  insertUserSchema: () => insertUserSchema,
  outlets: () => outlets,
  printerSettings: () => printerSettings,
  products: () => products,
  stockMovements: () => stockMovements,
  subscriptionPlans: () => subscriptionPlans,
  transactionItems: () => transactionItems,
  transactions: () => transactions,
  users: () => users
});
import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var outlets, users, products, categories, customers, transactions, transactionItems, dashboardStats, subscriptionPlans, features, stockMovements, discounts, backupLogs, printerSettings, insertUserSchema, insertProductSchema, insertCategorySchema, insertCustomerSchema, insertTransactionSchema, insertTransactionItemSchema, insertSubscriptionPlanSchema, insertFeatureSchema, insertOutletSchema, insertStockMovementSchema, insertDiscountSchema, insertBackupLogSchema, insertPrinterSettingSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    outlets = pgTable("outlets", {
      id: serial("id").primaryKey(),
      nama: text("nama").notNull(),
      alamat: text("alamat").notNull(),
      telepon: text("telepon"),
      email: text("email"),
      kodeOutlet: text("kode_outlet").notNull().unique(),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      username: text("username").notNull().unique(),
      password: text("password").notNull(),
      email: text("email").notNull().unique(),
      nama: text("nama").notNull(),
      role: text("role", { enum: ["admin", "kasir", "supervisor", "pemilik"] }).notNull().default("kasir"),
      outletId: integer("outlet_id").references(() => outlets.id),
      subscriptionPlan: text("subscription_plan", { enum: ["free", "pro", "pro_plus"] }).notNull().default("free"),
      subscriptionStatus: text("subscription_status", { enum: ["active", "inactive", "trial"] }).notNull().default("trial"),
      subscriptionExpiresAt: timestamp("subscription_expires_at"),
      permissions: jsonb("permissions").notNull().default("{}"),
      // Role-based permissions
      lastLogin: timestamp("last_login"),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    products = pgTable("products", {
      id: serial("id").primaryKey(),
      nama: text("nama").notNull(),
      kode: text("kode").notNull().unique(),
      barcode: text("barcode").unique(),
      kategoriId: integer("kategori_id").notNull().references(() => categories.id),
      kategori: text("kategori").notNull(),
      // Keep for backward compatibility
      harga: decimal("harga", { precision: 10, scale: 2 }).notNull(),
      hargaBeli: decimal("harga_beli", { precision: 10, scale: 2 }),
      stok: integer("stok").notNull().default(0),
      stokMinimal: integer("stok_minimal").notNull().default(5),
      satuan: text("satuan").notNull().default("pcs"),
      deskripsi: text("deskripsi"),
      gambar: text("gambar"),
      pajak: decimal("pajak", { precision: 5, scale: 2 }).default("0"),
      // Tax percentage
      diskonMaksimal: decimal("diskon_maksimal", { precision: 5, scale: 2 }).default("0"),
      outletId: integer("outlet_id").references(() => outlets.id),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    categories = pgTable("categories", {
      id: serial("id").primaryKey(),
      nama: text("nama").notNull(),
      deskripsi: text("deskripsi"),
      warna: text("warna").default("#ef4444"),
      sort_order: integer("sort_order").default(0),
      isActive: boolean("is_active").notNull().default(true)
    });
    customers = pgTable("customers", {
      id: serial("id").primaryKey(),
      nama: text("nama").notNull(),
      email: text("email"),
      telepon: text("telepon"),
      alamat: text("alamat"),
      totalPembelian: decimal("total_pembelian", { precision: 12, scale: 2 }).notNull().default("0"),
      jumlahTransaksi: integer("jumlah_transaksi").notNull().default(0),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    transactions = pgTable("transactions", {
      id: serial("id").primaryKey(),
      nomorTransaksi: text("nomor_transaksi").notNull().unique(),
      customerId: integer("customer_id").references(() => customers.id),
      kasirId: integer("kasir_id").notNull().references(() => users.id),
      outletId: integer("outlet_id").references(() => outlets.id),
      subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
      pajak: decimal("pajak", { precision: 12, scale: 2 }).notNull().default("0"),
      diskon: decimal("diskon", { precision: 12, scale: 2 }).notNull().default("0"),
      diskonPersen: decimal("diskon_persen", { precision: 5, scale: 2 }).default("0"),
      total: decimal("total", { precision: 12, scale: 2 }).notNull(),
      metodePembayaran: text("metode_pembayaran").notNull(),
      // tunai, kartu, ewallet, qris
      jumlahBayar: decimal("jumlah_bayar", { precision: 12, scale: 2 }),
      kembalian: decimal("kembalian", { precision: 12, scale: 2 }).default("0"),
      catatan: text("catatan"),
      status: text("status").notNull().default("completed"),
      // pending, completed, cancelled, refund
      isPrinted: boolean("is_printed").notNull().default(false),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    transactionItems = pgTable("transaction_items", {
      id: serial("id").primaryKey(),
      transactionId: integer("transaction_id").notNull().references(() => transactions.id),
      productId: integer("product_id").notNull().references(() => products.id),
      namaProduk: text("nama_produk").notNull(),
      harga: decimal("harga", { precision: 10, scale: 2 }).notNull(),
      jumlah: integer("jumlah").notNull(),
      subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull()
    });
    dashboardStats = pgTable("dashboard_stats", {
      id: serial("id").primaryKey(),
      tanggal: timestamp("tanggal").notNull(),
      penjualanHarian: decimal("penjualan_harian", { precision: 12, scale: 2 }).notNull(),
      totalTransaksi: integer("total_transaksi").notNull(),
      produkTerjual: integer("produk_terjual").notNull(),
      pelangganBaru: integer("pelanggan_baru").notNull()
    });
    subscriptionPlans = pgTable("subscription_plans", {
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
    features = pgTable("features", {
      id: serial("id").primaryKey(),
      name: text("name").notNull().unique(),
      displayName: text("display_name").notNull(),
      description: text("description"),
      category: text("category").notNull(),
      // "basic", "analytics", "advanced", "integration"
      isActive: boolean("is_active").notNull().default(true)
    });
    stockMovements = pgTable("stock_movements", {
      id: serial("id").primaryKey(),
      productId: integer("product_id").notNull().references(() => products.id),
      outletId: integer("outlet_id").references(() => outlets.id),
      type: text("type").notNull(),
      // "in", "out", "adjustment", "transfer"
      quantity: integer("quantity").notNull(),
      quantityBefore: integer("quantity_before").notNull(),
      quantityAfter: integer("quantity_after").notNull(),
      reason: text("reason"),
      // "purchase", "sale", "adjustment", "transfer", "expired"
      referenceId: integer("reference_id"),
      // Transaction ID or other reference
      userId: integer("user_id").notNull().references(() => users.id),
      catatan: text("catatan"),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    discounts = pgTable("discounts", {
      id: serial("id").primaryKey(),
      nama: text("nama").notNull(),
      type: text("type").notNull(),
      // "percentage", "fixed"
      value: decimal("value", { precision: 10, scale: 2 }).notNull(),
      minPurchase: decimal("min_purchase", { precision: 12, scale: 2 }).default("0"),
      maxDiscount: decimal("max_discount", { precision: 12, scale: 2 }),
      startDate: timestamp("start_date"),
      endDate: timestamp("end_date"),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    backupLogs = pgTable("backup_logs", {
      id: serial("id").primaryKey(),
      type: text("type").notNull(),
      // "manual", "automatic"
      status: text("status").notNull(),
      // "success", "failed", "in_progress"
      filePath: text("file_path"),
      fileSize: integer("file_size"),
      errorMessage: text("error_message"),
      userId: integer("user_id").references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    printerSettings = pgTable("printer_settings", {
      id: serial("id").primaryKey(),
      outletId: integer("outlet_id").notNull().references(() => outlets.id),
      printerName: text("printer_name").notNull(),
      printerType: text("printer_type").notNull(),
      // "thermal", "inkjet", "laser"
      paperSize: text("paper_size").notNull().default("80mm"),
      isDefault: boolean("is_default").notNull().default(false),
      settings: jsonb("settings").notNull().default("{}"),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      createdAt: true
    });
    insertProductSchema = createInsertSchema(products).omit({
      id: true,
      createdAt: true
    });
    insertCategorySchema = createInsertSchema(categories).omit({
      id: true
    });
    insertCustomerSchema = createInsertSchema(customers).omit({
      id: true,
      totalPembelian: true,
      jumlahTransaksi: true,
      createdAt: true
    });
    insertTransactionSchema = createInsertSchema(transactions).omit({
      id: true,
      nomorTransaksi: true,
      createdAt: true
    });
    insertTransactionItemSchema = createInsertSchema(transactionItems).omit({
      id: true,
      transactionId: true
      // This will be set by the backend
    });
    insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
      id: true,
      createdAt: true
    });
    insertFeatureSchema = createInsertSchema(features).omit({
      id: true
    });
    insertOutletSchema = createInsertSchema(outlets).omit({
      id: true,
      createdAt: true
    });
    insertStockMovementSchema = createInsertSchema(stockMovements).omit({
      id: true,
      createdAt: true
    });
    insertDiscountSchema = createInsertSchema(discounts).omit({
      id: true,
      createdAt: true
    });
    insertBackupLogSchema = createInsertSchema(backupLogs).omit({
      id: true,
      createdAt: true
    });
    insertPrinterSettingSchema = createInsertSchema(printerSettings).omit({
      id: true,
      createdAt: true
    });
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  db: () => db,
  getDatabaseStatus: () => getDatabaseStatus,
  isDatabaseConnected: () => isDatabaseConnected,
  pool: () => pool
});
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
function isDatabaseConnected() {
  return db !== null && pool !== null;
}
function getDatabaseStatus() {
  if (isDatabaseConnected()) {
    return "Connected to Supabase PostgreSQL";
  } else if (skipDatabase) {
    return "Database connection skipped";
  } else {
    return "Using MemStorage (fallback)";
  }
}
var pool, db, skipDatabase, databaseUrl;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    pool = null;
    db = null;
    skipDatabase = process.env.SKIP_DATABASE === "true";
    databaseUrl = process.env.DATABASE_URL?.trim();
    if (!skipDatabase && databaseUrl && databaseUrl.length > 0) {
      try {
        console.log("\u{1F517} Connecting to Supabase PostgreSQL database...");
        pool = new Pool({
          connectionString: databaseUrl,
          ssl: {
            rejectUnauthorized: false
          },
          max: 20,
          idleTimeoutMillis: 3e4,
          connectionTimeoutMillis: 2e3
        });
        db = drizzle(pool, { schema: schema_exports });
        console.log("\u2705 Supabase PostgreSQL database connection initialized successfully");
        pool.query("SELECT NOW()", (err, result) => {
          if (err) {
            console.error("\u274C Database connection test failed:", err.message);
          } else {
            console.log("\u2705 Database connection test successful:", result.rows[0].now);
          }
        });
      } catch (error) {
        console.error("\u274C Failed to initialize Supabase database connection:", error instanceof Error ? error.message : String(error));
        console.log("\u26A0\uFE0F Falling back to MemStorage");
        pool = null;
        db = null;
      }
    } else {
      if (skipDatabase) {
        console.log("\u{1F4E6} Database connection skipped (SKIP_DATABASE=true), using MemStorage");
      } else {
        console.log("\u26A0\uFE0F DATABASE_URL not provided, using MemStorage instead");
        console.log("\u{1F4A1} Please set DATABASE_URL environment variable to connect to Supabase");
      }
    }
  }
});

// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
init_schema();
init_db();
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
      outletId: null,
      subscriptionPlan: "pro_plus",
      subscriptionStatus: "active",
      subscriptionExpiresAt: null,
      permissions: {},
      lastLogin: null,
      isActive: true,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(admin.id, admin);
    const categories2 = [
      { nama: "Makanan", deskripsi: "Produk makanan dan snack", warna: "#ef4444" },
      { nama: "Minuman", deskripsi: "Minuman segar dan sehat", warna: "#10b981" },
      { nama: "Elektronik", deskripsi: "Perangkat elektronik", warna: "#3b82f6" },
      { nama: "Rumah Tangga", deskripsi: "Keperluan rumah tangga", warna: "#f59e0b" },
      { nama: "Kesehatan", deskripsi: "Produk kesehatan dan kebersihan", warna: "#8b5cf6" }
    ];
    categories2.forEach((cat) => {
      const category = {
        id: this.currentCategoryId++,
        nama: cat.nama,
        deskripsi: cat.deskripsi,
        warna: cat.warna,
        sort_order: this.currentCategoryId,
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
        barcode: null,
        kategoriId: 1,
        // Default to first category
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
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
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
      outletId: insertUser.outletId || null,
      subscriptionPlan: insertUser.subscriptionPlan || "free",
      subscriptionStatus: insertUser.subscriptionStatus || "trial",
      subscriptionExpiresAt: insertUser.subscriptionExpiresAt || null,
      permissions: insertUser.permissions || {},
      lastLogin: null,
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
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
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
  async getProductByBarcode(barcode) {
    return Array.from(this.products.values()).find((p) => p.barcode === barcode && p.isActive);
  }
  async getLowStockProducts(outletId) {
    return Array.from(this.products.values()).filter(
      (p) => p.isActive && p.stok <= p.stokMinimal
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
      warna: insertCategory.warna || "#ef4444",
      sort_order: this.currentCategoryId,
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
  async markTransactionAsPrinted(id) {
    const transaction = this.transactions.get(id);
    if (transaction) {
      transaction.isPrinted = true;
      this.transactions.set(id, transaction);
      return true;
    }
    return false;
  }
  // Outlets - Mock implementation
  async getOutlets() {
    return [{
      id: 1,
      nama: "Outlet Utama",
      alamat: "Jl. Utama No. 1",
      telepon: null,
      email: null,
      kodeOutlet: "OUT001",
      isActive: true,
      createdAt: /* @__PURE__ */ new Date()
    }];
  }
  async getOutlet(id) {
    if (id === 1) {
      return {
        id: 1,
        nama: "Outlet Utama",
        alamat: "Jl. Utama No. 1",
        telepon: null,
        email: null,
        kodeOutlet: "OUT001",
        isActive: true,
        createdAt: /* @__PURE__ */ new Date()
      };
    }
    return void 0;
  }
  async createOutlet(outlet) {
    return {
      id: Date.now(),
      nama: outlet.nama,
      alamat: outlet.alamat,
      telepon: outlet.telepon || null,
      email: outlet.email || null,
      kodeOutlet: outlet.kodeOutlet,
      isActive: outlet.isActive ?? true,
      createdAt: /* @__PURE__ */ new Date()
    };
  }
  // Stock Movements - Mock implementation
  async getStockMovements(filters) {
    return [];
  }
  async createStockMovement(movement) {
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
      createdAt: /* @__PURE__ */ new Date()
    };
  }
  // Discounts - Mock implementation
  async getDiscounts(isActive) {
    return [];
  }
  async getDiscount(id) {
    return void 0;
  }
  async createDiscount(discount) {
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
      createdAt: /* @__PURE__ */ new Date()
    };
  }
  async updateDiscount(id, discount) {
    return void 0;
  }
  async applyDiscount(discountId, subtotal) {
    return { discountAmount: 0, finalTotal: subtotal };
  }
  // Reports - Mock implementation
  async getProfitReport(startDate, endDate, outletId) {
    return { profit: 0, revenue: 0, cost: 0 };
  }
  async getStockMovementReport(startDate, endDate, outletId, type) {
    return [];
  }
  // Printer Settings - Mock implementation
  async getPrinterSettings(outletId) {
    return [];
  }
  async createPrinterSetting(setting) {
    return {
      id: Date.now(),
      outletId: setting.outletId,
      printerName: setting.printerName,
      printerType: setting.printerType,
      paperSize: setting.paperSize || "80mm",
      isActive: setting.isActive ?? true,
      isDefault: setting.isDefault ?? false,
      settings: setting.settings || {},
      createdAt: /* @__PURE__ */ new Date()
    };
  }
  async generateReceiptData(transactionId) {
    return { receiptData: "Mock receipt data" };
  }
  // Backup - Mock implementation
  async getBackupLogs() {
    return [];
  }
  async createBackup(type, userId) {
    return {
      id: Date.now(),
      type,
      userId: userId || null,
      status: "completed",
      filePath: null,
      fileSize: null,
      errorMessage: null,
      createdAt: /* @__PURE__ */ new Date()
    };
  }
  // Multi-outlet sync - Mock implementation
  async syncOutletData(sourceOutletId, targetOutletId, dataTypes) {
    return { success: true, message: "Sync completed" };
  }
  // Cash Entries - Mock implementation
  async getCashEntries(date) {
    const mockEntries = [
      {
        id: 1,
        tanggal: date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        waktu: "09:00:00",
        jenis: "masuk",
        kategori: "Modal Awal",
        deskripsi: "Modal kas awal hari",
        jumlah: 5e5,
        saldo: 5e5,
        kasir: "Admin Toko",
        referensi: null,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: 2,
        tanggal: date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        waktu: "10:30:22",
        jenis: "masuk",
        kategori: "Penjualan",
        deskripsi: "Penjualan tunai",
        jumlah: 25e3,
        saldo: 525e3,
        kasir: "Admin Toko",
        referensi: "T1752132320001",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    return mockEntries.filter((entry) => !date || entry.tanggal === date);
  }
  async addCashEntry(entry) {
    return {
      id: Date.now(),
      ...entry,
      saldo: 5e5,
      // Mock saldo calculation
      kasir: "Admin Toko",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
};
var DatabaseStorage = class {
  // Import database connection
  db = (init_db(), __toCommonJS(db_exports)).db;
  async getUsers() {
    return await this.db.select().from(users);
  }
  async getUser(id) {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await this.db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await this.db.insert(users).values(insertUser).returning();
    return user;
  }
  async getProducts() {
    return await this.db.select().from(products).where(eq(products.isActive, true));
  }
  async getProduct(id) {
    const [product] = await this.db.select().from(products).where(eq(products.id, id));
    return product || void 0;
  }
  async createProduct(insertProduct) {
    const [product] = await this.db.insert(products).values(insertProduct).returning();
    return product;
  }
  async updateProduct(id, updateData) {
    const [product] = await this.db.update(products).set(updateData).where(eq(products.id, id)).returning();
    return product || void 0;
  }
  async deleteProduct(id) {
    const result = await this.db.update(products).set({ isActive: false }).where(eq(products.id, id));
    return result.rowCount > 0;
  }
  async getProductsByCategory(kategori) {
    return await this.db.select().from(products).where(
      and(eq(products.kategori, kategori), eq(products.isActive, true))
    );
  }
  async searchProducts(query) {
    return await this.db.select().from(products).where(
      and(
        sql`${products.nama} ILIKE ${`%${query}%`}`,
        eq(products.isActive, true)
      )
    );
  }
  async getProductByBarcode(barcode) {
    const [product] = await this.db.select().from(products).where(
      and(eq(products.barcode, barcode), eq(products.isActive, true))
    );
    return product || void 0;
  }
  async getLowStockProducts(outletId) {
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
  async getCategories() {
    return await this.db.select().from(categories).where(eq(categories.isActive, true));
  }
  async createCategory(insertCategory) {
    const [category] = await this.db.insert(categories).values(insertCategory).returning();
    return category;
  }
  async getCustomers() {
    return await this.db.select().from(customers);
  }
  async getCustomer(id) {
    const [customer] = await this.db.select().from(customers).where(eq(customers.id, id));
    return customer || void 0;
  }
  async createCustomer(insertCustomer) {
    const [customer] = await this.db.insert(customers).values(insertCustomer).returning();
    return customer;
  }
  async updateCustomer(id, updateData) {
    const [customer] = await this.db.update(customers).set(updateData).where(eq(customers.id, id)).returning();
    return customer || void 0;
  }
  async deleteCustomer(id) {
    const result = await this.db.delete(customers).where(eq(customers.id, id));
    return result.rowCount > 0;
  }
  async getTransactions() {
    const allTransactions = await this.db.select().from(transactions).orderBy(desc(transactions.createdAt));
    const result = [];
    for (const transaction of allTransactions) {
      const items = await this.db.select().from(transactionItems).where(eq(transactionItems.transactionId, transaction.id));
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
    const [transaction] = await this.db.select().from(transactions).where(eq(transactions.id, id));
    if (!transaction) return void 0;
    const items = await this.db.select().from(transactionItems).where(eq(transactionItems.transactionId, id));
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
    const [transaction] = await this.db.insert(transactions).values({
      ...insertTransaction,
      nomorTransaksi
    }).returning();
    const createdItems = [];
    for (const item of items) {
      const [createdItem] = await this.db.insert(transactionItems).values({
        ...item,
        transactionId: transaction.id
      }).returning();
      createdItems.push(createdItem);
      await this.db.update(products).set({
        stok: sql`${products.stok} - ${item.jumlah}`
      }).where(eq(products.id, item.productId));
    }
    if (transaction.customerId) {
      await this.db.update(customers).set({
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
    const dateTransactions = await this.db.select().from(transactions).where(
      and(
        gte(transactions.createdAt, startDate),
        lte(transactions.createdAt, endDate)
      )
    ).orderBy(desc(transactions.createdAt));
    const result = [];
    for (const transaction of dateTransactions) {
      const items = await this.db.select().from(transactionItems).where(eq(transactionItems.transactionId, transaction.id));
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
  async markTransactionAsPrinted(id) {
    const result = await this.db.update(transactions).set({ isPrinted: true }).where(eq(transactions.id, id));
    return result.rowCount > 0;
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
    const topProductsQuery = await this.db.select({
      product: products,
      totalTerjual: sql`COALESCE(SUM(${transactionItems.jumlah}), 0)`
    }).from(products).leftJoin(transactionItems, eq(products.id, transactionItems.productId)).where(eq(products.isActive, true)).groupBy(products.id).orderBy(desc(sql`COALESCE(SUM(${transactionItems.jumlah}), 0)`)).limit(limit);
    return topProductsQuery.map((item) => ({
      ...item.product,
      totalTerjual: item.totalTerjual
    }));
  }
  async getRecentTransactions(limit = 5) {
    const recentTransactions = await this.db.select().from(transactions).orderBy(desc(transactions.createdAt)).limit(limit);
    const result = [];
    for (const transaction of recentTransactions) {
      const items = await this.db.select().from(transactionItems).where(eq(transactionItems.transactionId, transaction.id));
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
  // Outlets
  async getOutlets() {
    return await this.db.select().from(outlets).where(eq(outlets.isActive, true));
  }
  async getOutlet(id) {
    const [outlet] = await this.db.select().from(outlets).where(eq(outlets.id, id));
    return outlet || void 0;
  }
  async createOutlet(insertOutlet) {
    const [outlet] = await this.db.insert(outlets).values(insertOutlet).returning();
    return outlet;
  }
  // Stock Movements
  async getStockMovements(filters) {
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
  async createStockMovement(insertMovement) {
    const [movement] = await this.db.insert(stockMovements).values(insertMovement).returning();
    return movement;
  }
  // Discounts
  async getDiscounts(isActive) {
    let query = this.db.select().from(discounts);
    if (isActive !== void 0) {
      query = query.where(eq(discounts.isActive, isActive));
    }
    return await query.orderBy(desc(discounts.createdAt));
  }
  async getDiscount(id) {
    const [discount] = await this.db.select().from(discounts).where(eq(discounts.id, id));
    return discount || void 0;
  }
  async createDiscount(insertDiscount) {
    const [discount] = await this.db.insert(discounts).values(insertDiscount).returning();
    return discount;
  }
  async updateDiscount(id, updateData) {
    const [discount] = await this.db.update(discounts).set(updateData).where(eq(discounts.id, id)).returning();
    return discount || void 0;
  }
  async applyDiscount(discountId, subtotal) {
    const discount = await this.getDiscount(discountId);
    if (!discount || !discount.isActive) {
      return { discountAmount: 0, finalTotal: subtotal };
    }
    let discountAmount = 0;
    if (discount.type === "percentage") {
      discountAmount = subtotal * parseFloat(discount.value) / 100;
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
  async getProfitReport(startDate, endDate, outletId) {
    return { profit: 0, revenue: 0, cost: 0 };
  }
  async getStockMovementReport(startDate, endDate, outletId, type) {
    return await this.getStockMovements({ startDate, endDate, outletId, type });
  }
  // Printer Settings
  async getPrinterSettings(outletId) {
    let query = this.db.select().from(printerSettings).where(eq(printerSettings.isActive, true));
    if (outletId) {
      query = query.where(eq(printerSettings.outletId, outletId));
    }
    return await query;
  }
  async createPrinterSetting(insertSetting) {
    const [setting] = await this.db.insert(printerSettings).values(insertSetting).returning();
    return setting;
  }
  async generateReceiptData(transactionId) {
    const transaction = await this.getTransaction(transactionId);
    return { transaction, receiptData: "Receipt data generated" };
  }
  // Backup
  async getBackupLogs() {
    return await this.db.select().from(backupLogs).orderBy(desc(backupLogs.createdAt));
  }
  async createBackup(type, userId) {
    const [backup] = await this.db.insert(backupLogs).values({
      type,
      userId: userId || null,
      status: "completed",
      filePath: null,
      fileSize: null,
      errorMessage: null
    }).returning();
    return backup;
  }
  // Multi-outlet sync
  async syncOutletData(sourceOutletId, targetOutletId, dataTypes) {
    return { success: true, message: "Sync completed", dataTypes };
  }
  // Cash Entries
  async getCashEntries(date) {
    const mockEntries = [
      {
        id: 1,
        tanggal: date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        waktu: "09:00:00",
        jenis: "masuk",
        kategori: "Modal Awal",
        deskripsi: "Modal kas awal hari",
        jumlah: 5e5,
        saldo: 5e5,
        kasir: "Admin Toko",
        referensi: null,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: 2,
        tanggal: date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        waktu: "10:30:22",
        jenis: "masuk",
        kategori: "Penjualan",
        deskripsi: "Penjualan tunai",
        jumlah: 25e3,
        saldo: 525e3,
        kasir: "Admin Toko",
        referensi: "T1752132320001",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    return mockEntries.filter((entry) => !date || entry.tanggal === date);
  }
  async addCashEntry(entry) {
    return {
      id: Date.now(),
      ...entry,
      saldo: 5e5,
      // Mock saldo calculation
      kasir: "Admin Toko",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
};
var storage;
try {
  if (isDatabaseConnected()) {
    console.log("\u{1F5C4}\uFE0F Using DatabaseStorage with Supabase PostgreSQL");
    storage = new DatabaseStorage();
  } else {
    console.log("\u{1F4E6} Using MemStorage as fallback");
    storage = new MemStorage();
  }
  console.log(`\u{1F4CA} Storage Status: ${getDatabaseStatus()}`);
} catch (error) {
  console.log("\u26A0\uFE0F Failed to initialize storage, using MemStorage:", error);
  storage = new MemStorage();
}

// server/routes.ts
init_schema();
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
  app2.patch("/api/products/:id/stock", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { stok, userRole } = req.body;
      if (!userRole || userRole !== "pemilik" && userRole !== "admin") {
        return res.status(403).json({
          message: "Akses ditolak. Hanya pemilik dan admin yang dapat mengubah stok."
        });
      }
      if (typeof stok !== "number" || stok < 0) {
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
  app2.get("/api/categories", async (req, res) => {
    try {
      const categories2 = await storage.getCategories();
      res.json(categories2);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data kategori" });
    }
  });
  app2.post("/api/categories", async (req, res) => {
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
  app2.get("/api/transactions/export", async (req, res) => {
    try {
      const { startDate, endDate, status } = req.query;
      let transactions2;
      if (startDate && endDate) {
        transactions2 = await storage.getTransactionsByDateRange(
          new Date(startDate),
          new Date(endDate)
        );
      } else {
        transactions2 = await storage.getTransactions();
      }
      if (status && status !== "all") {
        transactions2 = transactions2.filter((t) => t.status === status);
      }
      const csvHeader = "Nomor Transaksi,Tanggal,Kasir,Pelanggan,Metode Pembayaran,Subtotal,Pajak,Diskon,Total,Status\n";
      const csvRows = transactions2.map((t) => {
        const date = new Date(t.createdAt).toLocaleDateString("id-ID");
        const customer = t.customer?.nama || "Umum";
        return `${t.nomorTransaksi},${date},${t.kasir.nama},${customer},${t.metodePembayaran},${t.subtotal},${t.pajak},${t.diskon},${t.total},${t.status}`;
      }).join("\n");
      const csvContent = csvHeader + csvRows;
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=transactions.csv");
      res.send(csvContent);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ message: "Gagal mengexport transaksi" });
    }
  });
  app2.post("/api/transactions/:id/print", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.markTransactionAsPrinted(id);
      if (!success) {
        return res.status(404).json({ message: "Transaksi tidak ditemukan" });
      }
      res.json({ message: "Transaksi berhasil ditandai sebagai tercetak" });
    } catch (error) {
      console.error("Print error:", error);
      res.status(500).json({ message: "Gagal mencetak transaksi" });
    }
  });
  app2.get("/api/cash-entries", async (req, res) => {
    try {
      const { date } = req.query;
      const entries = await storage.getCashEntries(date);
      res.json(entries);
    } catch (error) {
      console.error("Get cash entries error:", error);
      res.status(500).json({ message: "Gagal mengambil data kas" });
    }
  });
  app2.post("/api/cash-entries", async (req, res) => {
    try {
      const { jenis, kategori, deskripsi, jumlah, referensi } = req.body;
      const entry = await storage.addCashEntry({
        jenis,
        kategori,
        deskripsi,
        jumlah: parseFloat(jumlah),
        referensi,
        kasir: "Current User"
        // TODO: Get from session
      });
      res.status(201).json(entry);
    } catch (error) {
      console.error("Add cash entry error:", error);
      res.status(500).json({ message: "Gagal menambah transaksi kas" });
    }
  });
  app2.get("/api/cash-entries/export", async (req, res) => {
    try {
      const { date } = req.query;
      const entries = await storage.getCashEntries(date);
      const csvHeader = "Tanggal,Waktu,Jenis,Kategori,Deskripsi,Jumlah,Saldo,Kasir,Referensi\n";
      const csvRows = entries.map((entry) => {
        const tanggal = new Date(entry.createdAt).toLocaleDateString("id-ID");
        const waktu = new Date(entry.createdAt).toLocaleTimeString("id-ID");
        return `${tanggal},${waktu},${entry.jenis},${entry.kategori},"${entry.deskripsi}",${entry.jumlah},${entry.saldo},${entry.kasir},${entry.referensi || ""}`;
      }).join("\n");
      const csvContent = csvHeader + csvRows;
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=cash-entries.csv");
      res.send(csvContent);
    } catch (error) {
      console.error("Export cash entries error:", error);
      res.status(500).json({ message: "Gagal mengexport data kas" });
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
  app2.post("/api/wallet/integrate/:provider", async (req, res) => {
    try {
      const { provider } = req.params;
      const { merchantId, callbackUrl } = req.body;
      if (!["gopay", "dana"].includes(provider)) {
        return res.status(400).json({ message: "Provider tidak didukung" });
      }
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
      res.json({
        success: true,
        provider,
        integrationUrl: integrationData[provider].integrationUrl,
        message: `Integrasi ${provider.toUpperCase()} berhasil dimulai`
      });
    } catch (error) {
      console.error("Wallet integration error:", error);
      res.status(500).json({ message: "Gagal mengintegrasikan wallet" });
    }
  });
  app2.post("/api/wallet/callback", async (req, res) => {
    try {
      const { provider, status, merchantId, accessToken } = req.body;
      if (status === "success") {
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
  app2.get("/api/wallet/balance/:provider", async (req, res) => {
    try {
      const { provider } = req.params;
      const balanceData = {
        gopay: {
          balance: 25e5,
          currency: "IDR",
          lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
        },
        dana: {
          balance: 175e4,
          currency: "IDR",
          lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
        }
      };
      res.json({
        success: true,
        provider,
        data: balanceData[provider] || { balance: 0, currency: "IDR" }
      });
    } catch (error) {
      console.error("Get wallet balance error:", error);
      res.status(500).json({ message: "Gagal mengambil saldo wallet" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/enhanced-routes.ts
init_schema();
import { z as z2 } from "zod";
function registerEnhancedRoutes(app2) {
  app2.post("/api/auth/login", async (req, res) => {
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
  app2.get("/api/auth/permissions/:userId", async (req, res) => {
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
  app2.get("/api/outlets", async (req, res) => {
    try {
      const outlets2 = await storage.getOutlets();
      res.json(outlets2);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data outlet" });
    }
  });
  app2.post("/api/outlets", async (req, res) => {
    try {
      const validatedData = insertOutletSchema.parse(req.body);
      const outlet = await storage.createOutlet(validatedData);
      res.status(201).json(outlet);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Data tidak valid", errors: error.errors });
      }
      res.status(500).json({ message: "Gagal membuat outlet" });
    }
  });
  app2.get("/api/stock-movements", async (req, res) => {
    try {
      const { productId, outletId, type, startDate, endDate } = req.query;
      const movements = await storage.getStockMovements({
        productId: productId ? parseInt(productId) : void 0,
        outletId: outletId ? parseInt(outletId) : void 0,
        type,
        startDate: startDate ? new Date(startDate) : void 0,
        endDate: endDate ? new Date(endDate) : void 0
      });
      res.json(movements);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data pergerakan stok" });
    }
  });
  app2.post("/api/stock-movements", async (req, res) => {
    try {
      const validatedData = insertStockMovementSchema.parse(req.body);
      const movement = await storage.createStockMovement(validatedData);
      res.status(201).json(movement);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Data tidak valid", errors: error.errors });
      }
      res.status(500).json({ message: "Gagal membuat pergerakan stok" });
    }
  });
  app2.get("/api/products/low-stock", async (req, res) => {
    try {
      const { outletId } = req.query;
      const products2 = await storage.getLowStockProducts(
        outletId ? parseInt(outletId) : void 0
      );
      res.json(products2);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil produk stok rendah" });
    }
  });
  app2.get("/api/discounts", async (req, res) => {
    try {
      const { isActive } = req.query;
      const discounts2 = await storage.getDiscounts(
        isActive ? isActive === "true" : void 0
      );
      res.json(discounts2);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil data diskon" });
    }
  });
  app2.post("/api/discounts", async (req, res) => {
    try {
      const validatedData = insertDiscountSchema.parse(req.body);
      const discount = await storage.createDiscount(validatedData);
      res.status(201).json(discount);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Data tidak valid", errors: error.errors });
      }
      res.status(500).json({ message: "Gagal membuat diskon" });
    }
  });
  app2.put("/api/discounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDiscountSchema.partial().parse(req.body);
      const discount = await storage.updateDiscount(id, validatedData);
      if (!discount) {
        return res.status(404).json({ message: "Diskon tidak ditemukan" });
      }
      res.json(discount);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Data tidak valid", errors: error.errors });
      }
      res.status(500).json({ message: "Gagal mengupdate diskon" });
    }
  });
  app2.post("/api/discounts/apply", async (req, res) => {
    try {
      const { discountId, subtotal } = req.body;
      const result = await storage.applyDiscount(discountId, parseFloat(subtotal));
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Gagal menerapkan diskon" });
    }
  });
  app2.get("/api/reports/profit", async (req, res) => {
    try {
      const { startDate, endDate, outletId } = req.query;
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
      const end = endDate ? new Date(endDate) : /* @__PURE__ */ new Date();
      const profitReport = await storage.getProfitReport(
        start,
        end,
        outletId ? parseInt(outletId) : void 0
      );
      res.json(profitReport);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil laporan profit" });
    }
  });
  app2.get("/api/reports/stock-movements", async (req, res) => {
    try {
      const { startDate, endDate, outletId, type } = req.query;
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3);
      const end = endDate ? new Date(endDate) : /* @__PURE__ */ new Date();
      const report = await storage.getStockMovementReport(
        start,
        end,
        outletId ? parseInt(outletId) : void 0,
        type
      );
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil laporan pergerakan stok" });
    }
  });
  app2.get("/api/printer-settings", async (req, res) => {
    try {
      const { outletId } = req.query;
      const settings = await storage.getPrinterSettings(
        outletId ? parseInt(outletId) : void 0
      );
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil pengaturan printer" });
    }
  });
  app2.post("/api/printer-settings", async (req, res) => {
    try {
      const validatedData = insertPrinterSettingSchema.parse(req.body);
      const setting = await storage.createPrinterSetting(validatedData);
      res.status(201).json(setting);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Data tidak valid", errors: error.errors });
      }
      res.status(500).json({ message: "Gagal membuat pengaturan printer" });
    }
  });
  app2.post("/api/print/receipt", async (req, res) => {
    try {
      const { transactionId, printerId } = req.body;
      const transaction = await storage.getTransaction(transactionId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaksi tidak ditemukan" });
      }
      const receiptData = await storage.generateReceiptData(transactionId);
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
  app2.get("/api/backup/logs", async (req, res) => {
    try {
      const logs = await storage.getBackupLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil log backup" });
    }
  });
  app2.post("/api/backup/create", async (req, res) => {
    try {
      const { type = "manual", userId } = req.body;
      const backup = await storage.createBackup(type, userId);
      res.status(201).json(backup);
    } catch (error) {
      res.status(500).json({ message: "Gagal membuat backup" });
    }
  });
  app2.get("/api/products/barcode/:barcode", async (req, res) => {
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
  app2.post("/api/sync/outlets", async (req, res) => {
    try {
      const { sourceOutletId, targetOutletId, dataTypes } = req.body;
      const result = await storage.syncOutletData(sourceOutletId, targetOutletId, dataTypes);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Gagal sinkronisasi data outlet" });
    }
  });
  console.log("\u2705 Enhanced routes registered successfully!");
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
var vite_config_default = defineConfig({
  plugins: [
    react()
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
  },
  define: {
    "process.env": {},
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
    "process.env.NEXT_PUBLIC_SUPABASE_URL": JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL || ""),
    "process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY": JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "")
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
init_db();
init_schema();
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
  if (process.env.USE_MOCK_DATA !== "true") {
    try {
      await seedDatabase();
    } catch (error) {
      console.log("\u26A0\uFE0F Database seeding failed, continuing with mock data...");
      console.log("\u{1F527} Set USE_MOCK_DATA=true to skip database connection");
    }
  } else {
    console.log("\u{1F4E6} Using mock data for development");
  }
  const server = await registerRoutes(app);
  registerEnhancedRoutes(app);
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
    log(`\u{1F680} POS CafeLux Enhanced Product Management System`);
    log(`\u{1F4F1} Server running on http://localhost:${port}`);
    log(`\u{1F48E} Pro Features: Opsi Tambahan, Bundel, Bahan Baku & Resep`);
    log(`\u{1F517} Kelola Produk: http://localhost:${port}/kelola-produk`);
  });
})();
