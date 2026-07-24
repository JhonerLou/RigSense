# 🗄️ Database Schema & Security Policy (Supabase PostgreSQL)

## 1. DDL Script (Tables & Constraints)

```sql
-- ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- WORKSPACES TABLE
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    environment_type VARCHAR(50) NOT NULL DEFAULT 'AC', -- 'AC', 'NON_AC'
    dust_level VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',   -- 'LOW', 'MEDIUM', 'HIGH'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- DEVICES TABLE
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,                      -- 'PC_DESKTOP', 'LAPTOP', 'MOUSE', 'KEYBOARD', 'MONITOR', 'HEADSET'
    workload_intensity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM', -- 'LIGHT', 'MEDIUM', 'HEAVY'
    purchase_date DATE,
    estimated_price DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- MAINTENANCE TASKS TABLE
CREATE TABLE maintenance_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    task_name VARCHAR(150) NOT NULL,
    base_interval_months INT NOT NULL,
    last_performed_at DATE,
    next_due_date DATE NOT NULL,
    risk_impact_cost DECIMAL(12, 2) DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'OK',           -- 'OK', 'DUE_SOON', 'OVERDUE'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SERVICE LOGS TABLE
CREATE TABLE service_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES maintenance_tasks(id) ON DELETE CASCADE,
    performed_at DATE NOT NULL,
    cost_spent DECIMAL(12, 2) DEFAULT 0.00,
    notes TEXT,
    receipt_image_url VARCHAR(550),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- DEVICE PARTS TABLE
CREATE TABLE device_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    part_type VARCHAR(50) NOT NULL, -- 'CPU', 'GPU', 'RAM', 'STORAGE', 'PSU', 'COOLER', 'MOTHERBOARD'
    name VARCHAR(150) NOT NULL,
    purchase_date DATE,
    warranty_expires_at DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Up Migration: Add AI Features Support

-- 1. Tambah kolom AI recommendation pada tabel maintenance_tasks
ALTER TABLE maintenance_tasks 
ADD COLUMN IF NOT EXISTS ai_recommendations JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS receipt_image_url TEXT;

-- 2. Tambah kolom AI health insights pada tabel devices
ALTER TABLE devices 
ADD COLUMN IF NOT EXISTS ai_health_summary TEXT,
ADD COLUMN IF NOT EXISTS last_ai_analyzed_at TIMESTAMPTZ;

-- Example JSON structure for ai_recommendations:
-- {
--   "ocr_extracted": true,
--   "detected_cost": 150000,
--   "detected_vendor": "Gamer Service ID",
--   "risk_tags": ["BEARING_WEAR_SUSPECTED"],
--   "advice": "Ganti kipas jika kebisingan berlanjut dalam 30 hari."
-- }