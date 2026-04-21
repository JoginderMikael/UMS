package git.jogindermikael.University.Management.System.user.dto;

import git.jogindermikael.University.Management.System.user.entity.Role;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UpdateRequest {
    @NotBlank
    private String firstName;
    @NotBlank
    private String lastName;
    @NotBlank
    private String email;
    private Role role;
}
