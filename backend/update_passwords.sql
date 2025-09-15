-- Update password hashes with correct bcrypt hashes
UPDATE login_table SET password_hash = '$2b$12$9ybnBYQ3Srux2FTd9jSyl.1zbCn7YrefU64Atp4PCk8XemozaOhK2' WHERE role = 'patient';
UPDATE login_table SET password_hash = '$2b$12$6TJxdw7VyTFb4sdx19Ju5.jrS/ml0Yzg3EJDODjE9Tir0B6LXeMSi' WHERE role = 'doctor';  
UPDATE login_table SET password_hash = '$2b$12$mDNDxV29HFI7481OKsWBWuq.oxS5.LPBb6XGy4jW29iM06tqYpKu.' WHERE role = 'pharmacist';

-- Verify the updates
SELECT username, role FROM login_table;