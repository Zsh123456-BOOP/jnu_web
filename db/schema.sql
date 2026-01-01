-- db/schema.sql
-- MySQL 8+ recommended
CREATE DATABASE IF NOT EXISTS lab_site
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;
USE lab_site;

-- 1) 管理员（单一管理员模型：无 RBAC、无普通用户）
DROP TABLE IF EXISTS admin_user;
CREATE TABLE admin_user (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_admin_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2) 模块（栏目）配置：可增删、启用/停用、排序、模板类型、导航可见
DROP TABLE IF EXISTS module;
CREATE TABLE module (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(128) NOT NULL,
  slug VARCHAR(128) NOT NULL,
  type ENUM('SinglePage','ListDetail','ExternalLink','LandingGrid','Contact') NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  nav_visible TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 100,
  config_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_module_slug (slug),
  KEY idx_module_enabled_sort (enabled, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3) 资源（上传文件/图片）
DROP TABLE IF EXISTS asset;
CREATE TABLE asset (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  original_name VARCHAR(255) NOT NULL,
  mime VARCHAR(128) NOT NULL,
  size BIGINT UNSIGNED NOT NULL,
  relative_path VARCHAR(512) NOT NULL,  -- 只存相对路径，如 uploads/2025/12/uuid_name.pdf
  kind ENUM('image','file') NOT NULL DEFAULT 'file',
  width INT NULL,
  height INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_asset_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4) 内容：支持 Markdown 或富文本 HTML（二选一）
DROP TABLE IF EXISTS content;
CREATE TABLE content (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  module_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  status ENUM('draft','published') NOT NULL DEFAULT 'draft',
  content_format ENUM('markdown','richtext') NOT NULL DEFAULT 'markdown',
  content_md MEDIUMTEXT NULL,
  content_html MEDIUMTEXT NULL,         -- 存已清洗后的 HTML
  summary TEXT NULL,
  cover_asset_id BIGINT UNSIGNED NULL,
  year INT NULL,                        -- 便于 Publications/Conferences 等按年索引
  tags_json JSON NULL,
  authors_json JSON NULL,
  meta_json JSON NULL,                  -- 其它结构化字段（people、course、conference 等）
  published_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_content_module_slug (module_id, slug),
  KEY idx_content_module_status (module_id, status),
  KEY idx_content_year (year),
  KEY idx_content_published_at (published_at),
  CONSTRAINT fk_content_module FOREIGN KEY (module_id) REFERENCES module(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_content_cover_asset FOREIGN KEY (cover_asset_id) REFERENCES asset(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5) 站点全局配置
DROP TABLE IF EXISTS settings;
CREATE TABLE settings (
  `key` VARCHAR(128) NOT NULL,
  value_json JSON NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6) 会话表（express-mysql-session 兼容结构）
DROP TABLE IF EXISTS sessions;
CREATE TABLE sessions (
  session_id VARCHAR(128) NOT NULL,
  expires INT(11) UNSIGNED NOT NULL,
  data MEDIUMTEXT NOT NULL,
  PRIMARY KEY (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 默认管理员（用户名：admin；初始明文密码：ChangeMe_123!）
-- bcrypt hash for "ChangeMe_123!" (cost=12)
INSERT INTO admin_user (username, password_hash, is_active)
VALUES ('admin', '$2b$12$RcrFKorZmrdidqC.slgQbeFa11RaumCYa8eXWGrnhrDO3X1W7gzim', 1);

-- 默认 settings
INSERT INTO settings (`key`, value_json) VALUES
('site', JSON_OBJECT('siteName','Lab Site','logoText','Bioinfo Lab','homeModules', JSON_ARRAY()));

-- 可选：预置几个模块（你也可以在后台创建）
INSERT INTO module (name, slug, type, enabled, nav_visible, sort_order, config_json) VALUES
('Home','home','LandingGrid',1,0,0, JSON_OBJECT('layout','home')),
('About the Laboratory','about','SinglePage',1,1,10, JSON_OBJECT()),
('Research','research','ListDetail',1,1,20, JSON_OBJECT('listFields', JSON_ARRAY('title','summary'))),
('Software','software','ListDetail',1,1,30, JSON_OBJECT()),
('Publications','publications','ListDetail',1,1,40, JSON_OBJECT('filters', JSON_ARRAY('year','keyword'))),
('People','people','ListDetail',1,1,50, JSON_OBJECT()),
('Collaborators','collaborators','ListDetail',1,1,60, JSON_OBJECT()),
('Courses','courses','ListDetail',1,1,70, JSON_OBJECT()),
('Editorial Services','editorial-services','SinglePage',1,1,80, JSON_OBJECT()),
('Conferences','conferences','ListDetail',1,1,90, JSON_OBJECT('filters', JSON_ARRAY('year'))),
('Links','links','ListDetail',1,1,100, JSON_OBJECT()),
('CPH','cph','ExternalLink',1,1,110, JSON_OBJECT('url','https://www.uth.edu/cph/')),
('Contact','contact','Contact',1,1,120, JSON_OBJECT());
