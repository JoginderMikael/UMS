package git.jogindermikael.University.Management.System.course.dto;

import java.util.UUID;

public record CourseResponse(
        UUID id,
        String title,
        String code,
        int creditUnits,
        UUID schoolId,
        String SchoolCode,
        String SchoolName,
        UUID departmentId,
        String departmentCode,
        String DepartmentName
) {
}
