-- 1. 创建数据库（cPanel会自动加前缀，此处仅为结构）
CREATE DATABASE IF NOT EXISTS charityevents_db;
USE charityevents_db;

-- 2. 核心表（复用A2并兼容A3）
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS organizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    mission TEXT NOT NULL,
    contact_email VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    purpose VARCHAR(200) NOT NULL,
    date DATETIME NOT NULL,
    location VARCHAR(200) NOT NULL,
    ticket_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    goal_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0.00,
    category_id INT NOT NULL,
    organization_id INT NOT NULL,
    is_suspended BOOLEAN DEFAULT FALSE,
    latitude DECIMAL(10,6) DEFAULT NULL,
    longitude DECIMAL(10,6) DEFAULT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- 3. A3新增：注册记录表（核心扩展）
CREATE TABLE IF NOT EXISTS registrations (
    registration_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    ticket_quantity INT NOT NULL CHECK (ticket_quantity >= 1),
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_event (email, event_id)  -- 防止重复注册
);

-- 4. 初始化数据（确保A3功能可测试）
INSERT INTO categories (name) VALUES
('Fun Run'), ('Gala Dinner'), ('Silent Auction'), ('Concert');

INSERT INTO organizations (name, mission, contact_email, contact_phone) VALUES
('Community Care', 'Supporting local communities through charity events', 'contact@communitycare.org', '+61 2 9876 5432');

INSERT INTO events (name, description, purpose, date, location, ticket_price, goal_amount, category_id, organization_id, latitude, longitude) VALUES
('City Fun Run 2025', 'Annual 5km fun run to raise funds for children\'s education', 'Support children\'s education programs', '2025-12-15 08:00:00', 'Central Park, Sydney', 25.00, 50000.00, 1, 1, -33.8688, 151.2093),
('Charity Gala Dinner', 'Black-tie event with guest speakers and auctions', 'Fund medical supplies for rural clinics', '2025-11-20 19:00:00', 'Grand Hotel, Melbourne', 150.00, 100000.00, 2, 1, -37.8136, 144.9631);

INSERT INTO registrations (event_id, full_name, email, phone, ticket_quantity) VALUES
(1, 'Alice Smith', 'alice@example.com', '+61 412 345 678', 2),
(1, 'Bob Johnson', 'bob@example.com', '+61 423 456 789', 1),
(2, 'Charlie Brown', 'charlie@example.com', '+61 434 567 890', 3);
