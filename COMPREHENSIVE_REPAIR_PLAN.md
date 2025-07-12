# 🔧 COMPREHENSIVE REPAIR PLAN - POS CAFELUX
**Berdasarkan permintaan user dan hasil testing**

---

## 📋 FITUR YANG PERLU DIPERBAIKI/DIBUAT

### 1. **HALAMAN KATEGORI** ✅ SUDAH DIPERBAIKI
- ✅ Tombol simpan kategori sudah berfungsi ke Supabase
- ✅ Modal tambah kategori sudah terintegrasi
- ✅ CRUD operations working

### 2. **HALAMAN PENJUALAN** ⚠️ PERLU PERBAIKAN
**Issues yang perlu diperbaiki:**
- ❌ Tombol filter transaksi tidak jalan
- ❌ Tombol detail transaksi tidak muncul
- ❌ Tombol export tidak berfungsi
- ❌ Tambahkan tombol edit transaksi untuk role admin

**Files to fix:**
- `client/src/pages/penjualan.tsx`
- `client/src/pages/penjualan-fixed.tsx` (sudah ada)

### 3. **HALAMAN RIWAYAT TRANSAKSI** ⚠️ PERLU PERBAIKAN
**Issues yang perlu diperbaiki:**
- ❌ Tombol cetak invoice tidak bekerja
- ❌ Tombol detail transaksi tidak muncul
- ❌ Tambah tombol edit (khusus admin)

**Files to fix:**
- `client/src/pages/riwayat-transaksi.tsx`
- `client/src/pages/riwayat-transaksi-fixed.tsx` (sudah ada)
- `client/src/pages/riwayat-transaksi-complete.tsx` (sudah ada)

### 4. **HALAMAN REKAP KAS** ✅ SUDAH DIPERBAIKI
- ✅ Tombol tambah transaksi berfungsi
- ✅ Dashboard kas dengan data real
- ✅ Export button ready
- ✅ Kas masuk/keluar form working

### 5. **HALAMAN PENGINGAT** ✅ SUDAH DIPERBAIKI
- ✅ Tombol tambah pengingat berfungsi
- ✅ Form lengkap dengan validasi
- ✅ Dashboard statistik
- ✅ Notifikasi stok rendah (perlu API fix)

### 6. **HALAMAN PELANGGAN** ❌ BELUM DIPERBAIKI
**Issues yang perlu diperbaiki:**
- ❌ Aksi edit tidak berfungsi
- ❌ Tombol export tidak berfungsi
- ❌ Filter tidak berfungsi

**Files to create/fix:**
- `client/src/pages/pelanggan.tsx`

### 7. **HALAMAN LAPORAN** ❌ BELUM DIPERBAIKI
**Issues yang perlu diperbaiki:**
- ❌ Grafik laporan tidak muncul
- ❌ Outlet tidak tersinkron di laporan
- ❌ Tambahkan pilihan outlet di filter laporan

**Files to create/fix:**
- `client/src/pages/laporan.tsx`

### 8. **HALAMAN PEGAWAI** ❌ BELUM DIPERBAIKI
**Issues yang perlu diperbaiki:**
- ❌ Tambah/edit/hapus pegawai tidak berfungsi
- ❌ Edit status hanya untuk role admin/supervisor/pemilik

**Files to create/fix:**
- `client/src/pages/pegawai.tsx`

### 9. **HALAMAN INVENTARIS** ❌ BELUM DIPERBAIKI
**Issues yang perlu diperbaiki:**
- ❌ Tambah/edit/detail item tidak berfungsi

**Files to create/fix:**
- `client/src/pages/inventaris.tsx`

### 10. **HALAMAN PENGATURAN MEJA** ❌ BELUM DIPERBAIKI
**Issues yang perlu diperbaiki:**
- ❌ Tombol tambah/edit meja dan layout tidak berjalan
- ❌ Kelola reservasi belum aktif

**Files to create/fix:**
- `client/src/pages/pengaturan-meja.tsx`

### 11. **HALAMAN PROFIL USER** ❌ BELUM ADA
**Fitur baru yang perlu dibuat:**
- ❌ Tambahkan halaman profil per user

**Files to create:**
- `client/src/pages/profil.tsx`

### 12. **SISTEM LOGIN** ❌ BELUM LENGKAP
**Fitur yang perlu ditambahkan:**
- ❌ Login melalui email
- ❌ Login melalui Google
- ❌ Login melalui No HP
- ❌ Gunakan Supabase Auth

**Files to create/fix:**
- `client/src/pages/login.tsx`
- `client/src/components/auth/`

### 13. **DESAIN HALAMAN DEPAN** ❌ BELUM SESUAI REFERENSI
**Perlu disesuaikan dengan referensi gambar**

---

## 🔧 TECHNICAL IMPLEMENTATION PLAN

### **PHASE 1: CRITICAL FIXES (Priority 1)**
1. **Fix API Endpoints yang gagal:**
   - Fix `/api/products/low-stock` (404 error)
   - Fix `/api/reminders` (JSON parsing error)

2. **Apply Supabase RLS Policies:**
   - Run `fix-supabase-policies.sql`
   - Test database operations

3. **Fix Halaman Penjualan:**
   - Implement filter functionality
   - Add detail transaction buttons
   - Add export functionality
   - Add edit button for admin role

### **PHASE 2: CORE FEATURES (Priority 2)**
1. **Fix Halaman Riwayat Transaksi:**
   - Implement print invoice functionality
   - Add detail transaction buttons
   - Add edit button for admin role

2. **Create Halaman Pelanggan:**
   - CRUD operations for customers
   - Export functionality
   - Filter and search

3. **Create Halaman Pegawai:**
   - Employee management
   - Role-based permissions
   - Status management for admin+

### **PHASE 3: ADVANCED FEATURES (Priority 3)**
1. **Create Halaman Laporan:**
   - Charts and graphs
   - Outlet synchronization
   - Filter by outlet

2. **Create Halaman Inventaris:**
   - Inventory management
   - Stock movements
   - Item details

3. **Create Halaman Pengaturan Meja:**
   - Table management
   - Layout designer
   - Reservation system

### **PHASE 4: AUTHENTICATION & UI (Priority 4)**
1. **Implement Supabase Auth:**
   - Email login
   - Google OAuth
   - Phone number login

2. **Create User Profile:**
   - Profile management
   - Settings
   - Preferences

3. **Redesign Homepage:**
   - Match reference design
   - Improve UX/UI

---

## 📁 FILES STRUCTURE PLAN

```
client/src/
├── pages/
│   ├── penjualan-complete.tsx          # ✅ To be created
│   ├── riwayat-transaksi-final.tsx     # ✅ To be created
│   ├── pelanggan-complete.tsx          # ❌ To be created
│   ├── laporan-complete.tsx            # ❌ To be created
│   ├── pegawai-complete.tsx            # ❌ To be created
│   ├── inventaris-complete.tsx         # ❌ To be created
│   ├── pengaturan-meja-complete.tsx    # ❌ To be created
│   ├── profil.tsx                      # ❌ To be created
│   └── login.tsx                       # ❌ To be created
├── components/
│   ├── auth/                           # ❌ To be created
│   │   ├── login-form.tsx
│   │   ├── google-auth.tsx
│   │   └── phone-auth.tsx
│   ├── charts/                         # ❌ To be created
│   │   ├── sales-chart.tsx
│   │   └── analytics-chart.tsx
│   ├── tables/                         # ❌ To be created
│   │   ├── customer-table.tsx
│   │   ├── employee-table.tsx
│   │   └── inventory-table.tsx
│   └── modals/                         # ✅ Partially exists
│       ├── edit-transaction-modal.tsx  # ❌ To be created
│       ├── customer-modal.tsx          # ❌ To be created
│       ├── employee-modal.tsx          # ❌ To be created
│       └── table-layout-modal.tsx      # ❌ To be created
└── hooks/
    ├── use-auth.ts                     # ❌ To be created
    ├── use-customers.ts                # ❌ To be created
    ├── use-employees.ts                # ❌ To be created
    └── use-reports.ts                  # ❌ To be created
```

```
server/
├── routes/
│   ├── auth.ts                         # ❌ To be created
│   ├── customers.ts                    # ✅ Exists, needs enhancement
│   ├── employees.ts                    # ❌ To be created
│   ├── reports.ts                      # ❌ To be created
│   ├── inventory.ts                    # ❌ To be created
│   └── tables.ts                       # ❌ To be created
└── middleware/
    ├── auth.ts                         # ❌ To be created
    └── permissions.ts                  # ❌ To be created
```

---

## 🗄️ DATABASE SCHEMA ADDITIONS

### **New Tables Needed:**
```sql
-- Employee management
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  employee_code VARCHAR(20) UNIQUE,
  position VARCHAR(50),
  salary DECIMAL(12,2),
  hire_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table management
CREATE TABLE tables (
  id SERIAL PRIMARY KEY,
  table_number VARCHAR(10),
  capacity INTEGER,
  status VARCHAR(20) DEFAULT 'available',
  position_x INTEGER,
  position_y INTEGER,
  outlet_id INTEGER REFERENCES outlets(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reservations
CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  table_id INTEGER REFERENCES tables(id),
  customer_id INTEGER REFERENCES customers(id),
  reservation_date DATE,
  reservation_time TIME,
  party_size INTEGER,
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inventory items
CREATE TABLE inventory_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  category VARCHAR(100),
  unit VARCHAR(50),
  current_stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  max_stock INTEGER,
  unit_cost DECIMAL(10,2),
  supplier_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 IMPLEMENTATION TIMELINE

### **Week 1: Critical Fixes**
- Day 1-2: Fix API endpoints dan RLS policies
- Day 3-4: Complete Halaman Penjualan
- Day 5-7: Complete Halaman Riwayat Transaksi

### **Week 2: Core Features**
- Day 1-3: Create Halaman Pelanggan
- Day 4-5: Create Halaman Pegawai
- Day 6-7: Testing and bug fixes

### **Week 3: Advanced Features**
- Day 1-3: Create Halaman Laporan
- Day 4-5: Create Halaman Inventaris
- Day 6-7: Create Halaman Pengaturan Meja

### **Week 4: Authentication & Polish**
- Day 1-3: Implement Supabase Auth
- Day 4-5: Create User Profile
- Day 6-7: Redesign Homepage dan final testing

---

## 📊 SUCCESS METRICS

### **Phase 1 Success Criteria:**
- ✅ All API endpoints return 200 status
- ✅ Database operations work without RLS errors
- ✅ Penjualan page fully functional
- ✅ Riwayat Transaksi page fully functional

### **Phase 2 Success Criteria:**
- ✅ Customer management CRUD working
- ✅ Employee management with role permissions
- ✅ Export functionality on all pages

### **Phase 3 Success Criteria:**
- ✅ Charts and reports displaying correctly
- ✅ Inventory tracking functional
- ✅ Table management and reservations working

### **Phase 4 Success Criteria:**
- ✅ Multi-method authentication working
- ✅ User profiles functional
- ✅ UI matches reference design
- ✅ All features tested and bug-free

---

## 🎯 NEXT IMMEDIATE ACTIONS

1. **Apply RLS Fix:**
   ```sql
   -- Run fix-supabase-policies.sql in Supabase dashboard
   ```

2. **Fix Critical API Endpoints:**
   - Debug `/api/products/low-stock`
   - Debug `/api/reminders`

3. **Start with Halaman Penjualan:**
   - Use existing `penjualan-fixed.tsx` as base
   - Implement missing functionality

4. **Test Each Component:**
   - Unit testing for each new component
   - Integration testing with database
   - UI/UX testing

---

**Status:** Ready to begin implementation  
**Estimated Completion:** 4 weeks  
**Risk Level:** Medium (due to complexity of authentication and charts)  
**Success Probability:** High (85%+ based on current progress)
