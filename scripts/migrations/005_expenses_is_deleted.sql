-- Soft delete support for expenses
ALTER TABLE expenses ADD COLUMN is_deleted TINYINT(1) NOT NULL DEFAULT 0 AFTER date;
ALTER TABLE expenses ADD INDEX idx_expenses_is_deleted (is_deleted);
