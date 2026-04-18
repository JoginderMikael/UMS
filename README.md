# 🎓 University Management System (UMS)

A comprehensive **University Management System** that combines a robust Spring Boot backend with a modern web frontend, originally developed as separate repositories and now integrated into a single workspace for streamlined development and deployment.

## 📋 Project Origin

This project is a **combination of two previously separate repositories**:

- **Backend**: Originally at `https://github.com/JoginderMikael/University-Management-System.git`
- **Frontend**: Originally at `https://github.com/JoginderMikael/UN-Management-System-FrontEnd.git`

They have been brought together in this workspace to simplify development, testing, and deployment using Docker Compose.

## 📋 Overview

This project provides a full-stack solution for managing university operations, including:

- **Academic Management**: Schools, departments, programs, courses, and academic calendars
- **Student Lifecycle**: Enrollment, fee management, transcripts, and grading
- **Faculty Operations**: Course assignments, student rosters, and grade management
- **Administration**: User management, reporting, and system monitoring
- **Security**: JWT-based authentication with Role-Based Access Control (RBAC)

## 🏗️ Architecture

The system is containerized using Docker Compose with the following components:

- **Backend**: Spring Boot REST API (Java 25, PostgreSQL, Redis)
- **Frontend**: Modern web application (HTML5, CSS3, JavaScript)
- **Database**: PostgreSQL for persistent data storage
- **Cache**: Redis for session management and caching

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Git

### Installation

1. **Clone this combined repository:**
   ```bash
   git clone <this-repository-url>
   cd UMS
   ```

2. **Start the system:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - **Frontend**: http://localhost
   - **Backend API**: http://localhost:8081
   - **API Documentation**: http://localhost:8081/swagger-ui/index.html

### Default Credentials

- **Admin User**: admin@university.com / Admin123!
- **Database**: postgres://uniuser:unipass@localhost:5432/unidata

## 🐳 Docker Setup and Deployment

### Detailed Docker Setup

1. **Verify Docker Installation:**
   ```bash
   docker --version
   docker-compose --version
   ```

2. **Clone and Navigate to Project:**
   ```bash
   git clone <this-repository-url>
   cd UMS
   ```

3. **Build and Start Services:**
   ```bash
   # Build and start all services
   docker-compose up --build

   # Or run in background (detached mode)
   docker-compose up --build -d
   ```

4. **Monitor Service Startup:**
   ```bash
   # View logs
   docker-compose logs -f

   # Check service status
   docker-compose ps
   ```

### Service Health Checks

The system includes health checks for database and cache services:

- **PostgreSQL**: Health check ensures the database is ready before the backend starts
- **Redis**: Health check verifies Redis connectivity
- **Backend**: Depends on healthy database and Redis services

### Accessing the Application

Once all services are running successfully:

1. **Web Frontend:**
   - URL: `http://localhost`
   - Description: Main user interface for admin, faculty, and students

2. **Backend API:**
   - URL: `http://localhost:8081`
   - Description: REST API endpoints for all operations

3. **API Documentation (Swagger):**
   - URL: `http://localhost:8081/swagger-ui/index.html`
   - Description: Interactive API documentation and testing interface

4. **Database (PostgreSQL):**
   - Host: `localhost`
   - Port: `5432`
   - Database: `unidata`
   - Username: `uniuser`
   - Password: `unipass`

### Verifying Successful Setup

1. **Check Service Logs:**
   ```bash
   docker-compose logs backend
   docker-compose logs frontend
   ```

2. **Test API Connectivity:**
   ```bash
   curl http://localhost:8081/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@university.com","password":"Admin123!"}'
   ```

3. **Access Web Interface:**
   - Open `http://localhost` in your browser
   - You should see the university management system login page

### Troubleshooting

**Common Issues:**

- **Port Conflicts:** Ensure ports 80, 5432, 6379, and 8081 are available
- **Build Failures:** Check Docker resources and internet connectivity
- **Database Connection:** Wait for PostgreSQL health check to pass
- **Frontend Loading Issues:** Verify backend is running and accessible

**Useful Commands:**
```bash
# Stop all services
docker-compose down

# Rebuild specific service
docker-compose up --build backend

# View resource usage
docker stats

# Clean up (removes volumes too)
docker-compose down -v
```

**Service Ports:**
- Frontend (nginx): 80
- Backend (Spring Boot): 8081
- PostgreSQL: 5432
- Redis: 6379

## 🧱 Technology Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Spring Boot 3+, Java 25 |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **Database** | PostgreSQL 17 |
| **Cache** | Redis 7 |
| **Security** | JWT, Spring Security, BCrypt |
| **Build Tools** | Maven, npm |
| **Testing** | JUnit, Jasmine, Karma |
| **Documentation** | JSDoc, Swagger/OpenAPI |

## 📁 Project Structure

```
UMS/
├── docker-compose.yml          # Docker orchestration (newly added for integration)
├── Backend/                    # Spring Boot REST API (original backend repo)
│   ├── src/
│   ├── pom.xml
│   ├── Dockerfile
│   ├── compose.yaml
│   └── README.md               # Original backend documentation
├── Frontend/                   # Web application (original frontend repo)
│   ├── admin/                  # Admin interface
│   ├── student/                # Student portal
│   ├── faculty/                # Faculty dashboard
│   ├── scripts/                # Shared utilities
│   ├── package.json
│   ├── Dockerfile
│   ├── nginx.conf
│   └── README.md               # Original frontend documentation
└── README.md                   # This integration guide
```

## 🔑 Key Features

### Authentication & Authorization
- JWT-based secure authentication
- Role-Based Access Control (RBAC)
- Three user roles: ADMIN, FACULTY, STUDENT

### Academic Management
- Multi-school and department support
- Program and course catalog management
- Academic year and semester planning
- Course offerings and scheduling

### Student Services
- Online course enrollment
- Fee payment tracking and management
- Academic transcript generation
- GPA calculation and performance tracking

### Faculty Tools
- Assigned course management
- Student roster access
- Grade assignment and updates
- Academic performance monitoring

### Administrative Functions
- User account management
- System-wide reporting
- Enrollment monitoring
- Fee configuration and auditing

## 🧪 Testing

### Backend Tests
```bash
cd Backend
mvn test
```

### Frontend Tests
```bash
cd Frontend
npm install
npm run test
npm run test:coverage  # Generate coverage report
```

## 📚 API Documentation

Complete API documentation is available at:
- **Swagger UI**: http://localhost:8081/swagger-ui/index.html
- **OpenAPI JSON**: http://localhost:8081/v3/api-docs
- **Detailed Docs**: [Backend/API_DOCUMENTATION.md](Backend/API_DOCUMENTATION.md)

## 🔧 Development

### Backend Development
```bash
cd Backend
mvn spring-boot:run  # Runs on port 8081
```

### Frontend Development
```bash
cd Frontend
# Using VS Code Live Server extension
# Or serve with any static server on port 80
```

### Database
The system uses PostgreSQL with automatic schema updates via Hibernate. Database migrations are handled through JPA.

## 📖 Original Documentation

For detailed information about each component, refer to the original READMEs:

- **[Backend README](Backend/README.md)**: Comprehensive backend documentation, API details, and architecture
- **[Frontend README](Frontend/README.md)**: Frontend setup, testing, and development guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow Spring Boot best practices for backend
- Use modern JavaScript (ES6+) for frontend
- Maintain test coverage above 80%
- Document APIs with OpenAPI/Swagger

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Joginder Mikael** - *Initial work* - [GitHub](https://github.com/JoginderMikael)

## 🙏 Acknowledgments

- Built with Spring Boot and modern web technologies
- Inspired by enterprise university management systems
- Docker for simplified deployment and scaling
- Integration of separate backend and frontend repositories
