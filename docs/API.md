# RigSense API Documentation

Dokumen ini adalah kontrak API (API Contract) untuk berinteraksi dengan Golang Backend. URL Base secara *default* adalah `http://localhost:8080`.

> **Semua endpoint di bawah (kecuali `/health`) membutuhkan Header `Authorization: Bearer <Supabase_JWT>`**.

---

## 1. Workspaces

### Create Workspace
Membuat *workspace* baru untuk menyimpan perangkat.

- **Method**: `POST`
- **URL**: `/api/workspaces`
- **Request Body**:
```json
{
  "name": "Kantor Utama",
  "environment_type": "OFFICE",
  "dust_level": "LOW"
}
```
*Note: `environment_type` dapat berupa `OFFICE`, `HOME`, `INDUSTRIAL`. `dust_level` dapat berupa `LOW`, `MEDIUM`, `HIGH`.*

- **Success Response (201 Created)**:
```json
{
  "data": {
    "id": "uuid-here",
    "user_id": "uuid-user-here",
    "name": "Kantor Utama",
    "environment_type": "OFFICE",
    "dust_level": "LOW",
    "created_at": "2026-07-24T12:00:00Z"
  }
}
```

---

## 2. Devices

### Create Device with Parts
Membuat perangkat (PC/Laptop) sekaligus mendaftarkan komponen-komponennya dalam satu transaksi.

- **Method**: `POST`
- **URL**: `/api/devices`
- **Request Body**:
```json
{
  "workspace_id": "uuid-workspace-here",
  "name": "PC Rakitan RTX 4090",
  "category": "DESKTOP",
  "workload_intensity": "HEAVY",
  "purchase_date": "2024-01-01T00:00:00Z",
  "estimated_price": 50000000.00,
  "parts": [
    {
      "part_type": "GPU",
      "name": "NVIDIA RTX 4090",
      "purchase_date": "2024-01-01T00:00:00Z",
      "warranty_expires_at": "2027-01-01T00:00:00Z"
    },
    {
      "part_type": "CPU",
      "name": "Intel Core i9 14900K",
      "purchase_date": "2024-01-01T00:00:00Z",
      "warranty_expires_at": "2027-01-01T00:00:00Z"
    }
  ]
}
```
*Note: `category` dapat berupa `DESKTOP`, `LAPTOP`, `SERVER`. `workload_intensity` dapat berupa `LIGHT`, `MEDIUM`, `HEAVY`.*

- **Success Response (201 Created)**:
```json
{
  "data": {
    "id": "uuid-device-here",
    "workspace_id": "uuid-workspace-here",
    "name": "PC Rakitan RTX 4090",
    ...
  }
}
```

---

## 3. Maintenance & Service Logs

### Create Maintenance Task
Membuat jadwal servis/perawatan. Algoritma waktu otomatis menghitung jatuh tempo berdasarkan Workload & Dust Level.

- **Method**: `POST`
- **URL**: `/api/maintenance-tasks`
- **Request Body**:
```json
{
  "device_id": "uuid-device-here",
  "task_name": "Ganti Thermal Paste & Bersihkan Kipas",
  "base_interval_months": 12,
  "risk_impact_cost": 500000.00
}
```

### Create Service Log
Mencatat riwayat servis yang telah dilakukan. Transaksi otomatis akan **memperbarui tanggal maintenance_tasks ke depan**.

- **Method**: `POST`
- **URL**: `/api/service-logs`
- **Request Body**:
```json
{
  "task_id": "uuid-task-here",
  "performed_at": "2026-07-24T12:00:00Z",
  "cost_spent": 150000.00,
  "notes": "Thermal paste diganti dengan Arctic MX-4",
  "receipt_image_url": "https://storage.supabase.com/receipts/img.png"
}
```

- **Success Response (201 Created)**:
```json
{
  "data": {
    "id": "uuid-log-here",
    "task_id": "uuid-task-here",
    "performed_at": "2026-07-24T12:00:00Z",
    "cost_spent": 150000,
    "notes": "Thermal paste diganti dengan Arctic MX-4"
  }
}
```

---

## 4. Artificial Intelligence (Google Gemini)

### OCR Receipt (Ekstrak Nota)
Membaca gambar nota servis dan mengeluarkan total biaya.

- **Method**: `POST`
- **URL**: `/api/ai/ocr-receipt`
- **Request Body**:
```json
{
  "base64_image": "data:image/jpeg;base64,/9j/4AAQSkZJ...",
  "mime_type": "image/jpeg"
}
```
- **Success Response (200 OK)**:
```json
{
  "data": {
    "total_cost": 150000.00
  }
}
```

### Generate Health Summary
Mengumpulkan seluruh data Device dan Parts untuk dianalisis oleh AI Gemini menjadi rekomendasi perawatan teknis.

- **Method**: `POST`
- **URL**: `/api/ai/devices/:deviceID/health-summary`
- **Request Body**: *None (Empty)*
- **Success Response (200 OK)**:
```json
{
  "data": {
    "recommendation": "Device dengan beban HEAVY ini menggunakan CPU Core i9 dan GPU RTX 4090. Direkomendasikan untuk memonitor suhu CPU dengan ketat dan mengganti thermal paste GPU setiap 9 bulan karena risiko pengeringan pasta termal tinggi."
  }
}
```
