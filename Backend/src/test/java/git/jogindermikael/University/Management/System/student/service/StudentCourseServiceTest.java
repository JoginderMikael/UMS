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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudentCourseServiceTest {

    @Mock
    private StudentSemesterEnrollmentRepository studentSemesterEnrollmentRepository;
    @Mock
    private StudentCourseRegistrationRepository studentCourseRegistrationRepository;
    @Mock
    private CourseRepository courseRepository;
    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private StudentCourseService studentCourseService;

    @Test
    void registerCourse_ShouldRegister_WhenValid() {
        UUID studentId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();
        Student student = Student.builder().build();
        Semester semester = Semester.builder().build();
        StudentSemesterEnrollment enrollment = StudentSemesterEnrollment.builder().semester(semester).build();
        Course course = new Course();

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(studentSemesterEnrollmentRepository.findByStudentAndActiveTrue(student)).thenReturn(Optional.of(enrollment));
        when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
        when(studentCourseRegistrationRepository.existsByStudentAndCourseAndSemester(student, course, semester)).thenReturn(false);

        studentCourseService.registerCourse(studentId, courseId);

        verify(studentCourseRegistrationRepository).save(any(StudentCourseRegistration.class));
    }

    @Test
    void registerCourse_ShouldThrowException_WhenNotEnrolledInSemester() {
        UUID studentId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();
        Student student = Student.builder().build();

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(studentSemesterEnrollmentRepository.findByStudentAndActiveTrue(student)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> studentCourseService.registerCourse(studentId, courseId));
    }

    @Test
    void getMyCourses_ShouldReturnCourses_WhenEnrolled() {
        UUID studentId = UUID.randomUUID();
        UUID registrationId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();
        Student student = Student.builder().build();
        Semester semester = Semester.builder().build();
        StudentSemesterEnrollment enrollment = StudentSemesterEnrollment.builder().semester(semester).build();
        Course course = new Course();
        course.setId(courseId);
        course.setCode("CS101");
        course.setTitle("Intro to CS");
        course.setCreditUnits(3);

        StudentCourseRegistration registration = StudentCourseRegistration.builder()
                .course(course)
                .semester(semester)
                .examRegistered(false)
                .build();
        registration.setId(registrationId);
        registration.setCreatedAt(Instant.now());
        List<StudentCourseRegistration> registrations = List.of(registration);

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(studentSemesterEnrollmentRepository.findByStudentAndActiveTrue(student)).thenReturn(Optional.of(enrollment));
        when(studentCourseRegistrationRepository.findByStudentAndSemester(student, semester)).thenReturn(registrations);

        List<StudentRegisteredCourseResponse> result = studentCourseService.getMyCourses(studentId);

        assertEquals(1, result.size());
        assertEquals(registrationId, result.getFirst().registrationId());
        assertEquals(courseId, result.getFirst().courseId());
        assertEquals("CS101", result.getFirst().courseCode());
        assertEquals("Intro to CS", result.getFirst().courseTitle());
        assertEquals(3, result.getFirst().creditUnits());
        assertEquals(false, result.getFirst().examRegistered());
    }

    @Test
    void registerCourses_ShouldRegisterAll_WhenValid() {
        UUID studentId = UUID.randomUUID();
        UUID courseId1 = UUID.randomUUID();
        UUID courseId2 = UUID.randomUUID();
        Student student = Student.builder().build();
        Semester semester = Semester.builder().build();
        StudentSemesterEnrollment enrollment = StudentSemesterEnrollment.builder().semester(semester).build();
        Course course1 = new Course();
        course1.setId(courseId1);
        Course course2 = new Course();
        course2.setId(courseId2);

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(studentSemesterEnrollmentRepository.findByStudentAndActiveTrue(student)).thenReturn(Optional.of(enrollment));
        when(courseRepository.findAllById(List.of(courseId1, courseId2))).thenReturn(List.of(course1, course2));
        when(studentCourseRegistrationRepository.existsByStudentAndCourseAndSemester(student, course1, semester)).thenReturn(false);
        when(studentCourseRegistrationRepository.existsByStudentAndCourseAndSemester(student, course2, semester)).thenReturn(false);

        studentCourseService.registerCourses(studentId, List.of(courseId1, courseId2));

        verify(studentCourseRegistrationRepository).saveAll(any());
    }

    @Test
    void registerCourses_ShouldThrowException_WhenCourseIdsEmpty() {
        UUID studentId = UUID.randomUUID();

        assertThrows(ResponseStatusException.class, () -> studentCourseService.registerCourses(studentId, List.of()));

        verify(studentRepository, never()).findById(any());
    }

    @Test
    void registerCourses_ShouldThrowException_WhenDuplicateCourseIds() {
        UUID studentId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();

        assertThrows(ResponseStatusException.class, () -> studentCourseService.registerCourses(studentId, List.of(courseId, courseId)));

        verify(studentRepository, never()).findById(any());
    }

    @Test
    void registerCourses_ShouldThrowException_WhenCourseNotFound() {
        UUID studentId = UUID.randomUUID();
        UUID courseId1 = UUID.randomUUID();
        UUID courseId2 = UUID.randomUUID();
        Student student = Student.builder().build();
        Semester semester = Semester.builder().build();
        StudentSemesterEnrollment enrollment = StudentSemesterEnrollment.builder().semester(semester).build();
        Course course1 = new Course();
        course1.setId(courseId1);

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(studentSemesterEnrollmentRepository.findByStudentAndActiveTrue(student)).thenReturn(Optional.of(enrollment));
        when(courseRepository.findAllById(List.of(courseId1, courseId2))).thenReturn(List.of(course1));

        assertThrows(ResponseStatusException.class, () -> studentCourseService.registerCourses(studentId, List.of(courseId1, courseId2)));

        verify(studentCourseRegistrationRepository, never()).saveAll(any());
    }

    @Test
    void registerCourses_ShouldThrowException_WhenAlreadyRegistered() {
        UUID studentId = UUID.randomUUID();
        UUID courseId1 = UUID.randomUUID();
        UUID courseId2 = UUID.randomUUID();
        Student student = Student.builder().build();
        Semester semester = Semester.builder().build();
        StudentSemesterEnrollment enrollment = StudentSemesterEnrollment.builder().semester(semester).build();
        Course course1 = new Course();
        course1.setId(courseId1);
        Course course2 = new Course();
        course2.setId(courseId2);

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(studentSemesterEnrollmentRepository.findByStudentAndActiveTrue(student)).thenReturn(Optional.of(enrollment));
        when(courseRepository.findAllById(List.of(courseId1, courseId2))).thenReturn(List.of(course1, course2));
        when(studentCourseRegistrationRepository.existsByStudentAndCourseAndSemester(student, course1, semester)).thenReturn(true);

        assertThrows(ResponseStatusException.class, () -> studentCourseService.registerCourses(studentId, List.of(courseId1, courseId2)));

        verify(studentCourseRegistrationRepository, never()).saveAll(any());
        verify(studentCourseRegistrationRepository, times(1))
                .existsByStudentAndCourseAndSemester(eq(student), eq(course1), eq(semester));
    }

    @Test
    void getExamRegistrationStatus_ShouldReturnAllRegisteredCourses_WhenCourseIdsNotProvided() {
        UUID studentId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();
        Student student = Student.builder().build();
        Semester semester = Semester.builder().build();
        StudentSemesterEnrollment enrollment = StudentSemesterEnrollment.builder().semester(semester).build();
        Course course = new Course();
        course.setId(courseId);
        course.setCode("CS101");
        course.setTitle("Intro to CS");
        StudentCourseRegistration registration = StudentCourseRegistration.builder()
                .student(student)
                .course(course)
                .semester(semester)
                .examRegistered(true)
                .build();

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(studentSemesterEnrollmentRepository.findByStudentAndActiveTrue(student)).thenReturn(Optional.of(enrollment));
        when(studentCourseRegistrationRepository.findByStudentAndSemester(student, semester))
                .thenReturn(List.of(registration));

        List<StudentExamRegistrationStatusResponse> result =
                studentCourseService.getExamRegistrationStatus(studentId, null);

        assertEquals(1, result.size());
        assertEquals(courseId, result.getFirst().courseId());
        assertEquals("CS101", result.getFirst().courseCode());
        assertEquals("Intro to CS", result.getFirst().courseTitle());
        assertEquals(true, result.getFirst().courseRegistered());
        assertEquals(true, result.getFirst().examRegistered());
    }

    @Test
    void getExamRegistrationStatus_ShouldReturnRequestedCourseStatuses_WhenCourseIdsProvided() {
        UUID studentId = UUID.randomUUID();
        UUID registeredCourseId = UUID.randomUUID();
        UUID notRegisteredCourseId = UUID.randomUUID();
        Student student = Student.builder().build();
        Semester semester = Semester.builder().build();
        StudentSemesterEnrollment enrollment = StudentSemesterEnrollment.builder().semester(semester).build();
        Course course = new Course();
        course.setId(registeredCourseId);
        course.setCode("CS201");
        course.setTitle("Data Structures");
        StudentCourseRegistration registration = StudentCourseRegistration.builder()
                .student(student)
                .course(course)
                .semester(semester)
                .examRegistered(false)
                .build();

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(studentSemesterEnrollmentRepository.findByStudentAndActiveTrue(student)).thenReturn(Optional.of(enrollment));
        when(studentCourseRegistrationRepository.findByStudentAndSemester(student, semester))
                .thenReturn(List.of(registration));

        List<StudentExamRegistrationStatusResponse> result =
                studentCourseService.getExamRegistrationStatus(studentId, List.of(registeredCourseId, notRegisteredCourseId));

        assertEquals(2, result.size());
        assertEquals(registeredCourseId, result.get(0).courseId());
        assertEquals(true, result.get(0).courseRegistered());
        assertEquals(false, result.get(0).examRegistered());
        assertEquals(notRegisteredCourseId, result.get(1).courseId());
        assertEquals(false, result.get(1).courseRegistered());
        assertEquals(false, result.get(1).examRegistered());
    }
}
