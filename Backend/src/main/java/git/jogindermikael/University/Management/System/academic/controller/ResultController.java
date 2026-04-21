package git.jogindermikael.University.Management.System.academic.controller;

import git.jogindermikael.University.Management.System.academic.TranscriptDTOs.GradeRequest;
import git.jogindermikael.University.Management.System.student.service.ResultService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/results")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
@Tag(name = "Student Results & Grading", description = "API endpoints for managing student grades and results including grading and transcript operations")
public class ResultController {

    private final ResultService resultService;

    @Operation(
            summary = "Update student grade/result",
            description = "Updates a student's grade for a course in the current semester. Only administrators and faculty members can update grades. " +
                    "Grades must be within the valid range (typically 0-100 or letter grades). The operation locks the grade after input."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Grade successfully updated"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid grade value or missing required fields"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have ADMIN or FACULTY role"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - Student, course, or enrollment not found"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflict - Grade already submitted or grading period closed"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database or grading service error"
            )
    })
    @PutMapping("/grade")
    public ResponseEntity<Void> updateResult(@RequestBody GradeRequest request)
    {
        resultService.grade(request);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
