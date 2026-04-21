package git.jogindermikael.University.Management.System.academic.controller;

import git.jogindermikael.University.Management.System.enrollment.controller.EnrollmentController;
import git.jogindermikael.University.Management.System.enrollment.dtos.CancelEnrollmentRequest;
import git.jogindermikael.University.Management.System.enrollment.dtos.EnrollStudentRequest;
import git.jogindermikael.University.Management.System.enrollment.dtos.EnrollmentResponse;
import git.jogindermikael.University.Management.System.enrollment.dtos.EnrollStudentResponse;
import git.jogindermikael.University.Management.System.enrollment.dtos.UpdateEnrollmentStatusRequest;
import git.jogindermikael.University.Management.System.enrollment.entity.EnrollmentStatus;
import git.jogindermikael.University.Management.System.enrollment.service.EnrollmentService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EnrollmentControllerTest {

    @Mock
    private EnrollmentService enrollmentService;

    @InjectMocks
    private EnrollmentController enrollmentController;

    @Test
    void createEnrollment_returnsOk() {
        EnrollStudentRequest request = new EnrollStudentRequest(
                "John",
                "Doe",
                "john.doe@example.com",
                "NIN12345",
                "Central High",
                "A",
                UUID.randomUUID(),
                UUID.randomUUID()
        );

        EnrollStudentResponse response = new EnrollStudentResponse(
                UUID.randomUUID(),
                "REG-001",
                "John Doe",
                "john.doe@example.com",
                "TempPass123",
                "Computer Science",
                "Engineering"
        );

        when(enrollmentService.enrollStudent(request)).thenReturn(response);

        ResponseEntity<EnrollStudentResponse> result = enrollmentController.createEnrollment(request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(enrollmentService).enrollStudent(request);
    }

    @Test
    void cancelEnrollment_returnsOk() {
        UUID enrollmentId = UUID.randomUUID();
        CancelEnrollmentRequest request = new CancelEnrollmentRequest("Left university");
        EnrollmentResponse response = new EnrollmentResponse(
                enrollmentId,
                UUID.randomUUID(),
                "John Doe",
                "REG-001",
                "john.doe@example.com",
                "Computer Science",
                "Engineering",
                2026,
                EnrollmentStatus.CANCELLED,
                Instant.now(),
                "Left university"
        );

        when(enrollmentService.cancelEnrollment(enrollmentId, request)).thenReturn(response);

        ResponseEntity<EnrollmentResponse> result = enrollmentController.cancelEnrollment(enrollmentId, request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(enrollmentService).cancelEnrollment(enrollmentId, request);
    }

    @Test
    void getAllEnrollments_returnsOk() {
        EnrollmentResponse response = new EnrollmentResponse(
                UUID.randomUUID(),
                UUID.randomUUID(),
                "John Doe",
                "REG-001",
                "john.doe@example.com",
                "Computer Science",
                "Engineering",
                2026,
                EnrollmentStatus.ENROLLED,
                null,
                null
        );

        when(enrollmentService.getAllEnrollments()).thenReturn(List.of(response));

        ResponseEntity<List<EnrollmentResponse>> result = enrollmentController.getAllEnrollments();

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assert result.getBody() != null;
        assertEquals(1, result.getBody().size());
        verify(enrollmentService).getAllEnrollments();
    }

    @Test
    void updateEnrollmentStatus_returnsOk() {
        UUID enrollmentId = UUID.randomUUID();
        UpdateEnrollmentStatusRequest request = new UpdateEnrollmentStatusRequest(EnrollmentStatus.SUSPENDED);
        EnrollmentResponse response = new EnrollmentResponse(
                enrollmentId,
                UUID.randomUUID(),
                "John Doe",
                "REG-001",
                "john.doe@example.com",
                "Computer Science",
                "Engineering",
                2026,
                EnrollmentStatus.SUSPENDED,
                null,
                null
        );

        when(enrollmentService.updateEnrollmentStatus(enrollmentId, request)).thenReturn(response);

        ResponseEntity<EnrollmentResponse> result = enrollmentController.updateEnrollmentStatus(enrollmentId, request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(enrollmentService).updateEnrollmentStatus(enrollmentId, request);
    }
}
