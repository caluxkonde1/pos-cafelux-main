# 🔧 Fix Git Authentication Error

## ❌ Error yang Terjadi
```
Authentication failed for 'gitgit push
'
```

## 🔍 Penyebab Masalah
1. **Personal Access Token (PAT) expired atau tidak valid**
2. **Username/password authentication deprecated** (GitHub tidak lagi mendukung password authentication)
3. **Git credential cache bermasalah**

## ✅ Solusi Step-by-Step

### Opsi 1: Menggunakan Personal Access Token (Recommended)

#### Step 1: Buat Personal Access Token di GitHub
1. Login ke GitHub.com
2. Klik profile picture → **Settings**
3. Scroll ke bawah → **Developer settings**
4. Klik **Personal access tokens** → **Tokens (classic)**
5. Klik **Generate new token** → **Generate new token (classic)**
6. Isi form:
   - **Note**: `POS CafeLux Development`
   - **Expiration**: `90 days` atau `No expiration`
   - **Scopes**: Centang `repo` (full control of private repositories)
7. Klik **Generate token**
8. **COPY TOKEN** (akan hilang setelah refresh!)

#### Step 2: Update Git Remote dengan Token
```bash
# Ganti YOUR_TOKEN dengan token yang baru dibuat
git remote set-url origin https://YOUR_TOKEN@github.com/caluxkonde1/pos-cafelux-main.git
```

#### Step 3: Test Push
```bash
git push origin main
```

### Opsi 2: Menggunakan Git Credential Manager

#### Step 1: Clear existing credentials
```bash
git config --global --unset credential.helper
git config --unset credential.helper
```

#### Step 2: Set credential helper
```bash
git config --global credential.helper manager-core
```

#### Step 3: Try push (akan muncul dialog login)
```bash
git push origin main
```

### Opsi 3: SSH Key (Most Secure)

#### Step 1: Generate SSH Key
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

#### Step 2: Add SSH Key to SSH Agent
```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

#### Step 3: Add SSH Key to GitHub
1. Copy public key: `cat ~/.ssh/id_ed25519.pub`
2. GitHub → Settings → SSH and GPG keys → New SSH key
3. Paste key dan save

#### Step 4: Change remote to SSH
```bash
git remote set-url origin git@github.com:caluxkonde1/pos-cafelux-main.git
```

## 🚀 Quick Fix Commands

### Jika menggunakan Personal Access Token:
```bash
# Ganti YOUR_TOKEN dengan token GitHub Anda
git remote set-url origin https://YOUR_TOKEN@github.com/caluxkonde1/pos-cafelux-main.git
git push origin main
```

### Jika ingin menggunakan username + token:
```bash
# Akan diminta username dan password (gunakan token sebagai password)
git push origin main
```

## 📋 Verification Commands

```bash
# Cek remote URL
git remote -v

# Cek status
git status

# Test connection
git ls-remote origin

# Push changes
git push origin main
```

## ⚠️ Important Notes

1. **Jangan gunakan password biasa** - GitHub sudah tidak mendukung
2. **Personal Access Token** adalah pengganti password
3. **Simpan token dengan aman** - treat seperti password
4. **SSH key** adalah opsi paling aman untuk jangka panjang

## 🎯 Recommended Solution

**Untuk development cepat**: Gunakan Personal Access Token (Opsi 1)
**Untuk production/security**: Gunakan SSH Key (Opsi 3)

---

**Next Steps After Fix:**
1. Test git push
2. Verify changes di GitHub
3. Continue dengan Vercel deployment
