# 📄 Product Requirement Document (PRD)
**Project Name:** Hardware Care Tracker  
**Document Version:** 1.0  
**Target Release:** MVP Version 1.0 (Web Dashboard & PWA)  

---

## 📌 1. Executive Summary & Problem Statement

### 1.1 Problem Statement
Perangkat elektronik (*PC Desktop, Laptop, dan Peripherals*) mengalami penurunan performa dan kerusakan fatal akibat *silent failure*—kerusakan mendasar yang tidak memiliki gejala fisik langsung (seperti *thermal paste* mengering, penumpukan debu ekstrem, atau degradasi sistem daya). Sebagian besar pengguna tidak memiliki jadwal teratur untuk melakukan perawatan preventif, sehingga berujung pada biaya perbaikan yang mahal atau penurunan nilai jual kembali (*resale value*) yang signifikan.

### 1.2 Product Vision
Menjadi platform *Predictive & Condition-Based Maintenance* serba gratis yang membantu pengguna menjaga kesehatan *hardware* mereka, mencegah kerusakan fatal, dan mempertahankan nilai aset perangkat elektronik.

### 1.3 Core Business Goals
* **Validasi Pasar:** Membuktikan tingkat engasemen pengguna terhadap pemantauan kesehatan perangkat secara berkala.
* **Retensi Pengguna:** Mendorong pengguna kembali ke platform melalui pengingat otomatis (*automated reminders*) dan logbook perawatan.
* **Incentivized Usage:** Memberikan nilai tambah finansial melalui fitur **Resale Value PDF Exporter** sebagai bukti perawatan fisik resmi saat jualan *second-hand*.

---

## 👥 2. Target Persona & User Journey

### User Persona
* **Nama:** Farhan (24 tahun) – Tech Enthusiast / Worker
* **Kebutuhan:** Memiliki laptop kerja dan PC gaming mahal. Ingin memastikan perangkatnya tidak cepat rusak (*overheat*) dan ingin menjualnya dengan harga tinggi saat butuh *upgrade* di kemudian hari.
* **Pain Point:** Sering lupa kapan terakhir kali membersihkan fan/ganti *thermal paste*, dan tidak punya bukti riwayat servis saat mau jual bekas.

### User Journey Flow
1. **Onboarding:** User mendaftar via Google SSO dan membuat *Workspace* (contoh: "Setup Kamar").
2. **Asset Registration:** User mendaftarkan unit *hardware* (kategori, umur perangkat, intensitas pemakaian, dan kondisi ruangan).
3. **Automated Scheduling:** Sistem langsung menghitung dan menampilkan jadwal perawatan serta estimasi risiko finansial jika diabaikan.
4. **Maintenance Execution:** User mendapatkan notifikasi email saat mendekati jadwal, melakukan perawatan fisik DIY, dan mengunggah foto nota/bukti.
5. **Certificate Export:** User mengunduh PDF riwayat perawatan perangkat saat ingin menjual unit tersebut.

---

## 🎯 3. Functional Requirements (FR)

### Module 1: Auth & Workspace Management
* **FR-1.1:** SSO Sign-In / Sign-Up menggunakan Google Auth dan Email/Password.
* **FR-1.2 Workspace Creation:** Pengguna dapat membuat lebih dari satu *Workspace* terisolasi.
* **FR-1.3 Environment Profiler:** Konfigurasi profil lingkungan untuk bobot risiko:
  * *Room Type:* AC / Non-AC
  * *Dust Exposure Level:* Low / Medium / High

### Module 2: Hardware Asset Inventory
* **FR-2.1 Asset Cataloging:** Pencatatan perangkat dengan atribut:
  * Category: `PC_DESKTOP`, `LAPTOP`, `MONITOR`, `KEYBOARD`, `MOUSE`, `HEADSET`.
  * Workload Intensity: `LIGHT` (<4 jam/hari), `MEDIUM` (4-8 jam/hari), `HEAVY` (>8 jam/hari).
  * Purchase Date & Estimated Asset Value (IDR).
* **FR-2.2 Task Preset Generation:** Pembuatan tugas perawatan *default* secara otomatis berdasarkan tipe komponen.

### Module 3: Predictive Maintenance & Risk Engine
* **FR-3.1 Predictive Algorithm:** Perhitungan tanggal jatuh tempo tugas berbasis rumus penyesuaian bobot lingkungan dan beban kerja:
  $$\text{Adjusted Interval} = \text{Base Interval} \times \text{Factor}_{\text{environment}} \times \text{Factor}_{\text{workload}}$$
* **FR-3.2 Financial Risk Score:** Menampilkan proyeksi kerugian estimasi nominal jika perawatan dilewati.
* **FR-3.3 Health Status States:**
  * `OK` (Kondisi Aman)
  * `DUE_SOON` (Memasuki H-14 Jatuh Tempo)
  * `OVERDUE` (Tanggal Perawatan Terlewati)

### Module 4: Service Logbook & Resale PDF Exporter
* **FR-4.1 Log Completion:** Fitur *Mark as Done* yang memperbarui `last_performed_at` dan melakukan kalkulasi ulang `next_due_date` secara otomatis.
* **FR-4.2 Service Evidence:** Pencatatan riwayat biaya, deskripsi perbaikan, dan foto bukti nota ke Cloud Storage.
* **FR-4.3 Certificate Exporter:** Generasi dokumen PDF terstruktur berisi seluruh riwayat perawatan perangkat.

### Module 5: Automated Email Reminders
* **FR-5.1 Scheduled Scan:** Pemindaian harian otomatis untuk tugas berstatus `DUE_SOON`.
* **FR-5.2 Email Dispatch:** Pengiriman email pengingat otomatis kepada pengguna.

## Module 6: Smart Hardware Assistant & Vision AI (Optional / Free Tier)

### 6.1 Vision OCR & Receipt Scanner
- **Description**: Pengguna dapat mengunggah foto nota servis/pembelian atau foto fisik komponen (misal: fan/heatsink).
- **Functionality**:
  - Auto-extract metadata nota (Harga, Tanggal, Nama Toko, Komponen) untuk auto-fill form logbook.
  - Visual inspection advisory untuk penumpukan debu.
- **Provider**: Google Gemini API (`gemini-2.5-flash`).

### 6.2 Hardware Doctor Chatbot
- **Description**: Asisten AI kontekstual yang membaca spesifikasi hardware pengguna di workspace.
- **Functionality**:
  - Memberikan rekomendasi suhu normal, panduan repaste, dan troubleshooting awal berdasarkan log kondisi perangkat.
---

## 📊 4. Non-Functional Requirements (NFR)

* **Performance:** *First Contentful Paint (FCP)* < 1.2 detik dan *Time to Interactive (TTI)* < 2.5 detik.
* **Security:** Row Level Security (RLS) aktif pada level database PostgreSQL untuk menjamin isolasi data antar pengguna.
* **Accessibility & Responsiveness:** Desain PWA *mobile-friendly* dan responsif di resolusi desktop maupun tablet.
* **Cost Constraint:** **Rp 0 / Bulan (100% Free Tier Architecture)** tanpa ketergantungan pada layanan berbayar.