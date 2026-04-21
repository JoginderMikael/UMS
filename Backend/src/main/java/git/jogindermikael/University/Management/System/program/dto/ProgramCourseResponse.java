package git.jogindermikael.University.Management.System.program.dto;

import git.jogindermikael.University.Management.System.program.entity.ProgramCourseType;

import java.util.UUID;

public record ProgramCourseResponse(
        UUID courseId,
        String courseTitle,
        String courseCode,
        int creditUnits,
        ProgramCourseType courseType,
        Integer yearOfStudy
) {
}
