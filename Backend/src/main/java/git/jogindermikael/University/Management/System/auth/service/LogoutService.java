package git.jogindermikael.University.Management.System.auth.service;


import git.jogindermikael.University.Management.System.auth.repository.TokenBlacklistRepository;
import git.jogindermikael.University.Management.System.auth.security.BlacklistedToken;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Setter
@RequiredArgsConstructor
@Slf4j
public class LogoutService {

    private final TokenBlacklistRepository tokenBlacklistResponsitory;
    private final JwtService jwtService;

    public void logout(String authHeader){
        if(authHeader==null || !authHeader.startsWith("Bearer ")){
            return;
        }

        String token = authHeader.substring(7);
        tokenBlacklistResponsitory.save(
                BlacklistedToken.builder()
                        .token(token)
                        .expiresAt(jwtService.extractExpiration(token).toInstant())
                        .build()
        );
    }
}
