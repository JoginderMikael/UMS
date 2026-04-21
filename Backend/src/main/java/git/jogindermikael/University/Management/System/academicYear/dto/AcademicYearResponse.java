package git.jogindermikael.University.Management.System.academicYear.dto;

import java.util.UUID;

public record AcademicYearResponse(
        UUID academicYearId,
        String name,
        boolean active
) {
}
