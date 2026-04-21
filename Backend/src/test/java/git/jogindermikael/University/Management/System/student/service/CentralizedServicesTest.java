package git.jogindermikael.University.Management.System.student.service;

import git.jogindermikael.University.Management.System.academicYear.entity.AcademicYear;
import git.jogindermikael.University.Management.System.academicYear.repository.AcademicYearRepository;
import git.jogindermikael.University.Management.System.semester.entity.Semester;
import git.jogindermikael.University.Management.System.semester.repository.SemesterRepository;
import git.jogindermikael.University.Management.System.student.entity.Student;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CentralizedServicesTest {

    @Mock
    private SemesterRepository semesterRepository;

    @Mock
    private AcademicYearRepository academicYearRepository;

    @InjectMocks
    private CentralizedServices centralizedServices;

    @Test
    void calculateGrade_returnsA() {
        assertEquals("A", centralizedServices.calculateGrade(90));
    }

    @Test
    void calculateGrade_returnsB() {
        assertEquals("B", centralizedServices.calculateGrade(65));
    }

    @Test
    void calculateGrade_returnsC() {
        assertEquals("C", centralizedServices.calculateGrade(55));
    }

    @Test
    void calculateGrade_returnsD() {
        assertEquals("D", centralizedServices.calculateGrade(40));
    }

    @Test
    void calculateGrade_returnsF() {
        assertEquals("F", centralizedServices.calculateGrade(10));
    }

    @Test
    void studentPromotionIfNeeded_firstEnrollment_setsSemesterAndYear() {
        AcademicYear currentYear = AcademicYear.builder().name("2024/2025").active(true).build();
        Semester activeSemester = Semester.builder().number(1).academicYear(currentYear).build();
        Student student = new Student();

        centralizedServices.studentPromotionIfNeeded(student, activeSemester);

        assertSame(activeSemester, student.getSemester());
        assertSame(currentYear, student.getAcademicYear());
        assertEquals(1, student.getSemesterNumber());
        verify(semesterRepository, never()).findByAcademicYearAndNumber(currentYear, 2);
        verify(academicYearRepository, never()).findByActiveTrue();
    }

    @Test
    void studentPromotionIfNeeded_semesterOne_movesToSemesterTwo() {
        AcademicYear currentYear = AcademicYear.builder().name("2024/2025").active(true).build();
        Semester semesterTwo = Semester.builder().number(2).academicYear(currentYear).build();
        Student student = new Student();
        student.setAcademicYear(currentYear);
        student.setSemester(Semester.builder().number(1).academicYear(currentYear).build());
        student.setSemesterNumber(1);

        when(semesterRepository.findByAcademicYearAndNumber(currentYear, 2)).thenReturn(Optional.of(semesterTwo));

        centralizedServices.studentPromotionIfNeeded(student, Semester.builder().number(1).academicYear(currentYear).build());

        assertEquals(2, student.getSemesterNumber());
        assertSame(semesterTwo, student.getSemester());
        assertSame(currentYear, student.getAcademicYear());
    }

    @Test
    void studentPromotionIfNeeded_semesterOne_sameAcademicYearSecondSemester_doesNotIncrementYearOfStudy() {
        AcademicYear currentYear = AcademicYear.builder().name("2026/2027").active(true).build();
        Semester semesterTwo = Semester.builder().number(2).academicYear(currentYear).build();
        Student student = new Student();
        student.setAcademicYear(currentYear);
        student.setSemester(Semester.builder().number(1).academicYear(currentYear).build());
        student.setSemesterNumber(1);
        student.setYearOfStudy(1);

        when(semesterRepository.findByAcademicYearAndNumber(currentYear, 2)).thenReturn(Optional.of(semesterTwo));

        centralizedServices.studentPromotionIfNeeded(student, semesterTwo);

        assertEquals(1, student.getYearOfStudy());
        assertEquals(2, student.getSemesterNumber());
        assertSame(currentYear, student.getAcademicYear());
        assertSame(semesterTwo, student.getSemester());
        verify(academicYearRepository, never()).findByActiveTrue();
    }

    @Test
    void studentPromotionIfNeeded_semesterTwo_promotesToNextYear() {
        AcademicYear currentYear = AcademicYear.builder().name("2024/2025").active(true).build();
        AcademicYear nextYear = AcademicYear.builder().name("2025/2026").active(true).build();
        Semester nextSemester = Semester.builder().number(1).academicYear(nextYear).build();
        Student student = new Student();
        student.setAcademicYear(currentYear);
        student.setSemester(Semester.builder().number(2).academicYear(currentYear).build());
        student.setSemesterNumber(2);
        student.setYearOfStudy(1);

        when(academicYearRepository.findByActiveTrue()).thenReturn(Optional.of(nextYear));
        when(semesterRepository.findByAcademicYearAndNumber(nextYear, 1)).thenReturn(Optional.of(nextSemester));

        centralizedServices.studentPromotionIfNeeded(student, Semester.builder().number(2).academicYear(currentYear).build());

        assertEquals(2, student.getYearOfStudy());
        assertSame(nextYear, student.getAcademicYear());
        assertEquals(1, student.getSemesterNumber());
        assertSame(nextSemester, student.getSemester());
    }

    @Test
    void studentPromotionIfNeeded_semesterTwo_toNextAcademicYearFirstSemester_incrementsYearOfStudy() {
        AcademicYear currentYear = AcademicYear.builder().name("2026/2027").active(false).build();
        AcademicYear nextYear = AcademicYear.builder().name("2027/2028").active(true).build();
        Semester nextSemester = Semester.builder().number(1).academicYear(nextYear).build();
        Student student = new Student();
        student.setAcademicYear(currentYear);
        student.setSemester(Semester.builder().number(2).academicYear(currentYear).build());
        student.setSemesterNumber(2);
        student.setYearOfStudy(1);

        when(academicYearRepository.findByActiveTrue()).thenReturn(Optional.of(nextYear));
        when(semesterRepository.findByAcademicYearAndNumber(nextYear, 1)).thenReturn(Optional.of(nextSemester));

        centralizedServices.studentPromotionIfNeeded(student, nextSemester);

        assertEquals(2, student.getYearOfStudy());
        assertEquals(1, student.getSemesterNumber());
        assertSame(nextYear, student.getAcademicYear());
        assertSame(nextSemester, student.getSemester());
    }

    @Test
    void studentPromotionIfNeeded_semesterTwo_withoutNextYear_throws() {
        AcademicYear currentYear = AcademicYear.builder().name("2024/2025").active(true).build();
        Student student = new Student();
        student.setAcademicYear(currentYear);
        student.setSemester(Semester.builder().number(2).academicYear(currentYear).build());
        student.setSemesterNumber(2);
        student.setYearOfStudy(1);

        when(academicYearRepository.findByActiveTrue()).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class,
                () -> centralizedServices.studentPromotionIfNeeded(student,
                        Semester.builder().number(2).academicYear(currentYear).build()));

        verifyNoInteractions(semesterRepository);
    }
}
