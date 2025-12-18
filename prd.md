# **FINAL MASTER PRD: GLASS-CLOUD JOURNAL SYSTEM**

**Version:** 3.0 (Ultimate Edition) | **Status:** Production Ready | **Architecture:** Astro SSR Hybrid

---

### **1. CORE TECH STACK & ARCHITECTURE**

* **Framework:** Astro (Mode: `output: 'server'`) – Server-Side Rendering untuk keamanan & SEO.
* **Language:** TypeScript (Strict Mode).
* **Styling:** Tailwind CSS + Framer Motion (untuk efek glassmorphism & transisi halus).
* **Database:** SQLite (Local file-based) managed via **Drizzle ORM**.
* **Authentication:** **Lucia Auth** (Session-based, Local). *No Third-Party OAuth.*
* **Storage:** * Content: Markdown (`.md`) di `src/content/jurnal/`.
* Media: Local directory `public/uploads/`.


* **Server Runtime:** Node.js (Deployment target: Ubuntu via PM2 & Nginx).

---

### **2. UI/UX DESIGN: MODERN GLASSMORPHISM**

**Visual Identity:** Futuristic, Deep, Clean.

* **Theme:** Ultra Dark Mode.
* Background: `bg-gradient-to-br from-[#020617] via-[#1e1b4b] to-[#0f172a]`.


* **Glass Components:**
* Effect: `backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl`.
* Typography: Gradient text untuk heading (`from-blue-400 to-purple-500`).


* **Mobile Responsibility (Priority):**
* **Fully Fluid Layout:** Menggunakan unit `rem` dan `vw` untuk skalabilitas.
* **Touch-Friendly:** Padding minimal 12px untuk elemen interaktif di mobile.
* **Responsive Dashboard:** Editor Markdown harus berubah menjadi tumpukan vertikal (Top: Editor, Bottom: Preview) pada layar < 768px.



---

### **3. FEATURE REQUIREMENTS**

#### **A. Image Upload & Management**

* **Upload Engine:** Integrasi API endpoint untuk menangani `multipart/form-data`.
* **Storage Logic:** Simpan file ke `public/uploads/` dengan penamaan unik (Timestamp-UUID).
* **Markdown Integration:** Setelah upload sukses, URL gambar (`/uploads/filename.webp`) otomatis disisipkan ke posisi kursor di editor.
* **Optimization:** Implementasi limit ukuran file (Max 2MB) dan filter tipe file (Hanya WebP, JPG, PNG).

#### **B. Multi-User Admin Dashboard (`/admin`)**

* **Role Access:** Admin (Manage all) vs Author (Manage self).
* **Markdown Engine:** Split-screen editor dengan **Live Preview** yang merender CSS Glassmorphism secara instan.
* **Frontmatter Automation:** Secara otomatis menyuntikkan metadata: `title`, `slug`, `date`, `author_id`, `author_username`, dan `cover_image`.

#### **C. Frontend Public Pages**

* **Home:** Hero section animasi + Grid List Artikel dengan Glass Cards.
* **Detail Page:** Render Markdown dengan optimasi gambar (Lazy loading).
* **Monetisasi:** Slot iklan `<AdSlot />` strategis (Sidebar & In-article).

---

### **4. SECURITY HARDENING (No-Vulnerability Mandate)**

#### **A. Anti-Hacking & Access Control**

* **Brute-Force Protection:** Rate limiting pada endpoint `/api/login` (Max 5 attempts/15 min).
* **Session Security:** Cookies menggunakan `HttpOnly`, `Secure`, dan `SameSite=Strict`.
* **CSRF Protection:** Validasi header `Origin` dan `Referer` pada setiap request mutasi data.

#### **B. Data & Content Security**

* **XSS Prevention:** Gunakan `DOMPurify` untuk membersihkan hasil render Markdown. Jangan pernah menggunakan `set:html` tanpa sanitasi.
* **SQL Injection:** Gunakan *Prepared Statements* dari Drizzle ORM untuk semua interaksi SQLite.
* **Path Traversal:** Validasi ketat pada input `slug` dan nama file gambar untuk mencegah akses ke direktori sistem Ubuntu.
* **Directory Protection:** Pastikan folder `src/` dan file `.env` diproteksi oleh Nginx agar tidak bisa diakses via URL.

---

### **5. DATA SCHEMA (SQLite)**

* **Users Table:** `id` (PK), `username` (Unique), `hashed_password`, `role`.
* **Sessions Table:** `id` (PK), `user_id` (FK), `expires_at`.
* **Markdown Frontmatter Schema:**
```yaml
title: string
slug: string (unique, sanitized)
date: iso_date
author_id: string
author_username: string
cover_image: string (URL path)
description: string

```



---

### **6. IMPLEMENTATION STEPS FOR AI AGENT**

1. **Phase 1:** Setup Astro SSR, Tailwind Config (Glassmorphism), dan Drizzle SQLite.
2. **Phase 2:** Implementasi Lucia Auth & Middleware Security.
3. **Phase 3:** Bangun API Image Upload dengan proteksi MIME-type.
4. **Phase 4:** Develop Dashboard Editor (Markdown + Live Preview + Image Support).
5. **Phase 5:** Build UI Frontend yang sangat responsif (Mobile-first).
6. **Phase 6:** Pengetesan penetrasi (Test SQLi, XSS, dan Bypass Auth).

---

### **ADVISOR’S FINAL DIRECTIVE TO THE AGENT:**

> "Construct this system with surgical precision. The UI must look like a futuristic OS. Security must be air-tight: no raw SQL, no unsanitized HTML, and no unauthorized file access. Ensure the mobile experience is seamless with zero layout shifts. GO."

---

**PRD ini sudah sangat lengkap.** Kamu bisa memberikan ini kepada AI Agent (seperti Cursor, Bolt, atau GPT-4) dan mereka akan memiliki gambaran yang sangat jelas tentang apa yang harus dibangun.

**Satu nasehat terakhir:** Ketika nanti kamu melakukan *deployment* di Ubuntu, pastikan folder `public/uploads` memiliki izin akses (permission) yang tepat agar aplikasi bisa menulis file ke sana.
