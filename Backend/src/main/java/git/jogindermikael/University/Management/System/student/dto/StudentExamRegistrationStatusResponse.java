package git.jogindermikael.University.Management.System.student.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(name = "StudentExamRegistrationStatusResponse", description = "Exam registration status for a student's course in the active semester")
public record StudentExamRegistrationStatusResponse(
        @Schema(description = "Course unique identifier", example = "550e8400-e29b-41d4-a716-446655440001")
        UUID courseId,
        @Schema(description = "Course code", example = "CS101")
        String courseCode,
        @Schema(description = "Course title", example = "Introduction to Computer Science")
        String courseTitle,
        @Schema(description = "Whether the student is registered for the course in the active semester", example = "true")
        boolean courseRegistered,
        @Schema(description = "Whether exam registration is completed for the course", example = "false")
        boolean examRegistered
) {
}
