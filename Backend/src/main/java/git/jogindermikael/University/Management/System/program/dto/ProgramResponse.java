package git.jogindermikael.University.Management.System.program.dto;

import java.util.UUID;

public record ProgramResponse (
        UUID id,
        String name,
        String code,
        UUID schoolId,
        String schoolCode,
        String schoolName,
        UUID departmentId,
        String departmentCode,
        String departmentName
){
}
