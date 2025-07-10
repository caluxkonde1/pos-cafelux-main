# 🗄️ **PANDUAN SETUP DATABASE NIAGAHOSTER cPANEL**

## 📋 **LANGKAH-LANGKAH SETUP DATABASE**

### **Step 1: Login ke cPanel Niagahoster**
1. Buka browser dan login ke cPanel Niagahoster Anda
2. Cari section **"Databases"** atau **"Database"**
3. Klik **"MySQL Databases"**

---

### **Step 2: Create Database**
1. Di section **"Create New Database"**:
   ```
   Database Name: pos_cafelux
   ```
2. Klik **"Create Database"**
3. Database akan dibuat dengan nama: `username_pos_cafelux`

---

### **Step 3: Create Database User**
1. Di section **"MySQL Users"**:
   ```
   Username: cafelux_user
   Password: [buat password yang kuat]
   ```
2. Klik **"Create User"**
3. User akan dibuat dengan nama: `username_cafelux_user`

---

### **Step 4: Add User to Database**
1. Di section **"Add User to Database"**:
   ```
   User: username_cafelux_user
   Database: username_pos_cafelux
   ```
2. Klik **"Add"**
3. Pilih **"ALL PRIVILEGES"**
4. Klik **"Make Changes"**

---

### **Step 5: Import Database Schema**
1. Klik **"phpMyAdmin"** di cPanel
2. Login dengan kredensial database yang baru dibuat
3. **PENTING**: Pilih database `username_pos_cafelux` dari dropdown kiri
4. Klik tab **"Import"**
5. Klik **"Choose File"** dan upload file: `niagahoster-mysql-migration-fixed.sql`
6. Klik **"Go"** untuk execute import

**✅ Expected Result:**
```
Import has been successfully finished, 50+ queries executed.
Tables created: 9
Sample data inserted
```

**⚠️ TROUBLESHOOTING:**
- **Error #1044 Access denied**: Pastikan database sudah dipilih di dropdown kiri
- **CREATE DATABASE error**: Skip error ini, gunakan database yang sudah dibuat via cPanel
- **Permission denied**: Pastikan user memiliki ALL PRIVILEGES pada database

---

### **Step 6: Verify Database Setup**
Setelah import berhasil, Anda akan melihat 9 tables:
```
✅ users
✅ categories  
✅ products
✅ customers
✅ transactions
✅ transaction_items
✅ outlets
✅ employees
✅ inventory
```

---

## 🔧 **KONFIGURASI ENVIRONMENT VARIABLES**

### **Step 7: Catat Informasi Database**
Dari cPanel, catat informasi berikut:
```
Database Host: [biasanya localhost atau IP server]
Database Name: username_pos_cafelux
Database User: username_cafelux_user
Database Password: [password yang Anda buat]
Port: 3306 (default MySQL)
```

### **Step 8: Format DATABASE_URL**
Buat DATABASE_URL dengan format:
```env
DATABASE_URL=mysql://username_cafelux_user:password@hostname:3306/username_pos_cafelux
```

**Contoh:**
```env
DATABASE_URL=mysql://john_cafelux_user:mypassword123@mysql.niagahoster.com:3306/john_pos_cafelux
```

---

## 🚀 **KONFIGURASI VERCEL ENVIRONMENT**

### **Step 9: Setup Environment Variables di Vercel**
1. Login ke **Vercel Dashboard**
2. Pilih project: **pos-cafelux-main**
3. Go to **Settings** > **Environment Variables**
4. Add variables berikut:

```env
DATABASE_URL=mysql://your_user:your_password@your_host:3306/your_database
DB_HOST=your_hostname.niagahoster.com
DB_PORT=3306
DB_NAME=username_pos_cafelux
DB_USER=username_cafelux_user
DB_PASSWORD=your_password
NODE_ENV=production
SESSION_SECRET=pos-cafelux-production-secret-key
```

### **Step 10: Deploy & Test**
1. Klik **"Save"** di Vercel
2. Vercel akan otomatis redeploy aplikasi
3. Tunggu deployment selesai (~2-3 menit)

---

## 🧪 **TESTING DATABASE CONNECTION**

### **Step 11: Test Connection Lokal**
1. Update file `.env` dengan kredensial Niagahoster:
```env
DATABASE_URL=mysql://your_user:your_password@your_host:3306/your_database
```

2. Test connection:
```bash
node test-niagahoster-connection.js
```

**Expected Output:**
```
🧪 Testing Niagahoster Database Connection
🔗 Connecting to database...
✅ Basic connection successful
✅ Found 9 tables in database
✅ Products table: 8 records
🎉 Niagahoster database connection test successful!
```

### **Step 12: Test Production Application**
1. Buka: https://pos-cafelux-main.vercel.app/
2. Test fitur-fitur berikut:
   - ✅ Login/Dashboard
   - ✅ Add new product
   - ✅ Create transaction
   - ✅ Check data persistence

---

## 🔍 **TROUBLESHOOTING COMMON ISSUES**

### **Issue 1: Connection Timeout**
```
Error: connect ETIMEDOUT
```
**Solution:**
- Pastikan hostname benar (biasanya `mysql.niagahoster.com`)
- Check firewall settings di cPanel

### **Issue 2: Access Denied**
```
Error: Access denied for user
```
**Solution:**
- Verify username dan password
- Pastikan user sudah di-assign ke database dengan ALL PRIVILEGES

### **Issue 3: Database Not Found**
```
Error: Unknown database
```
**Solution:**
- Pastikan database name benar (dengan prefix username)
- Check di phpMyAdmin apakah database exists

### **Issue 4: SSL Connection**
```
Error: SSL connection error
```
**Solution:**
Add SSL parameter ke DATABASE_URL:
```env
DATABASE_URL=mysql://user:pass@host:3306/db?ssl=true
```

---

## 📊 **VERIFICATION CHECKLIST**

### **✅ Database Setup Complete:**
- [ ] Database `username_pos_cafelux` created
- [ ] User `username_cafelux_user` created with ALL PRIVILEGES
- [ ] Schema imported successfully (9 tables)
- [ ] Sample data loaded (products, categories, users)

### **✅ Environment Configuration:**
- [ ] DATABASE_URL configured in Vercel
- [ ] All environment variables set
- [ ] Application redeployed successfully

### **✅ Testing Complete:**
- [ ] Local connection test passed
- [ ] Production application accessible
- [ ] Data persistence verified
- [ ] CRUD operations working

---

## 🎉 **SUCCESS INDICATORS**

### **Database Connection Success:**
```
✅ MySQL database connection initialized
✅ Database seeding completed successfully
✅ Server running on port 5000
```

### **Application Success:**
```
✅ Products persist after page refresh
✅ Transactions saved to database
✅ Customer data maintained
✅ Reports show real data
```

---

## 📞 **SUPPORT & NEXT STEPS**

### **If Setup Successful:**
🎉 **Congratulations!** POS CafeLux sekarang menggunakan database Niagahoster dengan data persistence penuh.

### **If Issues Persist:**
1. Check cPanel error logs
2. Verify database credentials
3. Test connection dengan phpMyAdmin
4. Contact Niagahoster support jika diperlukan

### **Production Ready Features:**
- ✅ **Multi-user access** dengan shared data
- ✅ **Data backup** otomatis oleh Niagahoster
- ✅ **Scalable** untuk multiple concurrent users
- ✅ **Persistent** data across deployments
- ✅ **Professional** production environment

**Total Setup Time:** ~10-15 menit
**Difficulty:** Beginner-friendly dengan panduan ini
