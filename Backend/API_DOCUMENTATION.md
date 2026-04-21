# University Management System API Documentation

This document reflects the current backend API implemented in this repository.

## Base URL
- `http://localhost:8081`

Most endpoints are under ` /api/v1/* `.

## Authentication
- Auth type: JWT Bearer token
- Header: `Authorization: Bearer <token>`
- Public endpoints:
1. `POST /api/v1/auth/login`
2. `POST /api/v1/auth/logout`
3. Swagger/OpenAPI docs endpoints

## API References
- Swagger UI: `http://localhost:8081/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8081/v3/api-docs`

## Access Legend
- `ADMIN` = `hasRole('ADMIN')`
- `FACULTY` = `hasRole('FACULTY')`
- `STUDENT` = `hasRole('STUDENT')`
- `AUTHENTICATED` = any logged-in user

## Authentication Endpoints

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/v1/auth/login` | Public | Authenticate user and return JWT |
| POST | `/api/v1/auth/logout` | Public | Logout/invalidate token |

## User Management Endpoints

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/v1/users/createuser` | ADMIN | Create user |
| GET | `/api/v1/users/allusers` | ADMIN | List users |
| GET | `/api/v1/users/email/{email}` | ADMIN | Get user by email |
| GET | `/api/v1/users/{id}` | ADMIN | Get user by id |
| PUT | `/api/v1/users/{id}` | ADMIN | Update user |
| DELETE | `/api/v1/users/{id}` | ADMIN | Soft-delete user |
| GET | `/api/v1/users/me` | AUTHENTICATED | Get current user profile |
| PUT | `/api/v1/users/{id}/restore` | ADMIN | Restore deleted user |
| GET | `/api/v1/users/allDeleted` | ADMIN | List deleted users |

## School Endpoints

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/v1/schools/addSchool` | ADMIN | Create school |
| GET | `/api/v1/schools/getAll` | AUTHENTICATED | List schools |
| GET | `/api/v1/schools/code/{code}` | AUTHENTICATED | Get school by code |
| GET | `/api/v1/schools/id/{id}` | AUTHENTICATED | Get school by id |
| DELETE | `/api/v1/schools/{id}` | ADMIN | Soft-delete school |
| PUT | `/api/v1/schools/{id}` | ADMIN | Update school |
| PUT | `/api/v1/schools/{id}/restore` | ADMIN | Restore school |
| GET | `/api/v1/schools/deletedSchools` | ADMIN | List deleted schools |

## Department Endpoints

Base path includes school id: `/api/v1/{schoolId}/departments`

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/v1/{schoolId}/departments/addDepartment` | ADMIN | Create department in school |
| GET | `/api/v1/{schoolId}/departments/all` | AUTHENTICATED | List departments in school |
| GET | `/api/v1/{schoolId}/departments/{id}` | AUTHENTICATED | Get department by id |
| DELETE | `/api/v1/{schoolId}/departments/{id}` | ADMIN | Soft-delete department |
| PUT | `/api/v1/{schoolId}/departments/{id}/restore` | ADMIN | Restore department |
| PUT | `/api/v1/{schoolId}/departments/{id}` | ADMIN | Update department |
| GET | `/api/v1/{schoolId}/departments/allDeleted` | ADMIN | List deleted departments |

## Program Endpoints

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/v1/programs/add` | ADMIN | Create program |
| GET | `/api/v1/programs/{id}` | AUTHENTICATED | Get program by id |
| GET | `/api/v1/programs/all` | AUTHENTICATED | List all programs (minimal view) |
| GET | `/api/v1/programs/schools/{schoolId}` | AUTHENTICATED | List programs by school |
| GET | `/api/v1/programs/departments/{departmentId}` | AUTHENTICATED | List programs by department |
| PUT | `/api/v1/programs/{id}` | ADMIN | Update program |
| DELETE | `/api/v1/programs/{id}` | ADMIN | Soft-delete program |
| POST | `/api/v1/programs/{id}/courses/{courseId}` | ADMIN or FACULTY | Add course to program |
| DELETE | `/api/v1/programs/{id}/courses/{courseId}` | ADMIN or FACULTY | Remove course from program |
| PUT | `/api/v1/programs/{id}/courses/{courseId}` | ADMIN or FACULTY | Update program-course mapping |
| GET | `/api/v1/programs/{id}/courses` | AUTHENTICATED | List all courses in program |

## Course Endpoints

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/v1/courses/add` | ADMIN or FACULTY | Create course |
| GET | `/api/v1/courses/university/all` | AUTHENTICATED | List all courses |
| GET | `/api/v1/courses/{id}` | AUTHENTICATED | Get course by id |
| GET | `/api/v1/courses/schools/{schoolId}` | AUTHENTICATED | List courses by school |
| GET | `/api/v1/courses/departments/{departmentId}` | AUTHENTICATED | List courses by department |
| GET | `/api/v1/courses/programs/{programId}` | AUTHENTICATED | List courses by program |
| PUT | `/api/v1/courses/{id}` | ADMIN or FACULTY | Update course |
| DELETE | `/api/v1/courses/{id}` | ADMIN or FACULTY | Soft-delete course |

## Academic Year Endpoints

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/v1/academic-years/add` | ADMIN | Create academic year |
| GET | `/api/v1/academic-years/all` | AUTHENTICATED | List academic years |
| PUT | `/api/v1/academic-years/{id}/activate` | ADMIN | Activate academic year |

## Semester Endpoints

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/v1/academic-years/{yearId}/semesters` | ADMIN | Create semester in academic year |
| GET | `/api/v1/academic-years/{yearId}/semesters` | AUTHENTICATED | List semesters in academic year |
| PUT | `/api/v1/semesters/{id}/activate` | ADMIN | Activate semester |

## Enrollment Endpoints

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/v1/enrollments/students` | ADMIN | Enroll student |
| PATCH | `/api/v1/enrollments/{enrollmentId}/cancel` | ADMIN | Cancel enrollment |
| GET | `/api/v1/enrollments` | ADMIN | List all enrollments |
| PATCH | `/api/v1/enrollments/{enrollmentId}/status` | ADMIN | Update enrollment status |

## Result/Grading Endpoints

| Method | Path | Access | Purpose |
|---|---|---|---|
| PUT | `/api/v1/results/grade` | ADMIN or FACULTY | Create/update student grade |

## Student Self-Service Endpoints

Base path: `/api/v1/students/me`

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/v1/students/me/semesters/enroll/{studentId}` | STUDENT | Enroll self into current semester |
| POST | `/api/v1/students/me/courses/{studentId}/{courseId}` | STUDENT | Register one course |
| POST | `/api/v1/students/me/courses/bulk` | STUDENT | Register multiple courses |
| GET | `/api/v1/students/me/courses/{studentId}` | STUDENT | Get own registered courses |
| POST | `/api/v1/students/me/courses/{studentId}/{courseId}/exam` | STUDENT | Register exam for a course |
| GET | `/api/v1/students/me/{studentId}/transcript` | STUDENT | Get own transcript |

## Student Fee Endpoints

Base path: `/api/v1/students`

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/v1/students/{studentId}/fees/{semesterId}/clear` | ADMIN | Force-clear fees |
| POST | `/api/v1/students/{studentId}/fees/{semesterId}/pay` | STUDENT or ADMIN | Record fee payment |
| GET | `/api/v1/students/{studentId}/fees/{semesterId}/status` | STUDENT or ADMIN | Get fee status |

## Student Details Endpoints (Admin)

Base path: `/api/v1/students`

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/students/registration/{registrationNumber}/details` | ADMIN | Get student details by registration number (path form) |
| GET | `/api/v1/students/registration/details?registrationNumber=...` | ADMIN | Get student details by registration number (query form, supports `/` safely) |
| PUT | `/api/v1/students/{studentId}/details` | ADMIN | Update student details |

## Admin Fee Management Endpoints

Base path: `/api/v1/admin/fees`

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/v1/admin/fees/programs` | ADMIN | Configure program fee for semester/academic year |
| GET | `/api/v1/admin/fees/programs/{programId}/records` | ADMIN | List configured fee records for a program |
| POST | `/api/v1/admin/fees/payments` | ADMIN | Record fee payment for student |
| POST | `/api/v1/admin/fees/students/{studentId}/semesters/{semesterId}/clear` | ADMIN | Mark student fees as cleared |
| GET | `/api/v1/admin/fees/students/{studentId}/semesters/{semesterId}` | ADMIN | Get student fee status |
| GET | `/api/v1/admin/fees/payments` | ADMIN | List all fee payment statuses |

## Common Status Codes

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

## Notes

1. UUID is used for most path identifiers (`{id}`, `{studentId}`, `{programId}`, etc.).
2. Some domain errors are returned as `400` or `404` depending on validation vs missing resources.
3. For DTO fields and exact request/response schemas, prefer Swagger UI because it is generated from current code.
