/* CREATE DATABASE transcendence_db;

CREATE USER admin WITH PASSWORD 'admin';

GRANT ALL PRIVILEGES ON DATABASE transcendence_db TO admin; */

-- Create the database
CREATE DATABASE transcendence_db;

-- Create the user (this will not throw an error if the user already exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'admin') THEN
        CREATE USER admin WITH PASSWORD 'admin';
    END IF;
END $$;

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON DATABASE transcendence_db TO admin;
