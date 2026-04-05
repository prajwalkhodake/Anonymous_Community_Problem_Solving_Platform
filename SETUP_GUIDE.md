# Step-by-Step Project Setup Guide

## Prerequisites Check

### Step 1: Install Java 21
```bash
# Check if Java is installed
java -version

# If not installed:
# macOS: brew install openjdk@21
# Linux: sudo apt-get install openjdk-21-jdk
# Windows: Download from oracle.com
```

### Step 2: Install MySQL Server
```bash
# Check if MySQL is running
mysql --version

# If not installed:
# macOS: brew install mysql
# Linux: sudo apt-get install mysql-server
# Windows: Download MySQL Community Server

# Start MySQL service
# macOS: brew services start mysql
# Linux: sudo systemctl start mysql
# Windows: Services > MySQL80 > Start
```

### Step 3: Start MySQL Service
```bash
# macOS/Linux - Check if running
mysql -u root -p

# If you see "mysql>" prompt, you're connected. Type "exit" to quit.
```

---

## Database Setup

### Step 4: Create Database
```bash
# Open MySQL in terminal
mysql -u root -p

# Password: sohamsql32025 (when prompted)

# Paste these commands:
CREATE DATABASE IF NOT EXISTS pdl_project;
USE pdl_project;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    anonymous_name VARCHAR(255) UNIQUE NOT NULL,
    trust_score INT DEFAULT 0,
    created_at DATETIME
);

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

# Verify tables were created
SHOW TABLES;

# Exit MySQL
exit
```

---

## Backend Setup (Spring Boot)

### Step 5: Navigate to Project Directory
```bash
cd /Users/prajwalkhodake/Desktop/Anonymous_Community_Problem_Solving_Platform_
```

### Step 6: Clean Previous Builds
```bash
./mvnw clean
```

### Step 7: Build the Project
```bash
./mvnw build
# This downloads dependencies and compiles the code
# Takes 2-5 minutes
```

### Step 8: Start Backend Server
```bash
./mvnw spring-boot:run

# You should see output like:
# Tomcat started on port(s): 8080 (http) with context path ''
# Started AnonymousplatformApplication in X.XXX seconds
```

**✓ Backend running on:** http://localhost:8080

**Keep this terminal open!**

---

## Frontend Setup (Vanilla JS)

### Step 9: Open New Terminal (Keep Backend Running)
```bash
# Open a new terminal/tab
# Navigate to frontend folder
cd /Users/prajwalkhodake/Desktop/Anonymous_Community_Problem_Solving_Platform_/frontend
```

### Step 10: Start Frontend Server
```bash
# Option 1: If you have Python installed (Recommended)
python3 -m http.server 3000

# Option 2: If you have Node.js installed
npx http-server -p 3000

# Option 3: If you have Ruby installed
ruby -run -ehttpd . -p 3000

# You should see:
# Serving HTTP on 0.0.0.0 port 3000
```

**✓ Frontend running on:** http://localhost:3000

**Keep this terminal open!**

---

## Access the Application

### Step 11: Open in Browser
```bash
# Open any web browser and visit:
http://localhost:3000

# You should see the login page
```

### Step 12: Create an Account
1. Click **"Sign Up"** tab
2. Enter email: `test@example.com`
3. Enter password: `password123`
4. Confirm password: `password123`
5. Check "I agree to Community Rules"
6. Click **Sign Up**

### Step 13: Set Username
1. Generate or enter custom anonymous name
2. Click **Save Name**
3. You'll be redirected to Dashboard

### Step 14: Explore Features
1. **Dashboard**: View your stats
2. **Board**: Browse posts with new **search feature**
3. **Search**: Type keywords, titles, or usernames
4. **Profile**: Manage your account
5. **Admin Panel**: (Optional - admin/admin123)

---

## Stopping the Application

### Step 15: Stop Backend
```bash
# In backend terminal
Ctrl + C

# MySQL will still be running
```

### Step 16: Stop Frontend
```bash
# In frontend terminal
Ctrl + C
```

### Step 17: Stop MySQL (Optional)
```bash
# macOS
brew services stop mysql

# Linux
sudo systemctl stop mysql

# Or keep it running for next session
```

---

## Troubleshooting

### Issue: "Connection refused at localhost:8080"
**Solution:**
```bash
# Backend not running? Start it:
./mvnw spring-boot:run

# Port already in use? Kill and restart:
kill -9 $(lsof -t -i:8080)
./mvnw spring-boot:run
```

### Issue: "Cannot connect to MySQL"
**Solution:**
```bash
# Start MySQL service
brew services start mysql  # macOS
sudo systemctl start mysql  # Linux

# Check connection
mysql -u root -p
# Password: sohamsql32025
```

### Issue: "Port 3000 already in use"
**Solution:**
```bash
# Use different port
python3 -m http.server 4000
# Then visit http://localhost:4000
```

### Issue: "Java version not supported"
**Solution:**
```bash
# Check Java version
java -version

# Should be 21.x.x
# Install Java 21 if you have older version
```

### Issue: "Maven not found"
**Solution:**
```bash
# Use Maven wrapper instead
./mvnw --version

# Should show Maven version with Java 21
```

---

## Quick Reference

| Component | URL | Status |
|-----------|-----|--------|
| Frontend | http://localhost:3000 | ✓ Running |
| Backend API | http://localhost:8080 | ✓ Running |
| MySQL | localhost:3306 | ✓ Running |
| Database | pdl_project | ✓ Ready |

---

## Test Credentials

**Frontend (LocalStorage - No Backend Login Yet):**
- Email: `test@example.com`
- Password: `password123`

**Admin Panel:**
- Username: `admin`
- Password: `admin123`

**MySQL:**
- Username: `root`
- Password: `sohamsql32025`

---

## Next Steps

After setup is complete, you can:
1. ✅ Test the search/explore feature
2. ✅ Create posts and replies
3. ✅ Try category filters
4. ✅ Access admin panel
5. ✅ Integrate backend API with frontend (future)

---

## For Developers

To modify and rebuild:
```bash
# Edit code in src/ or frontend/

# Backend changes:
./mvnw clean build
./mvnw spring-boot:run

# Frontend changes:
# Just refresh browser (http://localhost:3000)
# No rebuild needed for vanilla JS
```

---

**Questions?** Check logs:
- Backend: Check terminal running `./mvnw spring-boot:run`
- Frontend: Open browser DevTools (F12)
- Database: `mysql -u root -p` then `SELECT * FROM users;`
