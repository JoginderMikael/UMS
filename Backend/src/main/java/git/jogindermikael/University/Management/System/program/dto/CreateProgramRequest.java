package git.jogindermikael.University.Management.System.program.dto;

import java.util.UUID;

public record CreateProgramRequest(
        String name,
        String code,
        UUID schoolId,
        UUID departmentId
) { }
