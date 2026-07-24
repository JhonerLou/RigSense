-- ==========================================
-- REALISTIC SEED DATA UNTUK HARDWARE CARE TRACKER
-- ==========================================

-- Bersihkan data lama jika ada (Hati-hati, ini akan menghapus data!)
TRUNCATE TABLE service_logs, maintenance_tasks, device_parts, devices, workspaces CASCADE;

-- Insert Workspaces (2 Ruangan)
-- Kita asumsikan user_id menggunakan UUID statis: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
INSERT INTO workspaces (id, user_id, name, environment_type, dust_level) VALUES 
('11111111-1111-1111-1111-111111111111', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Home Studio (Kamar)', 'AC', 'LOW'),
('22222222-2222-2222-2222-222222222222', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Kantor StartUp', 'NON_AC', 'HIGH');

-- Insert Devices (Data Perangkat Asli & Harga Realistis di Pasaran Indonesia)
INSERT INTO devices (id, workspace_id, name, category, workload_intensity, purchase_date, estimated_price) VALUES 
-- Di Home Studio (Kamar AC, jarang debu ekstrim)
('d1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Custom PC - Intel i5 13400F + RTX 4060', 'PC_DESKTOP', 'HEAVY', '2023-05-10', 16500000.00),
('d2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'LG UltraGear 27GR75Q-B 27" 165Hz', 'MONITOR', 'HEAVY', '2023-06-01', 4800000.00),
('d3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Keychron Q1 Pro Wireless Mechanical', 'KEYBOARD', 'MEDIUM', '2023-11-20', 3150000.00),
('d4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Logitech MX Master 3S', 'MOUSE', 'MEDIUM', '2023-01-15', 1550000.00),
-- Di Kantor (Non-AC, Debu Tinggi, Pemakaian Berat)
('d5555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'ASUS ROG Zephyrus G14 (2022)', 'LAPTOP', 'HEAVY', '2022-08-10', 25000000.00);


-- Insert Maintenance Tasks (Skenario Jatuh Tempo)
INSERT INTO maintenance_tasks (id, device_id, task_name, base_interval_months, last_performed_at, next_due_date, risk_impact_cost, status) VALUES 
-- Tugas 1: Repaste PC Desktop (Aman, baru dilakukan bulan lalu)
('f1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Ganti Thermal Paste (Kryonaut) & Bersihkan Kipas CPU', 12, CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '11 months', 4500000.00, 'OK'),

-- Tugas 2: Ganti Switch Mouse Logitech (DUE SOON - Hampir kena double click issue)
('f2222222-2222-2222-2222-222222222222', 'd4444444-4444-4444-4444-444444444444', 'Ganti Switch Kailh Silent Mute (Rawan Double Click)', 24, '2023-01-15', CURRENT_DATE + INTERVAL '7 days', 250000.00, 'DUE_SOON'),

-- Tugas 3: Servis Kipas Laptop ROG (OVERDUE - Di ruang tanpa AC dan berdebu tinggi, bahaya overheat)
('f3333333-3333-3333-3333-333333333333', 'd5555555-5555-5555-5555-555555555555', 'Deep Cleaning Kipas Laptop & Ganti Liquid Metal', 6, '2023-02-10', CURRENT_DATE - INTERVAL '30 days', 8500000.00, 'OVERDUE');


-- Insert Service Logs (Catatan Servis Historis)
INSERT INTO service_logs (task_id, performed_at, cost_spent, notes) VALUES 
-- Log untuk repaste PC Desktop bulan lalu
('f1111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '1 month', 150000.00, 'Repaste menggunakan Thermal Grizzly Kryonaut. Suhu turun dari 85C ke 65C saat full load rendering.'),

-- Log untuk servis kipas ROG lama (Tahun 2023)
('f3333333-3333-3333-3333-333333333333', '2023-02-10', 250000.00, 'Bawa ke ASUS Service Center Roxy. Dibersihkan debu membandel di heatsink. Ganti Thermal Grizzly Conductonaut.');


-- Insert Device Parts (Komponen Spesifik)
INSERT INTO device_parts (id, device_id, part_type, name, purchase_date, warranty_expires_at) VALUES
-- Komponen untuk PC Custom Desktop
('e1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'CPU', 'Intel Core i5-13400F', '2023-05-10', '2026-05-10'),
('e2222222-2222-2222-2222-222222222222', 'd1111111-1111-1111-1111-111111111111', 'GPU', 'ZOTAC GAMING GeForce RTX 4060 8GB', '2023-05-10', '2026-05-10'),
('e3333333-3333-3333-3333-333333333333', 'd1111111-1111-1111-1111-111111111111', 'RAM', 'Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz', '2023-05-10', '2033-05-10'),
('e4444444-4444-4444-4444-444444444444', 'd1111111-1111-1111-1111-111111111111', 'MOTHERBOARD', 'ASRock B760M Steel Legend WiFi', '2023-05-10', '2026-05-10'),
('e5555555-5555-5555-5555-555555555555', 'd1111111-1111-1111-1111-111111111111', 'PSU', 'Corsair RM650 80+ Gold', '2023-05-10', '2030-05-10'),
('e6666666-6666-6666-6666-666666666666', 'd1111111-1111-1111-1111-111111111111', 'COOLER', 'Deepcool AK400 Digital', '2023-05-10', '2024-05-10'),

-- Komponen penting untuk Laptop ROG G14 (yang biasa rawan rusak/perlu diganti)
('e7777777-7777-7777-7777-777777777777', 'd5555555-5555-5555-5555-555555555555', 'STORAGE', 'Samsung 980 PRO 1TB PCIe 4.0 NVMe', '2022-08-10', '2027-08-10'),
('e8888888-8888-8888-8888-888888888888', 'd5555555-5555-5555-5555-555555555555', 'COOLER', 'Dual Fan Assembly (CPU & GPU)', '2022-08-10', '2024-08-10');
