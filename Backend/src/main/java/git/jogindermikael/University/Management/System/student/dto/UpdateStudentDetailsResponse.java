package git.jogindermikael.University.Management.System.student.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(name = "UpdateStudentDetailsResponse", description = "Updated student details returned after a successful update")
public record UpdateStudentDetailsResponse(
        @Schema(description = "Student identifier", example = "8f1712ac-7161-4c36-948e-40842eeb43f4")
        UUID studentId,

        @Schema(description = "User identifier linked to the student profile", example = "96e92996-f2eb-426e-9bde-b1c8bdb4b814")
        UUID userId,

        @Schema(description = "Student first name", example = "John")
        String firstName,

        @Schema(description = "Student last name", example = "Doe")
        String lastName,

        @Schema(description = "Student email", example = "john.doe@student.uni")
        String email,

        @Schema(description = "National ID number", example = "12345678901")
        String nationalId,

        @Schema(description = "Secondary school name", example = "Green Valley Secondary School")
        String secondarySchool,

        @Schema(description = "Secondary performance", example = "A-")
        String secondaryPerformance,

        @Schema(description = "School identifier", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
        UUID schoolId,

        @Schema(description = "School name", example = "School of Computing")
        String schoolName,

        @Schema(description = "Program identifier", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
        UUID programId,

        @Schema(description = "Program name", example = "Bachelor of Computer Science")
        String programName
) {
}
