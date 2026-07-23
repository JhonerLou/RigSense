# 🏛️ System Architecture Specification

## 1. High-Level Architecture Overview

Hardware Care Tracker menggunakan pendekatan **Modular Monolith** pada backend (Go) dan **PWA App Router** pada frontend (Next.js). Arsitektur ini dirancang 100% *free-tier friendly* memanfaatkan Vercel, Render/Koyeb, Supabase, dan Google Gemini API.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js Frontend / PWA                          │
│                   (Hosted on Vercel - Free Tier)                       │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
             REST / JSON API                         │ Direct Client Call
                    │                                │ (OCR / Vision)
                    ▼                                ▼
┌────────────────────────────────────────┐   ┌───────────────────────────┐
│          Go Backend (Gin/Router)       │   │     Google Gemini API     │
│        (Hosted on Render/Koyeb)        │   │       (gemini-2.5-flash)  │
└───────────────────┬────────────────────┘   └───────────────────────────┘
                    │                                ▲
             SQL / RLS Auth                          │ Context Feed
                    ▼                                │
┌────────────────────────────────────────────────────┴───────────────────┐
│                       Supabase Backend-as-a-Service                    │
│   (PostgreSQL DB + Row Level Security + Auth + Storage + pg_cron)      │
└────────────────────────────────────────────────────────────────────────┘


### Module Boundary (`internal/module/ai`)
- **Domain**: `internal/domain/ai.go` (Interface AI Provider & Entities)
- **Adapter**: `internal/pkg/ai/gemini.go` (Wrapper Google GenAI SDK Go)
- **Constraint**: Panggilan ke Gemini API bersifat *asynchronous* atau via *background job* jika batas rate limit (15 RPM) tercapai.

## 2. Go Backend Architecture (Clean Architecture)

Backend ditulis menggunakan bahasa Go dengan mematuhi prinsip **Clean Architecture (Uncle Bob)** dan batas modul yang jelas (*Modular Monolith*).

### 2.1 Layer Hierarchy & Dependency Rules

Dependency mengalir **HANYA ke arah dalam** (`External` $\rightarrow$ `Delivery` $\rightarrow$ `Usecase` $\rightarrow$ `Domain`).

```text
[ HTTP / Handlers ] ──► [ Usecases / Business Logic ] ──► [ Domain / Entities ]
                                 │                              ▲
                                 ▼                              │
                        [ Repositories ] ───────────────────────┘



backend/
├── cmd/
│   └── api/
│       └── main.go                  # Entry point, Wire dependencies & Start server
├── config/
│   └── config.go                    # Load env variables (Supabase URL, Keys, Gemini API)
├── internal/
│   ├── domain/                      # Core Entities & Interfaces
│   │   ├── device.go
│   │   ├── maintenance.go
│   │   ├── workspace.go
│   │   └── ai.go
│   │
│   ├── module/                      # Feature Modules
│   │   ├── device/
│   │   │   ├── delivery/http/
│   │   │   ├── repository/
│   │   │   └── usecase/
│   │   ├── maintenance/
│   │   │   ├── delivery/http/
│   │   │   ├── repository/
│   │   │   └── usecase/
│   │   ├── workspace/
│   │   │   ├── delivery/http/
│   │   │   ├── repository/
│   │   │   └── usecase/
│   │   └── ai/                      # Gemini AI Integration Module
│   │       ├── delivery/http/
│   │       └── usecase/
│   │
│   └── pkg/                         # Shared Packages
│       ├── database/                # Supabase Postgres Connection Pool
│       ├── ai/                      # Gemini SDK Client Wrapper
│       ├── mailer/                  # Resend API Client Wrapper
│       └── middleware/              # Supabase JWT Auth & CORS Middleware