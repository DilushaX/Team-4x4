-- Team4x4 Complete Unified Database Schema and Initial Seed Script
CREATE DATABASE IF NOT EXISTS team4x4 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE team4x4;

-- Disable foreign key checks for clean table initialization
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS quotation_items;
DROP TABLE IF EXISTS quotations;
DROP TABLE IF EXISTS inventory_movements;
DROP TABLE IF EXISTS admin_notifications;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS service_images;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS project_images;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'customer', -- 'admin', 'customer'
    remember_token VARCHAR(255) NULL,
    reset_token VARCHAR(255) NULL,
    reset_expires DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 2. Categories Table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NULL,
    image_path VARCHAR(255) NULL,
    status TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Products Table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NULL,
    category VARCHAR(100) NULL,
    category_id INT NULL,
    description TEXT NULL,
    price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    stock INT DEFAULT 0,
    is_featured TINYINT(1) DEFAULT 0,
    image_path VARCHAR(255) NULL,
    features TEXT NULL,
    compatibility TEXT NULL,
    installation_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Product Additional Images
CREATE TABLE product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Customers Table
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    phone VARCHAR(50) NULL,
    address TEXT NULL,
    vehicle_model VARCHAR(255) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Orders Table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address TEXT NULL,
    district VARCHAR(100) NULL,
    postal_code VARCHAR(50) NULL,
    vehicle_model VARCHAR(255) NOT NULL,
    notes TEXT NULL,
    fulfillment_type VARCHAR(50) NOT NULL DEFAULT 'pickup', -- 'pickup', 'delivery'
    delivery_fee DECIMAL(12, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(100) DEFAULT 'Cash on Delivery',
    payment_status VARCHAR(50) DEFAULT 'unpaid',
    whatsapp_reference VARCHAR(255) NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'processing', 'completed', 'cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_orders_status (status),
    INDEX idx_orders_user (user_id),
    INDEX idx_orders_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Order Items Table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_title VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(12, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Projects Table (Build Gallery)
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(255) NOT NULL,
    description TEXT NULL,
    featured_image VARCHAR(255) NULL,
    before_image VARCHAR(255) NULL,
    after_image VARCHAR(255) NULL,
    modifications TEXT NULL,
    installed_parts TEXT NULL,
    customer_notes TEXT NULL,
    completion_date DATE NULL,
    project_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_projects_slug (slug),
    INDEX idx_projects_cat (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Project Additional Images
CREATE TABLE project_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Services Table
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255) NULL,
    description TEXT NULL,
    features TEXT NULL,
    hero_banner VARCHAR(255) NULL,
    pricing VARCHAR(255) NULL,
    duration VARCHAR(100) NULL,
    compatibility TEXT NULL,
    faqs TEXT NULL,
    seo_title VARCHAR(255) NULL,
    seo_description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_services_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Service Showcase Images
CREATE TABLE service_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Messages Table (Contact Form)
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(100) NULL,
    vehicle VARCHAR(255) NULL,
    service VARCHAR(255) NULL,
    subject VARCHAR(255) NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'unread',
    reply_content TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 13. Admin Notifications Table
CREATE TABLE admin_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Inventory Movements Table
CREATE TABLE inventory_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    quantity_changed INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Suppliers Table
CREATE TABLE suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NULL,
    phone VARCHAR(100) NULL,
    email VARCHAR(255) NULL,
    products_supplied TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Settings Table
CREATE TABLE settings (
    `key` VARCHAR(100) PRIMARY KEY,
    `value` TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Quotations Tables
CREATE TABLE quotations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quotation_number VARCHAR(100) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(100) NULL,
    vehicle_model VARCHAR(255) NULL,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'sent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE quotation_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quotation_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================================================
-- SEED DATA
-- ==========================================================================

-- 1. Users (Admin: admin@team4x4.lk / Password: admin)
INSERT INTO users (id, name, email, password, role) VALUES 
(1, 'Team 4x4 Admin', 'admin@team4x4.lk', '$2y$12$Ad.M9P1khtrgD1t5/UN16u5/ct5TIFaeuH7LvbL3iB9Z5hDwyZzUi', 'admin'),
(2, 'Kasun Silva', 'kasun@email.lk', '$2y$12$Ad.M9P1khtrgD1t5/UN16u5/ct5TIFaeuH7LvbL3iB9Z5hDwyZzUi', 'customer'),
(3, 'Nimal Perera', 'nimal.p@gmail.com', '$2y$12$Ad.M9P1khtrgD1t5/UN16u5/ct5TIFaeuH7LvbL3iB9Z5hDwyZzUi', 'customer');

-- 2. Customer profiles
INSERT INTO customers (id, user_id, phone, address, vehicle_model, notes) VALUES
(1, 2, '+94 77 123 4567', 'No. 15, Galle Road, Colombo 03', 'Land Rover Defender 110', 'Prefers OEM parts for restoration.'),
(2, 3, '+94 71 987 6543', 'No. 88, Kandy Road, Gampaha', 'Toyota Land Cruiser 79', 'Heavy-duty suspension build.');

-- 3. Categories
INSERT INTO categories (id, name, slug, description, image_path, status, sort_order) VALUES
(1, 'Performance', 'performance', 'High-performance tuning, suspension coilovers, and cooling systems.', 'assets/images/suspension.png', 1, 1),
(2, 'Exterior', 'exterior', 'Custom bumpers, body armor, and roll cages built to order.', 'assets/images/fabrication.jpg', 1, 2),
(3, 'Interior', 'interior', 'Marine-grade leather seating, premium soundproofing, and custom navigations.', 'assets/images/intake.png', 1, 3),
(4, 'Lighting', 'lighting', 'Military-grade LED bars and off-road illumination units.', 'assets/images/lighting.jpg', 1, 4),
(5, 'Recovery', 'recovery', 'Winch systems, kinetic ropes, and recovery hardware.', 'assets/images/recovery.jpg', 1, 5),
(6, 'Intake', 'intake', 'Elevated snorkels and high-flow air filters.', 'assets/images/intake.png', 1, 6),
(7, 'Suspension', 'suspension', 'Heavy duty coils, leaf springs, and performance shocks.', 'assets/images/suspension.png', 1, 7);

-- 4. Products
INSERT INTO products (id, title, slug, sku, category, category_id, description, price, stock, is_featured, image_path, features, compatibility, installation_notes) VALUES
(1, 'Tactical Bull Bar V2', 'tactical-bull-bar-v2', 'T4X4-BBV2', 'Exterior', 2, 'Heavy-duty steel bumper designed to offer maximum protection and winching capabilities in off-road excursions.', 125000.00, 10, 1, 'assets/images/fabrication.jpg', 'Heavy-duty steel construction|Integrated winch mount|D-Ring recovery points|Textured powder coat finish', 'Defender 90 / 110 / 130 / Universal', 'Bolt-on fitment; professional installation by certified technicians recommended.'),
(2, 'BP-51 Bypass Suspension Kit', 'bp-51-suspension-kit', 'T4X4-BP51', 'Suspension', 7, 'Old Man Emu high-performance internal bypass shocks offering peak articulation and rebound damping configuration.', 380000.00, 5, 1, 'assets/images/suspension.png', 'Internal bypass shocks|Adjustable compression & rebound|Vehicle-specific valving|Corrosion resistant bodies', 'Land Cruiser 70/80/100, Defender 110/130', 'Requires professional alignment after installation.'),
(3, 'Heavy-Duty Rock Sliders', 'heavy-duty-rock-sliders', 'T4X4-RS01', 'Exterior', 2, 'Dual-tube chassis-mounted side rock armor designed for serious rock sliders and threshold safety.', 75000.00, 8, 1, 'assets/images/fabrication.jpg', 'Chassis-mounted design|Dual outer rail protection|Non-slip step plates|Gloss black powder coat', 'Defender 90 / 110 / 130', 'Bolt-on to factory chassis outriggers.'),
(4, 'Warn Zeon 12-S Winch', 'warn-zeon-12-s-winch', 'T4X4-WZ12', 'Recovery', 5, 'Warn professional recovery winching kit containing 12,000 lbs pull index and Spydura synthetic rope.', 285000.00, 4, 1, 'assets/images/recovery.jpg', '12,000 lbs pull capacity|Spydura synthetic rope|IP68 waterproof rating|Wireless remote control', 'All steel bumpers / Universal', 'Requires minimum 650 CCA battery; dual battery system recommended.'),
(5, 'Baja Designs LED Light Bar', 'baja-designs-led-light-bar', 'T4X4-LB50', 'Lighting', 4, '50-inch arc LED light bar providing daytime-level Peripheral forest sight paths in complete pitch darkness.', 165000.00, 12, 1, 'assets/images/lighting.jpg', '50" curved double row LED|22,000 raw lumens|IP69K ingress protection|Combo spot/flood optic', 'Roof rack mounts / Universal', 'Includes wiring loom, relay, fuse, and switch.'),
(6, 'Safari Snorkel Air Intake', 'safari-snorkel-air-intake', 'T4X4-SN01', 'Intake', 6, 'Elevated high-flow air induction system protecting engine combustion from mud, sand, and water ingress.', 48000.00, 15, 0, 'assets/images/intake.png', 'Elevated air intake|UV stable polyethylene|High-flow air grid|Decreased engine dust loading', 'Defender 300Tdi/Td5/Puma', 'Requires template cutting on side fender.');

-- 5. Product Images
INSERT INTO product_images (id, product_id, image_path) VALUES
(1, 1, 'assets/images/fabrication.jpg'),
(2, 2, 'assets/images/suspension.png'),
(3, 3, 'assets/images/fabrication.jpg'),
(4, 4, 'assets/images/recovery.jpg'),
(5, 5, 'assets/images/lighting.jpg'),
(6, 6, 'assets/images/intake.png');

-- 6. Projects (Gallery)
INSERT INTO projects (id, title, slug, category, description, featured_image, before_image, after_image, modifications, installed_parts, customer_notes, completion_date, project_order) VALUES
(1, 'Defender Restoration Project', 'defender-restoration', 'Restoration', 'A complete frame-off restoration of a classic Land Rover Defender 110, blending heritage aesthetics with advanced modern off-road performance.', 'assets/images/restoration.png', 'assets/images/restoration.png', 'assets/images/restoration.png', 'Galvanized Chassis Upgrade\nPuma Bonnet & Dashboard Conversion\nBespoke Soundproofing Insulation', 'Land Rover 2.4 TDCi Engine\nLT77 Gearbox Rebuild Kit\nHeavy Duty Coil Springs', 'Customer requested a classic aesthetic with modern drivability and absolute reliability for island-wide touring.', '2026-03-15', 1),
(2, 'Tactical Suspension Upgrade', 'tactical-suspension-upgrade', 'Suspension', 'Advanced long-travel suspension geometry engineered for extreme off-road terrain stability and maximum wheel articulation.', 'assets/images/suspension.png', 'assets/images/suspension.png', 'assets/images/suspension.png', 'Long-Travel Coilover Conversion\nAdjustable Panhard Rods\nPolyurethane Bushings Kit', 'Old Man Emu BP-51 Bypass Shocks\nARB Adjustable Upper Control Arms', 'Prepared specifically for high-speed trail driving and extreme rock crawling.', '2026-04-20', 2),
(3, 'Custom Armor Build', 'custom-armor-build', 'Fabrication', 'Bespoke heavy-duty external protection, carefully engineered and welded to provide bulletproof defense in hostile rock and forest terrains.', 'assets/images/fabrication.jpg', 'assets/images/fabrication.jpg', 'assets/images/fabrication.jpg', 'Custom Tube Front Bumper\nHeavy-Duty Rock Sliders\nFull Underbody Skid Plates', '6mm CNC Cut Mild Steel Plates\nHigh-Tensile Mounting Hardware', 'Fully sandblasted and powder-coated in matte black textured finish for corrosion resistance.', '2026-02-10', 3),
(4, 'Interior Restoration', 'interior-restoration', 'Restoration', 'Luxury meets raw utility. A complete interior redesign featuring premium marine-grade leather, sound insulation, and modern off-road navigation systems.', 'assets/images/intake.png', 'assets/images/intake.png', 'assets/images/intake.png', 'Hand-Stitched Leather Dashboard\nAlcantara Roof Lining\nHeavy-Duty Rubber Floor Liners', 'Custom Recaro Orthoped Seats\nGarmin Overlander GPS Dock', 'Designed to handle dust and mud while offering a high-end luxury feel inside the cabin.', '2026-05-01', 4),
(5, 'Winch Installation', 'winch-installation', 'Recovery', 'Integrated recovery systems with massive pulling power, custom synthetic line setups, and wireless control units for reliable field operations.', 'assets/images/recovery.jpg', 'assets/images/recovery.jpg', 'assets/images/recovery.jpg', 'Hidden Winch Mount Bracket\nWireless Remote Control Integration', 'Warn Zeon 12-S Platinum Winch\nSpydura Synthetic Winch Rope', 'Crucial upgrade for solo overland expeditions where self-recovery is mandatory.', '2025-11-18', 5),
(6, 'LED Lighting Upgrade', 'led-lighting-upgrade', 'Lighting', 'High-output tactical lighting arrays engineered for daytime-level visibility in complete darkness, with custom dash switch control.', 'assets/images/lighting.jpg', 'assets/images/lighting.jpg', 'assets/images/lighting.jpg', 'Roof Rack Lightbar Mounting\nCustom Auxiliary Dash Switch Pod', 'Baja Designs 50" OnX6 Arc LED Light Bar\nKC HiLiTES FLEX ERA 4 Auxiliary Lights', 'Positioned and aimed precisely to eliminate glare on the hood and maximize peripheral forest visibility.', '2026-01-22', 6);

-- 7. Project Secondary Images
INSERT INTO project_images (id, project_id, image_path) VALUES
(1, 1, 'assets/images/restoration.png'), (2, 1, 'assets/images/fabrication.jpg'), (3, 1, 'assets/images/suspension.png'),
(4, 2, 'assets/images/suspension.png'), (5, 2, 'assets/images/recovery.jpg'), (6, 2, 'assets/images/lighting.jpg'),
(7, 3, 'assets/images/fabrication.jpg'), (8, 3, 'assets/images/restoration.png'), (9, 3, 'assets/images/recovery.jpg'),
(10, 4, 'assets/images/intake.png'), (11, 4, 'assets/images/suspension.png'), (12, 4, 'assets/images/lighting.jpg'),
(13, 5, 'assets/images/recovery.jpg'), (14, 5, 'assets/images/fabrication.jpg'), (15, 5, 'assets/images/lighting.jpg'),
(16, 6, 'assets/images/lighting.jpg'), (17, 6, 'assets/images/intake.png'), (18, 6, 'assets/images/recovery.jpg');

-- 8. Services
INSERT INTO services (id, slug, title, subtitle, description, features, hero_banner, pricing, duration, compatibility, faqs, seo_title, seo_description) VALUES
(1, 'restoration', 'Frame-Off Restoration', 'Restoration Service', 'Comprehensive rebuilds returning classic hardware to factory-plus specifications, incorporating modern materials while preserving original tactical aesthetics.', 'Chassis reinforcement & corrosion control|Engine rebuild prep + performance calibration|High-strength suspension mounting points|Modern protection and finish coating', 'assets/images/restoration.png', 'LKR 280,000 - 420,000', '4-8 weeks', 'Land Rover Defender\nToyota Land Cruiser\nJeep Wrangler & Classic 4x4 platforms', '[{"q":"Do you use original replacement parts?","a":"Yes, we source authentic OEM parts or high-performance aftermarket parts as per project requirements."},{"q":"Do you provide a warranty on frame work?","a":"Yes, all structural welding and frame powder-coatings include a 3-year rust-through warranty."}]', 'Team 4x4 | Frame-Off Restoration', 'Precision rebuilds restore heritage rigs to factory-plus condition with full chassis, drivetrain, and finish work.'),
(2, 'suspension', 'Tactical Suspension', 'Suspension Service', 'Advanced damping systems and geometry correction for extreme terrain dominance. Engineered for payload capacity and high-speed stability.', 'Long-Travel Coilover Conversion|Adjustable Panhard Rods|Polyurethane Bushings Kit|Stabilizer Bar Quick Disconnects', 'assets/images/suspension.png', 'LKR 180,000 - 320,000', '2-4 weeks', 'Toyota Land Cruiser\nLand Rover Defender\nHilux, D-Max & common 4x4 pickups', '[{"q":"What is internal bypass damping?","a":"Bypass damping allows progressive damping levels that increase in stiffness as the shock reaches its compression limit, preventing bottoming out."}]', 'Team 4x4 | Tactical Suspension coilovers', 'High-performance coilovers and bypass shocks custom-tuned for extreme Sri Lankan terrains.'),
(3, 'fabrication', 'Armor & Fabrication', 'Fabrication Service', 'Bespoke rock sliders, bumpers, and skid plates TIG welded from high-tensile steel and aluminium. Maximum protection with zero compromise.', 'Bespoke bumper mounting|CNC cut mild-steel skid plates|High-tensile hardware configurations|Corrosion-resistant textured finishes', 'assets/images/fabrication.jpg', 'LKR 80,000 - 150,000', '1-2 weeks', 'Defender, Wrangler, Land Cruiser, Hilux', '[{"q":"Are skid plates aluminum or steel?","a":"We offer both: 6mm CNC-bent marine-grade aluminum for lightweight shielding, or 4mm mild steel for maximum rock protection."}]', 'Team 4x4 | Custom Off-road Armor & Fabrication', 'Heavy-duty front bumpers, rock sliders, and roll cages handcrafted in our workshop.'),
(4, 'lighting', 'High-Output Lumens', 'Lighting Service', 'Surgical illumination for zero-light environments. Military-grade LED systems designed for maximum visibility and long-range beam projection.', '50-inch arc LED bars|KC HiLiTES FLEX ERA auxiliary pods|Custom dash switch controllers|Waterproof relay wiring harnesses', 'assets/images/lighting.jpg', 'LKR 45,000 - 95,000', '1-3 days', 'All vehicles / Universal fitment', '[{"q":"Do auxiliary lights drain the battery?","a":"We install dual-battery isolation systems or high-output alternators if the lighting load exceeds battery capacities."}]', 'Team 4x4 | High-Output Lumens & Trail Lighting', 'Surgical trail illumination kits and wiring arrays.'),
(5, 'recovery', 'Winch Systems & Recovery', 'Recovery Service', 'Extreme-duty winching solutions for self-recovery in the most hostile environments. Built for reliability when everything else fails.', '12,000lb winch integration|Recovery point reinforcement|Snatch block and rigging kit|Heavy-duty control switches', 'assets/images/recovery.jpg', 'LKR 170,000 - 300,000', '1-3 weeks', '4x4 pickups and SUVs', '[{"q":"Should I get steel or synthetic winch line?","a":"We recommend synthetic line (like Spydura) because it is safer, lighter, and does not store kinetic energy under tension like steel cable."}]', 'Team 4x4 | Heavy-Duty Winches & Recovery Systems', 'Professional recovery setups including high-draw winches and reinforced chassis tow hooks.'),
(6, 'intake', 'Elevated Air Intakes', 'Intake Service', 'Deep-water fording and dust filtration systems. Ensure your engine breathes clean, cool air regardless of the terrain conditions.', 'Safari snorkel air induction|High-flow washable filters|Sealed intake box plumbing|Water separator valves', 'assets/images/intake.png', 'LKR 38,000 - 68,000', '1-2 days', 'Hilux, Land Cruiser, Defender, Wrangler', '[{"q":"Does a snorkel increase engine performance?","a":"Snorkels provide cooler ram-air from roof height which can improve fuel efficiency and air charge densities."}]', 'Team 4x4 | Snorkel Air Intakes & Filtration', 'Water-fording snorkels and sealed engine intakes.');

-- 9. Service Showcase Images
INSERT INTO service_images (id, service_name, image_path) VALUES
(1, 'restoration', 'assets/images/restoration.png'), (2, 'restoration', 'assets/images/intake.png'),
(3, 'suspension', 'assets/images/suspension.png'), (4, 'suspension', 'assets/images/recovery.jpg'),
(5, 'fabrication', 'assets/images/fabrication.jpg'), (6, 'fabrication', 'assets/images/restoration.png'),
(7, 'lighting', 'assets/images/lighting.jpg'), (8, 'lighting', 'assets/images/intake.png'),
(9, 'recovery', 'assets/images/recovery.jpg'), (10, 'recovery', 'assets/images/fabrication.jpg'),
(11, 'intake', 'assets/images/intake.png'), (12, 'intake', 'assets/images/suspension.png');

-- 10. Orders & Order Items (Initial Seed)
INSERT INTO orders (id, user_id, customer_name, phone, email, address, district, postal_code, vehicle_model, notes, fulfillment_type, delivery_fee, total_amount, payment_method, status, created_at) VALUES
(1, 2, 'Kasun Silva', '+94 77 123 4567', 'kasun@email.lk', 'No. 15, Galle Road', 'Colombo', '00300', 'Defender 110', 'Call before delivery.', 'delivery', 2500.00, 510000.00, 'Cash on Delivery', 'pending', '2026-06-23 10:30:00'),
(2, 3, 'Nimal Perera', '+94 71 987 6543', 'nimal.p@gmail.com', 'No. 88, Kandy Road', 'Gampaha', '11000', 'Land Cruiser 79', 'Garage collection planned.', 'pickup', 0.00, 380000.00, 'Bank Transfer', 'confirmed', '2026-06-22 14:15:00');

INSERT INTO order_items (id, order_id, product_id, product_title, quantity, price) VALUES
(1, 1, 1, 'Tactical Bull Bar V2', 1, 125000.00),
(2, 1, 2, 'BP-51 Bypass Suspension Kit', 1, 380000.00),
(3, 2, 2, 'BP-51 Bypass Suspension Kit', 1, 380000.00);

-- 11. Messages (Contact Form Seed)
INSERT INTO messages (id, name, email, phone, subject, message, status) VALUES
(1, 'Amaya Fernando', 'amaya@gmail.com', '+94 77 555 1234', 'Restoration Inquiry', 'I have a Land Rover Defender 90 classic that needs full frame restoration and chassis galvanized treatment. Please get back to me with estimated timelines.', 'unread'),
(2, 'Ravi Kumara', 'ravi.k@outlook.com', '+94 71 333 9999', 'Winch Compatibility', 'Can the Warn Zeon 12-S Winch be installed into the Tactical Bull Bar V2 without extra bracket modification?', 'read');

-- 12. Settings
INSERT INTO settings (`key`, `value`) VALUES
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
('business_hours', 'Mon - Fri: 0800 - 1800 hrs; Sat: 0900 - 1400 hrs; Sun: Offline');

-- 13. Suppliers
INSERT INTO suppliers (id, name, company, phone, email, products_supplied) VALUES
(1, 'Fox Performance', 'Fox Factory', '+1 800 369 7469', 'trade@foxfactory.com', 'Suspension Shocks & Coilovers'),
(2, 'ARB Colombo', 'ARB 4x4 Accessories', '+94 11 234 5678', 'orders@arb.lk', 'Recovery Equipment, Bull Bars');

