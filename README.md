
# Glass Cloud Journal System

> A futuristic, glassmorphism-styled Markdown journal and blog platform built with Astro, React, and Tailwind CSS.

<!-- ![Project Banner](public/favicon.svg) -->

## 🚀 Overview

Glass Cloud Journal System is a high-performance, server-side rendered (SSR) application designed for speed and visual appeal. It features a secure admin dashboard, a live-preview Markdown editor, and a public-facing blog with a deep-space aesthetic.

## 🛠️ Tech Stack

- **Framework:** [Astro 5.0](https://astro.build) (SSR Node.js Adapter)
- **Language:** TypeScript
- **UI/Styling:** Tailwind CSS, Glassmorphism, React (for interactive components)
- **Database:** SQLite (via [Better SQLite3](https://github.com/WiseLibs/better-sqlite3))
- **ORM:** [Drizzle ORM](https://orm.drizzle.team)
- **Auth:** [Lucia Auth](https://lucia-auth.com) (v3)
- **Security:** CSRF Protection, Rate Limiting, DOMPurify, Input Validation

## ✨ Features

- **Futuristic UI**: Deep space theme with glassmorphism cards and smooth transitions.
- **Admin Dashboard**: Manage your journal entries securely.
- **Markdown Editor**: 
  - Split-screen editing with **Live Preview**.
  - **Image Upload**: Drag & drop or click to upload (WebP/JPG/PNG).
  - **Metadata Management**: Edit title, description, cover image, and author.
- **Role-Based Access Control (RBAC)**: 
  - **Admin**: Full control.
  - **Author**: Can only edit their own posts.
- **Performance**: 
  - Server-Side Rendering (SSR) for SEO and fast initial load.
  - Lazy loading for images.
- **Security Hardening**:
  - **CSRF Protection**: Origin/Referer verification on mutations.
  - **Rate Limiting**: Protects login endpoint (5 attempts/15 min).
  - **Sanitization**: Prevents XSS via DOMPurify.

## 📦 Installation & Setup

### Prerequisites
- Node.js v18+
- npm or pnpm

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/glass-cloud-journal.git
cd glass-cloud-journal
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
Initialize the SQLite database schema:
```bash
npm run db:generate
npm run db:push
```

### 4. Run Development Server
```bash
npm run dev
```
Visit `http://localhost:4321` to see the application.

### 5. First Time Login
The system is designed to auto-create an **Admin** account on the first login attempt with the username `admin`.

1.  Navigate to `/login`.
2.  Enter Username: `admin`
3.  Enter Password: (Any secure password, min 6 chars)
4.  Click **Authenticate**.

> **⚠️ Security Note:** After the first login, it is recommended to disable the auto-creation logic in `src/pages/api/login.ts` for production environments.

## 🚀 Deployment

### Build for Production
```bash
npm run build
```
This generates a standalone Node.js server in `dist/`.

### Run Production Server
```bash
node ./dist/server/entry.mjs
```

### Nginx Configuration
An example Nginx configuration is provided in `nginx.conf.example`. Ensure `public/uploads` is writable by the web server user.

## 📂 Project Structure

```
├── public/           # Static assets & uploads
├── src/
│   ├── auth/         # Lucia Auth configuration
│   ├── components/   # UI Components (Astro/React)
│   ├── content/      # Markdown storage (Flat file)
│   ├── db/           # Drizzle ORM schema & client
│   ├── layouts/      # Astro layouts
│   ├── lib/          # Utilities
│   ├── pages/        # File-based routing
│   │   ├── admin/    # Protected Admin Routes
│   │   ├── api/      # API Endpoints (Login, Upload, Save)
│   │   └── journal/  # Public Journal Entries
│   └── middleware.ts # Security Middleware (CSRF, Auth)
├── astro.config.mjs  # Astro Config
├── drizzle.config.ts # Drizzle Config
└── package.json
```

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.
