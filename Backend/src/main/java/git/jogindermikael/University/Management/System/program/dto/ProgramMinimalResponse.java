package git.jogindermikael.University.Management.System.program.dto;

import java.util.UUID;

public record ProgramMinimalResponse(
        UUID id,
        UUID schoolId,
        UUID departmentId
) {
}
