# 🛠️ MVP Technical Specification & Architecture
**Project Name:** Hardware Care Tracker  
**Architecture Pattern:** Modular Monolith (Clean Architecture)  
**Cost Model:** 100% Free Tier Stack  

---

## 🛠️ 1. Infrastructure & Free Tier Stack

Seluruh penyedia infrastruktur dipilih berdasarkan ketersediaan **Free Tier Permanen (Tanpa Kartu Kredit)**:

| Component | Framework / Technology | Infrastructure Provider | Free Limits |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js 14+ (App Router) + TailwindCSS + shadcn/ui | Vercel | Unlimited Bandwidth (Hobby Tier) |
| **Backend API** | Go (Golang) + Gin Framework | Render.com / Koyeb | 750 Hours Runtime/Month |
| **Database & Auth** | PostgreSQL + Supabase Auth | Supabase | 500 MB DB Data, 50k MAU |
| **File Storage** | Supabase Storage (Nota & Bukti Servis) | Supabase | 1 GB Free Storage |
| **Scheduler** | PostgreSQL `pg_cron` | Supabase Internal | Native Extension (Rp 0) |
| **Email Service** | Resend API | Resend | 3,000 Emails/Month |
| **PDF Renderer** | `@react-pdf/renderer` | Client-Side (Browser) | Unlimited (Zero Server Compute) |

---

## 🏗️ 2. Clean Architecture Strategy (Backend Go)

Backend dirancang dengan pola **Domain-Driven Modular Monolith** untuk menjaga kualitas kode (*clean code*) dan kemudahan migrasi ke *Microservices* di masa depan.

### Directory Structure
```text
cmd/
  └── api/
      └── main.go                 # Entry point & Dependency Injection
internal/
  ├── domain/                     # Core Business Entities & Interfaces (Pure Go)
  │   ├── device.go
  │   ├── maintenance.go
  │   └── workspace.go
  ├── module/                     # Isolated Feature Modules
  │   ├── device/
  │   │   ├── delivery/http/      # REST API Handlers
  │   │   ├── repository/         # Database Operations (SQL/GORM)
  │   │   └── usecase/            # Core Business Logic
  │   ├── maintenance/
  │   └── workspace/
  └── pkg/                        # Shared Utilities (Logger, DB Connector, Resend Client)