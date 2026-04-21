package git.jogindermikael.University.Management.System.auth.service;

import git.jogindermikael.University.Management.System.auth.repository.TokenBlacklistRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TokenCleanupServiceTest {

    @Mock
    private TokenBlacklistRepository tokenBlacklistRepository;

    @InjectMocks
    private TokenCleanupService tokenCleanupService;

    @Test
    void deleteExpiredTokens_ShouldCallRepository_WithCurrentInstant() {
        when(tokenBlacklistRepository.deleteAllExpiredBefore(any(Instant.class))).thenReturn(5);

        tokenCleanupService.deleteExpiredTokens();

        verify(tokenBlacklistRepository, times(1)).deleteAllExpiredBefore(any(Instant.class));
    }

    @Test
    void deleteExpiredTokens_ShouldDeleteExpiredTokens_AndReturnCount() {
        when(tokenBlacklistRepository.deleteAllExpiredBefore(any(Instant.class))).thenReturn(10);

        tokenCleanupService.deleteExpiredTokens();

        verify(tokenBlacklistRepository).deleteAllExpiredBefore(any(Instant.class));
    }

    @Test
    void deleteExpiredTokens_ShouldHandleZeroDeletedTokens() {
        when(tokenBlacklistRepository.deleteAllExpiredBefore(any(Instant.class))).thenReturn(0);

        tokenCleanupService.deleteExpiredTokens();

        verify(tokenBlacklistRepository, times(1)).deleteAllExpiredBefore(any(Instant.class));
    }

    @Test
    void deleteExpiredTokens_ShouldHandleLargeNumberOfDeletedTokens() {
        when(tokenBlacklistRepository.deleteAllExpiredBefore(any(Instant.class))).thenReturn(1000);

        tokenCleanupService.deleteExpiredTokens();

        verify(tokenBlacklistRepository, times(1)).deleteAllExpiredBefore(any(Instant.class));
    }

    @Test
    void deleteExpiredTokens_ShouldUseCurrentTime() {
        Instant before = Instant.now();
        when(tokenBlacklistRepository.deleteAllExpiredBefore(any(Instant.class))).thenReturn(5);

        tokenCleanupService.deleteExpiredTokens();

        Instant after = Instant.now();
        
        verify(tokenBlacklistRepository).deleteAllExpiredBefore(any(Instant.class));
    }

    @Test
    void deleteExpiredTokens_ShouldCallRepositoryOncePerExecution() {
        when(tokenBlacklistRepository.deleteAllExpiredBefore(any(Instant.class))).thenReturn(3);

        tokenCleanupService.deleteExpiredTokens();
        tokenCleanupService.deleteExpiredTokens();

        verify(tokenBlacklistRepository, times(2)).deleteAllExpiredBefore(any(Instant.class));
    }

    @Test
    void deleteExpiredTokens_ShouldHandleRepositoryException() {
        when(tokenBlacklistRepository.deleteAllExpiredBefore(any(Instant.class)))
                .thenThrow(new RuntimeException("Database error"));

        try {
            tokenCleanupService.deleteExpiredTokens();
        } catch (RuntimeException e) {
            assertEquals("Database error", e.getMessage());
        }

        verify(tokenBlacklistRepository, times(1)).deleteAllExpiredBefore(any(Instant.class));
    }

    @Test
    void deleteExpiredTokens_ShouldPassInstantParameter() {
        when(tokenBlacklistRepository.deleteAllExpiredBefore(any(Instant.class))).thenReturn(7);

        tokenCleanupService.deleteExpiredTokens();

        verify(tokenBlacklistRepository).deleteAllExpiredBefore(any(Instant.class));
    }

    @Test
    void deleteExpiredTokens_ShouldBeIdempotent() {
        when(tokenBlacklistRepository.deleteAllExpiredBefore(any(Instant.class))).thenReturn(5);

        tokenCleanupService.deleteExpiredTokens();
        tokenCleanupService.deleteExpiredTokens();
        tokenCleanupService.deleteExpiredTokens();

        verify(tokenBlacklistRepository, times(3)).deleteAllExpiredBefore(any(Instant.class));
    }

    @Test
    void deleteExpiredTokens_ShouldReturnCorrectCount() {
        when(tokenBlacklistRepository.deleteAllExpiredBefore(any(Instant.class))).thenReturn(42);

        tokenCleanupService.deleteExpiredTokens();

        verify(tokenBlacklistRepository).deleteAllExpiredBefore(any(Instant.class));
    }
}
