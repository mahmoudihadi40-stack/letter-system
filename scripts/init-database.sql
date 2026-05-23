-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(100) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  password_hash VARCHAR(255),
  department_id UUID REFERENCES departments(id),
  role_id UUID REFERENCES roles(id),
  manager_id UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create letters table
CREATE TABLE IF NOT EXISTS letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_number VARCHAR(50) UNIQUE,
  from_department_id UUID NOT NULL REFERENCES departments(id),
  to_department_id UUID NOT NULL REFERENCES departments(id),
  subject VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'draft',
  priority VARCHAR(20) DEFAULT 'normal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_date TIMESTAMP,
  received_date TIMESTAMP
);

-- Create letter_approvals table (برای تایید و ارجاع نامه ها)
CREATE TABLE IF NOT EXISTS letter_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id UUID NOT NULL REFERENCES letters(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES users(id),
  assigned_by UUID NOT NULL REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  signature_path VARCHAR(255)
);

-- Create letter_history table
CREATE TABLE IF NOT EXISTS letter_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id UUID NOT NULL REFERENCES letters(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  action_by UUID NOT NULL REFERENCES users(id),
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create letter_attachments table
CREATE TABLE IF NOT EXISTS letter_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id UUID NOT NULL REFERENCES letters(id) ON DELETE CASCADE,
  file_name VARCHAR(255),
  file_path VARCHAR(255),
  file_size INTEGER,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create search_archive table
CREATE TABLE IF NOT EXISTS letter_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id UUID NOT NULL REFERENCES letters(id) ON DELETE CASCADE,
  letter_number VARCHAR(50),
  subject VARCHAR(500),
  from_department_id UUID REFERENCES departments(id),
  to_department_id UUID REFERENCES departments(id),
  created_date DATE,
  archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (id, name, description, permissions) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'مدیر عامل', 'مدیر عامل شرکت', '["view_all","approve_all","manage_departments","manage_users"]'),
  ('a0000000-0000-0000-0000-000000000002', 'مدیر کل', 'مدیر کل بخش', '["view_department","approve_letters","manage_staff","assign_tasks"]'),
  ('a0000000-0000-0000-0000-000000000003', 'مسئول بخش', 'مسئول بخش', '["view_department","create_letter","approve_staff_letters","manage_referral"]'),
  ('a0000000-0000-0000-0000-000000000004', 'کارمند', 'کارمند عادی بخش', '["view_department","create_letter","submit_for_approval"]'),
  ('a0000000-0000-0000-0000-000000000005', 'مدیر IT', 'مدیر سیستم اطلاعات', '["manage_users","manage_system","view_all"]')
ON CONFLICT (id) DO NOTHING;

-- Insert default IT admin user (password: 123)
-- Password hash for "123" using bcrypt: $2b$10$J/cxQMKWxY2FJfYVJpS3wOjGkL5fW3cX.qXzQzKqZ8qX8qX8qX8qX
INSERT INTO users (id, email, username, full_name, password_hash, role_id, is_active) 
VALUES ('a0000000-0000-0000-0000-100000000001', 'admin@company.com', 'ADMIN', 'مدیر سیستم', 
  '$2b$10$J/cxQMKWxY2FJfYVJpS3wOjGkL5fW3cX.qXzQzKqZ8qX8qX8qX8qX', 
  'a0000000-0000-0000-0000-000000000005', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE letter_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_letters_created_by ON letters(created_by);
CREATE INDEX idx_letters_from_dept ON letters(from_department_id);
CREATE INDEX idx_letters_to_dept ON letters(to_department_id);
CREATE INDEX idx_letters_status ON letters(status);
CREATE INDEX idx_letters_created_at ON letters(created_at);
CREATE INDEX idx_approvals_letter ON letter_approvals(letter_id);
CREATE INDEX idx_approvals_assigned_to ON letter_approvals(assigned_to);
CREATE INDEX idx_history_letter ON letter_history(letter_id);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_role ON users(role_id);
