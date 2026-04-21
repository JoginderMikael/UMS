package git.jogindermikael.University.Management.System.academic.TranscriptDTOs;

import java.util.UUID;

public record TranscriptCourseDto(
        UUID courseId,
        String courseCode,
        String courseName,
        Integer marks,
        String grade
) {}
