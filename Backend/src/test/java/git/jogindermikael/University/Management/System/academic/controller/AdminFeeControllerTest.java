package git.jogindermikael.University.Management.System.academic.controller;

import git.jogindermikael.University.Management.System.student.dto.FeePaymentRequest;
import git.jogindermikael.University.Management.System.student.dto.FeeStatusResponse;
import git.jogindermikael.University.Management.System.student.dto.SetProgramFeeRequest;
import git.jogindermikael.University.Management.System.student.service.StudentFeePaymentService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminFeeControllerTest {

    @Mock
    private StudentFeePaymentService feePaymentService;

    @InjectMocks
    private AdminFeeController adminFeeController;

    @Test
    void setProgramSemesterFee_returnsCreated() {
        SetProgramFeeRequest request = new SetProgramFeeRequest(
                UUID.randomUUID(),
                UUID.randomUUID(),
                UUID.randomUUID(),
                BigDecimal.valueOf(1200)
        );

        ResponseEntity<Void> response = adminFeeController.setProgramSemesterFee(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(feePaymentService).setProgramFee(request);
    }

    @Test
    void recordPayment_returnsOk() {
        FeePaymentRequest request = new FeePaymentRequest(UUID.randomUUID(), UUID.randomUUID(), BigDecimal.valueOf(500));
        FeeStatusResponse status = sampleStatus();
        when(feePaymentService.payFees(request)).thenReturn(status);

        ResponseEntity<FeeStatusResponse> response = adminFeeController.recordPayment(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(status, response.getBody());
        verify(feePaymentService).payFees(request);
    }

    @Test
    void getFeeStatus_returnsOk() {
        UUID studentId = UUID.randomUUID();
        UUID semesterId = UUID.randomUUID();
        FeeStatusResponse status = sampleStatus();
        when(feePaymentService.getFeeStatus(studentId, semesterId)).thenReturn(status);

        ResponseEntity<FeeStatusResponse> response = adminFeeController.getFeeStatus(studentId, semesterId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(status, response.getBody());
        verify(feePaymentService).getFeeStatus(studentId, semesterId);
    }

    @Test
    void getAllFeePayments_returnsOk() {
        FeeStatusResponse status = sampleStatus();
        when(feePaymentService.getAllFeeStatuses()).thenReturn(List.of(status));

        ResponseEntity<List<FeeStatusResponse>> response = adminFeeController.getAllFeePayments();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody() == null ? 0 : response.getBody().size());
        verify(feePaymentService).getAllFeeStatuses();
    }

    @Test
    void clearFees_returnsOk() {
        UUID studentId = UUID.randomUUID();
        UUID semesterId = UUID.randomUUID();

        ResponseEntity<Void> response = adminFeeController.clearFees(studentId, semesterId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(feePaymentService).clearFees(studentId, semesterId);
    }

    private FeeStatusResponse sampleStatus() {
        return new FeeStatusResponse(
                UUID.randomUUID(),
                "REG-001",
                "Jane Doe",
                UUID.randomUUID(),
                "Computer Science",
                UUID.randomUUID(),
                UUID.randomUUID(),
                BigDecimal.valueOf(1200),
                BigDecimal.valueOf(500),
                BigDecimal.valueOf(700),
                false
        );
    }
}
