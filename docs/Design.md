# 🎨 UI/UX & Design System Specification

## 1. Visual Identity & Theme
* **Theme Concept:** Modern Tech, Minimalist, Data-Dense, Dark-Mode First.
* **Target Feeling:** Tangguh, Presisi, Berbasis Data, Transparan.

---

## 2. Color Palette & Semantics

Menggunakan variabel TailwindCSS / shadcn UI:

| Semantic Role | Color Code / Slate | Usage |
| :--- | :--- | :--- |
| **Primary** | `Zinc 900` / `Zinc 50` | Slate latar belakang utama dan teks kontras |
| **Brand Accent** | `Emerald 500` (`#10B981`) | Status `OK` / Health Score optimal |
| **Warning State** | `Amber 500` (`#F59E0B`) | Status `DUE_SOON` / Peringatan H-14 |
| **Danger State** | `Rose 500` (`#F43F5E`) | Status `OVERDUE` / Risiko Kerusakan tinggi |
| **Card Surface** | `Zinc 900` (Dark) | Kartu modul hardware & workspace |

---

## 3. Core Component UX Guidelines

### A. Health Gauge & Status Indicator
* **State OK:** Badge Hijau bercahaya (*subtle glow*) + Teks "Optimal".
* **State DUE_SOON:** Badge Kuning + Teks "Jatuh Tempo X Hari Lagi".
* **State OVERDUE:** Badge Merah Berkedip (*Pulsing dot*) + Estimasi Risiko Kerugian Rp (IDR) dicetak tebal (*Bold*).

### B. PDF Certificate Layout Specification
* Header: Logo Hardware Care Tracker + QR Code Verifikasi.
* Metadata: Nama Owner, Serial/Device ID, Workspace Profiler.
* Table Layout: Chronological Service History (Tanggal, Jenis Servis, Biaya, Status Bukti Nota).# 🎨 UI/UX & Design System Specification

## 1. Visual Identity & Theme
* **Theme Concept:** Modern Tech, Minimalist, Data-Dense, Dark-Mode First.
* **Target Feeling:** Tangguh, Presisi, Berbasis Data, Transparan.

---

## 2. Color Palette & Semantics

Menggunakan variabel TailwindCSS / shadcn UI:

| Semantic Role | Color Code / Slate | Usage |
| :--- | :--- | :--- |
| **Primary** | `Zinc 900` / `Zinc 50` | Slate latar belakang utama dan teks kontras |
| **Brand Accent** | `Emerald 500` (`#10B981`) | Status `OK` / Health Score optimal |
| **Warning State** | `Amber 500` (`#F59E0B`) | Status `DUE_SOON` / Peringatan H-14 |
| **Danger State** | `Rose 500` (`#F43F5E`) | Status `OVERDUE` / Risiko Kerusakan tinggi |
| **Card Surface** | `Zinc 900` (Dark) | Kartu modul hardware & workspace |

---

## 3. Core Component UX Guidelines

### A. Health Gauge & Status Indicator
* **State OK:** Badge Hijau bercahaya (*subtle glow*) + Teks "Optimal".
* **State DUE_SOON:** Badge Kuning + Teks "Jatuh Tempo X Hari Lagi".
* **State OVERDUE:** Badge Merah Berkedip (*Pulsing dot*) + Estimasi Risiko Kerugian Rp (IDR) dicetak tebal (*Bold*).

### B. PDF Certificate Layout Specification
* Header: Logo Hardware Care Tracker + QR Code Verifikasi.
* Metadata: Nama Owner, Serial/Device ID, Workspace Profiler.
* Table Layout: Chronological Service History (Tanggal, Jenis Servis, Biaya, Status Bukti Nota).