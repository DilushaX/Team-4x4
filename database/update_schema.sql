-- Team4x4 Database Schema Update Script

USE team4x4;

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_path VARCHAR(255) NULL,
    status TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add columns to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(100) NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100) NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id INT NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS features TEXT NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS compatibility TEXT NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS `condition` VARCHAR(100) NULL DEFAULT 'New';
ALTER TABLE products ADD COLUMN IF NOT EXISTS installation_notes TEXT NULL;

-- 3. Add constraint to products (if not exists)
-- Since MySQL does not easily support ADD FOREIGN KEY IF NOT EXISTS, we will check if category_id exists before creating foreign key relation.
ALTER TABLE products ADD CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

-- 4. Create services table
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255) NULL,
    description TEXT NULL,
    features TEXT NULL, -- pipe-separated
    hero_banner VARCHAR(255) NULL,
    pricing VARCHAR(255) NULL,
    duration VARCHAR(100) NULL,
    compatibility TEXT NULL,
    faqs TEXT NULL, -- JSON structure
    seo_title VARCHAR(255) NULL,
    seo_description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Add columns to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100) DEFAULT 'cod';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'unpaid';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS whatsapp_reference VARCHAR(255) NULL;

-- 6. Create messages/contacts table & add missing columns
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(100) NULL,
    vehicle VARCHAR(255) NULL,
    service VARCHAR(255) NULL,
    subject VARCHAR(255) NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'unread', -- 'unread', 'read', 'replied', 'archived'
    reply_content TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE messages ADD COLUMN IF NOT EXISTS vehicle VARCHAR(255) NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS service VARCHAR(255) NULL;

-- Add reset token columns to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_expires DATETIME NULL;


-- 6b. Create subscribers table (footer newsletter signup)
CREATE TABLE IF NOT EXISTS subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create admin_notifications table
CREATE TABLE IF NOT EXISTS admin_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'order', 'stock', 'customer', 'message'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Create inventory_movements table
CREATE TABLE IF NOT EXISTS inventory_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    quantity_changed INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 9. Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NULL,
    phone VARCHAR(100) NULL,
    email VARCHAR(255) NULL,
    products_supplied TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Create settings table
CREATE TABLE IF NOT EXISTS settings (
    `key` VARCHAR(100) PRIMARY KEY,
    `value` TEXT NULL
);

-- 11. Create quotations tables
CREATE TABLE IF NOT EXISTS quotations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quotation_number VARCHAR(100) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(100) NULL,
    vehicle_model VARCHAR(255) NULL,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'sent', -- 'draft', 'sent', 'accepted', 'expired'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quotation_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quotation_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE
);

-- ==========================================================================
-- SEED DATA
-- ==========================================================================

-- Seed Categories
INSERT IGNORE INTO categories (id, name, slug, description, image_path, status, sort_order) VALUES
(1, 'Performance', 'performance', 'High-performance tuning, suspension coilovers, and cooling systems.', 'assets/images/suspension.png', 1, 1),
(2, 'Exterior', 'exterior', 'Custom bumpers, body armor, and roll cages built to order.', 'assets/images/fabrication.jpg', 1, 2),
(3, 'Interior', 'interior', 'Marine-grade leather seating, premium soundproofing, and custom navigations.', 'assets/images/intake.png', 1, 3),
(4, 'Lighting', 'lighting', 'Military-grade LED bars and off-road illumination units.', 'assets/images/lighting.jpg', 1, 4),
(5, 'Recovery', 'recovery', 'Winch systems, kinetic ropes, and recovery hardware.', 'assets/images/recovery.jpg', 1, 5),
(6, 'Intake', 'intake', 'Elevated snorkels and high-flow air filters.', 'assets/images/intake.png', 1, 6),
(7, 'Suspension', 'suspension', 'Heavy duty coils, leaf springs, and performance shocks.', 'assets/images/suspension.png', 1, 7);

-- Seed Settings
INSERT IGNORE INTO settings (`key`, `value`) VALUES
('business_name', 'Team 4x4'),
('phone', '+94 70 393 9459'),
('whatsapp', '+94 70 393 9459'),
('email', 'info@team4x4.com'),
('address', 'No. 42, Industrial Zone Road, Colombo 00200, Sri Lanka'),
('facebook', 'https://facebook.com/team4x4'),
('instagram', 'https://instagram.com/team4x4'),
('youtube', 'https://youtube.com/team4x4'),
('logo', 'assets/images/logo.png'),
('currency', 'LKR'),
('delivery_charges', '2500'),
('business_hours', 'Mon - Fri: 0800 - 1800 hrs; Sat: 0900 - 1400 hrs; Sun: Offline'),
('smtp_host', 'localhost'),
('smtp_port', '25'),
('smtp_user', ''),
('smtp_pass', ''),
('smtp_secure', 'none');

-- Seed Services
INSERT IGNORE INTO services (id, slug, title, subtitle, description, features, hero_banner, pricing, duration, compatibility, faqs, seo_title, seo_description) VALUES
(1, 'restoration', 'Frame-Off Restoration', 'Restoration Service', 'Comprehensive rebuilds returning classic hardware to factory-plus specifications, incorporating modern materials while preserving original tactical aesthetics.', 'Chassis reinforcement & corrosion control|Engine rebuild prep + performance calibration|High-strength suspension mounting points|Modern protection and finish coating', 'assets/images/restoration.png', 'LKR 280,000 - 420,000', '4-8 weeks', 'Land Rover Defender\nToyota Land Cruiser\nJeep Wrangler & Classic 4x4 platforms', '[{"q":"Do you use original replacement parts?","a":"Yes, we source authentic OEM parts or high-performance aftermarket parts as per project requirements."},{"q":"Do you provide a warranty on frame work?","a":"Yes, all structural welding and frame powder-coatings include a 3-year rust-through warranty."}]', 'Team 4x4 | Frame-Off Restoration', 'Precision rebuilds restore heritage rigs to factory-plus condition with full chassis, drivetrain, and finish work.'),
(2, 'suspension', 'Tactical Suspension', 'Suspension Service', 'Advanced damping systems and geometry correction for extreme terrain dominance. Engineered for payload capacity and high-speed stability.', 'Long-Travel Coilover Conversion|Adjustable Panhard Rods|Polyurethane Bushings Kit|Stabilizer Bar Quick Disconnects', 'assets/images/suspension.png', 'LKR 180,000 - 320,000', '2-4 weeks', 'Toyota Land Cruiser\nLand Rover Defender\nHilux, D-Max & common 4x4 pickups', '[{"q":"What is internal bypass damping?","a":"Bypass damping allows progressive damping levels that increase in stiffness as the shock reaches its compression limit, preventing bottoming out."}]', 'Team 4x4 | Tactical Suspension coilovers', 'High-performance coilovers and bypass shocks custom-tuned for extreme Sri Lankan terrains.'),
(3, 'fabrication', 'Armor & Fabrication', 'Fabrication Service', 'Bespoke rock sliders, bumpers, and skid plates TIG welded from high-tensile steel and aluminium. Maximum protection with zero compromise.', 'Bespoke bumper mounting|CNC cut mild-steel skid plates|High-tensile hardware configurations|Corrosion-resistant textured finishes', 'assets/images/fabrication.jpg', 'LKR 80,000 - 150,000', '1-2 weeks', 'Defender, Wrangler, Land Cruiser, Hilux', '[{"q":"Are skid plates aluminum or steel?","a":"We offer both: 6mm CNC-bent marine-grade aluminum for lightweight shielding, or 4mm mild steel for maximum rock protection."}]', 'Team 4x4 | Custom Off-road Armor & Fabrication', 'Heavy-duty front bumpers, rock sliders, and roll cages handcrafted in our workshop.'),
(4, 'lighting', 'High-Output Lumens', 'Lighting Service', 'Surgical illumination for zero-light environments. Military-grade LED systems designed for maximum visibility and long-range beam projection.', '50-inch arc LED bars|KC HiLiTES FLEX ERA auxiliary pods|Custom dash switch controllers|Waterproof relay wiring harnesses', 'assets/images/lighting.jpg', 'LKR 45,000 - 95,000', '1-3 days', 'All vehicles / Universal fitment', '[{"q":"Do auxiliary lights drain the battery?","a":"We install dual-battery isolation systems or high-output alternators if the lighting load exceeds battery capacities."}]', 'Team 4x4 | High-Output Lumens & Trail Lighting', 'Surgical trail illumination kits and wiring arrays.'),
(5, 'recovery', 'Winch Systems & Recovery', 'Recovery Service', 'Extreme-duty winching solutions for self-recovery in the most hostile environments. Built for reliability when everything else fails.', '12,000lb winch integration|Recovery point reinforcement|Snatch block and rigging kit|Heavy-duty control switches', 'assets/images/recovery.jpg', 'LKR 170,000 - 300,000', '1-3 weeks', '4x4 pickups and SUVs', '[{"q":"Should I get steel or synthetic winch line?","a":"We recommend synthetic line (like Spydura) because it is safer, lighter, and does not store kinetic energy under tension like steel cable."}]', 'Team 4x4 | Heavy-Duty Winches & Recovery Systems', 'Professional recovery setups including high-draw winches and reinforced chassis tow hooks.'),
(6, 'intake', 'Elevated Air Intakes', 'Intake Service', 'Deep-water fording and dust filtration systems. Ensure your engine breathes clean, cool air regardless of the terrain conditions.', 'Safari snorkel air induction|High-flow washable filters|Sealed intake box plumbing|Water separator valves', 'assets/images/intake.png', 'LKR 38,000 - 68,000', '1-2 days', 'Hilux, Land Cruiser, Defender, Wrangler', '[{"q":"Does a snorkel increase engine performance?","a":"Snorkels provide cooler ram-air from roof height which can improve fuel efficiency and air charge densities."}]', 'Team 4x4 | Snorkel Air Intakes & Filtration', 'Water-fording snorkels and sealed engine intakes.');

-- Update products to link to Categories table
UPDATE products SET category_id = 1 WHERE category = 'Performance';
UPDATE products SET category_id = 2 WHERE category = 'Exterior';
UPDATE products SET category_id = 3 WHERE category = 'Interior';
UPDATE products SET category_id = 4 WHERE category = 'Lighting';
UPDATE products SET category_id = 5 WHERE category = 'Recovery';
UPDATE products SET category_id = 6 WHERE category = 'Intake';
UPDATE products SET category_id = 7 WHERE category = 'Suspension';

-- Populate remaining product details if missing
UPDATE products SET sku = 'T4X4-BBV2', features = 'Heavy-duty steel construction|Integrated winch mount|D-Ring recovery points|Textured powder coat finish', compatibility = 'Defender 90 / 110 / 130 / Universal', installation_notes = 'Bolt-on fitment; professional installation by certified technicians recommended.' WHERE id = 1;
UPDATE products SET sku = 'T4X4-BP51', features = 'Internal bypass shocks|Adjustable compression & rebound|Vehicle-specific valving|Corrosion resistant bodies', compatibility = 'Land Cruiser 70/80/100, Defender 110/130', installation_notes = 'Requires professional alignment after installation.' WHERE id = 2;
UPDATE products SET sku = 'T4X4-RS01', features = 'Chassis-mounted design|Dual outer rail protection|Non-slip step plates|Gloss black powder coat', compatibility = 'Defender 90 / 110 / 130', installation_notes = 'Bolt-on to factory chassis outriggers.' WHERE id = 3;
UPDATE products SET sku = 'T4X4-WZ12', features = '12,000 lbs pull capacity|Spydura synthetic rope|IP68 waterproof rating|Wireless remote control', compatibility = 'All steel bumpers / Universal', installation_notes = 'Requires minimum 650 CCA battery; dual battery system recommended.' WHERE id = 4;
UPDATE products SET sku = 'T4X4-LB50', features = '50" curved double row LED|22,000 raw lumens|IP69K ingress protection|Combo spot/flood optic', compatibility = 'Roof rack mounts / Universal', installation_notes = 'Includes wiring loom, relay, fuse, and switch.' WHERE id = 5;
UPDATE products SET sku = 'T4X4-SN01', features = 'Elevated air intake|UV stable polyethylene|High-flow air grid|Decreased engine dust loading', compatibility = 'Defender 300Tdi/Td5/Puma', installation_notes = 'Requires template cutting on side fender.' WHERE id = 6;

-- Performance Indexes
SET @exist := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'products' AND index_name = 'idx_products_cat');
SET @sqlstmt := IF(@exist = 0, 'CREATE INDEX idx_products_cat ON products(category_id)', 'SELECT "index idx_products_cat exists"');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'products' AND index_name = 'idx_products_price');
SET @sqlstmt := IF(@exist = 0, 'CREATE INDEX idx_products_price ON products(price)', 'SELECT "index idx_products_price exists"');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'products' AND index_name = 'idx_products_featured');
SET @sqlstmt := IF(@exist = 0, 'CREATE INDEX idx_products_featured ON products(is_featured)', 'SELECT "index idx_products_featured exists"');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'orders' AND index_name = 'idx_orders_status');
SET @sqlstmt := IF(@exist = 0, 'CREATE INDEX idx_orders_status ON orders(status)', 'SELECT "index idx_orders_status exists"');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'orders' AND index_name = 'idx_orders_user');
SET @sqlstmt := IF(@exist = 0, 'CREATE INDEX idx_orders_user ON orders(user_id)', 'SELECT "index idx_orders_user exists"');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'orders' AND index_name = 'idx_orders_created');
SET @sqlstmt := IF(@exist = 0, 'CREATE INDEX idx_orders_created ON orders(created_at)', 'SELECT "index idx_orders_created exists"');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

