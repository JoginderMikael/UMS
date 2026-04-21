package git.jogindermikael.University.Management.System.academic.TranscriptDTOs;

import java.util.List;

public record TranscriptSemesterDto(
        int semesterNumber,
        List<TranscriptCourseDto> courses
) {}
