package git.jogindermikael.University.Management.System.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import git.jogindermikael.University.Management.System.auth.dto.AuthRequest;
import git.jogindermikael.University.Management.System.auth.service.AuthService;
import git.jogindermikael.University.Management.System.auth.service.JwtService;
import git.jogindermikael.University.Management.System.auth.service.LogoutService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthService authService;

    @Mock
    private LogoutService logoutService;

    @InjectMocks
    private AuthController authController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void login_ShouldReturnToken_WhenCredentialsAreValid() throws Exception {
        AuthRequest request = new AuthRequest("admin@university.com", "Admin123!");
        String token = "mock-jwt-token";

        when(authService.login(request.getEmail(), request.getPassword())).thenReturn(token);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value(token));
    }

    @Test
    void logout_ShouldReturnOk_WhenTokenIsValid() throws Exception {
        String authHeader = "Bearer mock-jwt-token";

        mockMvc.perform(post("/api/v1/auth/logout")
                        .header("Authorization", authHeader))
                .andExpect(status().isOk());

        verify(logoutService).logout(authHeader);
    }
}
