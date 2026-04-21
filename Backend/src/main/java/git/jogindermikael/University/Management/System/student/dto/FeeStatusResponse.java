package git.jogindermikael.University.Management.System.student.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record FeeStatusResponse(
        UUID studentId,
        String registrationNumber,
        String studentName,
        UUID programId,
        String programName,
        UUID semesterId,
        UUID academicYearId,
        BigDecimal requiredAmount,
        BigDecimal amountPaid,
        BigDecimal balance,
        boolean cleared
) {
}
