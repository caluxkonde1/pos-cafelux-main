import { db } from "./db";
import { users, products, categories, customers } from "@shared/schema";

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Skip seeding if no database connection (using MemStorage)
    if (!db) {
      console.log("No database connection available, skipping seeding (using MemStorage)");
      return;
    }

    // Check if data already exists
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

    // Insert admin user
    await db.insert(users).values({
      username: "admin",
      password: "admin123",
      email: "admin@qasir.com",
      nama: "Admin Toko",
      role: "admin",
      subscriptionPlan: "pro_plus",
      subscriptionStatus: "active",
      subscriptionExpiresAt: null,
      isActive: true,
    });

    // Insert categories
    const categoryIds = await db.insert(categories).values([
      { nama: "Makanan", deskripsi: "Produk makanan dan minuman", isActive: true },
      { nama: "Minuman", deskripsi: "Berbagai jenis minuman", isActive: true },
      { nama: "Snack", deskripsi: "Camilan dan makanan ringan", isActive: true },
      { nama: "Sembako", deskripsi: "Kebutuhan pokok sehari-hari", isActive: true },
      { nama: "Personal Care", deskripsi: "Produk perawatan diri", isActive: true },
    ]).returning({ id: categories.id });

    // Insert products
    await db.insert(products).values([
      {
        nama: "Roti Tawar Sari Roti",
        kode: "P001",
        kategori: "Makanan",
        harga: "12000",
        stok: 50,
        deskripsi: "Roti tawar berkualitas untuk sarapan",
        isActive: true,
      },
      {
        nama: "Indomie Goreng",
        kode: "P002", 
        kategori: "Makanan",
        harga: "3500",
        stok: 100,
        deskripsi: "Mie instan rasa ayam bawang",
        isActive: true,
      },
      {
        nama: "Aqua 600ml",
        kode: "P003",
        kategori: "Minuman",
        harga: "3000",
        stok: 200,
        deskripsi: "Air mineral dalam kemasan",
        isActive: true,
      },
      {
        nama: "Teh Botol Sosro",
        kode: "P004",
        kategori: "Minuman",
        harga: "4500",
        stok: 80,
        deskripsi: "Teh manis dalam botol",
        isActive: true,
      },
      {
        nama: "Chitato Sapi Panggang",
        kode: "P005",
        kategori: "Snack",
        harga: "8000",
        stok: 40,
        deskripsi: "Keripik kentang rasa sapi panggang",
        isActive: true,
      },
      {
        nama: "Beras Premium 5kg",
        kode: "P006",
        kategori: "Sembako",
        harga: "75000",
        stok: 25,
        deskripsi: "Beras premium kualitas terbaik",
        isActive: true,
      },
      {
        nama: "Minyak Goreng Tropical 1L",
        kode: "P007",
        kategori: "Sembako",
        harga: "18000",
        stok: 60,
        deskripsi: "Minyak goreng kelapa sawit",
        isActive: true,
      },
      {
        nama: "Sampo Clear Men",
        kode: "P008",
        kategori: "Personal Care",
        harga: "22000",
        stok: 30,
        deskripsi: "Sampo anti ketombe untuk pria",
        isActive: true,
      },
      {
        nama: "Sabun Mandi Lifebuoy",
        kode: "P009",
        kategori: "Personal Care",
        harga: "5500",
        stok: 70,
        deskripsi: "Sabun mandi antibakteri",
        isActive: true,
      },
      {
        nama: "Susu Ultra Milk 250ml",
        kode: "P010",
        kategori: "Minuman",
        harga: "6500",
        stok: 90,
        deskripsi: "Susu UHT rasa plain",
        isActive: true,
      },
    ]);

    // Insert sample customers
    await db.insert(customers).values([
      {
        nama: "Andi Susanto",
        email: "andi@email.com",
        telepon: "08123456789",
        alamat: "Jl. Sudirman No. 123, Jakarta",
        totalPembelian: "0",
        jumlahTransaksi: 0,
      },
      {
        nama: "Sari Dewi",
        email: "sari@email.com",
        telepon: "08198765432",
        alamat: "Jl. Thamrin No. 456, Jakarta",
        totalPembelian: "0",
        jumlahTransaksi: 0,
      },
      {
        nama: "Budi Hartono",
        email: "budi@email.com",
        telepon: "08555123456",
        alamat: "Jl. Gatot Subroto No. 789, Jakarta",
        totalPembelian: "0",
        jumlahTransaksi: 0,
      },
      {
        nama: "Lisa Permata",
        email: "lisa@email.com",
        telepon: "08777888999",
        alamat: "Jl. Kuningan No. 321, Jakarta", 
        totalPembelian: "0",
        jumlahTransaksi: 0,
      },
      {
        nama: "Riko Pratama",
        email: "riko@email.com",
        telepon: "08333444555",
        alamat: "Jl. Senayan No. 654, Jakarta",
        totalPembelian: "0",
        jumlahTransaksi: 0,
      },
    ]);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run seed if this file is executed directly
const runSeed = async () => {
  try {
    await seedDatabase();
    console.log("Seeding finished");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

// Check if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeed();
}