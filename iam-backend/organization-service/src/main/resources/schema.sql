CREATE TABLE IF NOT EXISTS organization (
    org_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_org_id BIGINT,
    level INTEGER,
    address TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    region VARCHAR(100),
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);