package git.jogindermikael.University.Management.System.student.service;

import git.jogindermikael.University.Management.System.course.entity.Course;
import git.jogindermikael.University.Management.System.course.repository.CourseRepository;
import git.jogindermikael.University.Management.System.semester.entity.Semester;
import git.jogindermikael.University.Management.System.student.dto.StudentExamRegistrationStatusResponse;
import git.jogindermikael.University.Management.System.student.dto.StudentRegisteredCourseResponse;
import git.jogindermikael.University.Management.System.student.entity.Student;
import git.jogindermikael.University.Management.System.student.entity.StudentCourseRegistration;
import git.jogindermikael.University.Management.System.student.entity.StudentSemesterEnrollment;
import git.jogindermikael.University.Management.System.student.repositories.StudentCourseRegistrationRepository;
import git.jogindermikael.University.Management.System.student.repositories.StudentRepository;
import git.jogindermikael.University.Management.System.student.repositories.StudentSemesterEnrollmentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class StudentCourseService {

    private final StudentSemesterEnrollmentRepository studentSemesterEnrollmentRepository;
    private final StudentCourseRegistrationRepository studentCourseRegistrationRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;


    public void registerCourse(UUID studentId, UUID courseId) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));


        StudentSemesterEnrollment enrollment = studentSemesterEnrollmentRepository.findByStudentAndActiveTrue(student)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not enrolled in semester"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        if(studentCourseRegistrationRepository.existsByStudentAndCourseAndSemester(
                student, course, enrollment.getSemester()
        )){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Already Registered");
        }

        StudentCourseRegistration registration = StudentCourseRegistration.builder()
                .student(student)
                .course(course)
                .semester(enrollment.getSemester())
                .examRegistered(false)
                .build();

        studentCourseRegistrationRepository.save(registration);
        log.info("Student Course Registration Registered Successfully for student {}", student.getRegistrationNumber());

    }

    public void registerCourses(UUID studentId, List<UUID> courseIds) {
        if (courseIds == null || courseIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Course IDs are required");
        }

        List<UUID> uniqueCourseIds = courseIds.stream()
                .distinct()
                .toList();

        if (uniqueCourseIds.size() != courseIds.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duplicate course IDs provided");
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        StudentSemesterEnrollment enrollment = studentSemesterEnrollmentRepository.findByStudentAndActiveTrue(student)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not enrolled in semester"));

        List<Course> courses = courseRepository.findAllById(uniqueCourseIds);
        Set<UUID> foundCourseIds = courses.stream()
                .map(Course::getId)
                .collect(Collectors.toSet());

        List<UUID> missingCourseIds = uniqueCourseIds.stream()
                .filter(courseId -> !foundCourseIds.contains(courseId))
                .toList();

        if (!missingCourseIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found: " + missingCourseIds);
        }

        for (Course course : courses) {
            if (studentCourseRegistrationRepository.existsByStudentAndCourseAndSemester(
                    student, course, enrollment.getSemester()
            )) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Already Registered: " + course.getId());
            }
        }

        List<StudentCourseRegistration> registrations = courses.stream()
                .map(course -> StudentCourseRegistration.builder()
                        .student(student)
                        .course(course)
                        .semester(enrollment.getSemester())
                        .examRegistered(false)
                        .build())
                .toList();

        studentCourseRegistrationRepository.saveAll(registrations);
        log.info("Student Course Registrations Registered Successfully for student {}", student.getRegistrationNumber());
    }

    public List<StudentRegisteredCourseResponse> getMyCourses(UUID studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        Semester semester = studentSemesterEnrollmentRepository.findByStudentAndActiveTrue(student)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not Enrolled"))
                .getSemester();
        log.info("Returning all courses for student {}", student.getRegistrationNumber());
        return studentCourseRegistrationRepository.findByStudentAndSemester(student, semester)
                .stream()
                .map(this::toRegisteredCourseResponse)
                .toList();
    }

    public List<StudentExamRegistrationStatusResponse> getExamRegistrationStatus(UUID studentId, List<UUID> courseIds) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        Semester semester = studentSemesterEnrollmentRepository.findByStudentAndActiveTrue(student)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not Enrolled"))
                .getSemester();

        List<StudentCourseRegistration> registrations =
                studentCourseRegistrationRepository.findByStudentAndSemester(student, semester);

        Map<UUID, StudentCourseRegistration> registrationByCourseId = registrations.stream()
                .collect(Collectors.toMap(reg -> reg.getCourse().getId(), Function.identity()));

        if (courseIds == null || courseIds.isEmpty()) {
            return registrations.stream()
                    .map(this::toExamStatusResponse)
                    .toList();
        }

        List<UUID> uniqueCourseIds = courseIds.stream().distinct().toList();
        return uniqueCourseIds.stream()
                .map(courseId -> {
                    StudentCourseRegistration registration = registrationByCourseId.get(courseId);
                    if (registration == null) {
                        return new StudentExamRegistrationStatusResponse(courseId, null, null, false, false);
                    }
                    return toExamStatusResponse(registration);
                })
                .toList();
    }

    private StudentExamRegistrationStatusResponse toExamStatusResponse(StudentCourseRegistration registration) {
        return new StudentExamRegistrationStatusResponse(
                registration.getCourse().getId(),
                registration.getCourse().getCode(),
                registration.getCourse().getTitle(),
                true,
                registration.isExamRegistered()
        );
    }

    private StudentRegisteredCourseResponse toRegisteredCourseResponse(StudentCourseRegistration registration) {
        return new StudentRegisteredCourseResponse(
                registration.getId(),
                registration.getCourse().getId(),
                registration.getCourse().getCode(),
                registration.getCourse().getTitle(),
                registration.getCourse().getCreditUnits(),
                registration.isExamRegistered(),
                registration.getCreatedAt()
        );
    }

}
