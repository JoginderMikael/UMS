# 🎓 University Management System – Backend

A **production-grade RESTful backend** for managing a complete university ecosystem, built using **Spring Boot**, **PostgreSQL**, and **enterprise-level system design principles**.

This project is designed as a **modular monolith** with clean separation of concerns, strong security, structured logging, and scalability in mind.

---

## 🖥️ Frontend Repository

Frontend code is available at: https://github.com/JoginderMikael/UN-Management-System-FrontEnd.git

---

## 📖 Quick Navigation

> ⚡ **Looking for API endpoints?** Check out the [Complete API Documentation](API_DOCUMENTATION.md)

* [Features](#-features-overview)
* [Technology Stack](#-technology-stack)
* [RBAC Permissions](#-role-based-access-control-rbac)
* [API Overview](#-api-overview)
* [Swagger / OpenAPI Access](#-swagger--openapi-access)
* [Project Structure](#-project-structure)

---

## 🚀 Features Overview

### 🔐 Authentication & Authorization

* JWT-based authentication
* Role-Based Access Control (RBAC)
* Roles: **ADMIN**, **FACULTY**, **STUDENT**
* Secure password hashing (BCrypt)

### 🏫 Academic Management

* **Schools & Departments**: Manage academic units.
* **Programs**: Degree programs and curricula.
* **Courses**: Course catalog and details.
* **Semesters & Academic Years**: Academic calendar management.
* **Course Offerings**: Courses available in specific semesters.

### 🧑‍🎓 Student Lifecycle

* **Enrollment**: Student registration and course enrollment.
* **Fee Management**: Tracking student fee payments.
* **Academic Records**: Grades, GPA calculation, and transcripts.
* **Semester Enrollment**: Managing student status per semester.

### 🧑‍🏫 Faculty Operations

* View assigned courses
* Access student rosters
* Assign and update grades

### 📊 Administration & Reporting

* User management (Admin, Faculty, Student)
* Enrollment monitoring
* Academic performance reports
* Transcript generation

### 🧾 Logging & Auditing

* Centralized logging using **SLF4J + Logback**
* Correlation IDs (MDC)
* Environment-based log configuration
* Secure, non-PII logging practices

---

## 🧱 Technology Stack

| Layer      | Technology                  |
| ---------- | --------------------------- |
| Language   | Java 25                     |
| Framework  | Spring Boot 3+              |
| Security   | Spring Security + JWT       |
| Database   | PostgreSQL                  |
| ORM        | Spring Data JPA (Hibernate) |
| Logging    | SLF4J + Logback             |
| Build Tool | Maven                       |

---

## 🏗️ System Architecture

```
Client (Web / Mobile)
        ↓
REST API (Spring Boot)
        ↓
----------------------------------
| Controller | Service | Repository |
----------------------------------
        ↓
PostgreSQL Database
```

* Stateless REST APIs
* Transactional service layer
* Clean architecture & domain-driven design

---

## 🔐 Role-Based Access Control (RBAC)

| Capability        | STUDENT | FACULTY | ADMIN |
| ----------------- | ------- | ------- | ----- |
| View own profile  | ✅       | ✅       | ✅     |
| Manage users      | ❌       | ❌       | ✅     |
| Enroll in courses | ✅       | ❌       | ✅     |
| Assign grades     | ❌       | ✅       | ✅     |
| View transcript   | ✅       | ❌       | ✅     |
| System reports    | ❌       | ❌       | ✅     |

---

## 🌐 API Overview

All APIs are versioned under `/api/v1`

### 📚 Full API Documentation

**[👉 Complete API Documentation Available Here →](API_DOCUMENTATION.md)**

The comprehensive API documentation includes:
- ✅ All 40+ endpoints with detailed descriptions
- ✅ Request/Response examples with sample JSON payloads
- ✅ Required authentication & authorization roles
- ✅ Query parameters and path variables
- ✅ Error responses and status codes
- ✅ Data models and schema definitions

### 🔑 Quick Reference - Main Endpoint Groups

| Endpoint Group | Purpose | Example Endpoints |
|---|---|---|
| **Authentication** | Login & Logout | `/auth/login`, `/auth/logout` |
| **User Management** | CRUD operations for users | `/users/createuser`, `/users/{id}`, `/users/allusers` |
| **Academic Structure** | Schools, Departments, Programs | `/schools`, `/departments`, `/programs` |
| **Courses** | Course management & catalog | `/courses`, `/courses/{id}`, `/courses/schools/{schoolId}` |
| **Student Operations** | Enrollment, registration, transcripts | `/students/me/semesters/enroll`, `/students/me/courses`, `/students/me/transcript` |
| **Semester & Year** | Academic calendar | `/academic-years`, `/semesters` |
| **Grading** | Student grades and results | `/results/grade` |
| **Fees** | Student fee management | `/students/{id}/fees/{semesterId}/clear` |

### Example API Calls

**Login:**
```bash
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@university.com",
    "password": "Admin123!"
  }'
```

**Get User by ID:**
```bash
curl -X GET http://localhost:8081/api/v1/users/8f1712ac-7161-4c36-948e-40842eeb43f4 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Create Course:**
```bash
curl -X POST http://localhost:8081/api/v1/courses/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Introduction to Computer Science",
    "code": "CS101",
    "description": "Fundamentals of computer science",
    "credits": 3,
    "departmentId": "dept-uuid-1"
  }'
```

📌 **For complete endpoint documentation with all request/response payloads, visit [API_DOCUMENTATION.md](API_DOCUMENTATION.md)**

---

## 🧭 Swagger / OpenAPI Access

Swagger is enabled through `springdoc-openapi` and is publicly accessible in local development.

### Start the backend

```bash
mvn spring-boot:run
```

Or on Windows PowerShell:

```powershell
mvn spring-boot:run
```

### Open documentation in browser

* Swagger UI: `http://localhost:8081/swagger-ui/index.html`
* OpenAPI JSON: `http://localhost:8081/v3/api-docs`

> Note: This project currently runs on port `8081` (`server.port=8081` in `src/main/resources/application.properties`).

---

## 🗂️ Project Structure

```
git.jogindermikael.University.Management.System
│
├── academic        # Academic structure (Schools, Transcripts)
├── academicYear    # Academic Year management
├── auth            # Authentication & Security
├── common          # Shared utilities, configs, and base entities
├── course          # Course management
├── enrollment      # Student enrollment logic
├── program         # Academic programs
├── semester        # Semester management
├── student         # Student specific logic (Fees, Transcripts, Repos)
├── user            # User management
└── UniversityManagementSystemApplication.java
```

---

## 🧾 Logging Strategy

* Logging facade: **SLF4J**
* Implementation: **Logback**
* Log levels strictly enforced
* Request correlation using MDC (`requestId`, `userId`)
* No sensitive data logged

### Log Levels

| Level | Usage                      |
| ----- | -------------------------- |
| INFO  | Business events            |
| WARN  | Validation & access issues |
| ERROR | System failures            |

---

## 🛢️ Database Design

* PostgreSQL with UUID primary keys
* Proper indexing on foreign keys
* Transactional integrity for enrollment & grading
* Soft deletes for critical entities

---

## ⚙️ Configuration Profiles

| Profile | Purpose           |
| ------- | ----------------- |
| dev     | Local development |
| test    | Automated testing |
| prod    | Production        |

---

## 🧪 Testing Strategy

* Unit tests for services
* Integration tests for APIs
* Security tests for RBAC rules
* Logging verification via test appenders

---

## 🚧 Roadmap

* [ ] Flyway database migrations
* [ ] JSON structured logs
* [ ] OpenAPI (Swagger) documentation
* [ ] ELK stack integration
* [ ] Microservices decomposition (future)

---

## 🤝 Contribution Guidelines

1. Fork the repository
2. Create a feature branch
3. Follow clean architecture principles
4. Ensure tests pass
5. Submit a pull request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## ✨ Author

Designed as an **enterprise-grade university backend system** using modern Java and Spring Boot best practices.
