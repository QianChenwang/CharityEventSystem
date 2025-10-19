-- 创建数据库（如果需要）
CREATE DATABASE IF NOT EXISTS charityevents_db;
USE charityevents_db;

-- 1. 组织表（管理慈善机构信息）
CREATE TABLE organizations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL, -- 组织名称
  mission TEXT, -- 使命描述
  contact_email VARCHAR(255), -- 联系邮箱
  contact_phone VARCHAR(50), -- 联系电话
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 初始化组织数据（修正：添加Organization后缀，避免与事件名混淆）
INSERT INTO organizations (name, mission, contact_email, contact_phone) VALUES
('Community Care Organization', 'Supporting local communities through charity events', 'contact@communitycare.org', '+61 2 9876 5432');

-- 2. 事件分类表
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE, -- 分类名称（如Fun Run、Gala Dinner）
  description TEXT
);

-- 初始化分类数据
INSERT INTO categories (name, description) VALUES
('Fun Run', 'Charity running events for all ages'),
('Gala Dinner', 'Formal dinners with fundraising activities'),
('Silent Auction', 'Events with silent bidding on donated items'),
('Concert', 'Music events to raise funds');

-- 3. 事件表（核心表）
CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL, -- 事件名称
  description TEXT, -- 详细描述
  purpose VARCHAR(255) NOT NULL, -- 筹款目的
  date DATETIME NOT NULL, -- 日期时间
  location VARCHAR(255) NOT NULL, -- 地点
  ticket_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00, -- 票价
  goal_amount DECIMAL(15, 2) NOT NULL, -- 筹款目标
  current_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00, -- 当前筹款（自动更新）
  is_suspended BOOLEAN NOT NULL DEFAULT FALSE, -- 是否暂停（管理员功能）
  category_id INT NOT NULL, -- 关联分类
  organization_id INT NOT NULL, -- 关联组织
  latitude DECIMAL(10, 4), -- 纬度（天气API用）
  longitude DECIMAL(10, 4), -- 经度（天气API用）
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- 外键关联
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- 4. 注册/参与表（记录用户注册信息）
CREATE TABLE registrations (
  registration_id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL, -- 关联事件
  full_name VARCHAR(255) NOT NULL, -- 参与者姓名
  email VARCHAR(255) NOT NULL, -- 参与者邮箱
  phone VARCHAR(50), -- 参与者电话
  ticket_quantity INT NOT NULL CHECK (ticket_quantity > 0), -- 购票数量（至少1）
  total_amount DECIMAL(10, 2) NOT NULL, -- 总金额（票价×数量）
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- 外键关联事件
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  -- 防重复注册（同一邮箱+事件只能注册一次）
  UNIQUE KEY unique_registration (email, event_id)
);
