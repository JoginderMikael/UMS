package git.jogindermikael.University.Management.System.auth.controller;

import git.jogindermikael.University.Management.System.auth.dto.AuthRequest;
import git.jogindermikael.University.Management.System.auth.dto.AuthResponse;
import git.jogindermikael.University.Management.System.auth.service.AuthService;
import git.jogindermikael.University.Management.System.auth.service.JwtService;
import git.jogindermikael.University.Management.System.auth.service.LogoutService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "API endpoints for user authentication including login and logout operations")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AuthService authService;
    private final LogoutService logoutService;
    /*
    POST http://localhost:8081/api/v1/auth/login
        {
          "email": "admin@university.com",
          "password": "Admin123!"
        }
     */
    @Operation(
            summary = "User login",
            description = "Authenticates a user with email and password credentials. Returns a JWT token valid for 24 hours. " +
                    "This token must be included in the Authorization header as 'Bearer {token}' for subsequent requests."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Login successful, JWT token returned",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Missing or invalid email/password in request body"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - Invalid email or password credentials"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - User with provided email does not exist"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Authentication service error"
            )
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request){
        String token = authService.login(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(new AuthResponse(token));
    }


    /*
    http://localhost:8081/api/v1/auth/logout
    Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkB1bml2ZXJzaXR5LmNvbSIsInVzZXJJZCI6IjIxOTk4ZGYxLWZkYTAtNGFiMC04Mjc0LWJjODJmOWIxMTczYyIsInJvbGUiOiJST0xFX0FETUlOIiwiaWF0IjoxNzY3MDEwODM3LCJleHAiOjE3Njc4NzQ4Mzd9.xQJ83KkVPhdZ7g3C_uuTYb7MMSskedWbYTVPKdcGGKY
     */

    @Operation(
            summary = "User logout",
            description = "Logs out the authenticated user by invalidating their JWT token. The token is added to a blacklist preventing further use. " +
                    "Requires the Authorization header with a valid Bearer token. Returns 200 OK with no content."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "User successfully logged out, token invalidated"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Missing Authorization header"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - Invalid or expired JWT token"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - Token has been revoked or blacklisted"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Logout service error"
            )
    })
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @Parameter(description = "JWT authentication token in format: Bearer {token}", required = true)
            @RequestHeader("Authorization") String authHeader
    ){
        logoutService.logout(authHeader);
        return ResponseEntity.ok().build();
    }
}
