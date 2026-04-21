package git.jogindermikael.University.Management.System.course.controller;


import git.jogindermikael.University.Management.System.course.dto.CourseResponse;
import git.jogindermikael.University.Management.System.course.service.CourseService;
import git.jogindermikael.University.Management.System.course.dto.CreateCourseRequest;
import git.jogindermikael.University.Management.System.course.dto.UpdateCourseRequest;
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
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
@Tag(name = "Course Management", description = "API endpoints for managing courses including creation, retrieval, update, and deletion operations")
public class CourseController {

    private final CourseService courseService;


    @Operation(
            summary = "Create a new course",
            description = "Creates a new course in the system with course details including code, title, credits, and description. " +
                    "Only administrators and faculty members can create courses. Course code must be unique."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Course successfully created",
                    content = @Content(schema = @Schema(implementation = CourseResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid input data or missing required fields"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have ADMIN or FACULTY role"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflict - Course code already exists in the system"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error while creating course"
            )
    })
    @PostMapping("/add")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity <CourseResponse> addCourse(
            @RequestBody @Valid CreateCourseRequest createCourseRequest) {
        return new ResponseEntity<>(courseService.createCourse(createCourseRequest), HttpStatus.CREATED);
    }

    @Operation(
            summary = "Retrieve all courses offered in the university",
            description = "Fetches a complete list of all courses offered in the university. " +
                    "Returns each course with name, code, school, department, and credit units. Accessible to all authenticated users."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "List of all university courses successfully retrieved",
                    content = @Content(schema = @Schema(implementation = CourseResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @GetMapping("/university/all")
    public ResponseEntity<List<CourseResponse>> getAllCoursesInUniversity() {
        return new ResponseEntity<>(courseService.getAllCourses(), HttpStatus.OK);
    }

    @Operation(
            summary = "Retrieve course by ID",
            description = "Fetches a specific course's details using its unique UUID identifier. Returns complete course information including code, title, credits, and description. " +
                    "Accessible to all authenticated users."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Course found and returned successfully",
                    content = @Content(schema = @Schema(implementation = CourseResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid UUID format"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - Course with the specified ID does not exist"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getCourse(
            @Parameter(description = "Course's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID id) {
        return new ResponseEntity<>(courseService.getCourseById(id), HttpStatus.OK);
    }

    @Operation(
            summary = "Retrieve all courses offered by a school",
            description = "Fetches a complete list of all courses offered within a specific school identified by schoolId. " +
                    "Returns all active courses with their details. Accessible to all authenticated users."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "List of courses successfully retrieved",
                    content = @Content(schema = @Schema(implementation = CourseResponse.class))
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
    public ResponseEntity<List<CourseResponse>> getAllCoursesBySchool(
            @Parameter(description = "School's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID schoolId) {
        return new ResponseEntity<>(courseService.getCoursesBySchool(schoolId), HttpStatus.OK);
    }

    @Operation(
            summary = "Retrieve all courses offered by a department",
            description = "Fetches a complete list of all courses offered within a specific department identified by departmentId. " +
                    "Returns courses managed by the department with full details. Accessible to all authenticated users."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "List of courses successfully retrieved",
                    content = @Content(schema = @Schema(implementation = CourseResponse.class))
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
    public ResponseEntity<List<CourseResponse>> getAllCoursesByDepartment(
            @Parameter(description = "Department's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID departmentId) {
        return new ResponseEntity<>(courseService.getCoursesByDepartment(departmentId), HttpStatus.OK);
    }

    @Operation(
            summary = "Retrieve all courses offered in a program",
            description = "Fetches a complete list of all courses that are part of a specific program's curriculum identified by programId. " +
                    "Returns all courses required or elective for the program. Accessible to all authenticated users."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "List of program courses successfully retrieved",
                    content = @Content(schema = @Schema(implementation = CourseResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid UUID format for programId"
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
    @GetMapping("/programs/{programId}")
    public ResponseEntity<List<CourseResponse>> getAllCoursesByProgram(
            @Parameter(description = "Program's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID programId) {
        return new ResponseEntity<>(courseService.getCoursesByProgram(programId), HttpStatus.OK);
    }

    @Operation(
            summary = "Update course details",
            description = "Updates an existing course's information including code, title, credits, and description. " +
                    "Only administrators and faculty members can update courses. Course code uniqueness must be maintained if changed."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Course successfully updated",
                    content = @Content(schema = @Schema(implementation = CourseResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid input data or missing required fields"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have ADMIN or FACULTY role"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - Course with the specified ID does not exist"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflict - Course code already in use by another course"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<CourseResponse> updateCourse(
            @Parameter(description = "Course's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID id,
            @RequestBody UpdateCourseRequest request) {
        return new ResponseEntity<>(courseService.updateCourse(id, request), HttpStatus.OK);
    }
    @Operation(
            summary = "Delete a course",
            description = "Performs a soft delete on a course, removing it from availability without permanently deleting database records. " +
                    "Only administrators and faculty members can delete courses. Deleted courses can potentially be restored by administrators."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Course successfully deleted (soft delete)"
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
                    description = "Not Found - Course with the specified ID does not exist"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<Void> deleteCourse(
            @Parameter(description = "Course's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID id) {
        courseService.deleteCourse(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
