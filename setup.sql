-- ============================================================
--  Student Achievement Hub - MySQL Setup Script
--  Run this manually OR let the backend auto-create it
-- ============================================================

CREATE DATABASE IF NOT EXISTS student_hub_demo;
USE student_hub_demo;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(50) NOT NULL,
  role VARCHAR(20) NOT NULL,
  skills TEXT
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'General',
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sample users
INSERT INTO users (name, username, password, role, skills) VALUES
  ('Arun Kumar',    'student1', '1234', 'student',   'Python, Machine Learning, React'),
  ('Priya Sharma',  'student2', '1234', 'student',   'Java, Spring Boot, MySQL'),
  ('Karthik Raj',   'student3', '1234', 'student',   'Node.js, MongoDB, Docker'),
  ('Admin',         'admin1',   '1234', 'admin',     ''),
  ('HR Recruiter',  'hr1',      '1234', 'recruiter', '');

-- Sample achievements
INSERT INTO achievements (user_id, title, description, category, status) VALUES
  (1, 'Won Hackathon 2024',       'First place at State Level Hackathon',           'Competition',   'verified'),
  (1, 'Published Research Paper', 'ML paper published in IEEE journal',             'Academic',      'verified'),
  (1, 'AWS Certified Developer',  'Passed AWS Developer Associate exam',            'Certification', 'pending'),
  (2, 'Google Summer of Code',    'Selected for GSoC 2024 with Apache',             'Open Source',   'verified'),
  (2, 'Built College App',        'Developed attendance tracking app (500+ users)', 'Project',       'pending'),
  (3, 'Internship at Infosys',    'Completed 6-month internship',                   'Internship',    'verified'),
  (3, 'Top 100 LeetCode India',   'Ranked in top 100 on LeetCode India',            'Competition',   'pending');

SELECT 'Setup complete!' as status;
