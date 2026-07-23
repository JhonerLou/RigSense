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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ai_health_summary TEXT,
    last_ai_analyzed_at TIMESTAMPTZ
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ai_recommendations JSONB DEFAULT '{}'::jsonb,
    receipt_image_url TEXT
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
