package git.jogindermikael.University.Management.System.auth.service;

import git.jogindermikael.University.Management.System.auth.repository.TokenBlacklistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class TokenCleanupService {


    private final TokenBlacklistRepository tokenBlacklistRepository;

    @Scheduled(cron = "0 0 0 * * *")
    public void deleteExpiredTokens() {
        int deleted = tokenBlacklistRepository.deleteAllExpiredBefore(Instant.now());
        log.info("Deleted {} expired blacklisted token", deleted);
    }
}
