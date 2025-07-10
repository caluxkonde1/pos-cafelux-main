# 🚀 POS CafeLux - Niagahoster Deployment Guide

## 📋 Langkah-langkah Setup Database di Niagahoster

### 1. 🗄️ Buat Database MySQL
1. Login ke cPanel Niagahoster
2. Masuk ke **MySQL Databases**
3. Buat database baru: `pos_cafelux`
4. Buat user database dengan password yang kuat
5. Assign user ke database dengan **ALL PRIVILEGES**

### 2. 📊 Import Database Schema
1. Masuk ke **phpMyAdmin** di cPanel
2. Pilih database `pos_cafelux`
3. Klik tab **SQL**
4. Copy-paste isi file `niagahoster-mysql-migration.sql`
5. Klik **Go** untuk execute

### 3. 🔧 Konfigurasi Environment
1. Copy file `.env.niagahoster` ke `.env`
2. Update dengan kredensial database Anda:

```env
# Ganti dengan kredensial Niagahoster Anda
DATABASE_URL=mysql://username:password@hostname:3306/pos_cafelux
DB_HOST=hostname.niagahoster.com
DB_NAME=pos_cafelux
DB_USER=your_username
DB_PASS=your_password
```

### 4. 🧪 Test Koneksi
```bash
# Install dependencies
npm install mysql2

# Test connection
node test-niagahoster-connection.js
```

### 5. 🚀 Deploy Aplikasi
```bash
# Build aplikasi
npm run build

# Upload folder dist/ ke public_html di cPanel File Manager
# Atau gunakan FTP/SFTP
```

## 📋 Kredensial Database Niagahoster

### Format DATABASE_URL:
```
mysql://username:password@hostname:3306/database_name
```

### Contoh:
```
mysql://cafelux_user:mypassword123@mysql.niagahoster.com:3306/cafelux_pos
```

## 🔧 Troubleshooting

### Connection Timeout:
- Pastikan SSL diaktifkan jika required
- Check firewall settings
- Verify hostname dan port

### Access Denied:
- Pastikan user memiliki privileges yang cukup
- Check username dan password
- Verify database name

### Table Not Found:
- Pastikan migration script sudah dijalankan
- Check database name yang benar
- Verify table creation berhasil

## 📊 Monitoring & Maintenance

### Health Check:
```bash
node test-niagahoster-connection.js
```

### Database Backup:
- Gunakan phpMyAdmin Export feature
- Schedule regular backups via cPanel
- Consider automated backup solutions

### Performance Optimization:
- Monitor query performance
- Add indexes untuk queries yang sering digunakan
- Optimize database configuration

## 🎯 Production Checklist

- [ ] Database created dan configured
- [ ] Migration script executed
- [ ] Environment variables set
- [ ] Connection test passed
- [ ] Application built dan deployed
- [ ] SSL certificate configured
- [ ] Domain pointed to hosting
- [ ] Backup strategy implemented

## 📞 Support

Jika mengalami masalah:
1. Check Niagahoster documentation
2. Contact Niagahoster support
3. Verify database credentials di cPanel
4. Test connection dengan script yang disediakan

**Status: Ready for Niagahoster deployment! 🚀**
