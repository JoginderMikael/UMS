package git.jogindermikael.University.Management.System.academic.school.department.controller;

import git.jogindermikael.University.Management.System.academic.school.department.dto.CreateDepartmentRequest;
import git.jogindermikael.University.Management.System.academic.school.department.dto.DepartmentResponse;
import git.jogindermikael.University.Management.System.academic.school.department.service.DepartmentService;
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
@RequestMapping("/api/v1/{schoolId}/departments")
@RequiredArgsConstructor
@Tag(name = "Department Management", description = "API endpoints for managing academic departments including creation, retrieval, update, and deletion operations")
public class DepartmentController {

    private final DepartmentService departmentService;

    @Operation(
            summary = "Create a new department",
            description = "Creates a new department within a specific school. Only administrators can create departments. " +
                    "Each department belongs to one school and manages programs and courses. Department names must be unique within the school."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Department successfully created",
                    content = @Content(schema = @Schema(implementation = DepartmentResponse.class))
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
                    responseCode = "404",
                    description = "Not Found - School with the specified ID does not exist"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflict - Department name already exists in this school"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @PostMapping("/addDepartment")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DepartmentResponse> addDepartment(
            @Parameter(description = "School's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID schoolId,
            @Valid @RequestBody CreateDepartmentRequest createDepartmentRequest
            ){

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(departmentService.addDepartment(schoolId, createDepartmentRequest));
    }

    @Operation(
            summary = "Retrieve all departments in a school",
            description = "Fetches a complete list of all departments within a specific school. Returns all departments with their details including name, code, and description. " +
                    "Accessible to all authenticated users."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "List of departments successfully retrieved",
                    content = @Content(schema = @Schema(implementation = DepartmentResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid UUID format for schoolId"
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
    @GetMapping("/all")
    public ResponseEntity <List<DepartmentResponse>> getAllDepartments(
            @Parameter(description = "School's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID schoolId
    ){
        return new ResponseEntity<>(departmentService.getAllDepartments(schoolId), HttpStatus.OK);
    }

    @Operation(
            summary = "Retrieve department by ID",
            description = "Fetches a specific department's complete details using its unique identifier. Returns department information including name, code, and description. " +
                    "Accessible to all authenticated users."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Department found and returned successfully",
                    content = @Content(schema = @Schema(implementation = DepartmentResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid UUID format"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - Department or school not found"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @GetMapping("/{id}")
    public ResponseEntity<DepartmentResponse> getDepartment(
            @Parameter(description = "School's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID schoolId,
            @Parameter(description = "Department's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440001", required = true)
            @PathVariable UUID id){
        return new ResponseEntity<>(departmentService.getDepartmentById(schoolId, id), HttpStatus.OK);
    }

    @Operation(
            summary = "Delete a department",
            description = "Performs a soft delete on a department, removing it from active use without permanently deleting database records. " +
                    "Only administrators can delete departments. Deleted departments can be restored by administrators."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "204",
                    description = "Department successfully deleted (soft delete)"
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
                    description = "Not Found - Department or school not found"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDepartment(
            @Parameter(description = "School's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID schoolId,
            @Parameter(description = "Department's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440001", required = true)
            @PathVariable UUID id
    ){
        departmentService.deleteDepartmentById(schoolId, id);
        new ResponseEntity<>(HttpStatus.OK);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Restore a deleted department",
            description = "Restores a previously soft-deleted department, making it active again in the system. " +
                    "Only administrators can restore deleted departments. The department must have been soft-deleted previously."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Department successfully restored",
                    content = @Content(schema = @Schema(implementation = DepartmentResponse.class))
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
                    description = "Not Found - Department or school not found"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @PutMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DepartmentResponse> restoreDepartment(
            @Parameter(description = "School's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID schoolId,
            @Parameter(description = "Department's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440001", required = true)
            @PathVariable UUID id
    ){
        departmentService.restoreDepartment(schoolId, id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Operation(
            summary = "Update department details",
            description = "Updates an existing department's information including name, code, and description. " +
                    "Only administrators can update departments. Department names must remain unique within the school if changed."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Department successfully updated",
                    content = @Content(schema = @Schema(implementation = DepartmentResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid input data"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have ADMIN role"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - Department or school not found"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflict - Department name already in use"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DepartmentResponse> updateDepartment(
            @Parameter(description = "School's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID schoolId,
            @Parameter(description = "Department's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440001", required = true)
            @PathVariable UUID id,
            @Valid @RequestBody CreateDepartmentRequest createDepartmentRequest){
        return new ResponseEntity<>(departmentService.updateDepartment(schoolId, id, createDepartmentRequest),
                HttpStatus.OK);
    }

    @Operation(
            summary = "Retrieve all deleted departments",
            description = "Fetches a complete list of all soft-deleted departments within a specific school. Useful for auditing and restoration purposes. " +
                    "Only administrators can access this endpoint."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "List of deleted departments successfully retrieved",
                    content = @Content(schema = @Schema(implementation = DepartmentResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid UUID format for schoolId"
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
    @GetMapping("/allDeleted")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity <List<DepartmentResponse>> getAllDeleted(
            @Parameter(description = "School's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID schoolId
    ){
        return new ResponseEntity<>(departmentService.getAllDeletedDepartments(schoolId), HttpStatus.OK);
    }
}
