import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  nama: text("nama").notNull(),
  role: text("role").notNull().default("admin"), // admin, kasir, pemilik
  subscriptionPlan: text("subscription_plan", { enum: ["free", "pro", "pro_plus"] }).notNull().default("free"),
  subscriptionStatus: text("subscription_status", { enum: ["active", "inactive", "trial"] }).notNull().default("trial"),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  nama: text("nama").notNull(),
  kode: text("kode").notNull().unique(),
  kategori: text("kategori").notNull(),
  harga: decimal("harga", { precision: 10, scale: 2 }).notNull(),
  stok: integer("stok").notNull().default(0),
  deskripsi: text("deskripsi"),
  gambar: text("gambar"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  nama: text("nama").notNull(),
  deskripsi: text("deskripsi"),
  isActive: boolean("is_active").notNull().default(true),
});

// Customers table
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  nama: text("nama").notNull(),
  email: text("email"),
  telepon: text("telepon"),
  alamat: text("alamat"),
  totalPembelian: decimal("total_pembelian", { precision: 12, scale: 2 }).notNull().default("0"),
  jumlahTransaksi: integer("jumlah_transaksi").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  nomorTransaksi: text("nomor_transaksi").notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id),
  kasirId: integer("kasir_id").notNull().references(() => users.id),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  pajak: decimal("pajak", { precision: 12, scale: 2 }).notNull().default("0"),
  diskon: decimal("diskon", { precision: 12, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  metodePembayaran: text("metode_pembayaran").notNull(), // tunai, kartu, ewallet, qris
  status: text("status").notNull().default("completed"), // pending, completed, cancelled
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Transaction items table
export const transactionItems = pgTable("transaction_items", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").notNull().references(() => transactions.id),
  productId: integer("product_id").notNull().references(() => products.id),
  namaProduk: text("nama_produk").notNull(),
  harga: decimal("harga", { precision: 10, scale: 2 }).notNull(),
  jumlah: integer("jumlah").notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
});

// Dashboard stats table (for caching)
export const dashboardStats = pgTable("dashboard_stats", {
  id: serial("id").primaryKey(),
  tanggal: timestamp("tanggal").notNull(),
  penjualanHarian: decimal("penjualan_harian", { precision: 12, scale: 2 }).notNull(),
  totalTransaksi: integer("total_transaksi").notNull(),
  produkTerjual: integer("produk_terjual").notNull(),
  pelangganBaru: integer("pelanggan_baru").notNull(),
});

// Subscription Plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // "Free", "Pro", "Pro Plus"
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("IDR"),
  interval: text("interval").notNull().default("monthly"), // monthly, yearly
  features: jsonb("features").notNull(), // Array of feature names
  maxProducts: integer("max_products"),
  maxEmployees: integer("max_employees"),
  maxOutlets: integer("max_outlets"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Features table
export const features = pgTable("features", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // "basic", "analytics", "advanced", "integration"
  isActive: boolean("is_active").notNull().default(true),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  totalPembelian: true,
  jumlahTransaksi: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  nomorTransaksi: true,
  createdAt: true,
});

export const insertTransactionItemSchema = createInsertSchema(transactionItems).omit({
  id: true,
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
});

export const insertFeatureSchema = createInsertSchema(features).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type TransactionItem = typeof transactionItems.$inferSelect;
export type InsertTransactionItem = z.infer<typeof insertTransactionItemSchema>;

export type DashboardStats = typeof dashboardStats.$inferSelect;

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;

export type Feature = typeof features.$inferSelect;
export type InsertFeature = z.infer<typeof insertFeatureSchema>;

// Additional types for complex operations
export type TransactionWithItems = Transaction & {
  items: TransactionItem[];
  customer?: Customer;
  kasir: User;
};

export type ProductWithCategory = Product & {
  category?: Category;
};

export type DashboardStatsType = {
  penjualanHarian: string;
  totalTransaksi: number;
  produkTerjual: number;
  pelangganBaru: number;
  pertumbuhanPenjualan: number;
  pertumbuhanTransaksi: number;
  pertumbuhanProduk: number;
  pertumbuhanPelanggan: number;
};
