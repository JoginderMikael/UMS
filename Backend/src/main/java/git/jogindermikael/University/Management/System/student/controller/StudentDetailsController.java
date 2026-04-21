package git.jogindermikael.University.Management.System.student.controller;

import git.jogindermikael.University.Management.System.student.dto.UpdateStudentDetailsRequest;
import git.jogindermikael.University.Management.System.student.dto.UpdateStudentDetailsResponse;
import git.jogindermikael.University.Management.System.student.service.StudentDetailsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')") // Allow both ADMIN and FACULTY roles to access student details
@Tag(name = "Student Details", description = "API endpoint for administrators to update student personal and academic profile details")
public class StudentDetailsController {

    private final StudentDetailsService studentDetailsService;

    @Operation(
            summary = "Get student details by registration number",
            description = "Returns a student's profile details using the registration number. Only administrators can perform this operation."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Student details successfully retrieved",
                    content = @Content(schema = @Schema(implementation = UpdateStudentDetailsResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid registration number format"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - Missing or invalid authentication token"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User is not an administrator"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - Student not found"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Unexpected error while retrieving details"
            )
    })
    @GetMapping("/registration/{registrationNumber}/details")
    public ResponseEntity<UpdateStudentDetailsResponse> getStudentDetailsByRegistrationNumber(
            @Parameter(description = "Student registration number", example = "2026-CS-0001", required = true)
            @PathVariable String registrationNumber
    ) {
        return ResponseEntity.ok(studentDetailsService.getStudentDetailsByRegistrationNumber(registrationNumber));
    }

    @Operation(
            summary = "Get student details by registration number (query)",
            description = "Returns a student's profile details using registration number provided as query parameter. " +
                    "Use this endpoint when registration numbers contain slashes."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Student details successfully retrieved",
                    content = @Content(schema = @Schema(implementation = UpdateStudentDetailsResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid registration number format"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - Missing or invalid authentication token"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User is not an administrator"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - Student not found"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Unexpected error while retrieving details"
            )
    })
    @GetMapping("/registration/details")
    public ResponseEntity<UpdateStudentDetailsResponse> getStudentDetailsByRegistrationNumberQuery(
            @Parameter(description = "Student registration number. Supports values with '/'.", example = "001/CS/00002/2026", required = true)
            @RequestParam String registrationNumber
    ) {
        return ResponseEntity.ok(studentDetailsService.getStudentDetailsByRegistrationNumber(registrationNumber));
    }

    @Operation(
            summary = "Update student details",
            description = "Updates a specific student's details using the provided payload. " +
                    "This includes names, email, national ID, secondary school information, and selected school/program. " +
                    "Only administrators can perform this operation. Returns the fully updated student details after successful update."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Student details successfully updated",
                    content = @Content(schema = @Schema(implementation = UpdateStudentDetailsResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid payload, invalid UUID format, or duplicate email"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - Missing or invalid authentication token"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User is not an administrator"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - Student, user profile, school, or program not found"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Unexpected error during update"
            )
    })
    @PutMapping("/{studentId}/details")
    public ResponseEntity<UpdateStudentDetailsResponse> updateStudentDetails(
            @Parameter(description = "Student unique identifier (UUID)", example = "8f1712ac-7161-4c36-948e-40842eeb43f4", required = true)
            @PathVariable UUID studentId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    description = "Student details payload from frontend",
                    content = @Content(schema = @Schema(implementation = UpdateStudentDetailsRequest.class))
            )
            @Valid @RequestBody UpdateStudentDetailsRequest request
    ) {
        return ResponseEntity.ok(studentDetailsService.updateStudentDetails(studentId, request));
    }
}
