CREATE DATABASE IF NOT EXISTS placement_management;
USE placement_management;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'faculty', 'company', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Student profiles
CREATE TABLE student_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    roll_number VARCHAR(20) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    year_of_study INT NOT NULL,
    cgpa DECIMAL(4,2),
    resume_url VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Company profiles
CREATE TABLE company_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    website VARCHAR(255),
    description TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Job postings
CREATE TABLE jobs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    location VARCHAR(100) NOT NULL,
    salary_range VARCHAR(100),
    job_type ENUM('full-time', 'part-time', 'contract') NOT NULL,
    status ENUM('open', 'closed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deadline TIMESTAMP NOT NULL,
    FOREIGN KEY (company_id) REFERENCES company_profiles(id)
);

-- Job applications
CREATE TABLE job_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('pending', 'shortlisted', 'rejected', 'accepted') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (student_id) REFERENCES student_profiles(id)
);

-- Internships
CREATE TABLE internships (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    duration VARCHAR(50) NOT NULL,
    stipend VARCHAR(100),
    location VARCHAR(100) NOT NULL,
    status ENUM('open', 'closed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deadline TIMESTAMP NOT NULL,
    FOREIGN KEY (company_id) REFERENCES company_profiles(id)
);

-- Internship applications
CREATE TABLE internship_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    internship_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('pending', 'shortlisted', 'rejected', 'accepted') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (internship_id) REFERENCES internships(id),
    FOREIGN KEY (student_id) REFERENCES student_profiles(id)
);

-- Counseling sessions
CREATE TABLE counseling_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    counselor_id INT NOT NULL,
    student_id INT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (counselor_id) REFERENCES users(id),
    FOREIGN KEY (student_id) REFERENCES student_profiles(id)
);

-- Mentorship programs
CREATE TABLE mentorship_programs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mentor_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    max_students INT NOT NULL,
    duration VARCHAR(50) NOT NULL,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mentor_id) REFERENCES users(id)
);

-- Mentorship enrollments
CREATE TABLE mentorship_enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    program_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('active', 'completed', 'dropped') DEFAULT 'active',
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES mentorship_programs(id),
    FOREIGN KEY (student_id) REFERENCES student_profiles(id)
); 