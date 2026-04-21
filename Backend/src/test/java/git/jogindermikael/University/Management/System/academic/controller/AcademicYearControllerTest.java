package git.jogindermikael.University.Management.System.academic.controller;

import git.jogindermikael.University.Management.System.academicYear.controller.AcademicYearController;
import git.jogindermikael.University.Management.System.academicYear.dto.AcademicYearRequest;
import git.jogindermikael.University.Management.System.academicYear.dto.AcademicYearResponse;
import git.jogindermikael.University.Management.System.academicYear.service.AcademicYearService;
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
class AcademicYearControllerTest {

    @Mock
    private AcademicYearService academicYearService;

    @InjectMocks
    private AcademicYearController academicYearController;

    private UUID yearId;

    @BeforeEach
    void setUp() {
        yearId = UUID.randomUUID();
    }

    @Test
    void createAcademicYear_returnsCreated() {
        AcademicYearRequest request = new AcademicYearRequest("2025/2026");
        AcademicYearResponse response = new AcademicYearResponse(yearId, "2025/2026", false);

        when(academicYearService.addAcademicYear(request)).thenReturn(response);

        ResponseEntity<AcademicYearResponse> result = academicYearController.createAcademicYear(request);

        assertEquals(HttpStatus.CREATED, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(academicYearService).addAcademicYear(request);
    }

    @Test
    void getAllAcademicYears_returnsOk() {
        AcademicYearResponse response = new AcademicYearResponse(yearId, "2025/2026", false);

        when(academicYearService.listAcademicYears()).thenReturn(List.of(response));

        ResponseEntity<List<AcademicYearResponse>> result = academicYearController.getAllAcademicYears();

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(1, result.getBody().size());
        verify(academicYearService).listAcademicYears();
    }

    @Test
    void activateAcademicYear_returnsOk() {
        ResponseEntity<Void> result = academicYearController.activateAcademicYear(yearId);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertNull(result.getBody());
        verify(academicYearService).activate(yearId);
    }
}
