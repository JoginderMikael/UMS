package git.jogindermikael.University.Management.System.academic.school.department.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateDepartmentRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String code;
}
