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
