CREATE TABLE IF NOT EXISTS games (
  slug VARCHAR(32) PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  bg_art_url VARCHAR(512) NULL,
  currency_name VARCHAR(32) NOT NULL,
  currency_per_pull INT NOT NULL,
  notes_json JSON NOT NULL
);

CREATE TABLE IF NOT EXISTS pullable_items (
  id VARCHAR(64) PRIMARY KEY,
  game_slug VARCHAR(32) NOT NULL,
  pool VARCHAR(32) NOT NULL,
  kind VARCHAR(32) NOT NULL,
  name VARCHAR(128) NOT NULL,
  rarity INT NOT NULL,
  max_copies INT NOT NULL,
  image_url VARCHAR(512) NULL,
  INDEX idx_items_game (game_slug)
);

CREATE TABLE IF NOT EXISTS shop_offers (
  id VARCHAR(64) PRIMARY KEY,
  game_slug VARCHAR(32) NOT NULL,
  name VARCHAR(128) NOT NULL,
  price_cny INT NOT NULL,
  crystals INT NOT NULL,
  kind VARCHAR(32) NOT NULL,
  max_qty INT NOT NULL,
  note VARCHAR(255) NULL,
  INDEX idx_offers_game (game_slug)
);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(20) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_game_progress (
  user_id VARCHAR(36) NOT NULL,
  game_slug VARCHAR(32) NOT NULL,
  payload JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, game_slug)
);
