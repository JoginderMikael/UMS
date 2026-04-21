package git.jogindermikael.University.Management.System.user.controller;

import git.jogindermikael.University.Management.System.user.dto.CreateUserRequest;
import git.jogindermikael.University.Management.System.user.dto.UpdateRequest;
import git.jogindermikael.University.Management.System.user.dto.UserResponse;
import git.jogindermikael.University.Management.System.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "API endpoints for managing users including creation, retrieval, update, and deletion operations")
public class UserController {

    private final UserService userService;


    /*
        POST http://localhost:8081/api/v1/users/createuser
            {
           "firstName": "Super",
            "lastName": "Administrator",
            "email": "super@admin.uni",
            "password": "SuperAdmin@Uni",
            "role": "ADMIN"
            }
     */
    @Operation(
            summary = "Create a new user",
            description = "Creates a new user account with the provided details. Only administrators can perform this operation. " +
                    "The user will be created with the specified role (ADMIN, LECTURER, STUDENT, etc.) and email must be unique."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "User successfully created",
                    content = @Content(schema = @Schema(implementation = UserResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid input data (e.g., invalid email format, missing required fields, password too weak)"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have ADMIN role to create users"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflict - Email already exists in the system"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Unexpected error occurred during user creation"
            )
    })
    @PostMapping("/createuser")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody CreateUserRequest createUserRequest) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(userService.createUser(createUserRequest));
    }
    /*
    http://localhost:8081/api/v1/users/allusers
     */
    @Operation(
            summary = "Retrieve all users",
            description = "Fetches a complete list of all users registered in the system. Only administrators can access this endpoint. " +
                    "Returns user details including ID, email, name, role, and status."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "List of users successfully retrieved",
                    content = @Content(schema = @Schema(implementation = UserResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have ADMIN role to view all users"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error while retrieving users"
            )
    })
    @GetMapping("/allusers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /*
    http://localhost:8081/api/v1/users/email/clean@student.uni
     */
    @Operation(
            summary = "Retrieve user by email",
            description = "Fetches a specific user's details using their email address. Email must be exact match. " +
                    "Only administrators can retrieve users by email. Useful for checking user existence or retrieving user profile."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "User found and returned successfully",
                    content = @Content(schema = @Schema(implementation = UserResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have ADMIN role"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - User with the specified email does not exist"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error while retrieving user"
            )
    })
    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUserByEmail(
            @Parameter(description = "User's email address", example = "clean@student.uni", required = true)
            @PathVariable String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    /*
    http://localhost:8081/api/v1/users/8f1712ac-7161-4c36-948e-40842eeb43f4
     */
    @Operation(
            summary = "Retrieve user by ID",
            description = "Fetches a specific user's complete details using their unique UUID identifier. " +
                    "Only administrators can retrieve users by ID. Returns all user information including email, name, role, and account status."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "User found and returned successfully",
                    content = @Content(schema = @Schema(implementation = UserResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid UUID format"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have ADMIN role"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - User with the specified ID does not exist"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error while retrieving user"
            )
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUserById(
            @Parameter(description = "User's unique identifier (UUID)", example = "8f1712ac-7161-4c36-948e-40842eeb43f4", required = true)
            @PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    /*
    http://localhost:8080/api/v1/users/8f1712ac-7161-4c36-948e-40842eeb43f4

    requestBody
    {
        "email": "mikemk@student.uni",
        "firstName": "mike",
        "id": "8f1712ac-7161-4c36-948e-40842eeb43f4",
        "lastName": "Mwaasi",
        "role": "STUDENT"
    }
     */
    @Operation(
            summary = "Update user details",
            description = "Updates an existing user's information including email, first name, last name, and role. " +
                    "Only administrators can update user details. All fields in the request are optional, but at least one field must be provided. " +
                    "Email must remain unique if being updated."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "User successfully updated",
                    content = @Content(schema = @Schema(implementation = UserResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid input data (e.g., invalid email format, empty update request)"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have ADMIN role to update users"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - User with the specified ID does not exist"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflict - Email already in use by another user"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error while updating user"
            )
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUser(
            @Parameter(description = "User's unique identifier (UUID)", example = "8f1712ac-7161-4c36-948e-40842eeb43f4", required = true)
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRequest updateRequest) {
        return ResponseEntity.ok(userService.updateUser(id, updateRequest));
    }

    /*
    http://localhost:8081/api/v1/users/96e92996-f2eb-426e-9bde-b1c8bdb4b814
     */
    @Operation(
            summary = "Delete a user",
            description = "Performs a soft delete on a user account by marking it as deleted without permanently removing records from the database. " +
                    "Only administrators can delete users. Deleted users can be restored using the restore endpoint. " +
                    "Returns 204 No Content on successful deletion."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "204",
                    description = "User successfully deleted (soft delete)"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid UUID format"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have ADMIN role to delete users"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - User with the specified ID does not exist"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error while deleting user"
            )
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "User's unique identifier (UUID)", example = "96e92996-f2eb-426e-9bde-b1c8bdb4b814", required = true)
            @PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    /*
    http://localhost:8081/api/v1/users/me
     */
    @Operation(
            summary = "Retrieve current authenticated user",
            description = "Fetches the profile information of the currently authenticated user. " +
                    "This endpoint can be accessed by any authenticated user (requires valid JWT token). " +
                    "Returns the details of the user making the request."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Current user information successfully retrieved",
                    content = @Content(schema = @Schema(implementation = UserResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - No valid JWT token provided or token is expired"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Error retrieving current user information"
            )
    })
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    /*
    http://localhost:8081/api/v1/users/96e92996-f2eb-426e-9bde-b1c8bdb4b814/restore
     */
    @Operation(
            summary = "Restore a deleted user",
            description = "Restores a previously soft-deleted user account, making it active again in the system. " +
                    "Only administrators can restore deleted users. The user must have been soft-deleted previously. " +
                    "Returns 204 No Content on successful restoration."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "204",
                    description = "User successfully restored"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid UUID format"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have ADMIN role to restore users"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - User with the specified ID does not exist or is not deleted"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error while restoring user"
            )
    })
    @PutMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> restoreUser(
            @Parameter(description = "Deleted user's unique identifier (UUID)", example = "96e92996-f2eb-426e-9bde-b1c8bdb4b814", required = true)
            @PathVariable UUID id) {
        userService.restoreUser(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @Operation(
            summary = "Retrieve all deleted users",
            description = "Fetches a complete list of all soft-deleted users in the system. " +
                    "Only administrators can access this endpoint. This is useful for audit trails and user restoration. " +
                    "Returns all deleted user details including deletion timestamp and account information."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "List of deleted users successfully retrieved",
                    content = @Content(schema = @Schema(implementation = UserResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have ADMIN role to view deleted users"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error while retrieving deleted users"
            )
    })
    @GetMapping("/allDeleted")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllDeletedUsers() {
        return ResponseEntity.ok(userService.getAllDeletedUsers());
    }
}
