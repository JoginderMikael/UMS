package git.jogindermikael.University.Management.System.student.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

@Schema(name = "BulkCourseRegistrationRequest", description = "Request payload for registering a student to multiple courses in the current semester")
public record BulkCourseRegistrationRequest(
        @NotNull
        @Schema(description = "Student unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", requiredMode = Schema.RequiredMode.REQUIRED)
        UUID studentId,
        @NotEmpty
        @Schema(description = "List of course unique identifiers (UUIDs)", example = "[\"550e8400-e29b-41d4-a716-446655440001\", \"550e8400-e29b-41d4-a716-446655440002\"]", requiredMode = Schema.RequiredMode.REQUIRED)
        List<UUID> courseIds
) {}
