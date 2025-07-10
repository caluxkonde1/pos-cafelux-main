import { insertTransactionSchema, insertTransactionItemSchema } from "./shared/schema.js";
import { z } from "zod";

// Test the transaction schema validation
const createTransactionSchema = z.object({
  transaction: insertTransactionSchema,
  items: z.array(insertTransactionItemSchema),
});

// Sample transaction data that might be sent from frontend
const sampleTransactionData = {
  transaction: {
    customerId: null,
    kasirId: 1,
    subtotal: "12000",
    pajak: "1200", 
    diskon: "0",
    total: "13200",
    metodePembayaran: "tunai",
    jumlahBayar: "15000",
    kembalian: "1800",
    catatan: null,
    status: "completed"
  },
  items: [
    {
      transactionId: 1, // This will be set by the backend
      productId: 1,
      namaProduk: "Roti Tawar Sari Roti",
      harga: "8500",
      jumlah: 1,
      subtotal: "8500"
    },
    {
      transactionId: 1,
      productId: 3,
      namaProduk: "Indomie Goreng", 
      harga: "3500",
      jumlah: 1,
      subtotal: "3500"
    }
  ]
};

console.log("🧪 Testing Transaction Schema Validation...\n");

try {
  console.log("📝 Sample transaction data:");
  console.log(JSON.stringify(sampleTransactionData, null, 2));
  
  console.log("\n🔍 Validating transaction schema...");
  const result = createTransactionSchema.parse(sampleTransactionData);
  console.log("✅ Validation successful!");
  console.log("✅ Transaction data is valid");
  
} catch (error) {
  console.log("❌ Validation failed!");
  console.log("❌ Error details:");
  
  if (error instanceof z.ZodError) {
    console.log("\n📋 Validation errors:");
    error.errors.forEach((err, index) => {
      console.log(`${index + 1}. Path: ${err.path.join('.')} - ${err.message}`);
    });
    
    console.log("\n🔧 Required fields for transaction:");
    console.log("- kasirId (number): User ID of the cashier");
    console.log("- subtotal (string): Subtotal amount");
    console.log("- pajak (string): Tax amount");
    console.log("- total (string): Total amount");
    console.log("- metodePembayaran (string): Payment method");
    
    console.log("\n🔧 Required fields for transaction items:");
    console.log("- transactionId (number): Transaction ID (set by backend)");
    console.log("- productId (number): Product ID");
    console.log("- namaProduk (string): Product name");
    console.log("- harga (string): Product price");
    console.log("- jumlah (number): Quantity");
    console.log("- subtotal (string): Item subtotal");
    
  } else {
    console.log(error.message);
  }
}

console.log("\n🎯 Checking enhanced transaction fields...");

// Check what fields are required vs optional in the enhanced schema
console.log("\n📋 Enhanced Transaction Schema Fields:");
console.log("Required fields:");
console.log("- kasirId: integer (references users.id)");
console.log("- subtotal: decimal");
console.log("- total: decimal");
console.log("- metodePembayaran: text");

console.log("\nOptional fields:");
console.log("- customerId: integer (nullable)");
console.log("- outletId: integer (nullable)");
console.log("- pajak: decimal (default 0)");
console.log("- diskon: decimal (default 0)");
console.log("- diskonPersen: decimal (nullable)");
console.log("- jumlahBayar: decimal (nullable)");
console.log("- kembalian: decimal (default 0)");
console.log("- catatan: text (nullable)");
console.log("- status: text (default 'completed')");
console.log("- isPrinted: boolean (default false)");

console.log("\n🎉 Transaction schema analysis complete!");
