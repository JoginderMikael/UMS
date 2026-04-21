-- ============================================
-- Enable UUID extension
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS
-- ============================================
CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       first_name VARCHAR(100) NOT NULL,
                       last_name VARCHAR(100) NOT NULL,
                       role VARCHAR(50) NOT NULL,
                       status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
                       created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- DEPARTMENTS
-- ============================================
CREATE TABLE departments (
                             id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                             name VARCHAR(255) NOT NULL UNIQUE,
                             code VARCHAR(50) NOT NULL UNIQUE,
                             created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PROGRAMS
-- ============================================
CREATE TABLE programs (
                          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                          name VARCHAR(255) NOT NULL,
                          department_id UUID NOT NULL,
                          created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

                          CONSTRAINT fk_program_department
                              FOREIGN KEY (department_id)
                                  REFERENCES departments(id)
);

-- ============================================
-- COURSES (CATALOG)
-- ============================================
CREATE TABLE courses (
                         id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                         course_code VARCHAR(50) NOT NULL UNIQUE,
                         title VARCHAR(255) NOT NULL,
                         description TEXT,
                         credits INTEGER NOT NULL CHECK (credits > 0),
                         department_id UUID NOT NULL,

                         CONSTRAINT fk_course_department
                             FOREIGN KEY (department_id)
                                 REFERENCES departments(id)
);

-- ============================================
-- SEMESTERS
-- ============================================
CREATE TABLE semesters (
                           id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                           name VARCHAR(100) NOT NULL UNIQUE,
                           start_date DATE NOT NULL,
                           end_date DATE NOT NULL,
                           CHECK (start_date < end_date)
);

-- ============================================
-- COURSE OFFERINGS
-- ============================================
CREATE TABLE course_offerings (
                                  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                  course_id UUID NOT NULL,
                                  semester_id UUID NOT NULL,
                                  faculty_id UUID NOT NULL,
                                  capacity INTEGER NOT NULL CHECK (capacity > 0),

                                  CONSTRAINT fk_offering_course
                                      FOREIGN KEY (course_id)
                                          REFERENCES courses(id),

                                  CONSTRAINT fk_offering_semester
                                      FOREIGN KEY (semester_id)
                                          REFERENCES semesters(id),

                                  CONSTRAINT fk_offering_faculty
                                      FOREIGN KEY (faculty_id)
                                          REFERENCES users(id)
);

-- ============================================
-- ENROLLMENTS
-- ============================================
CREATE TABLE enrollments (
                             id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                             student_id UUID NOT NULL,
                             course_offering_id UUID NOT NULL,
                             status VARCHAR(50) NOT NULL DEFAULT 'ENROLLED',
                             enrolled_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

                             CONSTRAINT uq_student_offering UNIQUE (student_id, course_offering_id),

                             CONSTRAINT fk_enrollment_student
                                 FOREIGN KEY (student_id)
                                     REFERENCES users(id),

                             CONSTRAINT fk_enrollment_offering
                                 FOREIGN KEY (course_offering_id)
                                     REFERENCES course_offerings(id)
);

-- ============================================
-- GRADES
-- ============================================
CREATE TABLE grades (
                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                        enrollment_id UUID NOT NULL UNIQUE,
                        grade VARCHAR(5),
                        graded_at TIMESTAMP WITHOUT TIME ZONE,

                        CONSTRAINT fk_grade_enrollment
                            FOREIGN KEY (enrollment_id)
                                REFERENCES enrollments(id)
);

-- ============================================
-- INDEXES (PERFORMANCE)
-- ============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_courses_code ON courses(course_code);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_offering ON enrollments(course_offering_id);
