-- init.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION hash_password(plain_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN crypt(plain_text, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(16) UNIQUE NOT NULL,
    password_hashed VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    rank INTEGER, 
    top_score INTEGER,
    is_admin BOOLEAN DEFAULT FALSE
);

INSERT INTO users (username, password_hashed, email, is_admin)
VALUES ('admin', hash_password('abc'), 'admin@admin.com', 'TRUE')
