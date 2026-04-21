package git.jogindermikael.University.Management.System.academic.school.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateSchoolRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String code;
}
