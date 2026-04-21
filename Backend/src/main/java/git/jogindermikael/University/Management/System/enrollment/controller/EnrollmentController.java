package git.jogindermikael.University.Management.System.enrollment.controller;

import git.jogindermikael.University.Management.System.enrollment.dtos.CancelEnrollmentRequest;
import git.jogindermikael.University.Management.System.enrollment.dtos.EnrollStudentRequest;
import git.jogindermikael.University.Management.System.enrollment.dtos.EnrollmentResponse;
import git.jogindermikael.University.Management.System.enrollment.dtos.EnrollStudentResponse;
import git.jogindermikael.University.Management.System.enrollment.dtos.UpdateEnrollmentStatusRequest;
import git.jogindermikael.University.Management.System.enrollment.service.EnrollmentService;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/enrollments")
@RequiredArgsConstructor
@Tag(name = "Student Enrollment", description = "API endpoints for managing student enrollments in courses and programs")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @Operation(
            summary = "Enroll a student in courses",
            description = "Enrolls a new student into the school and their assigned courses. Only administrators can perform enrollments. " +
                    "Creates enrollment records linking the student to courses for the current semester. Student must not already be enrolled in the same course."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Student successfully enrolled",
                    content = @Content(schema = @Schema(implementation = EnrollStudentResponse.class))
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
                    description = "Not Found - Student, course, or semester not found"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflict - Student already enrolled in the course or enrollment limit reached"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database or enrollment service error"
            )
    })
    @PostMapping("/students")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EnrollStudentResponse> createEnrollment(
            @RequestBody @Valid EnrollStudentRequest request
    ) {
        return new ResponseEntity<>(enrollmentService.enrollStudent(request), HttpStatus.OK);
    }

    @Operation(
            summary = "Cancel enrollment",
            description = "Cancels an existing enrollment record. Only administrators can cancel enrollments."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Enrollment successfully cancelled",
                    content = @Content(schema = @Schema(implementation = EnrollmentResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have ADMIN role"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - Enrollment not found"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflict - Enrollment already cancelled"
            )
    })
    @PatchMapping("/{enrollmentId}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EnrollmentResponse> cancelEnrollment(
            @Parameter(description = "Enrollment unique identifier (UUID)", required = true)
            @PathVariable UUID enrollmentId,
            @RequestBody(required = false) CancelEnrollmentRequest request
    ) {
        return new ResponseEntity<>(enrollmentService.cancelEnrollment(enrollmentId, request), HttpStatus.OK);
    }

    @Operation(
            summary = "View all enrollments",
            description = "Returns all enrollment records in the system. Only administrators can view all enrollments."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Enrollments successfully retrieved",
                    content = @Content(schema = @Schema(implementation = EnrollmentResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have ADMIN role"
            )
    })
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EnrollmentResponse>> getAllEnrollments() {
        return new ResponseEntity<>(enrollmentService.getAllEnrollments(), HttpStatus.OK);
    }

    @Operation(
            summary = "Update enrollment status",
            description = "Updates the status of an existing enrollment record. Only administrators can update enrollment status."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Enrollment status successfully updated",
                    content = @Content(schema = @Schema(implementation = EnrollmentResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid status payload"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have ADMIN role"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - Enrollment not found"
            )
    })
    @PatchMapping("/{enrollmentId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EnrollmentResponse> updateEnrollmentStatus(
            @Parameter(description = "Enrollment unique identifier (UUID)", required = true)
            @PathVariable UUID enrollmentId,
            @RequestBody @Valid UpdateEnrollmentStatusRequest request
    ) {
        return new ResponseEntity<>(enrollmentService.updateEnrollmentStatus(enrollmentId, request), HttpStatus.OK);
    }
}
