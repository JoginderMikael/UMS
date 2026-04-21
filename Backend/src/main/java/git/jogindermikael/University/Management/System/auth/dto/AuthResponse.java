package git.jogindermikael.University.Management.System.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private final String token;
    private final String type = "Bearer";
}
