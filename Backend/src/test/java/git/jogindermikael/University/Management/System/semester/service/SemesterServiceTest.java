package git.jogindermikael.University.Management.System.semester.service;

import git.jogindermikael.University.Management.System.academicYear.entity.AcademicYear;
import git.jogindermikael.University.Management.System.academicYear.repository.AcademicYearRepository;
import git.jogindermikael.University.Management.System.semester.dto.CreateSemesterRequest;
import git.jogindermikael.University.Management.System.semester.dto.SemesterResponse;
import git.jogindermikael.University.Management.System.semester.entity.Semester;
import git.jogindermikael.University.Management.System.semester.repository.SemesterRepository;
import git.jogindermikael.University.Management.System.student.service.StudentFeePaymentService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SemesterServiceTest {

    @Mock
    private SemesterRepository semesterRepository;
    @Mock
    private AcademicYearRepository academicYearRepository;
    @Mock
    private StudentFeePaymentService studentFeePaymentService;

    @InjectMocks
    private SemesterService semesterService;

    @Test
    void createSemester_ShouldCreate_WhenValid() {
        UUID academicYearId = UUID.randomUUID();
        CreateSemesterRequest request = new CreateSemesterRequest(1);
        AcademicYear academicYear = AcademicYear.builder().build();
        academicYear.setId(academicYearId);
        Semester semester = Semester.builder()
                .academicYear(academicYear)
                .number(1)
                .name("Semester 1")
                .active(false)
                .build();

        when(academicYearRepository.findById(academicYearId)).thenReturn(Optional.of(academicYear));
        when(semesterRepository.findByAcademicYearAndNumber(academicYear, 1)).thenReturn(Optional.empty());
        when(semesterRepository.save(any(Semester.class))).thenReturn(semester);

        SemesterResponse response = semesterService.createSemester(academicYearId, request);

        assertNotNull(response);
        assertEquals(1, response.number());
        assertEquals("Semester 1", response.name());
    }

    @Test
    void createSemester_ShouldThrowException_WhenAlreadyExists() {
        UUID academicYearId = UUID.randomUUID();
        CreateSemesterRequest request = new CreateSemesterRequest(1);
        AcademicYear academicYear = AcademicYear.builder().build();
        Semester existingSemester = Semester.builder().build();

        when(academicYearRepository.findById(academicYearId)).thenReturn(Optional.of(academicYear));
        when(semesterRepository.findByAcademicYearAndNumber(academicYear, 1)).thenReturn(Optional.of(existingSemester));

        assertThrows(ResponseStatusException.class, () -> semesterService.createSemester(academicYearId, request));
    }

    @Test
    void getByAcademicYear_ShouldReturnSemesters() {
        UUID academicYearId = UUID.randomUUID();
        Semester semester = Semester.builder().number(1).name("Semester 1").build();

        when(semesterRepository.findByAcademicYear_Id(academicYearId)).thenReturn(List.of(semester));

        List<SemesterResponse> responses = semesterService.getByAcademicYear(academicYearId);

        assertEquals(1, responses.size());
        assertEquals("Semester 1", responses.getFirst().name());
    }

    @Test
    void activateSemester_ShouldActivate_WhenFound() {
        UUID semesterId = UUID.randomUUID();
        UUID academicYearId = UUID.randomUUID();
        AcademicYear academicYear = AcademicYear.builder().build();
        academicYear.setId(academicYearId);
        Semester semester = Semester.builder().academicYear(academicYear).active(false).build();
        semester.setId(semesterId);
        Semester otherSemester = Semester.builder().academicYear(academicYear).active(true).build();
        otherSemester.setId(UUID.randomUUID());

        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));
        when(academicYearRepository.findAllByActiveTrue()).thenReturn(List.of(academicYear));
        when(semesterRepository.findByActiveTrueOrderByUpdatedAtDescCreatedAtDesc()).thenReturn(List.of(otherSemester));

        semesterService.activateSemester(semesterId);

        assertTrue(semester.isActive());
        assertFalse(otherSemester.isActive());
        verify(studentFeePaymentService).carryForwardPositiveBalances(otherSemester, semester);
    }

    @Test
    void activateSemester_ShouldNotCarryForward_WhenNoOtherSemesterWasActive() {
        UUID semesterId = UUID.randomUUID();
        UUID academicYearId = UUID.randomUUID();

        AcademicYear academicYear = AcademicYear.builder().build();
        academicYear.setId(academicYearId);

        Semester semester = Semester.builder().academicYear(academicYear).active(false).build();
        semester.setId(semesterId);

        Semester otherSemester = Semester.builder().academicYear(academicYear).active(false).build();
        otherSemester.setId(UUID.randomUUID());

        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));
        when(academicYearRepository.findAllByActiveTrue()).thenReturn(List.of(academicYear));
        when(semesterRepository.findByActiveTrueOrderByUpdatedAtDescCreatedAtDesc()).thenReturn(List.of());

        semesterService.activateSemester(semesterId);

        assertTrue(semester.isActive());
        assertFalse(otherSemester.isActive());
        verify(studentFeePaymentService, never()).carryForwardPositiveBalances(any(), any());
    }

    @Test
    void activateSemester_ShouldActivateItsAcademicYearAndDeactivateOtherActiveYears() {
        UUID semesterId = UUID.randomUUID();
        AcademicYear targetYear = AcademicYear.builder().active(false).build();
        targetYear.setId(UUID.randomUUID());
        AcademicYear otherActiveYear = AcademicYear.builder().active(true).build();
        otherActiveYear.setId(UUID.randomUUID());

        Semester semester = Semester.builder().academicYear(targetYear).active(false).build();
        semester.setId(semesterId);

        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));
        when(academicYearRepository.findAllByActiveTrue()).thenReturn(List.of(otherActiveYear));
        when(semesterRepository.findByActiveTrueOrderByUpdatedAtDescCreatedAtDesc()).thenReturn(List.of());

        semesterService.activateSemester(semesterId);

        assertTrue(targetYear.isActive());
        assertFalse(otherActiveYear.isActive());
    }
}
