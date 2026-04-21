package git.jogindermikael.University.Management.System.academicYear.controller;

import git.jogindermikael.University.Management.System.academicYear.dto.AcademicYearRequest;
import git.jogindermikael.University.Management.System.academicYear.dto.AcademicYearResponse;
import git.jogindermikael.University.Management.System.academicYear.service.AcademicYearService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/academic-years")
@RequiredArgsConstructor()
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Academic Year Management", description = "API endpoints for managing academic years including creation, retrieval, and activation")
public class AcademicYearController {

    private final AcademicYearService academicYearService;

    @Operation(
            summary = "Create a new academic year",
            description = "Creates a new academic year with start and end dates. Only administrators can create academic years. " +
                    "Each academic year is typically divided into semesters. A new academic year becomes inactive by default."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Academic year successfully created",
                    content = @Content(schema = @Schema(implementation = AcademicYearResponse.class))
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
                    responseCode = "409",
                    description = "Conflict - Academic year overlaps with existing years"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @PostMapping("/add")
    public ResponseEntity<AcademicYearResponse> createAcademicYear(@RequestBody AcademicYearRequest academicYearRequest) {
        return new ResponseEntity<>(academicYearService.addAcademicYear(academicYearRequest), HttpStatus.CREATED);
    }

    @Operation(
            summary = "Retrieve all academic years",
            description = "Fetches a complete list of all academic years in the system. Returns all academic years with their dates and status. " +
                    "Accessible to all users (public endpoint). Useful for students and staff to view the academic calendar."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "List of academic years successfully retrieved",
                    content = @Content(schema = @Schema(implementation = AcademicYearResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @GetMapping("/all")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<AcademicYearResponse>> getAllAcademicYears() {
        return new ResponseEntity<>(academicYearService.listAcademicYears(), HttpStatus.OK);
    }

    @Operation(
            summary = "Activate an academic year",
            description = "Sets a specific academic year as active and automatically deactivates the previously active year. " +
                    "Only administrators can activate academic years. Only one academic year can be active at a time. " +
                    "All semester operations and student enrollments occur within the active academic year."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Academic year successfully activated"
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
                    description = "Not Found - Academic year with the specified ID does not exist"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Activation error"
            )
    })
    @PutMapping("/{id}/activate")
    public ResponseEntity<Void> activateAcademicYear(
            @Parameter(description = "Academic year's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID id) {
        academicYearService.activate(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
