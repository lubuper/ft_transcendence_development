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
    is_admin BOOLEAN DEFAULT FALSE
);

-- Create user's score table
CREATE TABLE IF NOT EXISTS user_scores (
    score_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    rank INTEGER,
    top_score INTEGER,
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

-- Create user's character table
CREATE TABLE IF NOT EXISTS user_characters (
    character_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    skin_hex VARCHAR(7),
    head_hex VARCHAR(7),
    chest_hex VARCHAR(7),
    legs_hex VARCHAR(7),
    feet_hex VARCHAR(7),
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);


--Inserting data for admin user
INSERT INTO users (username, password_hashed, email, is_admin)
VALUES ('admin', hash_password('abc'), 'admin@admin.com', 'TRUE')

INSERT INTO user_scores (user_id, rank, top_score)
VALUES (1, NULL, NULL);

INSERT INTO user_colors (user_id, skin_color_hex, head_color_hex, chest_color_hex, legs_color_hex, feet_color_hex)
VALUES (1, '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF');

INSERT INTO user_scores (user_id, rank, top_score)
VALUES (1, NULL, NULL);

INSERT INTO user_colors (user_id, skin_color_hex, head_color_hex, chest_color_hex, legs_color_hex, feet_color_hex)
VALUES (1, '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF');