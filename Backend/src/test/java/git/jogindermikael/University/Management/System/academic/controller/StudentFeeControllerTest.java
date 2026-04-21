package git.jogindermikael.University.Management.System.academic.controller;

import git.jogindermikael.University.Management.System.student.controller.StudentFeeController;
import git.jogindermikael.University.Management.System.student.dto.FeePaymentRequest;
import git.jogindermikael.University.Management.System.student.dto.FeeStatusResponse;
import git.jogindermikael.University.Management.System.student.service.StudentFeePaymentService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudentFeeControllerTest {

    @Mock
    private StudentFeePaymentService feePaymentService;

    @InjectMocks
    private StudentFeeController studentFeeController;

    @Test
    void payFees_returnsUpdatedStatus() {
        UUID studentId = UUID.randomUUID();
        UUID semesterId = UUID.randomUUID();
        StudentFeeController.FeePaymentAmountRequest request =
                new StudentFeeController.FeePaymentAmountRequest(BigDecimal.valueOf(400));

        FeeStatusResponse response = new FeeStatusResponse(
                studentId, "REG-001", "Jane Doe", UUID.randomUUID(), "CS",
                semesterId, UUID.randomUUID(), BigDecimal.valueOf(1200),
                BigDecimal.valueOf(400), BigDecimal.valueOf(800), false
        );

        when(feePaymentService.payFees(new FeePaymentRequest(studentId, semesterId, BigDecimal.valueOf(400))))
                .thenReturn(response);

        ResponseEntity<FeeStatusResponse> result = studentFeeController.payFees(studentId, semesterId, request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(feePaymentService).payFees(new FeePaymentRequest(studentId, semesterId, BigDecimal.valueOf(400)));
    }
}
