package git.jogindermikael.University.Management.System.student.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

@Schema(name = "UpdateStudentDetailsRequest", description = "Payload used by a student to update their profile and academic placement details")
public record UpdateStudentDetailsRequest(
        @Schema(description = "Student first name", example = "John", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "firstName is required")
        String firstName,

        @Schema(description = "Student last name", example = "Doe", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "lastName is required")
        String lastName,

        @Schema(description = "Student email address", example = "john.doe@student.uni", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "email is required")
        @Email(message = "email must be valid")
        String email,

        @Schema(description = "National ID number", example = "12345678901", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "nationalId is required")
        String nationalId,

        @Schema(description = "Secondary/high school name", example = "Green Valley Secondary School", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "secondarySchool is required")
        String secondarySchool,

        @Schema(description = "Secondary school performance/grade", example = "A-", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "secondaryPerformance is required")
        String secondaryPerformance,

        @Schema(description = "School unique identifier", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull(message = "schoolId is required")
        UUID schoolId,

        @Schema(description = "Program unique identifier", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull(message = "programId is required")
        UUID programId
) {
}
