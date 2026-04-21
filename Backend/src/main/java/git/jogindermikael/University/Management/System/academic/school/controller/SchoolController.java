package git.jogindermikael.University.Management.System.academic.school.controller;


import git.jogindermikael.University.Management.System.academic.school.dto.CreateSchoolRequest;
import git.jogindermikael.University.Management.System.academic.school.dto.SchoolResponse;
import git.jogindermikael.University.Management.System.academic.school.dto.UpdateSchoolRequest;
import git.jogindermikael.University.Management.System.academic.school.service.SchoolService;
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
@RequestMapping("/api/v1/schools")
@RequiredArgsConstructor
@Tag(name = "School Management", description = "API endpoints for managing academic schools including creation, retrieval, update, and deletion operations")
public class SchoolController {

    private final SchoolService schoolService;

    @Operation(
            summary = "Create a new school",
            description = "Creates a new academic school within the institution. Only administrators can create schools. " +
                    "A school is the top-level organizational unit containing departments and programs. School codes must be unique."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "School successfully created",
                    content = @Content(schema = @Schema(implementation = SchoolResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid input data or missing required fields"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have ADMIN role"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflict - School code already exists"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @PostMapping("/addSchool")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SchoolResponse> addSchool(@RequestBody CreateSchoolRequest createSchoolRequest) {
        return new ResponseEntity<>(schoolService.createSchool(createSchoolRequest),  HttpStatus.OK);
    }

    @Operation(
            summary = "Retrieve all schools",
            description = "Fetches a complete list of all schools within the institution. Returns all school details including name, code, and description. " +
                    "Accessible to all authenticated users."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "List of schools successfully retrieved",
                    content = @Content(schema = @Schema(implementation = SchoolResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @GetMapping("/getAll")
    public ResponseEntity<List<SchoolResponse>> getAllSchools() {
        return new ResponseEntity<>(schoolService.findAllSchools(),  HttpStatus.OK);
    }

    @Operation(
            summary = "Retrieve school by code",
            description = "Fetches a specific school's details using its school code. School codes are typically short alphanumeric identifiers. " +
                    "Accessible to all authenticated users."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "School found and returned successfully",
                    content = @Content(schema = @Schema(implementation = SchoolResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - School with the specified code does not exist"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @GetMapping("/code/{code}")
    public ResponseEntity<SchoolResponse> getSchoolByCode(
            @Parameter(description = "School's unique code identifier", example = "COMP", required = true)
            @PathVariable("code") String schoolCode) {
        return new ResponseEntity<>(schoolService.findSchoolByCode(schoolCode),  HttpStatus.OK);
    }

    @Operation(
            summary = "Retrieve school by ID",
            description = "Fetches a specific school's complete details using its unique UUID identifier. Returns all school information. " +
                    "Accessible to all authenticated users."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "School found and returned successfully",
                    content = @Content(schema = @Schema(implementation = SchoolResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid UUID format"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - School with the specified ID does not exist"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @GetMapping("/id/{id}")
    public ResponseEntity<SchoolResponse> getSchoolById(
            @Parameter(description = "School's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID id) {
        return new ResponseEntity<>(schoolService.findSchoolById(id),  HttpStatus.OK);
    }

    @Operation(
            summary = "Delete a school",
            description = "Performs a soft delete on a school, removing it from active use without permanently deleting database records. " +
                    "Only administrators can delete schools. Deleted schools can be restored by administrators."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "School successfully deleted (soft delete)"
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
                    description = "Not Found - School with the specified ID does not exist"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSchoolById(
            @Parameter(description = "School's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID id) {
        schoolService.deleteSchoolById(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Operation(
            summary = "Update school details",
            description = "Updates school name and code for an existing school. " +
                    "Only administrators can update schools. School name and code must remain unique."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "School successfully updated",
                    content = @Content(schema = @Schema(implementation = SchoolResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid input data or duplicate school name/code"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have ADMIN role"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - School with the specified ID does not exist"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SchoolResponse> updateSchoolById(
            @Parameter(description = "School's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID id,
            @Valid @RequestBody UpdateSchoolRequest updateSchoolRequest) {
        return new ResponseEntity<>(schoolService.updateSchool(id, updateSchoolRequest),  HttpStatus.OK);
    }

    @Operation(
            summary = "Restore a deleted school",
            description = "Restores a previously soft-deleted school, making it active again in the system. " +
                    "Only administrators can restore deleted schools. The school must have been soft-deleted previously."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "School successfully restored",
                    content = @Content(schema = @Schema(implementation = SchoolResponse.class))
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
                    description = "Not Found - School with the specified ID does not exist"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @PutMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SchoolResponse> restoreSchoolById(
            @Parameter(description = "School's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID id) {
        schoolService.restore(id);
        return new ResponseEntity<>(schoolService.findSchoolById(id),  HttpStatus.OK);
    }

    @Operation(
            summary = "Retrieve all deleted schools",
            description = "Fetches a complete list of all soft-deleted schools in the system. Useful for auditing and restoration purposes. " +
                    "Only administrators can access this endpoint."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "List of deleted schools successfully retrieved",
                    content = @Content(schema = @Schema(implementation = SchoolResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have ADMIN role"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @GetMapping("/deletedSchools")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SchoolResponse>> deleteAllSchools() {
        return new ResponseEntity<>(schoolService.findAllDeletedSchools(),  HttpStatus.OK);
    }
}
