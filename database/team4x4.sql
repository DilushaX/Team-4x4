-- Team4x4 Complete Database Schema and Seeding Script
CREATE DATABASE IF NOT EXISTS team4x4;
USE team4x4;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'customer', -- 'admin', 'customer'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL, -- Stored in LKR
    stock INT DEFAULT 0,
    is_featured TINYINT(1) DEFAULT 0,
    image_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Product Additional Images
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 4. Projects Table (Build Portfolio)
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    description TEXT,
    featured_image TEXT,
    before_image TEXT,
    after_image TEXT,
    modifications TEXT,
    installed_parts TEXT,
    customer_notes TEXT,
    completion_date DATE,
    project_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Project Additional Images
CREATE TABLE IF NOT EXISTS project_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    image_path TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 6. Service Pages Showcase Images
CREATE TABLE IF NOT EXISTS service_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL, -- 'restoration', 'suspension', 'fabrication', 'lighting', 'recovery', 'intake'
    image_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    district VARCHAR(100) NOT NULL,
    postal_code VARCHAR(50) NOT NULL,
    vehicle_model VARCHAR(255) NOT NULL,
    notes TEXT,
    fulfillment_type VARCHAR(50) NOT NULL, -- 'pickup', 'delivery'
    delivery_fee DECIMAL(12, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 8. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_title VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 9. Customer Profiles
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    vehicle_model VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================================================
-- SEED DATA CONFIGURATIONS
-- ==========================================================================

-- 1. Seed Users (Admin: admin@team4x4.lk / Password: admin)
INSERT INTO users (name, email, password, role) VALUES 
('Team 4x4 Admin', 'admin@team4x4.lk', '$2y$12$Ad.M9P1khtrgD1t5/UN16u5/ct5TIFaeuH7LvbL3iB9Z5hDwyZzUi', 'admin');

-- 2. Seed Products
INSERT INTO products (title, slug, description, price, stock, is_featured, image_path) VALUES
('Tactical Bull Bar V2', 'tactical-bull-bar-v2', 'Heavy-duty steel bumper designed to offer maximum protection and winching capabilities in off-road excursions.', 125000.00, 10, 1, 'assets/images/fabrication.jpg'),
('BP-51 Bypass Suspension Kit', 'bp-51-suspension-kit', 'Old Man Emu high-performance internal bypass shocks offering peak articulation and rebound damping configuration.', 380000.00, 5, 1, 'assets/images/suspension.png'),
('Heavy-Duty Rock Sliders', 'heavy-duty-rock-sliders', 'Dual-tube chassis-mounted side rock armor designed for serious rock sliders and threshold safety.', 75000.00, 8, 1, 'assets/images/fabrication.jpg'),
('Warn Zeon 12-S Winch', 'warn-zeon-12-s-winch', 'Warn professional recovery winching kit containing 12,000 lbs pull index and Spydura synthetic rope.', 285000.00, 4, 1, 'assets/images/recovery.jpg'),
('Baja Designs LED Light Bar', 'baja-designs-led-light-bar', '50-inch arc LED light bar providing daytime-level Peripheral forest sight paths in complete pitch darkness.', 165000.00, 12, 1, 'assets/images/lighting.jpg'),
('Safari Snorkel Air Intake', 'safari-snorkel-air-intake', 'Elevated high-flow air induction system protecting engine combustion from mud, sand, and water ingress.', 48000.00, 15, 0, 'assets/images/intake.png');

-- 3. Seed Product Secondary Images
INSERT INTO product_images (product_id, image_path) VALUES
(1, 'assets/images/fabrication.jpg'),
(2, 'assets/images/suspension.png'),
(3, 'assets/images/fabrication.jpg');

-- 4. Seed Dynamic Projects
INSERT INTO projects (id, title, slug, category, description, featured_image, before_image, after_image, modifications, installed_parts, customer_notes, completion_date, project_order) VALUES
(1, 'Defender Restoration Project', 'defender-restoration', 'Restoration', 'A complete frame-off restoration of a classic Land Rover Defender 110, blending heritage aesthetics with advanced modern off-road performance.', 'assets/images/restoration.png', 'assets/images/restoration.png', 'assets/images/restoration.png', 'Galvanized Chassis Upgrade\nPuma Bonnet & Dashboard Conversion\nBespoke Soundproofing Insulation\nUpgraded heavy-duty steering dampers', 'Land Rover 2.4 TDCi Engine\nLT77 Gearbox Rebuild Kit\nHeavy Duty Coil Springs\nCustom Leather Sport Seats', 'Customer requested a classic aesthetic with modern drivability and absolute reliability for island-wide touring.', '2026-03-15', 1),
(2, 'Tactical Suspension Upgrade', 'tactical-suspension-upgrade', 'Suspension', 'Advanced long-travel suspension geometry engineered for extreme off-road terrain stability and maximum wheel articulation.', 'assets/images/suspension.png', 'assets/images/suspension.png', 'assets/images/suspension.png', 'Long-Travel Coilover Conversion\nAdjustable Panhard Rods\nPolyurethane Bushings Kit\nStabilizer Bar Quick Disconnects', 'Old Man Emu BP-51 Bypass Shocks\nARB Adjustable Upper Control Arms\nHeavy-Duty Sway Bar Links\nCoil Spacer Kit', 'Prepared specifically for high-speed trail driving and extreme rock crawling.', '2026-04-20', 2),
(3, 'Custom Armor Build', 'custom-armor-build', 'Fabrication', 'Bespoke heavy-duty external protection, carefully engineered and welded to provide bulletproof defense in hostile rock and forest terrains.', 'assets/images/fabrication.jpg', 'assets/images/fabrication.jpg', 'assets/images/fabrication.jpg', 'Custom Tube Front Bumper\nHeavy-Duty Rock Sliders\nHigh-Clearance Rear Bumper\nFull Underbody Skid Plates', '6mm CNC Cut Mild Steel Plates\nHigh-Tensile Mounting Hardware\nIntegrated Tow Recovery Points', 'Fully sandblasted and powder-coated in matte black textured finish for corrosion resistance.', '2026-02-10', 3),
(4, 'Interior Restoration', 'interior-restoration', 'Restoration', 'Luxury meets raw utility. A complete interior redesign featuring premium marine-grade leather, sound insulation, and modern off-road navigation systems.', 'assets/images/intake.png', 'assets/images/intake.png', 'assets/images/intake.png', 'Hand-Stitched Leather Dashboard\nAlcantara Roof Lining\nHeavy-Duty Rubber Floor Liners\nTouchscreen Nav Console', 'Custom Recaro Orthoped Seats\nGarmin Overlander GPS Dock\nFocal Premium Audio Speaker Array', 'Designed to handle dust and mud while offering a high-end luxury feel inside the cabin.', '2026-05-01', 4),
(5, 'Winch Installation', 'winch-installation', 'Recovery', 'Integrated recovery systems with massive pulling power, custom synthetic line setups, and wireless control units for reliable field operations.', 'assets/images/recovery.jpg', 'assets/images/recovery.jpg', 'assets/images/recovery.jpg', 'Hidden Winch Mount Bracket\nWireless Remote Control Integration\nHeavy-Duty Dual Battery Setup', 'Warn Zeon 12-S Platinum Winch\nSpydura Synthetic Winch Rope\nFactor 55 ProLink Shackle Mount', 'Crucial upgrade for solo overland expeditions where self-recovery is mandatory.', '2025-11-18', 5),
(6, 'LED Lighting Upgrade', 'led-lighting-upgrade', 'Lighting', 'High-output tactical lighting arrays engineered for daytime-level visibility in complete darkness, with custom dash switch control.', 'assets/images/lighting.jpg', 'assets/images/lighting.jpg', 'assets/images/lighting.jpg', 'Roof Rack Lightbar Mounting\nCustom Auxiliary Dash Switch Pod\nWaterproof Wiring Harness Integration', 'Baja Designs 50" OnX6 Arc LED Light Bar\nKC HiLiTES FLEX ERA 4 Auxiliary Lights\nRedarc Switch-Pro Controller', 'Positioned and aimed precisely to eliminate glare on the hood and maximize peripheral forest visibility.', '2026-01-22', 6);

-- 5. Seed Project Additional Images
INSERT INTO project_images (project_id, image_path) VALUES
(1, 'assets/images/restoration.png'), (1, 'assets/images/fabrication.jpg'), (1, 'assets/images/suspension.png'),
(2, 'assets/images/suspension.png'), (2, 'assets/images/recovery.jpg'), (2, 'assets/images/lighting.jpg'),
(3, 'assets/images/fabrication.jpg'), (3, 'assets/images/restoration.png'), (3, 'assets/images/recovery.jpg'),
(4, 'assets/images/intake.png'), (4, 'assets/images/suspension.png'), (4, 'assets/images/lighting.jpg'),
(5, 'assets/images/recovery.jpg'), (5, 'assets/images/fabrication.jpg'), (5, 'assets/images/lighting.jpg'),
(6, 'assets/images/lighting.jpg'), (6, 'assets/images/intake.png'), (6, 'assets/images/recovery.jpg');

-- 6. Seed Showcase Service Images (Default showcases populated)
INSERT INTO service_images (service_name, image_path) VALUES
('restoration', 'assets/images/restoration.png'), ('restoration', 'assets/images/intake.png'),
('suspension', 'assets/images/suspension.png'), ('suspension', 'assets/images/recovery.jpg'),
('fabrication', 'assets/images/fabrication.jpg'), ('fabrication', 'assets/images/restoration.png'),
('lighting', 'assets/images/lighting.jpg'), ('lighting', 'assets/images/intake.png'),
('recovery', 'assets/images/recovery.jpg'), ('recovery', 'assets/images/fabrication.jpg'),
('intake', 'assets/images/intake.png'), ('intake', 'assets/images/suspension.png');
