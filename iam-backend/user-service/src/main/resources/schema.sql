CREATE TABLE IF NOT EXISTS user_account (
                                            user_id BIGSERIAL PRIMARY KEY,
                                            org_id BIGINT NOT NULL,
                                            group_id BIGINT,
                                            role_id BIGINT,
                                            role VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    contact_no VARCHAR(50),
    first_name VARCHAR(100),
    middle_name VARCHAR(100),
    last_name VARCHAR(100),
    password VARCHAR(255),
    last_login TIMESTAMP,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );