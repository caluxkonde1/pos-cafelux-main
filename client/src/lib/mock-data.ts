import { Product, Customer, Transaction, TransactionItem, User } from "@shared/schema";

// Sample products for demo purposes
export const mockProducts: Product[] = [
  {
    id: 1,
    nama: "Roti Tawar Sari Roti",
    kode: "RTW001",
    kategori: "Makanan",
    harga: "8500",
    stok: 50,
    deskripsi: "Roti tawar segar dari Sari Roti",
    gambar: null,
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: 2,
    nama: "Susu Ultra 1L",
    kode: "SUL001", 
    kategori: "Minuman",
    harga: "12000",
    stok: 30,
    deskripsi: "Susu UHT Ultra kemasan 1 liter",
    gambar: null,
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: 3,
    nama: "Indomie Goreng",
    kode: "IMG001",
    kategori: "Makanan",
    harga: "3500",
    stok: 100,
    deskripsi: "Mie instan rasa ayam bawang",
    gambar: null,
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: 4,
    nama: "Teh Botol Sosro",
    kode: "TBS001",
    kategori: "Minuman", 
    harga: "5000",
    stok: 75,
    deskripsi: "Teh dalam kemasan botol 350ml",
    gambar: null,
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: 5,
    nama: "Sabun Mandi Lifebuoy",
    kode: "SML001",
    kategori: "Kesehatan",
    harga: "8000",
    stok: 40,
    deskripsi: "Sabun batang antibakteri",
    gambar: null,
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
];

// Sample customers for demo purposes
export const mockCustomers: Customer[] = [
  {
    id: 1,
    nama: "Andi Susanto",
    email: "andi@email.com",
    telepon: "08123456789",
    alamat: "Jl. Merdeka No. 1, Jakarta",
    totalPembelian: "2500000",
    jumlahTransaksi: 15,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: 2,
    nama: "Siti Nurhaliza", 
    email: "siti@email.com",
    telepon: "08234567890",
    alamat: "Jl. Sudirman No. 2, Bandung",
    totalPembelian: "1800000",
    jumlahTransaksi: 12,
    createdAt: new Date("2024-01-20"),
  },
  {
    id: 3,
    nama: "Budi Prasetyo",
    email: "budi@email.com", 
    telepon: "08345678901",
    alamat: "Jl. Gatot Subroto No. 3, Surabaya",
    totalPembelian: "3200000",
    jumlahTransaksi: 18,
    createdAt: new Date("2024-02-01"),
  },
];

// Sample employees/users for demo purposes
export const mockEmployees: User[] = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    email: "admin@qasir.com",
    nama: "Admin Toko",
    role: "admin",
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: 2,
    username: "kasir1",
    password: "kasir123", 
    email: "kasir1@qasir.com",
    nama: "Siti Nurhaliza",
    role: "kasir",
    isActive: true,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: 3,
    username: "kasir2",
    password: "kasir123",
    email: "kasir2@qasir.com", 
    nama: "Budi Santoso",
    role: "kasir",
    isActive: true,
    createdAt: new Date("2024-02-01"),
  },
  {
    id: 4,
    username: "supervisor1",
    password: "super123",
    email: "supervisor@qasir.com",
    nama: "Andi Prasetyo", 
    role: "supervisor",
    isActive: false,
    createdAt: new Date("2024-01-20"),
  },
];

// Sample transaction data for demo purposes
export const mockTransactions: Transaction[] = [
  {
    id: 1,
    nomorTransaksi: "T20240705001",
    customerId: 1,
    kasirId: 2,
    subtotal: "125000",
    pajak: "12500", 
    diskon: "0",
    total: "137500",
    metodePembayaran: "tunai",
    status: "completed",
    createdAt: new Date("2024-07-05T10:30:00"),
  },
  {
    id: 2,
    nomorTransaksi: "T20240705002",
    customerId: null,
    kasirId: 2,
    subtotal: "87500",
    pajak: "8750",
    diskon: "0", 
    total: "96250",
    metodePembayaran: "qris",
    status: "completed",
    createdAt: new Date("2024-07-05T11:15:00"),
  },
  {
    id: 3,
    nomorTransaksi: "T20240705003",
    customerId: 3,
    kasirId: 1,
    subtotal: "234000",
    pajak: "23400",
    diskon: "5000",
    total: "252400", 
    metodePembayaran: "kartu",
    status: "completed",
    createdAt: new Date("2024-07-05T12:45:00"),
  },
];

// Utility functions for working with mock data
export const getMockProductById = (id: number): Product | undefined => {
  return mockProducts.find(product => product.id === id);
};

export const getMockCustomerById = (id: number): Customer | undefined => {
  return mockCustomers.find(customer => customer.id === id);
};

export const getMockEmployeeById = (id: number): User | undefined => {
  return mockEmployees.find(employee => employee.id === id);
};

export const generateMockTransactionNumber = (): string => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `T${dateStr}${randomNum}`;
};

// Demo data generators
export const generateMockSalesData = (days: number = 7) => {
  const data = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      total: Math.floor(Math.random() * 5000000) + 1000000,
      transactions: Math.floor(Math.random() * 50) + 10,
    });
  }
  
  return data;
};

export const generateMockDashboardStats = () => {
  return {
    penjualanHarian: (Math.floor(Math.random() * 3000000) + 2000000).toString(),
    totalTransaksi: Math.floor(Math.random() * 100) + 50,
    produkTerjual: Math.floor(Math.random() * 300) + 200,
    pelangganBaru: Math.floor(Math.random() * 20) + 10,
    pertumbuhanPenjualan: (Math.random() * 20) + 5,
    pertumbuhanTransaksi: (Math.random() * 15) + 3,
    pertumbuhanProduk: (Math.random() * 25) + 8,
    pertumbuhanPelanggan: (Math.random() * 10) + 2,
  };
};

// Export all for convenience
export const mockData = {
  products: mockProducts,
  customers: mockCustomers,
  employees: mockEmployees,
  transactions: mockTransactions,
};

export default mockData;
