package git.jogindermikael.University.Management.System.student.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.util.UUID;

@Schema(name = "ProgramFeeRecordResponse", description = "Configured payable fee for a program in a specific semester and academic year")
public record ProgramFeeRecordResponse(
        @Schema(description = "Program identifier", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
        UUID programId,

        @Schema(description = "Program name", example = "Bachelor of Computer Science")
        String programName,

        @Schema(description = "Semester identifier", example = "f9ff6481-d9a4-4d8d-b456-77cb85ba6ddd")
        UUID semesterId,

        @Schema(description = "Semester number", example = "1")
        int semesterNumber,

        @Schema(description = "Semester name", example = "Semester 1")
        String semesterName,

        @Schema(description = "Academic year identifier", example = "d385f9e0-ef9c-40f8-a89a-c2199bc2162f")
        UUID academicYearId,

        @Schema(description = "Academic year name", example = "2025/2026")
        String academicYearName,

        @Schema(description = "Fee amount payable", example = "120000.00")
        BigDecimal amount
) {
}
