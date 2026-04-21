package git.jogindermikael.University.Management.System.auth.security;


import git.jogindermikael.University.Management.System.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "token_blacklist")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BlacklistedToken extends BaseEntity {

    @Column(length = 512, unique = true, nullable = false)
    private String token;

    private Instant expiresAt;
}
