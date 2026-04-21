package git.jogindermikael.University.Management.System.student.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(name = "StudentRegisteredCourseResponse", description = "Course registration details for a student in the active semester")
public record StudentRegisteredCourseResponse(
        @Schema(description = "Student course registration ID", example = "4f98cb60-3b7f-4c8f-9d0b-688cc9bb0f1e")
        UUID registrationId,
        @Schema(description = "Course unique identifier", example = "550e8400-e29b-41d4-a716-446655440001")
        UUID courseId,
        @Schema(description = "Course code", example = "CS101")
        String courseCode,
        @Schema(description = "Course title", example = "Introduction to Computer Science")
        String courseTitle,
        @Schema(description = "Course credit units", example = "3")
        int creditUnits,
        @Schema(description = "Whether exam registration is completed for the course", example = "false")
        boolean examRegistered,
        @Schema(description = "When course registration was created", example = "2026-02-21T12:15:30Z")
        Instant registeredAt
) {
}
