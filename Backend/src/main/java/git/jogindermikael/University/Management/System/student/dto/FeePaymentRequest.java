package git.jogindermikael.University.Management.System.student.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record FeePaymentRequest(
        @NotNull(message = "Student ID is required")
        UUID studentId,
        @NotNull(message = "Semester ID is required")
        UUID semesterId,
        @NotNull(message = "Payment amount is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Payment amount must be greater than zero")
        BigDecimal amount
) {
}
