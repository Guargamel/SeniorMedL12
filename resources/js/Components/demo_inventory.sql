-- ------------------------------------------------------------
-- DEMO INVENTORY DATA (copy-paste into phpMyAdmin SQL tab)
--
-- Expected columns:
-- medicine_categories: id, name, description, created_at, updated_at
-- medicines: id, generic_name, brand_name, dosage_form, strength, category_id, unit, description, is_active, picture, created_at, updated_at
-- medicine_batches: id, medicine_id, batch_no, expiry_date, quantity, received_at, supplier, cost, created_at, updated_at
-- ------------------------------------------------------------

START TRANSACTION;

-- 0) Optional reset (uncomment if you want to wipe existing rows)
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE medicine_batches;
-- TRUNCATE TABLE medicines;
-- TRUNCATE TABLE medicine_categories;
-- SET FOREIGN_KEY_CHECKS = 1;

-- 1) Categories
INSERT INTO medicine_categories (name, description, created_at, updated_at) VALUES
('Antibiotic', 'For bacterial infections', NOW(), NOW()),
('Analgesic', 'Pain reliever / antipyretic', NOW(), NOW()),
('Antihypertensive', 'Blood pressure control', NOW(), NOW()),
('Antidiabetic', 'Blood sugar control', NOW(), NOW()),
('Antihistamine', 'Allergy relief', NOW(), NOW()),
('Vitamins', 'Supplements', NOW(), NOW()),
('Respiratory', 'Cough/colds/asthma', NOW(), NOW());

-- 2) Medicines (master list)
-- NOTE: category_id assumes the inserts above created IDs 1..7.
-- If your category IDs differ, update these category_id values.
INSERT INTO medicines
(generic_name, brand_name, dosage_form, strength, category_id, unit, description, is_active, picture, created_at, updated_at)
VALUES
('Amoxicillin', 'Amoxil', 'Capsule', '500mg', 1, 'capsule', 'Common antibiotic used for bacterial infections', 1, 'amoxicillin.jpg', NOW(), NOW()),
('Azithromycin', 'Zithromax', 'Tablet', '500mg', 1, 'tablet', 'Antibiotic for respiratory/skin infections', 1, 'azithromycin.jpg', NOW(), NOW()),
('Paracetamol', 'Biogesic', 'Tablet', '500mg', 2, 'tablet', 'Pain and fever reducer', 1, 'paracetamol.jpg', NOW(), NOW()),
('Ibuprofen', 'Advil', 'Tablet', '200mg', 2, 'tablet', 'NSAID for pain/inflammation', 1, 'ibuprofen.jpg', NOW(), NOW()),
('Losartan', 'Cozaar', 'Tablet', '50mg', 3, 'tablet', 'For hypertension', 1, 'losartan.jpg', NOW(), NOW()),
('Amlodipine', 'Norvasc', 'Tablet', '5mg', 3, 'tablet', 'Calcium channel blocker for hypertension', 1, 'amlodipine.jpg', NOW(), NOW()),
('Metformin', 'Glucophage', 'Tablet', '500mg', 4, 'tablet', 'For type 2 diabetes', 1, 'metformin.jpg', NOW(), NOW()),
('Gliclazide', 'Diamicron', 'Tablet', '80mg', 4, 'tablet', 'Sulfonylurea for type 2 diabetes', 1, 'gliclazide.jpg', NOW(), NOW()),
('Cetirizine', 'Zyrtec', 'Tablet', '10mg', 5, 'tablet', 'Allergy relief (non-drowsy)', 1, 'cetirizine.jpg', NOW(), NOW()),
('Loratadine', 'Claritin', 'Tablet', '10mg', 5, 'tablet', 'Allergy relief', 1, 'loratadine.jpg', NOW(), NOW()),
('Ascorbic Acid', 'Ceelin', 'Tablet', '500mg', 6, 'tablet', 'Vitamin C supplement', 1, 'ascorbic.jpg', NOW(), NOW()),
('Multivitamins', 'Centrum', 'Tablet', '1 tab', 6, 'tablet', 'Daily multivitamin supplement', 1, 'multivitamins.jpg', NOW(), NOW()),
('Salbutamol', 'Ventolin', 'Inhaler', '100mcg', 7, 'puff', 'Relieves asthma symptoms / bronchospasm', 1, 'salbutamol.jpg', NOW(), NOW()),
('Dextromethorphan', 'Robitussin DM', 'Syrup', '15mg/5ml', 7, 'ml', 'Cough suppressant', 1, 'dextromethorphan.jpg', NOW(), NOW());

-- 3) Batches (expiry + stock per batch)
-- Includes expired and valid batches so your "Expired" and "Available" pages show real results.
-- NOTE: medicine_id assumes the medicines inserted above created IDs 1..14 in that exact order.
-- If your medicine IDs differ, update the medicine_id values accordingly.
INSERT INTO medicine_batches
(medicine_id, batch_no, expiry_date, quantity, received_at, supplier, cost, created_at, updated_at)
VALUES
-- Amoxicillin (1): one expired with remaining stock + one valid
(1, 'AMX-EXP-2401', '2024-01-15', 35, '2023-10-10', 'ABC Pharma', 3.20, NOW(), NOW()),
(1, 'AMX-VAL-2601', '2026-09-30', 120, '2026-01-10', 'ABC Pharma', 3.55, NOW(), NOW()),

-- Azithromycin (2): low valid stock
(2, 'AZI-VAL-2602', '2026-12-31', 18, '2026-02-02', 'MediSupply Inc.', 18.00, NOW(), NOW()),

-- Paracetamol (3): plenty valid stock
(3, 'PAR-VAL-2602', '2027-06-30', 300, '2026-02-01', 'MediSupply Inc.', 1.10, NOW(), NOW()),

-- Ibuprofen (4): expired batch
(4, 'IBU-EXP-2411', '2024-11-30', 40, '2024-03-15', 'HealthPlus', 2.25, NOW(), NOW()),

-- Losartan (5): low valid stock + expired zero stock
(5, 'LOS-EXP-2406', '2024-06-30', 0, '2024-01-20', 'HealthPlus', 5.00, NOW(), NOW()),
(5, 'LOS-VAL-2601', '2026-12-31', 25, '2026-01-15', 'HealthPlus', 5.25, NOW(), NOW()),

-- Amlodipine (6): out of stock (valid but qty 0)
(6, 'AML-VAL-2601', '2027-01-31', 0, '2026-01-25', 'HealthPlus', 4.50, NOW(), NOW()),

-- Metformin (7): expired with stock (so it appears in expired list)
(7, 'MET-EXP-2502', '2025-02-28', 60, '2024-09-01', 'HealthPlus', 2.75, NOW(), NOW()),

-- Gliclazide (8): valid
(8, 'GLI-VAL-2603', '2027-03-31', 90, '2026-02-10', 'HealthPlus', 3.90, NOW(), NOW()),

-- Cetirizine (9): expired + valid
(9, 'CET-EXP-2409', '2024-09-30', 15, '2024-02-05', 'AllerCare', 2.10, NOW(), NOW()),
(9, 'CET-VAL-2601', '2027-01-31', 80, '2026-01-25', 'AllerCare', 2.30, NOW(), NOW()),

-- Loratadine (10): valid
(10, 'LOR-VAL-2602', '2027-02-28', 70, '2026-02-08', 'AllerCare', 2.40, NOW(), NOW()),

-- Ascorbic Acid (11): valid
(11, 'VITC-VAL-2602', '2027-02-28', 150, '2026-02-02', 'NutriMed', 0.95, NOW(), NOW()),

-- Multivitamins (12): low stock valid
(12, 'MVT-VAL-2602', '2026-10-31', 22, '2026-02-03', 'NutriMed', 7.50, NOW(), NOW()),

-- Salbutamol (13): valid
(13, 'SAL-VAL-2507', '2026-07-31', 40, '2026-02-05', 'RespiraCare', 12.00, NOW(), NOW()),

-- Dextromethorphan (14): expired
(14, 'DEX-EXP-2403', '2024-03-31', 10, '2023-12-12', 'RespiraCare', 4.20, NOW(), NOW());

COMMIT;

-- Quick checks:
-- Expired batches with remaining stock
-- SELECT * FROM medicine_batches WHERE expiry_date < CURDATE() AND quantity > 0 ORDER BY expiry_date ASC;
-- Available stock per medicine (non-expired)
-- SELECT m.id, m.generic_name, SUM(CASE WHEN b.expiry_date >= CURDATE() THEN b.quantity ELSE 0 END) AS available_qty
-- FROM medicines m LEFT JOIN medicine_batches b ON b.medicine_id = m.id GROUP BY m.id ORDER BY m.generic_name;
