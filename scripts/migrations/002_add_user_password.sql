-- Add password hash column for secure auth. Existing users get NULL and must set password via Sign up.
ALTER TABLE users
  ADD COLUMN password_hash VARCHAR(255) NULL DEFAULT NULL AFTER username;
