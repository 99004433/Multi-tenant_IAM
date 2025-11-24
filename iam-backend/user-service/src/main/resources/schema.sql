CREATE TABLE IF NOT EXISTS user_account (
    user_id BIGSERIAL PRIMARY KEY,
    organization VARCHAR(255),
    group_name VARCHAR(255),
    role VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    contact_no VARCHAR(50),
    first_name VARCHAR(100),
    middle_name VARCHAR(100),
    last_name VARCHAR(100),
    password VARCHAR(255),
    last_login TIMESTAMP,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
    );