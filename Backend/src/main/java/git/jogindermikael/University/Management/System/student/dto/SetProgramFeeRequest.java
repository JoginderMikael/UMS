package git.jogindermikael.University.Management.System.student.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record SetProgramFeeRequest(
        @NotNull(message = "Program ID is required")
        UUID programId,
        @NotNull(message = "Academic year ID is required")
        UUID academicYearId,
        @NotNull(message = "Semester ID is required")
        UUID semesterId,
        @NotNull(message = "Fee amount is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Fee amount must be greater than zero")
        BigDecimal amount
) {
}
