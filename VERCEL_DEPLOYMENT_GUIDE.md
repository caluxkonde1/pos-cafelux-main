# 🚀 VERCEL DEPLOYMENT GUIDE - POS CAFELUX

## 📋 Prerequisites
1. ✅ Supabase project sudah dibuat
2. ✅ GitHub repository sudah siap
3. ✅ Vercel account sudah tersedia

## 🔧 Environment Variables untuk Vercel

Copy environment variables berikut ke Vercel Dashboard > Settings > Environment Variables:

```bash
# ===== SUPABASE CONFIGURATION =====
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]

# ===== APPLICATION CONFIGURATION =====
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://pos-cafelux-main.vercel.app
SESSION_SECRET=[GENERATE_RANDOM_32_CHAR_STRING]
JWT_SECRET=[GENERATE_RANDOM_32_CHAR_STRING]

# ===== OPTIONAL CONFIGURATIONS =====
NEXT_PUBLIC_STORAGE_BUCKET=pos-cafelux-storage
```

## 🗄️ Database Setup di Supabase

1. **Buka Supabase Dashboard** → SQL Editor
2. **Run migration scripts** dalam urutan berikut:

### Migration 1: Initial Schema
```sql
-- Copy dan paste isi dari: supabase/migrations/20250110000000_initial_pos_cafelux_schema.sql
```

### Migration 2: Database Functions
```sql
-- Copy dan paste isi dari: supabase/migrations/20250110000001_database_functions.sql
```

### Migration 3: Enhanced Features
```sql
-- Copy dan paste isi dari: supabase/migrations/20250115000000_enhanced_product_management.sql
```

## 🚀 Deployment Steps

### 1. Push ke GitHub
```bash
git add .
git commit -m "Setup Supabase for Vercel deployment"
git push origin main
```

### 2. Deploy ke Vercel
1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import dari GitHub repository
4. Set Framework: **Vite**
5. Set Build Command: **npm run vercel-build**
6. Set Output Directory: **dist/public**
7. Add Environment Variables (dari list di atas)
8. Click "Deploy"

### 3. Verify Deployment
1. Buka URL deployment (https://pos-cafelux-main.vercel.app)
2. Test login dengan: admin / admin123
3. Test semua fitur utama
4. Check browser console untuk error

## 🔍 Troubleshooting

### Database Connection Issues
- Pastikan DATABASE_URL benar
- Check Supabase project status
- Verify RLS policies

### Build Errors
- Check environment variables
- Verify all dependencies installed
- Check build logs di Vercel

### Runtime Errors
- Check browser console
- Verify API endpoints
- Check Vercel function logs

## 📱 Testing Checklist

- [ ] Dashboard loads correctly
- [ ] Product management works
- [ ] Category management works
- [ ] Employee management works
- [ ] Mobile responsive design
- [ ] Search and filter functions
- [ ] Add/Edit modals work
- [ ] API endpoints respond correctly

## 🎉 Success!

Jika semua langkah berhasil, aplikasi POS CafeLux akan berjalan di:
**https://pos-cafelux-main.vercel.app**

---
Generated by prepare-vercel-deployment.js
Date: 2025-07-11T14:52:59.995Z
