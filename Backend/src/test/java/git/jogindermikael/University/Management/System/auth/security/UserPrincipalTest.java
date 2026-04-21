package git.jogindermikael.University.Management.System.auth.security;

import git.jogindermikael.University.Management.System.user.entity.Role;
import git.jogindermikael.University.Management.System.user.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class UserPrincipalTest {

    @Test
    void userPrincipal_exposesExpectedFieldsAndFlags() {
        UUID id = UUID.randomUUID();
        User user = new User();
        user.setId(id);
        user.setEmail("admin@university.com");
        user.setPassword("secret");
        user.setRole(Role.ADMIN);

        UserPrincipal principal = new UserPrincipal(user);

        assertEquals(id, principal.getId());
        assertEquals("admin@university.com", principal.getUsername());
        assertEquals("secret", principal.getPassword());
        assertTrue(principal.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN")));
        assertTrue(principal.isAccountNonExpired());
        assertTrue(principal.isAccountNonLocked());
        assertTrue(principal.isCredentialsNonExpired());
        assertTrue(principal.isEnabled());
    }
}
