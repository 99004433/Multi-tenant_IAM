CREATE TABLE IF NOT EXISTS groups (
    group_id BIGSERIAL PRIMARY KEY,
    org_id BIGINT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50),
    allowed_role_ids BIGINT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );