package git.jogindermikael.University.Management.System.program.dto;

import git.jogindermikael.University.Management.System.program.entity.ProgramCourseType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AddProgramCourseRequest(
        @NotNull ProgramCourseType courseType,
        @NotNull @Min(1) Integer yearOfStudy
) {
}
