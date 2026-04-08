-- 1. Create the database (if it doesn't already exist)
CREATE DATABASE IF NOT EXISTS pdl_project;

-- 2. Use the created database
USE pdl_project;

-- 3. Create 'users' table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    anonymous_name VARCHAR(255) UNIQUE NOT NULL,
    trust_score INT DEFAULT 0,
    created_at DATETIME
);

-- 4. Create 'project' table (Maps to Problem.java)
CREATE TABLE IF NOT EXISTS project (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(255),
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at DATETIME,
    updated_at DATETIME,
    author_id BIGINT,
    CONSTRAINT fk_project_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Create 'responses' table (Maps to Response.java)
CREATE TABLE IF NOT EXISTS responses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    problem_id BIGINT,
    author_id BIGINT,
    response_type VARCHAR(255),
    content TEXT NOT NULL,
    is_helpful BOOLEAN DEFAULT FALSE,
    created_at DATETIME,
    CONSTRAINT fk_response_problem FOREIGN KEY (problem_id) REFERENCES project(id) ON DELETE CASCADE,
    CONSTRAINT fk_response_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 6. Create 'reports' table for user reporting content/profiles
CREATE TABLE IF NOT EXISTS reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    target_type VARCHAR(50) NOT NULL, 
    target_id BIGINT NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    reported_by VARCHAR(255) NOT NULL,
    created_at DATETIME
);
