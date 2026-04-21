package git.jogindermikael.University.Management.System.student.service;

import git.jogindermikael.University.Management.System.academicYear.entity.AcademicYear;
import git.jogindermikael.University.Management.System.academicYear.repository.AcademicYearRepository;
import git.jogindermikael.University.Management.System.semester.entity.Semester;
import git.jogindermikael.University.Management.System.semester.repository.SemesterRepository;
import git.jogindermikael.University.Management.System.student.entity.Student;
import git.jogindermikael.University.Management.System.student.entity.StudentCourseRegistration;
import git.jogindermikael.University.Management.System.student.repositories.StudentCourseRegistrationRepository;
import git.jogindermikael.University.Management.System.student.repositories.StudentRepository;
import git.jogindermikael.University.Management.System.student.entity.StudentSemesterEnrollment;
import git.jogindermikael.University.Management.System.student.repositories.StudentSemesterEnrollmentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExamRegistrationServiceTest {

    @Mock
    private StudentCourseRegistrationRepository courseRegistrationRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private StudentSemesterEnrollmentRepository studentSemesterEnrollmentRepository;
    @Mock
    private SemesterRepository semesterRepository;
    @Mock
    private AcademicYearRepository academicYearRepository;
    @Mock
    private StudentFeePaymentService feePaymentService;

    @InjectMocks
    private ExamRegistrationService examRegistrationService;

    @Test
    void registerForExam_ShouldRegister_WhenFeeCleared() {
        UUID studentId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();
        Student student = Student.builder().build();
        student.setId(studentId);
        AcademicYear activeYear = AcademicYear.builder().name("2025/2026").active(true).build();
        activeYear.setId(UUID.randomUUID());
        Semester semester = Semester.builder().academicYear(activeYear).active(true).build();
        semester.setId(UUID.randomUUID());
        StudentCourseRegistration registration = StudentCourseRegistration.builder()
                .examRegistered(false)
                .student(student)
                .semester(semester)
                .build();
        StudentSemesterEnrollment enrollment = StudentSemesterEnrollment.builder()
                .student(student)
                .academicYear(activeYear)
                .semester(semester)
                .active(true)
                .build();

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(academicYearRepository.findByActiveTrue()).thenReturn(Optional.of(activeYear));
        when(semesterRepository.findByActiveTrue()).thenReturn(Optional.of(semester));
        when(studentSemesterEnrollmentRepository.findByStudentAndActiveTrue(student)).thenReturn(Optional.of(enrollment));
        when(courseRegistrationRepository.findByStudentAndCourse_IdAndSemester(student, courseId, semester))
                .thenReturn(Optional.of(registration));
        when(feePaymentService.isFeesCleared(student, semester)).thenReturn(true);

        examRegistrationService.registerForExam(studentId, courseId);

        assertTrue(registration.isExamRegistered());
    }

    @Test
    void registerForExam_ShouldThrowException_WhenFeeNotCleared() {
        UUID studentId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();
        Student student = Student.builder().build();
        student.setId(studentId);
        AcademicYear activeYear = AcademicYear.builder().name("2025/2026").active(true).build();
        activeYear.setId(UUID.randomUUID());
        Semester semester = Semester.builder().academicYear(activeYear).active(true).build();
        semester.setId(UUID.randomUUID());
        StudentCourseRegistration registration = StudentCourseRegistration.builder()
                .examRegistered(false)
                .student(student)
                .semester(semester)
                .build();
        StudentSemesterEnrollment enrollment = StudentSemesterEnrollment.builder()
                .student(student)
                .academicYear(activeYear)
                .semester(semester)
                .active(true)
                .build();

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(academicYearRepository.findByActiveTrue()).thenReturn(Optional.of(activeYear));
        when(semesterRepository.findByActiveTrue()).thenReturn(Optional.of(semester));
        when(studentSemesterEnrollmentRepository.findByStudentAndActiveTrue(student)).thenReturn(Optional.of(enrollment));
        when(courseRegistrationRepository.findByStudentAndCourse_IdAndSemester(student, courseId, semester))
                .thenReturn(Optional.of(registration));
        when(feePaymentService.isFeesCleared(student, semester)).thenReturn(false);

        assertThrows(ResponseStatusException.class, () -> examRegistrationService.registerForExam(studentId, courseId));
    }
}
