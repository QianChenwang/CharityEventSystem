-- 1. 创建数据库（作业要求命名）
CREATE DATABASE IF NOT EXISTS charityevents_db;
USE charityevents_db;

-- 2. 事件类别表
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 慈善机构表
CREATE TABLE IF NOT EXISTS organizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    mission TEXT NOT NULL,
    contact_email VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 事件表（含purpose和经纬度字段）
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    purpose TEXT NOT NULL, -- 事件目的（作业要求）
    date DATETIME NOT NULL,
    location VARCHAR(200) NOT NULL,
    ticket_price DECIMAL(10,2) NOT NULL,
    goal_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0.00,
    category_id INT NOT NULL,
    organization_id INT NOT NULL,
    is_suspended BOOLEAN DEFAULT FALSE,
    latitude DECIMAL(10,6), -- 天气API需要
    longitude DECIMAL(10,6), -- 天气API需要
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- 5. 注册记录表（作业新增要求）
CREATE TABLE IF NOT EXISTS registrations (
    registration_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    ticket_quantity INT NOT NULL CHECK (ticket_quantity >= 1),
    total_amount DECIMAL(10,2) NOT NULL, -- 票价×数量
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE KEY (email, event_id) -- 阻止重复注册（作业要求）
);

-- 6. 插入类别
INSERT INTO categories (name) VALUES
('Fun Run'),
('Gala Dinner'),
('Silent Auction'),
('Concert');

-- 7. 插入机构
INSERT INTO organizations (name, mission, contact_email, contact_phone) VALUES
(
    'Community Care Foundation',
    'Our mission is to support vulnerable families in the local community through food banks, education grants, and medical assistance. We believe every individual deserves access to basic needs and opportunities to thrive.',
    'contact@ccfoundation.org',
    '+61 2 1234 5678'
);

-- 8. 插入8个样本事件（含经纬度，适配天气API）
INSERT INTO events (name, description, purpose, date, location, ticket_price, goal_amount, current_amount, category_id, organization_id, is_suspended, latitude, longitude) VALUES
-- Upcoming 事件
(
    'City Fun Run 2025',
    'A family-friendly 5km fun run! All proceeds go to local food banks.',
    'Raise funds for local food banks to support low-income families with weekly meals.',
    '2025-10-15 08:00:00',
    'Central Park, Sydney',
    25.00,
    50000.00,
    12500.00,
    1,
    1,
    FALSE,
    -33.870453, 151.208755 -- 悉尼经纬度
),
(
    'Charity Gala Dinner',
    'An elegant black-tie event with 3-course meal and live jazz.',
    'Fund medical grants for low-income families to cover children’s hospital bills.',
    '2025-11-20 19:00:00',
    'Harbor View Hotel, Melbourne',
    150.00,
    100000.00,
    35000.00,
    2,
    1,
    FALSE,
    -37.813628, 144.963058 -- 墨尔本经纬度
),
(
    'Winter Concert for Kids',
    'Live classical music by City Youth Orchestra (free entry).',
    'Support education programs for disadvantaged children (school supplies, tutoring).',
    '2025-12-05 14:00:00',
    'Town Hall, Brisbane',
    0.00,
    20000.00,
    8500.00,
    4,
    1,
    FALSE,
    -27.469771, 153.025124 -- 布里斯班经纬度
),
(
    'Silent Auction: Art for Charity',
    'Bid on original artworks by local artists (100% proceeds to education).',
    'Provide scholarships for disadvantaged high school students to attend university.',
    '2025-10-28 10:00:00',
    'Art Gallery, Perth',
    10.00,
    30000.00,
    9200.00,
    3,
    1,
    FALSE,
    -31.950527, 115.860458 -- 珀斯经纬度
),
(
    'Beach Clean & Fun Day',
    'Help clean Manly Beach + games, food trucks, live music.',
    'Fund ocean conservation projects (coral reef restoration, marine plastic cleanup).',
    '2025-11-01 09:00:00',
    'Manly Beach, Sydney',
    15.00,
    15000.00,
    4800.00,
    1,
    1,
    FALSE,
    -33.817337, 151.287747 -- 曼利海滩经纬度
),
-- Past 事件
(
    'Spring Fun Run 2025',
    '3km fun run in September 2025 (raised $32k).',
    'Fund allergy research for children with severe food allergies.',
    '2025-09-01 08:00:00',
    'Botanic Gardens, Sydney',
    20.00,
    30000.00,
    32000.00,
    1,
    1,
    FALSE,
    -33.868820, 151.209295 -- 悉尼植物园经纬度
),
-- Suspended 事件
(
    'Charity Golf Tournament',
    'Golf tournament (suspended due to venue maintenance).',
    'Raise funds for homeless shelters to provide winter bedding and meals.',
    '2025-10-10 08:30:00',
    'Golf Club, Sydney',
    100.00,
    40000.00,
    5000.00,
    1,
    1,
    TRUE,
    -33.847163, 151.184490 -- 悉尼高尔夫俱乐部经纬度
),
(
    'Community Bake Sale',
    'Homemade cakes sold for homeless shelters (suspended due to low volunteers).',
    'Support homeless shelters with daily meals and hygiene kits.',
    '2025-10-05 10:00:00',
    'Community Center, Adelaide',
    5.00,
    8000.00,
    1200.00,
    3,
    1,
    TRUE,
    -34.921230, 138.599503 -- 阿德莱德经纬度
);

-- 9. 插入10条注册记录（作业要求“至少10条”）
INSERT INTO registrations (event_id, full_name, email, phone, ticket_quantity, total_amount) VALUES
(1, 'Alice Smith', 'alice@example.com', '+61 2 1111 2222', 2, 50.00),  -- 事件1（25×2）
(1, 'Bob Johnson', 'bob@example.com', '+61 2 3333 4444', 1, 25.00),   -- 事件1
(2, 'Charlie Brown', 'charlie@example.com', '+61 2 5555 6666', 2, 300.00), -- 事件2（150×2）
(3, 'Diana Prince', 'diana@example.com', '+61 2 7777 8888', 3, 0.00),  -- 事件3（免费）
(4, 'Ethan Hunt', 'ethan@example.com', '+61 2 9999 0000', 1, 10.00),   -- 事件4
(5, 'Fiona Gallagher', 'fiona@example.com', '+61 2 2222 3333', 4, 60.00), -- 事件5（15×4）
(6, 'George Costanza', 'george@example.com', '+61 2 4444 5555', 2, 40.00),-- 事件6（20×2）
(1, 'Hannah Montana', 'hannah@example.com', '+61 2 6666 7777', 1, 25.00),-- 事件1
(2, 'Ian Malcolm', 'ian@example.com', '+61 2 8888 9999', 1, 150.00),   -- 事件2
(4, 'Julia Roberts', 'julia@example.com', '+61 2 0000 1111', 2, 20.00);-- 事件4（10×2）
