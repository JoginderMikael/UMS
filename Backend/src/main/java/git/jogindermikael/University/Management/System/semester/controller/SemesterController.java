package git.jogindermikael.University.Management.System.semester.controller;

import git.jogindermikael.University.Management.System.semester.dto.CreateSemesterRequest;
import git.jogindermikael.University.Management.System.semester.dto.SemesterResponse;
import git.jogindermikael.University.Management.System.semester.service.SemesterService;
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
@RequestMapping()
@RequiredArgsConstructor
@Tag(name = "Semester Management", description = "API endpoints for managing semesters within academic years including creation, retrieval, and activation")
public class SemesterController {

    private final SemesterService semesterService;

    @Operation(
            summary = "Create a new semester",
            description = "Creates a new semester within a specific academic year. Only administrators can create semesters. " +
                    "Each academic year typically has 2-3 semesters. Semesters define enrollment and grading periods."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Semester successfully created",
                    content = @Content(schema = @Schema(implementation = SemesterResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid input data or date range"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have ADMIN role"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - Academic year with the specified ID does not exist"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflict - Semester overlaps with existing semesters in the year"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @PostMapping("/api/v1/academic-years/{yearId}/semesters")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SemesterResponse> createSemester(
            @Parameter(description = "Academic year's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID yearId,
            @Valid @RequestBody CreateSemesterRequest createSemesterRequest){
        return new ResponseEntity<>(semesterService.createSemester(yearId, createSemesterRequest), HttpStatus.CREATED);
    }

    @Operation(
            summary = "Retrieve all semesters in an academic year",
            description = "Fetches a complete list of all semesters within a specific academic year. Returns all semesters with their dates and status. " +
                    "Accessible to all authenticated users."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "List of semesters successfully retrieved",
                    content = @Content(schema = @Schema(implementation = SemesterResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid UUID format for yearId"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - Academic year with the specified ID does not exist"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @GetMapping("/api/v1/academic-years/{yearId}/semesters")
    public ResponseEntity<List<SemesterResponse>> getAllSemesters(
            @Parameter(description = "Academic year's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID yearId){
        return new ResponseEntity<>(semesterService.getByAcademicYear(yearId), HttpStatus.OK);
    }

    @Operation(
            summary = "Activate a semester",
            description = "Sets a specific semester as active, enabling enrollment and coursework for that period. " +
                    "Only administrators can activate semesters. Typically, only one semester is active at a time. " +
                    "Activating a new semester may deactivate the previously active one."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Semester successfully activated"
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
                    description = "Not Found - Semester with the specified ID does not exist"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Activation error"
            )
    })
    @PutMapping("/api/v1/semesters/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> activateSemester(
            @Parameter(description = "Semester's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID id){
        semesterService.activateSemester(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
