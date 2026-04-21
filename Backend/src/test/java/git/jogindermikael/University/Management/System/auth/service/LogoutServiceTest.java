package git.jogindermikael.University.Management.System.auth.service;

import git.jogindermikael.University.Management.System.auth.repository.TokenBlacklistRepository;
import git.jogindermikael.University.Management.System.auth.security.BlacklistedToken;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Calendar;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LogoutServiceTest {

    @Mock
    private TokenBlacklistRepository tokenBlacklistRepository;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private LogoutService logoutService;

    @Test
    void logout_ShouldSaveBlacklistedToken_WhenValidBearerToken() {
        String token = "valid-jwt-token-123";
        String authHeader = "Bearer " + token;
        Calendar expirationCalendar = Calendar.getInstance();
        expirationCalendar.add(Calendar.HOUR, 24);
        Instant expirationInstant = expirationCalendar.toInstant();

        when(jwtService.extractExpiration(token)).thenReturn(expirationCalendar);
        when(tokenBlacklistRepository.save(any(BlacklistedToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        logoutService.logout(authHeader);

        ArgumentCaptor<BlacklistedToken> captor = ArgumentCaptor.forClass(BlacklistedToken.class);
        verify(tokenBlacklistRepository, times(1)).save(captor.capture());
        
        BlacklistedToken capturedToken = captor.getValue();
        assertEquals(token, capturedToken.getToken());
        assertNotNull(capturedToken.getExpiresAt());
    }

    @Test
    void logout_ShouldNotSaveBlacklistedToken_WhenAuthHeaderIsNull() {
        logoutService.logout(null);

        verify(tokenBlacklistRepository, never()).save(any());
        verify(jwtService, never()).extractExpiration(any());
    }

    @Test
    void logout_ShouldNotSaveBlacklistedToken_WhenAuthHeaderDoesNotStartWithBearer() {
        logoutService.logout("InvalidToken");

        verify(tokenBlacklistRepository, never()).save(any());
        verify(jwtService, never()).extractExpiration(any());
    }

    @Test
    void logout_ShouldNotSaveBlacklistedToken_WhenAuthHeaderIsEmpty() {
        logoutService.logout("");

        verify(tokenBlacklistRepository, never()).save(any());
        verify(jwtService, never()).extractExpiration(any());
    }

    @Test
    void logout_ShouldExtractTokenCorrectly_FromBearerHeader() {
        String token = "my-jwt-token";
        String authHeader = "Bearer " + token;
        Calendar expirationCalendar = Calendar.getInstance();
        expirationCalendar.add(Calendar.HOUR, 24);

        when(jwtService.extractExpiration(token)).thenReturn(expirationCalendar);
        when(tokenBlacklistRepository.save(any(BlacklistedToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        logoutService.logout(authHeader);

        verify(jwtService, times(1)).extractExpiration(token);
        ArgumentCaptor<BlacklistedToken> captor = ArgumentCaptor.forClass(BlacklistedToken.class);
        verify(tokenBlacklistRepository, times(1)).save(captor.capture());
        assertEquals(token, captor.getValue().getToken());
    }

    @Test
    void logout_ShouldHandleMultipleCalls() {
        String token1 = "token-1";
        String token2 = "token-2";
        String authHeader1 = "Bearer " + token1;
        String authHeader2 = "Bearer " + token2;
        
        Calendar expirationCalendar = Calendar.getInstance();
        expirationCalendar.add(Calendar.HOUR, 24);

        when(jwtService.extractExpiration(any())).thenReturn(expirationCalendar);
        when(tokenBlacklistRepository.save(any(BlacklistedToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        logoutService.logout(authHeader1);
        logoutService.logout(authHeader2);

        ArgumentCaptor<BlacklistedToken> captor = ArgumentCaptor.forClass(BlacklistedToken.class);
        verify(tokenBlacklistRepository, times(2)).save(captor.capture());
        
        assertEquals(token1, captor.getAllValues().get(0).getToken());
        assertEquals(token2, captor.getAllValues().get(1).getToken());
    }

    @Test
    void logout_ShouldUseCorrectExpirationTime() {
        String token = "jwt-token";
        String authHeader = "Bearer " + token;
        Calendar expirationCalendar = Calendar.getInstance();
        expirationCalendar.set(2026, Calendar.FEBRUARY, 5, 10, 30, 45);
        Instant expectedInstant = expirationCalendar.toInstant();

        when(jwtService.extractExpiration(token)).thenReturn(expirationCalendar);
        when(tokenBlacklistRepository.save(any(BlacklistedToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        logoutService.logout(authHeader);

        ArgumentCaptor<BlacklistedToken> captor = ArgumentCaptor.forClass(BlacklistedToken.class);
        verify(tokenBlacklistRepository).save(captor.capture());
        assertEquals(expectedInstant, captor.getValue().getExpiresAt());
    }

    @Test
    void logout_ShouldNotThrowException_WhenTokenBlacklistRepositoryThrowsException() {
        String token = "jwt-token";
        String authHeader = "Bearer " + token;
        Calendar expirationCalendar = Calendar.getInstance();

        when(jwtService.extractExpiration(token)).thenReturn(expirationCalendar);
        when(tokenBlacklistRepository.save(any(BlacklistedToken.class))).thenThrow(new RuntimeException("DB error"));

        assertThrows(RuntimeException.class, () -> logoutService.logout(authHeader));
    }

    @Test
    void logout_ShouldHandleBearerPrefixWithMultipleSpaces() {
        // Testing edge case with multiple spaces
        String token = "token-123";
        String authHeader = "Bearer  " + token; // Extra space
        Calendar expirationCalendar = Calendar.getInstance();

        when(jwtService.extractExpiration(" " + token)).thenReturn(expirationCalendar);
        when(tokenBlacklistRepository.save(any(BlacklistedToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        logoutService.logout(authHeader);

        ArgumentCaptor<BlacklistedToken> captor = ArgumentCaptor.forClass(BlacklistedToken.class);
        verify(tokenBlacklistRepository).save(captor.capture());
        assertTrue(captor.getValue().getToken().contains(token));
    }
}
