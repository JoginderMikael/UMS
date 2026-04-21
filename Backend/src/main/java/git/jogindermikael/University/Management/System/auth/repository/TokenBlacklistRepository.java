package git.jogindermikael.University.Management.System.auth.repository;

import git.jogindermikael.University.Management.System.auth.security.BlacklistedToken;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.UUID;

public interface TokenBlacklistRepository extends JpaRepository<BlacklistedToken, UUID> {

    boolean existsByToken(String token);

    @Modifying
    @Transactional
    @Query("DELETE FROM BlacklistedToken t WHERE t.expiresAt < :now")
    int deleteAllExpiredBefore(@Param("now")Instant now);
}
