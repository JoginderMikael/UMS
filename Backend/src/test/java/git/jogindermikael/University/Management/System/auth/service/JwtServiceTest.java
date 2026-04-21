package git.jogindermikael.University.Management.System.auth.service;

import git.jogindermikael.University.Management.System.auth.security.UserPrincipal;
import git.jogindermikael.University.Management.System.user.entity.Role;
import git.jogindermikael.University.Management.System.user.entity.User;
import org.junit.jupiter.api.Test;

import java.util.Calendar;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    private final JwtService jwtService = new JwtService();

    @Test
    void generateToken_and_extractEmail_returnsUserEmail() {
        UserPrincipal principal = buildPrincipal("admin@university.com", Role.ADMIN);

        String token = jwtService.generateToken(principal);

        assertNotNull(token);
        assertEquals("admin@university.com", jwtService.extractEmail(token));
    }

    @Test
    void isTokenValid_returnsTrue_forValidToken() {
        UserPrincipal principal = buildPrincipal("faculty@university.com", Role.FACULTY);

        String token = jwtService.generateToken(principal);

        assertTrue(jwtService.isTokenValid(token));
    }

    @Test
    void isTokenValid_returnsFalse_forInvalidToken() {
        assertFalse(jwtService.isTokenValid("not-a-jwt"));
    }

    @Test
    void extractExpiration_returnsExpectedWindow() {
        UserPrincipal principal = buildPrincipal("student@university.com", Role.STUDENT);
        long now = System.currentTimeMillis();

        String token = jwtService.generateToken(principal);
        Calendar expiration = jwtService.extractExpiration(token);

        long expMillis = expiration.getTimeInMillis();
        long day = 24L * 60 * 60 * 1000;
        assertTrue(expMillis >= now + 9 * day);
        assertTrue(expMillis <= now + 11 * day);
    }

    private UserPrincipal buildPrincipal(String email, Role role) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail(email);
        user.setPassword("secret");
        user.setRole(role);
        return new UserPrincipal(user);
    }
}
