# 🚀 VERCEL SUPABASE CONFIGURATION GUIDE

## 📋 Konfigurasi Advanced Vercel untuk Koneksi Supabase

### 1. Environment Variables Configuration

Pada Vercel Dashboard > Settings > Environment Variables, tambahkan variabel berikut:

#### ✅ Required Environment Variables:

```bash
# ===== SUPABASE DATABASE =====
DATABASE_URL=postgresql://postgres:Caluxkonde87253186@db.wbseybltsgfstwqqnzxg.supabase.co:5432/postgres

# ===== SUPABASE API =====
NEXT_PUBLIC_SUPABASE_URL=https://wbseybltsgfstwqqnzxg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndicmV5YmxOc2dmc3R3cXFuenhniIsicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0MjU5NzQsImV4cCI6MjA1MjAwMTk3NH0.Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej7_Ej<ask_followup_question>
<question>Untuk konfigurasi advanced di Vercel agar koneksi Supabase berjalan dengan baik, Anda perlu mengisi environment variables dengan benar. Berikut adalah variabel environment yang harus Anda isi di Vercel Dashboard > Settings > Environment Variables:

- DATABASE_URL: URL koneksi database PostgreSQL Supabase Anda, misalnya:
  postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

- NEXT_PUBLIC_SUPABASE_URL: URL Supabase project Anda, misalnya:
  https://[PROJECT_REF].supabase.co

- NEXT_PUBLIC_SUPABASE_ANON_KEY: Anon key dari Supabase project Anda

- SUPABASE_SERVICE_ROLE_KEY: Service role key dari Supabase project Anda

- SESSION_SECRET: String acak untuk session secret (minimal 32 karakter)

- JWT_SECRET: String acak untuk JWT secret (minimal 32 karakter)

- NEXT_PUBLIC_STORAGE_BUCKET: Nama bucket storage Anda, misalnya "pos-cafelux-storage"

Untuk prefix STORAGE_URL yang Anda sebutkan, biasanya itu adalah variabel yang otomatis dibuat oleh Vercel untuk storage URL. Anda tidak perlu mengisinya secara manual kecuali ada kebutuhan khusus.

Apakah Anda ingin saya bantu membuatkan daftar environment variables lengkap yang bisa Anda copy-paste ke Vercel? Atau ada pertanyaan lain terkait konfigurasi ini?</question>
</ask_followup_question>
