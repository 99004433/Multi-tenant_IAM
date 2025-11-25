CREATE TABLE IF NOT EXISTS organization (
    org_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_org_id BIGINT,
    level INTEGER,
    address TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    region VARCHAR(100),
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    zipcode VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);