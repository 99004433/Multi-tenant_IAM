-- Multi-Tenant IAM Database Initialization Script
-- This script creates all necessary tables with proper relationships

-- Enable UUID extension (optional, for future use)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Organization Table (Tenant Isolation)
CREATE TABLE IF NOT EXISTS organization (
    org_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_org_id BIGINT REFERENCES organization(org_id),
    level INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE',

    -- Location fields (auto-filled from external APIs)
    street_address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    zipcode VARCHAR(20),
    region VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    timezone VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_org_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'))
);

-- Add index for location searches
CREATE INDEX IF NOT EXISTS idx_organization_location ON organization(country, state, city);

-- Create Groups Table
CREATE TABLE IF NOT EXISTS groups (
    group_id BIGSERIAL PRIMARY KEY,
    org_id BIGINT NOT NULL REFERENCES organization(org_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_group_per_org UNIQUE (org_id, name),
    CONSTRAINT chk_group_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- Create Roles Table
CREATE TABLE IF NOT EXISTS roles (
    role_id BIGSERIAL PRIMARY KEY,
    org_id BIGINT NOT NULL REFERENCES organization(org_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    permissions JSONB, -- Store permissions as JSON
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_role_per_org UNIQUE (org_id, name),
    CONSTRAINT chk_role_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- Create User Account Table
CREATE TABLE IF NOT EXISTS user_account (
    user_id BIGSERIAL PRIMARY KEY,
    org_id BIGINT NOT NULL REFERENCES organization(org_id) ON DELETE CASCADE,
    group_id BIGINT REFERENCES groups(group_id) ON DELETE SET NULL,
    role_id BIGINT REFERENCES roles(role_id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    middle_name VARCHAR(100),
    last_name VARCHAR(100),
    contact_no VARCHAR(50),
    role VARCHAR(255) DEFAULT 'USER', -- Default role string (ADMIN, USER, etc.)
    status VARCHAR(50) DEFAULT 'ACTIVE',
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'LOCKED'))
);

-- Create User-Group Assignment Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_groups (
    user_id BIGINT REFERENCES user_account(user_id) ON DELETE CASCADE,
    group_id BIGINT REFERENCES groups(group_id) ON DELETE CASCADE,
    assigned_by BIGINT REFERENCES user_account(user_id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, group_id)
);

-- Create User-Role Assignment Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT REFERENCES user_account(user_id) ON DELETE CASCADE,
    role_id BIGINT REFERENCES roles(role_id) ON DELETE CASCADE,
    assigned_by BIGINT REFERENCES user_account(user_id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- Create Notifications Table (for 90-day inactive users, etc.)
CREATE TABLE IF NOT EXISTS notifications (
    notification_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES user_account(user_id) ON DELETE CASCADE,
    org_id BIGINT REFERENCES organization(org_id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    sent_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING',
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_notification_status CHECK (status IN ('PENDING', 'SENT', 'FAILED', 'CANCELLED')),
    CONSTRAINT chk_notification_type CHECK (type IN ('INACTIVE_USER', 'SECURITY_ALERT', 'WELCOME', 'PASSWORD_RESET', 'ACCOUNT_LOCKED'))
);

-- Create Audit Log Table (track all important actions)
CREATE TABLE IF NOT EXISTS audit_log (
    audit_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES user_account(user_id) ON DELETE SET NULL,
    org_id BIGINT REFERENCES organization(org_id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_user_org_id ON user_account(org_id);
CREATE INDEX IF NOT EXISTS idx_user_email ON user_account(email);
CREATE INDEX IF NOT EXISTS idx_user_last_login ON user_account(last_login);
CREATE INDEX IF NOT EXISTS idx_user_status ON user_account(status);
CREATE INDEX IF NOT EXISTS idx_group_org_id ON groups(org_id);
CREATE INDEX IF NOT EXISTS idx_role_org_id ON roles(org_id);
CREATE INDEX IF NOT EXISTS idx_notification_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_org_id ON audit_log(org_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_log(created_at);

-- Insert Sample Data
-- Insert root organization
INSERT INTO organization (name, level, status, country, created_at)
VALUES ('Root Organization', 0, 'ACTIVE', 'USA', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Insert sample child organizations
INSERT INTO organization (name, parent_org_id, level, status, country, created_at)
VALUES
    ('Engineering Department', 1, 1, 'ACTIVE', 'USA', CURRENT_TIMESTAMP),
    ('Sales Department', 1, 1, 'ACTIVE', 'USA', CURRENT_TIMESTAMP),
    ('HR Department', 1, 1, 'ACTIVE', 'USA', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Insert sample groups
INSERT INTO groups (org_id, name, description, created_at)
VALUES
    (1, 'Admins', 'System administrators with full access', CURRENT_TIMESTAMP),
    (1, 'Developers', 'Software developers', CURRENT_TIMESTAMP),
    (1, 'Managers', 'Department managers', CURRENT_TIMESTAMP)
ON CONFLICT (org_id, name) DO NOTHING;

-- Insert sample roles
INSERT INTO roles (org_id, name, description, permissions, created_at)
VALUES
    (1, 'SUPER_ADMIN', 'Full system access', '{"all": true}'::jsonb, CURRENT_TIMESTAMP),
    (1, 'ADMIN', 'Organization admin', '{"org": "manage", "users": "manage"}'::jsonb, CURRENT_TIMESTAMP),
    (1, 'USER', 'Standard user', '{"profile": "view", "data": "read"}'::jsonb, CURRENT_TIMESTAMP),
    (1, 'VIEWER', 'Read-only access', '{"data": "read"}'::jsonb, CURRENT_TIMESTAMP)
ON CONFLICT (org_id, name) DO NOTHING;

-- Create a function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_organization_updated_at ON organization;
CREATE TRIGGER update_organization_updated_at BEFORE UPDATE ON organization FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_updated_at ON user_account;
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON user_account FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (if using specific database users)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- View to get inactive users (90+ days)
CREATE OR REPLACE VIEW inactive_users_90_days AS
SELECT
    u.user_id,
    u.email,
    u.first_name,
    u.last_name,
    u.org_id,
    u.last_login,
    CURRENT_DATE - u.last_login::date AS days_inactive
FROM user_account u
WHERE u.last_login < CURRENT_TIMESTAMP - INTERVAL '90 days'
  AND u.status = 'ACTIVE'
ORDER BY u.last_login ASC;

-- Function to find users by organization (for multi-tenancy)
CREATE OR REPLACE FUNCTION get_users_by_org(org_id_param BIGINT)
RETURNS TABLE (
    user_id BIGINT,
    email VARCHAR,
    full_name VARCHAR,
    status VARCHAR,
    last_login TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.user_id,
        u.email,
        CONCAT(u.first_name, ' ', u.last_name) AS full_name,
        u.status,
        u.last_login
    FROM user_account u
    WHERE u.org_id = org_id_param;
END;
$$ LANGUAGE plpgsql;

-- Sample query to test inactive users view
-- SELECT * FROM inactive_users_90_days;

COMMENT ON TABLE organization IS 'Tenant organizations for multi-tenancy';
COMMENT ON TABLE user_account IS 'User accounts with authentication details';
COMMENT ON TABLE notifications IS 'Notification queue for emails and alerts';
COMMENT ON TABLE audit_log IS 'Audit trail for security and compliance';

-- =====================================================================
-- SAMPLE DATA: MULTI-HOSPITAL NETWORK (MANIPAL, APOLLO, AIIMS, ETCC)
-- Realistic hospital management system data
-- =====================================================================

-- 1. ORGANIZATIONS (Hospital Chains & Branches)
-- =====================================================================

INSERT INTO organization (org_id, name, parent_org_id, level, status, street_address, city, state, country, zipcode, region, latitude, longitude, timezone) VALUES

-- ============ MANIPAL HOSPITALS ============
-- Parent Organization
(1, 'Manipal Hospitals', NULL, 0, 'ACTIVE', 'Airport Road', 'Bangalore', 'Karnataka', 'India', '560017', 'Asia', 12.9352, 77.6245, 'Asia/Kolkata'),

-- Branch Hospitals
(2, 'Manipal Hospital - Whitefield', 1, 1, 'ACTIVE', 'ITPL Main Road', 'Bangalore', 'Karnataka', 'India', '560066', 'Asia', 12.9698, 77.7499, 'Asia/Kolkata'),
(3, 'Manipal Hospital - Dwarka', 1, 1, 'ACTIVE', 'Sector 6, Dwarka', 'Delhi', 'Delhi', 'India', '110075', 'Asia', 28.5921, 77.0460, 'Asia/Kolkata'),
(4, 'Manipal Hospital - Goa', 1, 1, 'ACTIVE', 'Donapaula', 'Panaji', 'Goa', 'India', '403004', 'Asia', 15.4509, 73.8278, 'Asia/Kolkata'),

-- ============ APOLLO HOSPITALS ============
(5, 'Apollo Hospitals', NULL, 0, 'ACTIVE', 'Greams Road', 'Chennai', 'Tamil Nadu', 'India', '600006', 'Asia', 13.0569, 80.2462, 'Asia/Kolkata'),
(6, 'Apollo Hospital - Bangalore', 5, 1, 'ACTIVE', 'Bannerghatta Road', 'Bangalore', 'Karnataka', 'India', '560076', 'Asia', 12.8996, 77.5977, 'Asia/Kolkata'),
(7, 'Apollo Hospital - Hyderabad', 5, 1, 'ACTIVE', 'Jubilee Hills', 'Hyderabad', 'Telangana', 'India', '500033', 'Asia', 17.4312, 78.4131, 'Asia/Kolkata'),

-- ============ AIIMS (All India Institute of Medical Sciences) ============
(8, 'AIIMS Delhi', NULL, 0, 'ACTIVE', 'Ansari Nagar', 'New Delhi', 'Delhi', 'India', '110029', 'Asia', 28.5672, 77.2100, 'Asia/Kolkata'),
(9, 'AIIMS Rishikesh', 8, 1, 'ACTIVE', 'Virbhadra Road', 'Rishikesh', 'Uttarakhand', 'India', '249203', 'Asia', 30.0688, 78.2635, 'Asia/Kolkata'),

-- ============ ETCC (Emergency & Trauma Care Center) ============
(10, 'ETCC - Emergency Trauma Care', NULL, 0, 'ACTIVE', 'MG Road', 'Mumbai', 'Maharashtra', 'India', '400001', 'Asia', 18.9388, 72.8354, 'Asia/Kolkata'),
(11, 'ETCC - Pune Branch', 10, 1, 'ACTIVE', 'FC Road', 'Pune', 'Maharashtra', 'India', '411004', 'Asia', 18.5196, 73.8553, 'Asia/Kolkata'),

-- ============ FORTIS HEALTHCARE ============
(12, 'Fortis Healthcare', NULL, 0, 'ACTIVE', 'Sector 62', 'Noida', 'Uttar Pradesh', 'India', '201301', 'Asia', 28.6273, 77.3716, 'Asia/Kolkata');

-- Reset sequence
SELECT setval('organization_org_id_seq', 12, true);

-- 2. GROUPS (Hospital Departments & Teams)
-- =====================================================================

INSERT INTO groups (group_id, org_id, name, description, status) VALUES

-- ============ ADMINISTRATIVE GROUPS ============
(1, 1, 'Admin - Super Administrators', 'System-wide super admin access', 'ACTIVE'),
(2, 1, 'Admin - Hospital Directors', 'Hospital directors and senior management', 'ACTIVE'),
(3, 1, 'Admin - Department Heads', 'Heads of various departments', 'ACTIVE'),
(4, 1, 'Admin - HR Team', 'Human resources and staff management', 'ACTIVE'),
(5, 1, 'Admin - Finance Team', 'Finance, billing and accounts', 'ACTIVE'),
(6, 1, 'Admin - IT & Support', 'IT administrators and technical support', 'ACTIVE'),
(7, 1, 'Admin - Operations', 'Operations and facilities management', 'ACTIVE'),

-- ============ CLINICAL GROUPS ============
(8, 1, 'Clinical - Surgeons', 'All surgical staff and specialists', 'ACTIVE'),
(9, 1, 'Clinical - Technicians', 'Lab technicians, radiology techs, medical technicians', 'ACTIVE'),

-- ============ DEPARTMENT-SPECIFIC GROUPS (Manipal) ============
(10, 1, 'Dept - Cardiology', 'Cardiology department staff', 'ACTIVE'),
(11, 1, 'Dept - Neurology', 'Neurology department staff', 'ACTIVE'),
(12, 1, 'Dept - Orthopedics', 'Orthopedics department staff', 'ACTIVE'),
(13, 1, 'Dept - Emergency', 'Emergency and trauma care staff', 'ACTIVE'),

-- ============ APOLLO GROUPS ============
(14, 5, 'Admin - Apollo Management', 'Apollo hospital administrators', 'ACTIVE'),
(15, 5, 'Clinical - Apollo Surgeons', 'Apollo surgical team', 'ACTIVE'),
(16, 5, 'Clinical - Apollo Technicians', 'Apollo technical staff', 'ACTIVE'),

-- ============ AIIMS GROUPS ============
(17, 8, 'Admin - AIIMS Administration', 'AIIMS administrators', 'ACTIVE'),
(18, 8, 'Clinical - AIIMS Surgeons', 'AIIMS surgical team', 'ACTIVE'),
(19, 8, 'Clinical - AIIMS Research', 'AIIMS research and academic staff', 'ACTIVE'),

-- ============ ETCC GROUPS ============
(20, 10, 'Admin - ETCC Management', 'ETCC emergency center management', 'ACTIVE'),
(21, 10, 'Clinical - ETCC Trauma Surgeons', 'ETCC trauma and emergency surgeons', 'ACTIVE'),
(22, 10, 'Clinical - ETCC Paramedics', 'ETCC paramedics and emergency technicians', 'ACTIVE');

-- Reset sequence
SELECT setval('groups_group_id_seq', 22, true);

-- 3. ROLES (Hospital Role-Based Access Control)
-- =====================================================================
-- 7 ADMIN ROLES + 2 CLINICAL ROLES = 9 Total Roles

INSERT INTO roles (role_id, org_id, name, description, permissions, status) VALUES

-- ============================================
-- ADMINISTRATIVE ROLES (7 ROLES)
-- ============================================

-- ADMIN ROLE 1: Super Administrator
(1, 1, 'SUPER_ADMIN', 'Full system access - Master administrator',
 '{"modules": ["all"], "actions": ["create", "read", "update", "delete", "manage", "configure"], "scope": "global"}'::jsonb, 'ACTIVE'),

-- ADMIN ROLE 2: Hospital Director
(2, 1, 'HOSPITAL_DIRECTOR', 'Hospital director with administrative control',
 '{"modules": ["all_admin", "reports", "finance", "hr", "facilities", "patients"], "actions": ["create", "read", "update", "approve", "manage"], "scope": "organization"}'::jsonb, 'ACTIVE'),

-- ADMIN ROLE 3: Department Head
(3, 1, 'DEPARTMENT_HEAD', 'Head of department with staff and resource management',
 '{"modules": ["department", "staff", "patients", "reports", "resources"], "actions": ["create", "read", "update", "approve"], "scope": "department"}'::jsonb, 'ACTIVE'),

-- ADMIN ROLE 4: HR Manager
(4, 1, 'HR_MANAGER', 'HR manager for staff recruitment and management',
 '{"modules": ["users", "staff", "attendance", "payroll", "recruitment"], "actions": ["create", "read", "update", "delete"], "scope": "organization"}'::jsonb, 'ACTIVE'),

-- ADMIN ROLE 5: Finance Manager
(5, 1, 'FINANCE_MANAGER', 'Finance manager for billing and accounts',
 '{"modules": ["billing", "payments", "reports", "invoices", "budget"], "actions": ["create", "read", "update", "approve"], "scope": "organization"}'::jsonb, 'ACTIVE'),

-- ADMIN ROLE 6: IT Administrator
(6, 1, 'IT_ADMIN', 'IT administrator with system and security access',
 '{"modules": ["system", "users", "settings", "integrations", "security"], "actions": ["create", "read", "update", "delete", "configure"], "scope": "organization"}'::jsonb, 'ACTIVE'),

-- ADMIN ROLE 7: Operations Manager
(7, 1, 'OPERATIONS_MANAGER', 'Operations and facilities management',
 '{"modules": ["operations", "facilities", "inventory", "logistics", "vendors"], "actions": ["create", "read", "update", "manage"], "scope": "organization"}'::jsonb, 'ACTIVE'),

-- ============================================
-- CLINICAL ROLES (2 ROLES)
-- ============================================

-- CLINICAL ROLE 1: Surgeon
(8, 1, 'SURGEON', 'Surgical specialists with operation theater access',
 '{"modules": ["patients", "medical_records", "surgeries", "ot_schedule", "prescriptions"], "actions": ["create", "read", "update", "operate"], "scope": "clinical"}'::jsonb, 'ACTIVE'),

-- CLINICAL ROLE 2: Technician
(9, 1, 'TECHNICIAN', 'Medical technicians (Lab, Radiology, Equipment)',
 '{"modules": ["laboratory", "radiology", "equipment", "tests", "reports"], "actions": ["read", "update", "process", "report"], "scope": "technical"}'::jsonb, 'ACTIVE');

-- Reset sequence
SELECT setval('roles_role_id_seq', 9, true);

-- 4. USERS (Hospital Staff)
-- =====================================================================
-- Password: All users have password "password123" (hashed with bcrypt)
-- In production, use proper password hashing via Spring Security

INSERT INTO user_account (user_id, org_id, group_id, role_id, email, password, first_name, middle_name, last_name, contact_no, role, status, last_login) VALUES

-- =====================================================================
-- ADMIN USERS (7 ADMIN ROLES)
-- =====================================================================

-- ADMIN ROLE 1: Super Administrator
(1, 1, 1, 1, 'admin@manipalhospitals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System', NULL, 'Administrator', '+91-9876543210', 'SUPER_ADMIN', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(2, 1, 1, 1, 'developer@hospital-iam.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Developer', NULL, 'Admin', '+91-9876543211', 'SUPER_ADMIN', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '30 minutes'),

-- ADMIN ROLE 2: Hospital Director
(3, 1, 2, 2, 'director@manipalhospitals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dr. Rajesh', 'Kumar', 'Sharma', '+91-9876543212', 'HOSPITAL_DIRECTOR', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(4, 5, 14, 2, 'director@apollohospitals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dr. Priya', NULL, 'Menon', '+91-9876543213', 'HOSPITAL_DIRECTOR', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '5 hours'),
(5, 8, 17, 2, 'director@aiims.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dr. Vikram', NULL, 'Singh', '+91-9876543214', 'HOSPITAL_DIRECTOR', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
(6, 10, 20, 2, 'director@etcc.in', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dr. Sunil', NULL, 'Patel', '+91-9876543215', 'HOSPITAL_DIRECTOR', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '4 hours'),

-- ADMIN ROLE 3: Department Head
(7, 1, 3, 3, 'depthead.cardiology@manipalhospitals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dr. Arvind', NULL, 'Reddy', '+91-9876543216', 'DEPARTMENT_HEAD', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
(8, 1, 3, 3, 'depthead.neurology@manipalhospitals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dr. Sunita', NULL, 'Nair', '+91-9876543217', 'DEPARTMENT_HEAD', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(9, 1, 3, 3, 'depthead.ortho@manipalhospitals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dr. Amit', NULL, 'Mehta', '+91-9876543218', 'DEPARTMENT_HEAD', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '6 hours'),

-- ADMIN ROLE 4: HR Manager
(10, 1, 4, 4, 'hr.manager@manipalhospitals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Sanjay', NULL, 'Tripathi', '+91-9876543219', 'HR_MANAGER', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
(11, 5, 14, 4, 'hr.manager@apollohospitals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Madhuri', NULL, 'Joshi', '+91-9876543220', 'HR_MANAGER', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '4 hours'),
(12, 8, 17, 4, 'hr.manager@aiims.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Ravi', NULL, 'Kumar', '+91-9876543221', 'HR_MANAGER', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '5 hours'),

-- ADMIN ROLE 5: Finance Manager
(13, 1, 5, 5, 'finance.manager@manipalhospitals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Rajiv', NULL, 'Malhotra', '+91-9876543222', 'FINANCE_MANAGER', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(14, 5, 14, 5, 'finance.manager@apollohospitals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Meera', NULL, 'Pillai', '+91-9876543223', 'FINANCE_MANAGER', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '5 hours'),
(15, 10, 20, 5, 'finance.manager@etcc.in', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Anand', NULL, 'Rao', '+91-9876543224', 'FINANCE_MANAGER', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '7 hours'),

-- ADMIN ROLE 6: IT Administrator
(16, 1, 6, 6, 'it.admin@manipalhospitals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Karthik', NULL, 'Reddy', '+91-9876543225', 'IT_ADMIN', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
(17, 5, 14, 6, 'it.admin@apollohospitals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Abhishek', NULL, 'Kumar', '+91-9876543226', 'IT_ADMIN', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
(18, 8, 17, 6, 'it.admin@aiims.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Deepak', NULL, 'Verma', '+91-9876543227', 'IT_ADMIN', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '2 hours'),

-- ADMIN ROLE 7: Operations Manager
(19, 1, 7, 7, 'operations.manager@manipalhospitals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Vinay', NULL, 'Singh', '+91-9876543228', 'OPERATIONS_MANAGER', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '4 hours'),
(20, 5, 14, 7, 'operations.manager@apollohospitals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Neha', NULL, 'Sharma', '+91-9876543229', 'OPERATIONS_MANAGER', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '6 hours'),
(21, 10, 20, 7, 'operations.manager@etcc.in', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Ramesh', NULL, 'Babu', '+91-9876543230', 'OPERATIONS_MANAGER', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '8 hours'),

-- =====================================================================
-- CLINICAL USERS (2 CLINICAL ROLES)
-- =====================================================================

-- CLINICAL ROLE 1: Surgeons
(22, 1, 8, 8, 'surgeon.cardio@manipalhospitals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dr. Harpreet', 'Singh', 'Bhatia', '+91-9876543231', 'SURGEON', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(23, 1, 8, 8, 'surgeon.neuro@manipalhospitals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dr. Venkat', NULL, 'Rao', '+91-9876543232', 'SURGEON', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '4 hours'),
(24, 1, 8, 8, 'surgeon.ortho@manipalhospitals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dr. Arun', NULL, 'Kumar', '+91-9876543233', 'SURGEON', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '5 hours'),
(25, 5, 15, 8, 'surgeon1@apollohospitals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dr. Lakshmi', NULL, 'Krishnan', '+91-9876543234', 'SURGEON', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
(26, 5, 15, 8, 'surgeon2@apollohospitals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dr. Nikhil', NULL, 'Desai', '+91-9876543235', 'SURGEON', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
(27, 8, 18, 8, 'surgeon1@aiims.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dr. Shalini', NULL, 'Gupta', '+91-9876543236', 'SURGEON', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '6 hours'),
(28, 8, 18, 8, 'surgeon2@aiims.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dr. Rajeev', NULL, 'Kapoor', '+91-9876543237', 'SURGEON', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '7 hours'),
(29, 10, 21, 8, 'trauma.surgeon1@etcc.in', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dr. Kavita', NULL, 'Menon', '+91-9876543238', 'SURGEON', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
(30, 10, 21, 8, 'trauma.surgeon2@etcc.in', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dr. Sameer', NULL, 'Patel', '+91-9876543239', 'SURGEON', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '45 minutes'),

-- CLINICAL ROLE 2: Technicians
(31, 1, 9, 9, 'lab.tech1@manipalhospitals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Suresh', NULL, 'Babu', '+91-9876543240', 'TECHNICIAN', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
(32, 1, 9, 9, 'lab.tech2@manipalhospitals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Anitha', NULL, 'Ramesh', '+91-9876543241', 'TECHNICIAN', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '5 hours'),
(33, 1, 9, 9, 'radiology.tech1@manipalhospitals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Ramya', NULL, 'Krishnan', '+91-9876543242', 'TECHNICIAN', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(34, 1, 9, 9, 'radiology.tech2@manipalhospitals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Prakash', NULL, 'Iyer', '+91-9876543243', 'TECHNICIAN', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '4 hours'),
(35, 5, 16, 9, 'lab.tech@apollohospitals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Divya', NULL, 'Nair', '+91-9876543244', 'TECHNICIAN', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
(36, 5, 16, 9, 'radiology.tech@apollohospitals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Ashok', NULL, 'Das', '+91-9876543245', 'TECHNICIAN', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '6 hours'),
(37, 8, 19, 9, 'research.tech@aiims.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Pooja', NULL, 'Singh', '+91-9876543246', 'TECHNICIAN', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '8 hours'),
(38, 10, 22, 9, 'emergency.tech@etcc.in', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Ritu', NULL, 'Sharma', '+91-9876543247', 'TECHNICIAN', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '9 hours'),

-- Inactive users (for 90-day notification testing)
(39, 1, 9, 9, 'inactive.tech@manipalhospitals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Old', NULL, 'Technician', '+91-9876543248', 'TECHNICIAN', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '95 days'),
(40, 5, 14, 7, 'inactive.ops@apollohospitals.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Inactive', NULL, 'Manager', '+91-9876543249', 'OPERATIONS_MANAGER', 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '120 days');

-- Reset sequence
SELECT setval('user_account_user_id_seq', 40, true);

-- 5. USER-GROUP ASSIGNMENTS (Many-to-Many)
-- =====================================================================

INSERT INTO user_groups (user_id, group_id, assigned_by, assigned_at) VALUES
-- Admin group assignments
(1, 1, 1, CURRENT_TIMESTAMP),
(2, 1, 1, CURRENT_TIMESTAMP),
(3, 2, 1, CURRENT_TIMESTAMP),
(7, 3, 1, CURRENT_TIMESTAMP),
(8, 3, 1, CURRENT_TIMESTAMP),
(10, 4, 1, CURRENT_TIMESTAMP),
(13, 5, 1, CURRENT_TIMESTAMP),
(16, 6, 1, CURRENT_TIMESTAMP),
(19, 7, 1, CURRENT_TIMESTAMP),

-- Surgeon assignments
(22, 8, 1, CURRENT_TIMESTAMP),
(23, 8, 1, CURRENT_TIMESTAMP),
(24, 8, 1, CURRENT_TIMESTAMP),
(25, 15, 4, CURRENT_TIMESTAMP),
(26, 15, 4, CURRENT_TIMESTAMP),
(27, 18, 5, CURRENT_TIMESTAMP),
(28, 18, 5, CURRENT_TIMESTAMP),
(29, 21, 6, CURRENT_TIMESTAMP),
(30, 21, 6, CURRENT_TIMESTAMP),

-- Technician assignments
(31, 9, 1, CURRENT_TIMESTAMP),
(32, 9, 1, CURRENT_TIMESTAMP),
(33, 9, 1, CURRENT_TIMESTAMP),
(34, 9, 1, CURRENT_TIMESTAMP),
(35, 16, 4, CURRENT_TIMESTAMP),
(36, 16, 4, CURRENT_TIMESTAMP),
(37, 19, 5, CURRENT_TIMESTAMP),
(38, 22, 6, CURRENT_TIMESTAMP);

-- 6. SAMPLE NOTIFICATIONS
-- =====================================================================

INSERT INTO notifications (notification_id, user_id, org_id, type, subject, message, sent_at, status, retry_count) VALUES
(1, 39, 1, 'INACTIVE_USER', 'Account Inactive - Please Login',
 'Hello Old Technician, Your account has been inactive for 95 days. Please log in to keep your account active.',
 CURRENT_TIMESTAMP - INTERVAL '5 days', 'SENT', 0),

(2, 40, 5, 'INACTIVE_USER', 'Account Inactive - Please Login',
 'Hello Inactive Manager, Your account has been inactive for 120 days. Please log in to keep your account active.',
 CURRENT_TIMESTAMP - INTERVAL '3 days', 'SENT', 0),

(3, 29, 10, 'SHIFT_REMINDER', 'Emergency Shift Starting',
 'Dr. Kavita Menon, your trauma surgery shift starts in 1 hour.',
 CURRENT_TIMESTAMP - INTERVAL '1 hour', 'SENT', 0);

-- Reset sequence
SELECT setval('notifications_notification_id_seq', 3, true);

-- 7. SAMPLE AUDIT LOGS
-- =====================================================================

INSERT INTO audit_log (log_id, user_id, org_id, action, entity_type, entity_id, ip_address, user_agent, status) VALUES
(1, 1, 1, 'LOGIN', 'USER', 1, '192.168.1.100', 'Mozilla/5.0', 'SUCCESS'),
(2, 2, 1, 'LOGIN', 'USER', 2, '192.168.1.101', 'Mozilla/5.0', 'SUCCESS'),
(3, 3, 1, 'UPDATE', 'ORGANIZATION', 1, '192.168.1.102', 'Mozilla/5.0', 'SUCCESS'),
(4, 22, 1, 'CREATE', 'SURGERY', 5001, '192.168.1.103', 'Mozilla/5.0', 'SUCCESS'),
(5, 31, 1, 'UPDATE', 'LAB_REPORT', 1001, '192.168.1.104', 'Mozilla/5.0', 'SUCCESS'),
(6, 16, 1, 'CREATE', 'USER', 15, '192.168.1.105', 'Mozilla/5.0', 'SUCCESS'),
(7, 13, 1, 'APPROVE', 'PAYMENT', 1, '192.168.1.106', 'Mozilla/5.0', 'SUCCESS');

-- Reset sequence
SELECT setval('audit_log_log_id_seq', 7, true);

-- =====================================================================
-- DATA VERIFICATION QUERIES
-- =====================================================================

-- View organization hierarchy (all hospital chains)
-- SELECT org_id, name, parent_org_id, level, city, state, country FROM organization ORDER BY level, org_id;

-- View all roles with counts
-- SELECT role_id, name, description, COUNT(u.user_id) as user_count
-- FROM roles r
-- LEFT JOIN user_account u ON r.role_id = u.role_id
-- GROUP BY r.role_id, r.name, r.description
-- ORDER BY r.role_id;

-- View all admin users
-- SELECT u.user_id, u.first_name, u.last_name, u.email, r.name as role_name, o.name as organization
-- FROM user_account u
-- JOIN roles r ON u.role_id = r.role_id
-- JOIN organization o ON u.org_id = o.org_id
-- WHERE r.role_id <= 7
-- ORDER BY r.role_id, u.user_id;

-- View all clinical users (Surgeons & Technicians)
-- SELECT u.user_id, u.first_name, u.last_name, u.email, r.name as role_name, o.name as organization
-- FROM user_account u
-- JOIN roles r ON u.role_id = r.role_id
-- JOIN organization o ON u.org_id = o.org_id
-- WHERE r.role_id IN (8, 9)
-- ORDER BY r.role_id, u.user_id;

-- View users by hospital
-- SELECT o.name as hospital, r.name as role, COUNT(u.user_id) as user_count
-- FROM organization o
-- LEFT JOIN user_account u ON o.org_id = u.org_id
-- LEFT JOIN roles r ON u.role_id = r.role_id
-- WHERE o.parent_org_id IS NULL
-- GROUP BY o.name, r.name
-- ORDER BY o.name, r.name;

-- View inactive users (90+ days)
-- SELECT * FROM inactive_users_90_days;

-- Test login credentials
-- Username: admin@manipalhospitals.com | Password: password123 | Role: SUPER_ADMIN
-- Username: developer@hospital-iam.com | Password: password123 | Role: SUPER_ADMIN
-- Username: director@manipalhospitals.com | Password: password123 | Role: HOSPITAL_DIRECTOR
-- Username: surgeon.cardio@manipalhospitals.com | Password: password123 | Role: SURGEON
-- Username: lab.tech1@manipalhospitals.com | Password: password123 | Role: TECHNICIAN

COMMIT;

-- =====================================================================
-- DATABASE SUMMARY
-- =====================================================================
-- Organizations: 12 (Manipal, Apollo, AIIMS, ETCC, Fortis)
-- Groups: 22 (7 Admin + 2 Clinical + 13 Department/Branch)
-- Roles: 9 (7 Admin + 2 Clinical)
-- Users: 40 (21 Admin + 9 Surgeons + 8 Technicians + 2 Inactive)
-- =====================================================================
