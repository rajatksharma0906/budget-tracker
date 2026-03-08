ALTER TABLE expenses ADD COLUMN sub_category VARCHAR(100) NULL AFTER category;
ALTER TABLE bills ADD COLUMN sub_category VARCHAR(100) NULL AFTER category;
