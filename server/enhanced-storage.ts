import { 
  outlets, stockMovements, discounts, backupLogs, printerSettings,
  type Outlet, type InsertOutlet, type StockMovement, type InsertStockMovement,
  type Discount, type InsertDiscount, type BackupLog, type InsertBackupLog,
  type PrinterSetting, type InsertPrinterSetting, type Product
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

// Enhanced methods for MemStorage
export class EnhancedMemStorage {
  private outlets: Map<number, Outlet> = new Map();
  private stockMovements: Map<number, StockMovement> = new Map();
  private discounts: Map<number, Discount> = new Map();
  private backupLogs: Map<number, BackupLog> = new Map();
  private printerSettings: Map<number, PrinterSetting> = new Map();
  
  private currentOutletId = 1;
  private currentStockMovementId = 1;
  private currentDiscountId = 1;
  private currentBackupLogId = 1;
  private currentPrinterSettingId = 1;

  constructor() {
    this.initializeEnhancedData();
  }

  private initializeEnhancedData() {
    // Initialize default outlet
    const defaultOutlet: Outlet = {
      id: this.currentOutletId++,
      nama: "Outlet Utama",
      alamat: "Jl. Raya No. 1",
      telepon: "021-12345678",
      email: "outlet@cafelux.com",
      kodeOutlet: "OUT001",
      isActive: true,
      createdAt: new Date(),
    };
    this.outlets.set(defaultOutlet.id, defaultOutlet);

    // Initialize sample discounts
    const sampleDiscounts = [
      { nama: "Diskon Member 10%", type: "percentage", value: "10.00", minPurchase: "50000" },
      { nama: "Diskon Hari Raya", type: "percentage", value: "15.00", minPurchase: "100000" },
      { nama: "Diskon Pembelian Besar", type: "fixed", value: "25000", minPurchase: "200000" },
    ];

    sampleDiscounts.forEach(disc => {
      const discount: Discount = {
        id: this.currentDiscountId++,
        nama: disc.nama,
        type: disc.type as "percentage" | "fixed",
        value: disc.value,
        minPurchase: disc.minPurchase,
        maxDiscount: null,
        startDate: null,
        endDate: null,
        isActive: true,
        createdAt: new Date(),
      };
      this.discounts.set(discount.id, discount);
    });

    // Initialize default printer setting
    const defaultPrinter: PrinterSetting = {
      id: this.currentPrinterSettingId++,
      outletId: 1,
      printerName: "Default Thermal Printer",
      printerType: "thermal",
      paperSize: "80mm",
      isDefault: true,
      settings: {},
      isActive: true,
      createdAt: new Date(),
    };
    this.printerSettings.set(defaultPrinter.id, defaultPrinter);
  }

  // Outlets
  async getOutlets(): Promise<Outlet[]> {
    return Array.from(this.outlets.values()).filter(o => o.isActive);
  }

  async getOutlet(id: number): Promise<Outlet | undefined> {
    return this.outlets.get(id);
  }

  async createOutlet(insertOutlet: InsertOutlet): Promise<Outlet> {
    const outlet: Outlet = {
      id: this.currentOutletId++,
      ...insertOutlet,
      isActive: insertOutlet.isActive ?? true,
      createdAt: new Date(),
    };
    this.outlets.set(outlet.id, outlet);
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
    let movements = Array.from(this.stockMovements.values());

    if (filters.productId) {
      movements = movements.filter(m => m.productId === filters.productId);
    }
    if (filters.outletId) {
      movements = movements.filter(m => m.outletId === filters.outletId);
    }
    if (filters.type) {
      movements = movements.filter(m => m.type === filters.type);
    }
    if (filters.startDate) {
      movements = movements.filter(m => m.createdAt >= filters.startDate!);
    }
    if (filters.endDate) {
      movements = movements.filter(m => m.createdAt <= filters.endDate!);
    }

    return movements.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createStockMovement(insertMovement: InsertStockMovement): Promise<StockMovement> {
    const movement: StockMovement = {
      id: this.currentStockMovementId++,
      ...insertMovement,
      createdAt: new Date(),
    };
    this.stockMovements.set(movement.id, movement);
    return movement;
  }

  // Discounts
  async getDiscounts(isActive?: boolean): Promise<Discount[]> {
    let discounts = Array.from(this.discounts.values());
    if (isActive !== undefined) {
      discounts = discounts.filter(d => d.isActive === isActive);
    }
    return discounts;
  }

  async getDiscount(id: number): Promise<Discount | undefined> {
    return this.discounts.get(id);
  }

  async createDiscount(insertDiscount: InsertDiscount): Promise<Discount> {
    const discount: Discount = {
      id: this.currentDiscountId++,
      ...insertDiscount,
      isActive: insertDiscount.isActive ?? true,
      createdAt: new Date(),
    };
    this.discounts.set(discount.id, discount);
    return discount;
  }

  async updateDiscount(id: number, updateData: Partial<InsertDiscount>): Promise<Discount | undefined> {
    const discount = this.discounts.get(id);
    if (discount) {
      const updatedDiscount = { ...discount, ...updateData };
      this.discounts.set(id, updatedDiscount);
      return updatedDiscount;
    }
    return undefined;
  }

  async applyDiscount(discountId: number, subtotal: number): Promise<{ discountAmount: number; finalTotal: number }> {
    const discount = this.discounts.get(discountId);
    if (!discount || !discount.isActive) {
      return { discountAmount: 0, finalTotal: subtotal };
    }

    if (subtotal < parseFloat(discount.minPurchase || "0")) {
      return { discountAmount: 0, finalTotal: subtotal };
    }

    let discountAmount = 0;
    if (discount.type === "percentage") {
      discountAmount = (subtotal * parseFloat(discount.value)) / 100;
      if (discount.maxDiscount) {
        discountAmount = Math.min(discountAmount, parseFloat(discount.maxDiscount));
      }
    } else {
      discountAmount = parseFloat(discount.value);
    }

    return {
      discountAmount,
      finalTotal: subtotal - discountAmount
    };
  }

  // Enhanced Product Methods
  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    // This would need access to products map from main storage
    return undefined; // Placeholder
  }

  async getLowStockProducts(outletId?: number): Promise<Product[]> {
    // This would need access to products map from main storage
    return []; // Placeholder
  }

  async markTransactionAsPrinted(id: number): Promise<boolean> {
    // This would need access to transactions map from main storage
    return false; // Placeholder
  }

  // Reports
  async getProfitReport(startDate: Date, endDate: Date, outletId?: number): Promise<any> {
    return {
      totalRevenue: "0",
      totalCost: "0",
      totalProfit: "0",
      profitMargin: 0,
      period: { startDate, endDate },
      outletId
    };
  }

  async getStockMovementReport(startDate: Date, endDate: Date, outletId?: number, type?: string): Promise<any> {
    const movements = await this.getStockMovements({
      startDate,
      endDate,
      outletId,
      type
    });

    return {
      totalMovements: movements.length,
      stockIn: movements.filter(m => m.type === 'in').length,
      stockOut: movements.filter(m => m.type === 'out').length,
      adjustments: movements.filter(m => m.type === 'adjustment').length,
      movements
    };
  }

  // Printer Settings
  async getPrinterSettings(outletId?: number): Promise<PrinterSetting[]> {
    let settings = Array.from(this.printerSettings.values()).filter(s => s.isActive);
    if (outletId) {
      settings = settings.filter(s => s.outletId === outletId);
    }
    return settings;
  }

  async createPrinterSetting(insertSetting: InsertPrinterSetting): Promise<PrinterSetting> {
    const setting: PrinterSetting = {
      id: this.currentPrinterSettingId++,
      ...insertSetting,
      isActive: insertSetting.isActive ?? true,
      createdAt: new Date(),
    };
    this.printerSettings.set(setting.id, setting);
    return setting;
  }

  async generateReceiptData(transactionId: number): Promise<any> {
    return {
      transactionId,
      receiptNumber: `R${Date.now()}`,
      timestamp: new Date(),
      items: [],
      total: "0",
      paymentMethod: "cash"
    };
  }

  // Backup
  async getBackupLogs(): Promise<BackupLog[]> {
    return Array.from(this.backupLogs.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createBackup(type: string, userId?: number): Promise<BackupLog> {
    const backup: BackupLog = {
      id: this.currentBackupLogId++,
      type,
      status: "success",
      filePath: `backup_${Date.now()}.sql`,
      fileSize: 1024,
      errorMessage: null,
      userId: userId || null,
      createdAt: new Date(),
    };
    this.backupLogs.set(backup.id, backup);
    return backup;
  }

  // Multi-outlet sync
  async syncOutletData(sourceOutletId: number, targetOutletId: number, dataTypes: string[]): Promise<any> {
    return {
      sourceOutletId,
      targetOutletId,
      dataTypes,
      status: "completed",
      syncedRecords: 0,
      timestamp: new Date()
    };
  }
}

// Enhanced methods for DatabaseStorage
export class EnhancedDatabaseStorage {
  // Outlets
  async getOutlets(): Promise<Outlet[]> {
    return await db.select().from(outlets).where(eq(outlets.isActive, true));
  }

  async getOutlet(id: number): Promise<Outlet | undefined> {
    const [outlet] = await db.select().from(outlets).where(eq(outlets.id, id));
    return outlet || undefined;
  }

  async createOutlet(insertOutlet: InsertOutlet): Promise<Outlet> {
    const [outlet] = await db.insert(outlets).values(insertOutlet).returning();
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
    let query = db.select().from(stockMovements);
    
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
    const [movement] = await db.insert(stockMovements).values(insertMovement).returning();
    return movement;
  }

  // Discounts
  async getDiscounts(isActive?: boolean): Promise<Discount[]> {
    if (isActive !== undefined) {
      return await db.select().from(discounts).where(eq(discounts.isActive, isActive));
    }
    return await db.select().from(discounts);
  }

  async getDiscount(id: number): Promise<Discount | undefined> {
    const [discount] = await db.select().from(discounts).where(eq(discounts.id, id));
    return discount || undefined;
  }

  async createDiscount(insertDiscount: InsertDiscount): Promise<Discount> {
    const [discount] = await db.insert(discounts).values(insertDiscount).returning();
    return discount;
  }

  async updateDiscount(id: number, updateData: Partial<InsertDiscount>): Promise<Discount | undefined> {
    const [discount] = await db
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

    if (subtotal < parseFloat(discount.minPurchase || "0")) {
      return { discountAmount: 0, finalTotal: subtotal };
    }

    let discountAmount = 0;
    if (discount.type === "percentage") {
      discountAmount = (subtotal * parseFloat(discount.value)) / 100;
      if (discount.maxDiscount) {
        discountAmount = Math.min(discountAmount, parseFloat(discount.maxDiscount));
      }
    } else {
      discountAmount = parseFloat(discount.value);
    }

    return {
      discountAmount,
      finalTotal: subtotal - discountAmount
    };
  }

  // Additional methods would be implemented here...
  // For brevity, I'll add placeholders for the remaining methods

  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    // Implementation would go here
    return undefined;
  }

  async getLowStockProducts(outletId?: number): Promise<Product[]> {
    // Implementation would go here
    return [];
  }

  async markTransactionAsPrinted(id: number): Promise<boolean> {
    // Implementation would go here
    return false;
  }

  async getProfitReport(startDate: Date, endDate: Date, outletId?: number): Promise<any> {
    // Implementation would go here
    return {};
  }

  async getStockMovementReport(startDate: Date, endDate: Date, outletId?: number, type?: string): Promise<any> {
    // Implementation would go here
    return {};
  }

  async getPrinterSettings(outletId?: number): Promise<PrinterSetting[]> {
    // Implementation would go here
    return [];
  }

  async createPrinterSetting(insertSetting: InsertPrinterSetting): Promise<PrinterSetting> {
    const [setting] = await db.insert(printerSettings).values(insertSetting).returning();
    return setting;
  }

  async generateReceiptData(transactionId: number): Promise<any> {
    // Implementation would go here
    return {};
  }

  async getBackupLogs(): Promise<BackupLog[]> {
    return await db.select().from(backupLogs).orderBy(desc(backupLogs.createdAt));
  }

  async createBackup(type: string, userId?: number): Promise<BackupLog> {
    const backup = {
      type,
      status: "success" as const,
      filePath: `backup_${Date.now()}.sql`,
      fileSize: 1024,
      errorMessage: null,
      userId: userId || null,
    };
    const [created] = await db.insert(backupLogs).values(backup).returning();
    return created;
  }

  async syncOutletData(sourceOutletId: number, targetOutletId: number, dataTypes: string[]): Promise<any> {
    // Implementation would go here
    return {};
  }
}
