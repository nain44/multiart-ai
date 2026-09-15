-- MultiArt AI Wallpaper Platform — MySQL schema (PHP backend)
-- IDs are 24-char hex strings (mirrors MongoDB ObjectId format) so existing
-- mobile/admin clients that expect `_id`-shaped strings keep working unchanged.

CREATE TABLE IF NOT EXISTS admins (
  id CHAR(24) PRIMARY KEY,
  name VARCHAR(255) NOT NULL DEFAULT 'Admin',
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('super', 'editor') NOT NULL DEFAULT 'super',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uniq_admins_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS categories (
  id CHAR(24) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  icon VARCHAR(32) NOT NULL DEFAULT '🖼️',
  cover_image_url TEXT NULL,
  description TEXT NULL,
  `order` INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  wallpaper_count INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uniq_categories_slug (slug),
  KEY idx_categories_order_active (`order`, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS wallpapers (
  id CHAR(24) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT NULL,
  category_id CHAR(24) NOT NULL,
  tags TEXT NULL, -- comma-separated, lowercase (mirrors Mongoose [String] array)
  image_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  width INT NULL,
  height INT NULL,
  resolution ENUM('SD', 'HD', 'FHD', '4K', '8K') NOT NULL DEFAULT 'FHD',
  cloudinary_id VARCHAR(500) NULL,
  is_premium TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  featured_at DATETIME(3) NULL,
  dedupe_key VARCHAR(700) NULL,
  device_id VARCHAR(255) NULL,
  visibility ENUM('private', 'public') NOT NULL DEFAULT 'public',
  approval_status ENUM('approved', 'pending', 'rejected') NOT NULL DEFAULT 'approved',
  source ENUM('own', 'pexels', 'unsplash', 'ai') NOT NULL DEFAULT 'own',
  photographer VARCHAR(255) NULL,
  photographer_url TEXT NULL,
  download_location TEXT NULL,
  download_count INT NOT NULL DEFAULT 0,
  like_count INT NOT NULL DEFAULT 0,
  report_count INT NOT NULL DEFAULT 0,
  dominant_color VARCHAR(20) NOT NULL DEFAULT '#1a1a2e',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uniq_wallpapers_dedupe_key (dedupe_key),
  KEY idx_wallpapers_category_active (category_id, is_active),
  KEY idx_wallpapers_premium_active (is_premium, is_active),
  KEY idx_wallpapers_visibility_status_active (visibility, approval_status, is_active),
  KEY idx_wallpapers_download_count (download_count),
  KEY idx_wallpapers_featured (is_featured, featured_at),
  KEY idx_wallpapers_created_at (created_at),
  KEY idx_wallpapers_device_id (device_id),
  FULLTEXT KEY ft_wallpapers_title_tags (title, tags),
  CONSTRAINT fk_wallpapers_category FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS device_quotas (
  id CHAR(24) PRIMARY KEY,
  device_id VARCHAR(255) NOT NULL,
  `date` CHAR(10) NOT NULL, -- YYYY-MM-DD, UTC
  count INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uniq_device_quotas_device_date (device_id, `date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
