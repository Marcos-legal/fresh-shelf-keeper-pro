-- Migration file: 20260417_security_hardening.sql

-- Step 1: Adjust user_roles table privileges
REVOKE ALL ON TABLE user_roles FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE user_roles TO role_admin;
GRANT SELECT ON TABLE user_roles TO role_user;

-- Step 2: Create Row Level Security (RLS) policies
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_user_roles ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY insert_user_roles ON user_roles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY update_user_roles ON user_roles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY delete_user_roles ON user_roles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Step 3: Password validation
ALTER ROLE role_user
  SET password_encryption TO 'SCRAM-SHA-256';
ALTER ROLE role_user
  SET password_validation_policy = '8 characters, 1 uppercase, 1 number';

-- Step 4: Protect storage access
REVOKE ALL ON SCHEMA storage FROM PUBLIC;
GRANT USAGE ON SCHEMA storage TO role_admin;
GRANT SELECT ON ALL OBJECTS IN SCHEMA storage TO role_user;

-- Make sure to execute AFTER this script to grant roles the ability to access their user-specific data accordingly.