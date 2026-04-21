package git.jogindermikael.University.Management.System.course.dto;

import java.util.UUID;

public record CreateCourseRequest(
        String title,
        String code,
        int creditUnits,
        UUID schoolId,
        UUID departmentId
) {}
