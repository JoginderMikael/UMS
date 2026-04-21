package git.jogindermikael.University.Management.System.enrollment.service;

import git.jogindermikael.University.Management.System.academic.school.entity.School;
import git.jogindermikael.University.Management.System.academic.school.repository.SchoolRepository;
import git.jogindermikael.University.Management.System.academicYear.entity.AcademicYear;
import git.jogindermikael.University.Management.System.academicYear.repository.AcademicYearRepository;
import git.jogindermikael.University.Management.System.enrollment.dtos.EnrollStudentRequest;
import git.jogindermikael.University.Management.System.enrollment.dtos.EnrollStudentResponse;
import git.jogindermikael.University.Management.System.enrollment.dtos.UpdateEnrollmentStatusRequest;
import git.jogindermikael.University.Management.System.enrollment.dtos.CancelEnrollmentRequest;
import git.jogindermikael.University.Management.System.enrollment.entity.Enrollment;
import git.jogindermikael.University.Management.System.enrollment.entity.EnrollmentStatus;
import git.jogindermikael.University.Management.System.enrollment.repository.EnrollmentRepository;
import git.jogindermikael.University.Management.System.program.entity.Program;
import git.jogindermikael.University.Management.System.program.repository.ProgramRepository;
import git.jogindermikael.University.Management.System.semester.entity.Semester;
import git.jogindermikael.University.Management.System.semester.repository.SemesterRepository;
import git.jogindermikael.University.Management.System.student.entity.Student;
import git.jogindermikael.University.Management.System.student.repositories.StudentRepository;
import git.jogindermikael.University.Management.System.user.entity.User;
import git.jogindermikael.University.Management.System.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EnrollmentServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private EnrollmentRepository enrollmentRepository;
    @Mock
    private SchoolRepository schoolRepository;
    @Mock
    private ProgramRepository programRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private RegistrationNumberService registrationNumberService;
    @Mock
    private AcademicYearRepository academicYearRepository;
    @Mock
    private SemesterRepository semesterRepository;

    @InjectMocks
    private EnrollmentService enrollmentService;

    @Test
    void enrollStudent_ShouldEnroll_WhenValid() {
        UUID schoolId = UUID.randomUUID();
        UUID programId = UUID.randomUUID();
        EnrollStudentRequest request = new EnrollStudentRequest(
                "John", "Doe", "john@example.com", "123456",
                "High School", "A", schoolId, programId
        );

        School school = School.builder().code("SCH").name("School").build();
        school.setId(schoolId);
        Program program = new Program();
        program.setSchool(school);
        program.setCode("PRG");
        program.setName("Program");
        AcademicYear academicYear = AcademicYear.builder().build();
        academicYear.setId(UUID.randomUUID());
        Semester semester = Semester.builder().build();
        semester.setId(UUID.randomUUID());
        User user = User.builder().firstName("John").lastName("Doe").email("john@example.com").build();
        Student student = Student.builder().lastName("Doe").build();

        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(programRepository.findById(programId)).thenReturn(Optional.of(program));
        when(academicYearRepository.findByActiveTrue()).thenReturn(Optional.of(academicYear));
        when(semesterRepository.findByAcademicYearAndActiveTrue(academicYear)).thenReturn(Optional.of(semester));
        when(registrationNumberService.nextSerial()).thenReturn(1L);
        when(registrationNumberService.generateRegistrationNumber(any(), any(), any(), any(Integer.class))).thenReturn("REG123");
        when(passwordEncoder.encode("REG123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(studentRepository.save(any(Student.class))).thenReturn(student);

        EnrollStudentResponse response = enrollmentService.enrollStudent(request);

        assertEquals("REG123", response.registrationNumber());
        verify(enrollmentRepository).save(any(Enrollment.class));
    }

    @Test
    void enrollStudent_ShouldNormalizeEmail_ToTrimmedLowercase() {
        UUID schoolId = UUID.randomUUID();
        UUID programId = UUID.randomUUID();
        EnrollStudentRequest request = new EnrollStudentRequest(
                "John", "Doe", "  JOHN@EXAMPLE.COM  ", "123456",
                "High School", "A", schoolId, programId
        );

        School school = School.builder().code("SCH").name("School").build();
        school.setId(schoolId);
        Program program = new Program();
        program.setSchool(school);
        program.setCode("PRG");
        program.setName("Program");
        AcademicYear academicYear = AcademicYear.builder().build();
        academicYear.setId(UUID.randomUUID());
        Semester semester = Semester.builder().build();
        semester.setId(UUID.randomUUID());
        User user = User.builder().firstName("John").lastName("Doe").email("john@example.com").build();
        Student student = Student.builder().lastName("Doe").build();

        when(userRepository.existsByEmail(eq("john@example.com"))).thenReturn(false);
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(programRepository.findById(programId)).thenReturn(Optional.of(program));
        when(academicYearRepository.findByActiveTrue()).thenReturn(Optional.of(academicYear));
        when(semesterRepository.findByAcademicYearAndActiveTrue(academicYear)).thenReturn(Optional.of(semester));
        when(registrationNumberService.nextSerial()).thenReturn(1L);
        when(registrationNumberService.generateRegistrationNumber(any(), any(), any(), any(Integer.class))).thenReturn("REG123");
        when(passwordEncoder.encode("REG123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(studentRepository.save(any(Student.class))).thenReturn(student);

        EnrollStudentResponse response = enrollmentService.enrollStudent(request);

        assertNotNull(response);
        verify(userRepository).existsByEmail("john@example.com");
    }

    @Test
    void enrollStudent_ShouldThrowException_WhenEmailExists() {
        EnrollStudentRequest request = new EnrollStudentRequest(
                "John", "Doe", "john@example.com", "123456",
                "High School", "A", UUID.randomUUID(), UUID.randomUUID()
        );

        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

        ResponseStatusException exception =
                assertThrows(ResponseStatusException.class, () -> enrollmentService.enrollStudent(request));

        assertEquals(409, exception.getStatusCode().value());
        assertEquals("A user with that email already exists.", exception.getReason());
    }

    @Test
    void enrollStudent_ShouldUseActiveSemester_WhenAvailable() {
        UUID schoolId = UUID.randomUUID();
        UUID programId = UUID.randomUUID();
        EnrollStudentRequest request = new EnrollStudentRequest(
                "John", "Doe", "john@example.com", "123456",
                "High School", "A", schoolId, programId
        );

        School school = School.builder().code("SCH").name("School").build();
        school.setId(schoolId);
        Program program = new Program();
        program.setSchool(school);
        program.setCode("PRG");
        program.setName("Program");

        AcademicYear academicYear = AcademicYear.builder().build();
        academicYear.setId(UUID.randomUUID());

        Semester activeSemester = Semester.builder().name("Semester 2").number(2).active(true).build();
        activeSemester.setId(UUID.randomUUID());

        User user = User.builder().firstName("John").lastName("Doe").email("john@example.com").build();
        Student student = Student.builder().lastName("Doe").semester(activeSemester).build();

        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(programRepository.findById(programId)).thenReturn(Optional.of(program));
        when(academicYearRepository.findByActiveTrue()).thenReturn(Optional.of(academicYear));
        when(semesterRepository.findByAcademicYearAndActiveTrue(academicYear)).thenReturn(Optional.of(activeSemester));
        when(registrationNumberService.nextSerial()).thenReturn(1L);
        when(registrationNumberService.generateRegistrationNumber(any(), any(), any(), any(Integer.class))).thenReturn("REG123");
        when(passwordEncoder.encode("REG123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(studentRepository.save(any(Student.class))).thenReturn(student);

        EnrollStudentResponse response = enrollmentService.enrollStudent(request);

        assertEquals("REG123", response.registrationNumber());
        verify(semesterRepository).findByAcademicYearAndActiveTrue(academicYear);
        verify(semesterRepository, never()).findByAcademicYearAndNumber(academicYear, 1);
    }

    @Test
    void enrollStudent_ShouldThrowConflict_WhenNoActiveAcademicYearConfigured() {
        UUID schoolId = UUID.randomUUID();
        UUID programId = UUID.randomUUID();
        EnrollStudentRequest request = new EnrollStudentRequest(
                "John", "Doe", "john@example.com", "123456",
                "High School", "A", schoolId, programId
        );

        School school = School.builder().code("SCH").name("School").build();
        school.setId(schoolId);
        Program program = new Program();
        program.setSchool(school);
        program.setCode("PRG");
        program.setName("Program");

        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(programRepository.findById(programId)).thenReturn(Optional.of(program));
        when(academicYearRepository.findByActiveTrue()).thenReturn(Optional.empty());

        ResponseStatusException exception =
                assertThrows(ResponseStatusException.class, () -> enrollmentService.enrollStudent(request));

        assertEquals(409, exception.getStatusCode().value());
        assertEquals(
                "No active academic year is configured. Activate an academic year before enrolling students.",
                exception.getReason()
        );
    }

    @Test
    void enrollStudent_ShouldThrowConflict_WhenNoSemesterConfigured() {
        UUID schoolId = UUID.randomUUID();
        UUID programId = UUID.randomUUID();
        EnrollStudentRequest request = new EnrollStudentRequest(
                "John", "Doe", "john@example.com", "123456",
                "High School", "A", schoolId, programId
        );

        School school = School.builder().code("SCH").name("School").build();
        school.setId(schoolId);
        Program program = new Program();
        program.setSchool(school);
        program.setCode("PRG");
        program.setName("Program");
        AcademicYear academicYear = AcademicYear.builder().build();
        academicYear.setId(UUID.randomUUID());

        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(programRepository.findById(programId)).thenReturn(Optional.of(program));
        when(academicYearRepository.findByActiveTrue()).thenReturn(Optional.of(academicYear));
        when(semesterRepository.findByAcademicYearAndActiveTrue(academicYear)).thenReturn(Optional.empty());
        when(semesterRepository.findByAcademicYearAndNumber(academicYear, 1)).thenReturn(Optional.empty());

        ResponseStatusException exception =
                assertThrows(ResponseStatusException.class, () -> enrollmentService.enrollStudent(request));

        assertEquals(409, exception.getStatusCode().value());
        assertEquals(
                "No semester is configured for the active academic year. Create and activate a semester before enrolling students.",
                exception.getReason()
        );
    }

    @Test
    void cancelEnrollment_ShouldSetCancelledStatus() {
        UUID enrollmentId = UUID.randomUUID();
        Enrollment enrollment = enrollmentWithStudent(enrollmentId, EnrollmentStatus.ENROLLED);

        when(enrollmentRepository.findById(enrollmentId)).thenReturn(Optional.of(enrollment));
        when(enrollmentRepository.save(any(Enrollment.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = enrollmentService.cancelEnrollment(enrollmentId, new CancelEnrollmentRequest("Withdrawn"));

        assertEquals(EnrollmentStatus.CANCELLED, response.status());
        assertEquals("Withdrawn", response.cancellationReason());
    }

    @Test
    void getAllEnrollments_ShouldReturnMappedResponses() {
        Enrollment enrollment = enrollmentWithStudent(UUID.randomUUID(), EnrollmentStatus.ENROLLED);
        when(enrollmentRepository.findAll()).thenReturn(List.of(enrollment));

        var responses = enrollmentService.getAllEnrollments();

        assertEquals(1, responses.size());
        assertEquals(EnrollmentStatus.ENROLLED, responses.get(0).status());
        assertEquals("John Doe", responses.get(0).studentName());
    }

    @Test
    void updateEnrollmentStatus_ShouldUpdateStatus() {
        UUID enrollmentId = UUID.randomUUID();
        Enrollment enrollment = enrollmentWithStudent(enrollmentId, EnrollmentStatus.ENROLLED);
        when(enrollmentRepository.findById(enrollmentId)).thenReturn(Optional.of(enrollment));
        when(enrollmentRepository.save(any(Enrollment.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = enrollmentService.updateEnrollmentStatus(
                enrollmentId,
                new UpdateEnrollmentStatusRequest(EnrollmentStatus.SUSPENDED)
        );

        assertEquals(EnrollmentStatus.SUSPENDED, response.status());
    }

    private Enrollment enrollmentWithStudent(UUID enrollmentId, EnrollmentStatus status) {
        School school = School.builder().name("Engineering").code("ENG").build();
        Program program = new Program();
        program.setName("Computer Science");
        User user = User.builder().email("john@example.com").build();

        Student student = Student.builder()
                .firstName("John")
                .lastName("Doe")
                .registrationNumber("REG-001")
                .school(school)
                .program(program)
                .user(user)
                .build();
        student.setId(UUID.randomUUID());

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .enrollmentYear(2026)
                .status(status)
                .active(true)
                .build();
        enrollment.setId(enrollmentId);
        return enrollment;
    }
}
