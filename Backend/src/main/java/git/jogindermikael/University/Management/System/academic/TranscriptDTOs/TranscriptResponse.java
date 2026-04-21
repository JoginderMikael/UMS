package git.jogindermikael.University.Management.System.academic.TranscriptDTOs;

import java.util.List;

public record TranscriptResponse(
        String academicYear,
        List<TranscriptSemesterDto> semesters
) {}
