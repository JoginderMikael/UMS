package git.jogindermikael.University.Management.System.student.service;

import git.jogindermikael.University.Management.System.academicYear.entity.AcademicYear;
import git.jogindermikael.University.Management.System.semester.entity.Semester;
import git.jogindermikael.University.Management.System.semester.repository.SemesterRepository;
import git.jogindermikael.University.Management.System.student.entity.Student;
import git.jogindermikael.University.Management.System.student.entity.StudentSemesterEnrollment;
import git.jogindermikael.University.Management.System.student.repositories.StudentRepository;
import git.jogindermikael.University.Management.System.student.repositories.StudentSemesterEnrollmentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentSemesterServiceTest {

    @Mock
    private StudentSemesterEnrollmentRepository studentSemesterEnrollmentRepository;
    @Mock
    private SemesterRepository semesterRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private CentralizedServices centralizedServices;

    @InjectMocks
    private StudentSemesterService studentSemesterService;

    @Test
    void enrollToSemester_ShouldEnrollStudent_WhenValid() {
        UUID studentId = UUID.randomUUID();
        Student student = Student.builder().yearOfStudy(1).build();
        AcademicYear academicYear = AcademicYear.builder().build();
        Semester semester = Semester.builder().academicYear(academicYear).number(1).build();
        semester.setId(UUID.randomUUID());

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(semesterRepository.findByActiveTrueOrderByUpdatedAtDescCreatedAtDesc()).thenReturn(List.of(semester));
        when(studentSemesterEnrollmentRepository.findByStudentAndActiveTrueOrderByCreatedAtDesc(student)).thenReturn(List.of());
        when(studentSemesterEnrollmentRepository.existsByStudentAndSemester(student, semester)).thenReturn(false);

        studentSemesterService.enrollToSemester(studentId);

        verify(centralizedServices).studentPromotionIfNeeded(student, semester);
        verify(studentRepository).save(student);
        verify(studentSemesterEnrollmentRepository).save(any(StudentSemesterEnrollment.class));
    }

    @Test
    void enrollToSemester_ShouldThrowException_WhenStudentNotFound() {
        UUID studentId = UUID.randomUUID();
        when(studentRepository.findById(studentId)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> studentSemesterService.enrollToSemester(studentId));
    }

    @Test
    void enrollToSemester_ShouldThrowException_WhenNoActiveSemester() {
        UUID studentId = UUID.randomUUID();
        Student student = Student.builder().build();

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(semesterRepository.findByActiveTrueOrderByUpdatedAtDescCreatedAtDesc()).thenReturn(List.of());

        assertThrows(ResponseStatusException.class, () -> studentSemesterService.enrollToSemester(studentId));
    }

    @Test
    void enrollToSemester_ShouldThrowException_WhenAlreadyEnrolled() {
        UUID studentId = UUID.randomUUID();
        UUID semesterId = UUID.randomUUID();
        Student student = Student.builder().build();
        Semester semester = Semester.builder().build();
        semester.setId(semesterId);
        StudentSemesterEnrollment existingEnrollment = StudentSemesterEnrollment.builder().semester(semester).build();

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(semesterRepository.findByActiveTrueOrderByUpdatedAtDescCreatedAtDesc()).thenReturn(List.of(semester));
        when(studentSemesterEnrollmentRepository.findByStudentAndActiveTrueOrderByCreatedAtDesc(student)).thenReturn(List.of(existingEnrollment));

        assertThrows(ResponseStatusException.class, () -> studentSemesterService.enrollToSemester(studentId));
    }

    @Test
    void enrollToSemester_ShouldUseLatestActiveSemester_WhenMultipleActiveSemestersExist() {
        UUID studentId = UUID.randomUUID();
        Student student = Student.builder().yearOfStudy(2).build();

        AcademicYear firstYear = AcademicYear.builder().name("2025/2026").build();
        Semester firstActive = Semester.builder().academicYear(firstYear).number(1).build();
        firstActive.setId(UUID.randomUUID());

        AcademicYear secondYear = AcademicYear.builder().name("2026/2027").build();
        Semester secondActive = Semester.builder().academicYear(secondYear).number(2).build();
        secondActive.setId(UUID.randomUUID());

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(semesterRepository.findByActiveTrueOrderByUpdatedAtDescCreatedAtDesc())
                .thenReturn(List.of(secondActive, firstActive));
        when(studentSemesterEnrollmentRepository.findByStudentAndActiveTrueOrderByCreatedAtDesc(student)).thenReturn(List.of());
        when(studentSemesterEnrollmentRepository.existsByStudentAndSemester(student, secondActive)).thenReturn(false);

        studentSemesterService.enrollToSemester(studentId);

        verify(centralizedServices).studentPromotionIfNeeded(student, secondActive);
        verify(studentSemesterEnrollmentRepository).save(any(StudentSemesterEnrollment.class));
    }

    @Test
    void enrollToSemester_ShouldDeactivatePreviousActiveEnrollment_WhenDifferentTargetSemester() {
        UUID studentId = UUID.randomUUID();
        Student student = Student.builder().yearOfStudy(2).build();

        AcademicYear year = AcademicYear.builder().name("2026/2027").build();
        Semester oldSemester = Semester.builder().academicYear(year).number(1).build();
        oldSemester.setId(UUID.randomUUID());
        Semester activeSemester = Semester.builder().academicYear(year).number(2).build();
        activeSemester.setId(UUID.randomUUID());

        StudentSemesterEnrollment previousActive = StudentSemesterEnrollment.builder()
                .student(student)
                .academicYear(year)
                .semester(oldSemester)
                .yearOfStudy(2)
                .semesterNumber(1)
                .active(true)
                .build();

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(semesterRepository.findByActiveTrueOrderByUpdatedAtDescCreatedAtDesc()).thenReturn(List.of(activeSemester));
        when(studentSemesterEnrollmentRepository.findByStudentAndActiveTrueOrderByCreatedAtDesc(student))
                .thenReturn(List.of(previousActive));
        when(studentSemesterEnrollmentRepository.existsByStudentAndSemester(student, activeSemester)).thenReturn(false);

        studentSemesterService.enrollToSemester(studentId);

        assertFalse(previousActive.isActive());
        verify(centralizedServices).studentPromotionIfNeeded(student, activeSemester);
        verify(studentSemesterEnrollmentRepository).save(any(StudentSemesterEnrollment.class));
    }

    @Test
    void enrollToSemester_ShouldThrowBadRequest_WhenHistoricalEnrollmentAlreadyExistsForTargetSemester() {
        UUID studentId = UUID.randomUUID();
        Student student = Student.builder().yearOfStudy(1).build();
        AcademicYear year = AcademicYear.builder().name("2026/2027").build();
        Semester activeSemester = Semester.builder().academicYear(year).number(2).build();
        activeSemester.setId(UUID.randomUUID());

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(semesterRepository.findByActiveTrueOrderByUpdatedAtDescCreatedAtDesc()).thenReturn(List.of(activeSemester));
        when(studentSemesterEnrollmentRepository.findByStudentAndActiveTrueOrderByCreatedAtDesc(student)).thenReturn(List.of());
        when(studentSemesterEnrollmentRepository.existsByStudentAndSemester(student, activeSemester)).thenReturn(true);

        assertThrows(ResponseStatusException.class, () -> studentSemesterService.enrollToSemester(studentId));

        verify(studentSemesterEnrollmentRepository, never()).save(any(StudentSemesterEnrollment.class));
    }

    @Test
    void enrollToSemester_ShouldPersistEnrollmentWithStudentProgressedValues() {
        UUID studentId = UUID.randomUUID();
        Student student = Student.builder().yearOfStudy(1).build();
        AcademicYear year = AcademicYear.builder().name("2026/2027").build();
        Semester activeSemester = Semester.builder().academicYear(year).number(2).build();
        activeSemester.setId(UUID.randomUUID());

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(semesterRepository.findByActiveTrueOrderByUpdatedAtDescCreatedAtDesc()).thenReturn(List.of(activeSemester));
        when(studentSemesterEnrollmentRepository.findByStudentAndActiveTrueOrderByCreatedAtDesc(student)).thenReturn(List.of());
        when(studentSemesterEnrollmentRepository.existsByStudentAndSemester(student, activeSemester)).thenReturn(false);
        doAnswer(invocation -> {
            student.setYearOfStudy(2);
            student.setSemesterNumber(2);
            student.setAcademicYear(year);
            student.setSemester(activeSemester);
            return null;
        }).when(centralizedServices).studentPromotionIfNeeded(student, activeSemester);

        studentSemesterService.enrollToSemester(studentId);

        ArgumentCaptor<StudentSemesterEnrollment> enrollmentCaptor = ArgumentCaptor.forClass(StudentSemesterEnrollment.class);
        verify(studentSemesterEnrollmentRepository).save(enrollmentCaptor.capture());
        StudentSemesterEnrollment savedEnrollment = enrollmentCaptor.getValue();

        assertEquals(2, savedEnrollment.getYearOfStudy());
        assertEquals(2, savedEnrollment.getSemesterNumber());
        assertEquals(year, savedEnrollment.getAcademicYear());
        assertEquals(activeSemester, savedEnrollment.getSemester());
        assertTrue(savedEnrollment.isActive());
    }
}
