package git.jogindermikael.University.Management.System.program.controller;

import git.jogindermikael.University.Management.System.program.dto.AddProgramCourseRequest;
import git.jogindermikael.University.Management.System.program.dto.CreateProgramRequest;
import git.jogindermikael.University.Management.System.program.dto.ProgramCourseResponse;
import git.jogindermikael.University.Management.System.program.dto.ProgramMinimalResponse;
import git.jogindermikael.University.Management.System.program.dto.ProgramResponse;
import git.jogindermikael.University.Management.System.program.service.ProgramService;
import git.jogindermikael.University.Management.System.program.dto.UpdateProgramRequest;
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
@RequestMapping("/api/v1/programs")
@RequiredArgsConstructor
@Tag(name = "Program Management", description = "API endpoints for managing academic programs including creation, retrieval, course assignment, and deletion")
public class ProgramController {

    private final ProgramService programService;

    @Operation(
            summary = "Create a new program",
            description = "Creates a new academic program with name, code, description, and other program details. " +
                    "Only administrators can create programs. Program code must be unique within the system."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Program successfully created",
                    content = @Content(schema = @Schema(implementation = ProgramResponse.class))
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
                    description = "Conflict - Program code already exists"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity <ProgramResponse> createProgram(@RequestBody CreateProgramRequest request){
        return ResponseEntity.ok(programService.addProgram(request));
    }

    @Operation(
            summary = "Retrieve program by ID",
            description = "Fetches a specific program's complete details using its unique identifier. Returns program information including name, code, description, and associated courses. " +
                    "Accessible to all authenticated users."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Program found and returned successfully",
                    content = @Content(schema = @Schema(implementation = ProgramResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid UUID format"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - Program with the specified ID does not exist"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @GetMapping("/{id}")
    public ResponseEntity<ProgramResponse> getProgram(
            @Parameter(description = "Program's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID id){
        return ResponseEntity.ok(programService.getProgramById(id));
    }

    @Operation(
            summary = "Retrieve all programs (minimal)",
            description = "Fetches all programs with minimal fields only: program ID, school ID, and department ID. " +
                    "Intended for frontend lookup and linking flows."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Minimal program list successfully retrieved",
                    content = @Content(schema = @Schema(implementation = ProgramMinimalResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @GetMapping("/all")
    public ResponseEntity<List<ProgramMinimalResponse>> getAllPrograms() {
        return ResponseEntity.ok(programService.getAllPrograms());
    }


    @Operation(
            summary = "Retrieve all programs offered by a school",
            description = "Fetches a complete list of all programs offered within a specific school. Returns all program details including code, name, and description. " +
                    "Accessible to all authenticated users."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "List of programs successfully retrieved",
                    content = @Content(schema = @Schema(implementation = ProgramResponse.class))
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
    @GetMapping("/schools/{schoolId}")
    public ResponseEntity<List<ProgramResponse>> bySchool(
            @Parameter(description = "School's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID schoolId){
        return ResponseEntity.ok(programService.getAllProgramsBySchool(schoolId));
    }

    @Operation(
            summary = "Retrieve all programs offered by a department",
            description = "Fetches a complete list of all programs managed by a specific department. Returns program details for all programs under the department's responsibility. " +
                    "Accessible to all authenticated users."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "List of programs successfully retrieved",
                    content = @Content(schema = @Schema(implementation = ProgramResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid UUID format for departmentId"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - Department with the specified ID does not exist"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @GetMapping("/departments/{departmentId}")
    public ResponseEntity<List<ProgramResponse>> byDepartment(
            @Parameter(description = "Department's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID departmentId){
        return ResponseEntity.ok(programService.getAllProgramsByDepartment(departmentId));
    }

    @Operation(
            summary = "Update program details",
            description = "Updates an existing program's information including name, code, description, and other program details. " +
                    "Only administrators can update programs. Program code uniqueness must be maintained if changed."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Program successfully updated",
                    content = @Content(schema = @Schema(implementation = ProgramResponse.class))
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
                    description = "Not Found - Program with the specified ID does not exist"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflict - Program code already in use"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProgramResponse> updateProgram(
            @Parameter(description = "Program's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID id,
            @RequestBody UpdateProgramRequest request){
        return ResponseEntity.ok(programService.updateProgram(id, request));
    }

    @Operation(
            summary = "Delete a program",
            description = "Performs a soft delete on a program, marking it as deleted without permanently removing database records. " +
                    "Only administrators can delete programs. Deleted programs may be restored by administrators."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Program successfully deleted (soft delete)"
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
                    description = "Not Found - Program with the specified ID does not exist"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProgramResponse> deleteProgram(
            @Parameter(description = "Program's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID id){
        return ResponseEntity.ok(programService.deleteProgram(id));
    }

    @Operation(
            summary = "Add a course to a program",
            description = "Associates a course with a program's curriculum, making it available to students in that program. " +
                    "Only administrators and faculty members can add courses to programs. A course can only be added once to each program. " +
                    "When adding, you must specify if the course is CORE or ELECTIVE and the year of study it belongs to in this program."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Course successfully added to program"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid UUID format"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have ADMIN or FACULTY role"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - Program or course not found"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflict - Course already added to this program"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @PostMapping("/{id}/courses/{courseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<ProgramCourseResponse> addCourse(
            @Parameter(description = "Program's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID id,
            @Parameter(description = "Course's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440001", required = true)
            @PathVariable UUID courseId,
            @Valid @RequestBody AddProgramCourseRequest request){
        return ResponseEntity.ok(programService.addCourse(id, courseId, request));
    }


    @Operation(
            summary = "Remove a course from a program",
            description = "Disassociates a course from a program's curriculum, making it no longer available to students in that program. " +
                    "Only administrators and faculty members can remove courses from programs. Existing student enrollments may be handled per business rules."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Course successfully removed from program"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid UUID format"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have ADMIN or FACULTY role"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - Program or course not found"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @DeleteMapping("/{id}/courses/{courseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<Void> deleteCourse(
            @Parameter(description = "Program's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID id,
            @Parameter(description = "Course's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440001", required = true)
            @PathVariable UUID courseId){
        programService.removeCourse(id, courseId);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Update a program course association",
            description = "Updates metadata for an already-associated course in a program, such as changing CORE/ELECTIVE " +
                    "classification or correcting the year of study. Only administrators and faculty members can perform this update."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Program course association successfully updated",
                    content = @Content(schema = @Schema(implementation = ProgramCourseResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid input data or UUID format"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have ADMIN or FACULTY role"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - Program/course association not found"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @PutMapping("/{id}/courses/{courseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<ProgramCourseResponse> updateProgramCourse(
            @Parameter(description = "Program's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID id,
            @Parameter(description = "Course's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440001", required = true)
            @PathVariable UUID courseId,
            @Valid @RequestBody AddProgramCourseRequest request) {
        return ResponseEntity.ok(programService.updateProgramCourse(id, courseId, request));
    }

    @Operation(
            summary = "Retrieve all courses in a program",
            description = "Fetches a complete list of all courses that are part of a specific program's curriculum. " +
                    "Returns all program course associations with course details, core/elective type, and year of study. " +
                    "Accessible to all authenticated users."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "List of program courses successfully retrieved",
                    content = @Content(schema = @Schema(implementation = ProgramCourseResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid UUID format"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - Program with the specified ID does not exist"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @GetMapping("/{id}/courses")
    public ResponseEntity<List<ProgramCourseResponse>> getAllCourse(
            @Parameter(description = "Program's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID id){
        return new ResponseEntity<>(programService.getAllProgramCourses(id), HttpStatus.OK);
    }

}
