# Globdot — Global Editorial News Platform

**Globdot** is an enterprise-grade digital newsroom and content platform built with **Next.js 15 (App Router)**, **React 19**, **Payload CMS 3.82**, **Tailwind CSS 4**, and **PostgreSQL**.

---

## 🌟 Key Features

- **Modern Editorial Experience**: Full Lexical rich text editor, article drafts, publishing workflows, revision tracking, and media uploads powered by Payload CMS 3.
- **Next.js 15 App Router**: Server-Side Rendering (SSR), Server Components, streaming, and dynamic caching.
- **Newsroom Taxonomy**: Multi-level classification by Sections, Regions, and Authors.
- **Live Coverage**: Dedicated live blog module with real-time story updates.
- **Curated Feeds & AI Assistant**: Integrated AI-powered news analysis and source link tracking.
- **Production-Ready Operations**: Built-in Docker compose for PostgreSQL, PM2 cluster/fork profiles, automated backups, and Nginx reverse proxy templates.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (React 19)
- **CMS**: [Payload CMS 3.82](https://payloadcms.com/)
- **Database**: [PostgreSQL 15](https://www.postgresql.org/) (via `@payloadcms/db-postgres` & Drizzle)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Process Management**: [PM2](https://pm2.keymetrics.io/)
- **Reverse Proxy**: [Nginx](https://nginx.org/) with Let's Encrypt SSL

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- [Node.js 20+ LTS](https://nodejs.org/)
- [Docker & Docker Compose](https://www.docker.com/)

### 2. Setup Environment
```bash
# Clone the repository
git clone https://github.com/rathana-pvs/globdot.git
cd globdot

# Copy environment variables
cp .env.example .env
```

### 3. Start PostgreSQL Database
```bash
docker compose up -d db
```

### 4. Install Dependencies & Seed
```bash
npm install
npm run generate:types
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public news site or [http://localhost:3000/admin](http://localhost:3000/admin) for the editorial CMS.

---

## 🌐 Production VPS Deployment

Globdot includes a turnkey setup script and zero-downtime deployment workflows.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full documentation.

### Quick Deployment to Ubuntu VPS:
```bash
# On your VPS:
git clone https://github.com/rathana-pvs/globdot.git /var/www/globdot
cd /var/www/globdot
cp .env.example .env
nano .env # configure domain and passwords
sudo ./setup-vps.sh
```

---

## 📜 Available Scripts

- `npm run dev`: Start Next.js dev server on port 3000.
- `npm run build`: Build production Next.js & Payload assets.
- `npm run start`: Start production server natively.
- `npm run lint`: Run ESLint checks.
- `npm run generate:types`: Generate TypeScript types from Payload collections.
- `npm run seed`: Seed database with initial articles, sections, and regions.
- `./deploy.sh`: Zero-downtime production deployment on VPS.
- `./scripts/backup.sh`: Automated PostgreSQL and media backup.
- `./scripts/restore.sh`: Disaster recovery restore script.

---

## 📄 License
Private & Confidential — Globdot Newsroom.
