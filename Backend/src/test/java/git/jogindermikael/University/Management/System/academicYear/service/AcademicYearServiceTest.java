package git.jogindermikael.University.Management.System.academicYear.service;

import git.jogindermikael.University.Management.System.academicYear.dto.AcademicYearRequest;
import git.jogindermikael.University.Management.System.academicYear.entity.AcademicYear;
import git.jogindermikael.University.Management.System.academicYear.repository.AcademicYearRepository;
import git.jogindermikael.University.Management.System.semester.repository.SemesterRepository;
import git.jogindermikael.University.Management.System.semester.entity.Semester;
import org.junit.jupiter.api.BeforeEach;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AcademicYearServiceTest {

    @Mock
    private AcademicYearRepository repository;
    @Mock
    private SemesterRepository semesterRepository;

    @InjectMocks
    private AcademicYearService service;

    private AcademicYear existingActive;
    private AcademicYear newYear;
    private UUID newId;

    @BeforeEach
    void setUp() {
        newId = UUID.randomUUID();
        existingActive = AcademicYear.builder()
                .name("2023/2024")
                .active(true)
                .build();
        existingActive.setId(UUID.randomUUID());

        newYear = AcademicYear.builder()
                .name("2024/2025")
                .active(false)
                .build();
        newYear.setId(newId);
    }

    @Test
    void addAcademicYear_success() {
        AcademicYearRequest req = new AcademicYearRequest("2024/2025");
        when(repository.existsByName("2024/2025")).thenReturn(false);
        when(repository.save(any(AcademicYear.class))).thenReturn(newYear);

        var res = service.addAcademicYear(req);

        assertNotNull(res);
        assertEquals("2024/2025", res.name());
        assertFalse(res.active());
        verify(repository, times(1)).save(any(AcademicYear.class));
    }

    @Test
    void addAcademicYear_duplicateName_throws() {
        AcademicYearRequest req = new AcademicYearRequest("2023/2024");
        when(repository.existsByName("2023/2024")).thenReturn(true);
        assertThrows(ResponseStatusException.class, () -> service.addAcademicYear(req));
        verify(repository, never()).save(any());
    }

    @Test
    void listAcademicYears_returnsList() {
        when(repository.findAll()).thenReturn(List.of(existingActive, newYear));
        var res = service.listAcademicYears();
        assertNotNull(res);
        assertEquals(2, res.size());
    }

    @Test
    void activate_success_with_existing_active() {
        when(repository.findById(newId)).thenReturn(Optional.of(newYear));
        when(repository.findAllByActiveTrue()).thenReturn(List.of(existingActive));
        when(semesterRepository.findByActiveTrueOrderByUpdatedAtDescCreatedAtDesc()).thenReturn(List.of());

        service.activate(newId);

        assertFalse(existingActive.isActive());
        assertTrue(newYear.isActive());
        verify(repository).saveAll(anyList());
        verify(semesterRepository).saveAll(anyList());
        verify(repository).save(newYear);
    }

    @Test
    void activate_notFound_throws() {
        UUID random = UUID.randomUUID();
        when(repository.findById(random)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> service.activate(random));
    }

    @Test
    void activate_success_when_multiple_active_years_only_target_remains_active() {
        UUID targetId = UUID.randomUUID();
        AcademicYear target = AcademicYear.builder().name("2025/2026").active(false).build();
        target.setId(targetId);

        AcademicYear activeOne = AcademicYear.builder().name("2023/2024").active(true).build();
        activeOne.setId(UUID.randomUUID());
        AcademicYear activeTwo = AcademicYear.builder().name("2024/2025").active(true).build();
        activeTwo.setId(UUID.randomUUID());

        when(repository.findById(targetId)).thenReturn(Optional.of(target));
        when(repository.findAllByActiveTrue()).thenReturn(List.of(activeOne, activeTwo));
        when(semesterRepository.findByActiveTrueOrderByUpdatedAtDescCreatedAtDesc()).thenReturn(List.of());

        service.activate(targetId);

        assertFalse(activeOne.isActive());
        assertFalse(activeTwo.isActive());
        assertTrue(target.isActive());
        verify(repository).saveAll(anyList());
        verify(semesterRepository).saveAll(anyList());
        verify(repository).save(target);
    }

    @Test
    void activate_shouldDeactivateActiveSemestersFromOtherAcademicYears() {
        UUID targetId = UUID.randomUUID();
        AcademicYear target = AcademicYear.builder().name("2025/2026").active(false).build();
        target.setId(targetId);

        AcademicYear otherYear = AcademicYear.builder().name("2024/2025").active(true).build();
        otherYear.setId(UUID.randomUUID());

        Semester otherYearSemester = Semester.builder().academicYear(otherYear).active(true).number(2).build();
        otherYearSemester.setId(UUID.randomUUID());

        when(repository.findById(targetId)).thenReturn(Optional.of(target));
        when(repository.findAllByActiveTrue()).thenReturn(List.of(otherYear));
        when(semesterRepository.findByActiveTrueOrderByUpdatedAtDescCreatedAtDesc()).thenReturn(List.of(otherYearSemester));

        service.activate(targetId);

        assertFalse(otherYearSemester.isActive());
        verify(semesterRepository).saveAll(anyList());
    }
}
