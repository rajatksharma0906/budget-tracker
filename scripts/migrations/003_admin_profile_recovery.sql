ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') NOT NULL DEFAULT 'user' AFTER password_hash;
ALTER TABLE users ADD COLUMN full_name VARCHAR(100) NULL AFTER role;
ALTER TABLE users ADD COLUMN email VARCHAR(255) NULL AFTER full_name;
ALTER TABLE users ADD COLUMN phone VARCHAR(30) NULL AFTER email;
ALTER TABLE users ADD COLUMN recovery_pin_hash VARCHAR(255) NULL AFTER phone;
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_phone ON users (phone);
CREATE INDEX idx_users_role ON users (role);
