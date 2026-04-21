package git.jogindermikael.University.Management.System.academic.controller;

import git.jogindermikael.University.Management.System.semester.controller.SemesterController;
import git.jogindermikael.University.Management.System.semester.dto.CreateSemesterRequest;
import git.jogindermikael.University.Management.System.semester.dto.SemesterResponse;
import git.jogindermikael.University.Management.System.semester.service.SemesterService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SemesterControllerTest {

    @Mock
    private SemesterService semesterService;

    @InjectMocks
    private SemesterController semesterController;

    private UUID yearId;
    private UUID semesterId;

    @BeforeEach
    void setUp() {
        yearId = UUID.randomUUID();
        semesterId = UUID.randomUUID();
    }

    @Test
    void createSemester_returnsCreated() {
        CreateSemesterRequest request = new CreateSemesterRequest(1);
        SemesterResponse response = new SemesterResponse(semesterId, "Semester 1", 1, false);

        when(semesterService.createSemester(yearId, request)).thenReturn(response);

        ResponseEntity<SemesterResponse> result = semesterController.createSemester(yearId, request);

        assertEquals(HttpStatus.CREATED, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(semesterService).createSemester(yearId, request);
    }

    @Test
    void getAllSemesters_returnsOk() {
        SemesterResponse response = new SemesterResponse(semesterId, "Semester 1", 1, false);

        when(semesterService.getByAcademicYear(yearId)).thenReturn(List.of(response));

        ResponseEntity<List<SemesterResponse>> result = semesterController.getAllSemesters(yearId);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assert result.getBody() != null;
        assertEquals(1, result.getBody().size());
        verify(semesterService).getByAcademicYear(yearId);
    }

    @Test
    void activateSemester_returnsOk() {
        ResponseEntity<Void> result = semesterController.activateSemester(semesterId);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertNull(result.getBody());
        verify(semesterService).activateSemester(semesterId);
    }
}
