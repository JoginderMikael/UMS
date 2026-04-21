package git.jogindermikael.University.Management.System.student.controller;

import git.jogindermikael.University.Management.System.academic.TranscriptDTOs.TranscriptResponse;
import git.jogindermikael.University.Management.System.student.dto.BulkCourseRegistrationRequest;
import git.jogindermikael.University.Management.System.student.dto.StudentExamRegistrationStatusResponse;
import git.jogindermikael.University.Management.System.student.dto.StudentRegisteredCourseResponse;
import git.jogindermikael.University.Management.System.student.service.ExamRegistrationService;
import git.jogindermikael.University.Management.System.student.service.StudentCourseService;
import git.jogindermikael.University.Management.System.student.service.StudentSemesterService;
import git.jogindermikael.University.Management.System.student.service.TranscriptService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
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
@RequestMapping("/api/v1/students/me")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN', 'FACULTY')") // Allow students, admins, and faculty to access these endpoints for viewing purposes; only students can modify their own data
@RequiredArgsConstructor
@Tag(name = "Student Self-Service", description = "API endpoints for students to manage their own course enrollments, exam registrations, and transcript viewing")
public class StudentSelfController {

    private final StudentSemesterService semesterService;
    private final StudentCourseService courseService;
    private final ExamRegistrationService examService;
    private final TranscriptService transcriptService;


    @Operation(
            summary = "Enroll student in current semester",
            description = "Enrolls the authenticated student in the currently active semester. This action registers the student for the semester's courses and activities. " +
                    "The student can only be enrolled once per semester. Enrollment must occur before course registration."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Student successfully enrolled in the semester"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid UUID format for studentId"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have STUDENT role or insufficient permissions"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - Student or active semester not found"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflict - Student already enrolled in this semester"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Enrollment service error"
            )
    })
    @PostMapping("/semesters/enroll/{studentId}")
    public ResponseEntity<Void> enroll(
            @Parameter(description = "Student's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID studentId){
        semesterService.enrollToSemester(studentId);
        return ResponseEntity.ok().build();
    }


    @Operation(
            summary = "Register student for a course",
            description = "Registers the authenticated student in a specific course for the current semester. Student must be enrolled in the semester first. " +
                    "Course registration enables the student to attend classes and complete coursework. A student can only register for each course once per semester."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Student successfully registered for the course"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid UUID format for studentId or courseId"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have STUDENT role or cannot register for this course"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - Student or course not found"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflict - Student already registered for course or prerequisite requirements not met"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Course registration service error"
            )
    })
    @PostMapping("/courses/{studentId}/{courseId}")
    public ResponseEntity<Void> registerCourse(
            @Parameter(description = "Student's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID studentId,
            @Parameter(description = "Course's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440001", required = true)
            @PathVariable UUID courseId){
        courseService.registerCourse(studentId, courseId);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Register student for multiple courses",
            description = "Registers the authenticated student in multiple courses for the current semester in a single request. " +
                    "Student must be enrolled in the semester first. Each course can only be registered once per semester. " +
                    "If any course is not found or already registered, the request fails.",
            requestBody = @RequestBody(
                    required = true,
                    content = @Content(schema = @Schema(implementation = BulkCourseRegistrationRequest.class))
            )
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Student successfully registered for all requested courses"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid UUIDs, duplicate course IDs, or empty course list"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have STUDENT role or cannot register for these courses"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - Student, course, or active semester not found"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflict - Student already registered for one or more courses"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Course registration service error"
            )
    })
    @PostMapping("/courses/bulk")
    public ResponseEntity<Void> registerCourses(
            @org.springframework.web.bind.annotation.RequestBody @Valid BulkCourseRegistrationRequest request
    ) {
        courseService.registerCourses(request.studentId(), request.courseIds());
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Retrieve all registered courses",
            description = "Fetches a complete list of all courses the authenticated student is registered for in the current semester. " +
                    "Returns course details including code, title, credits, and instructor information. Useful for viewing course schedule and syllabus."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "List of student courses successfully retrieved",
                    content = @Content(schema = @Schema(implementation = StudentRegisteredCourseResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid UUID format for studentId"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have STUDENT role"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - Student not found"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @GetMapping("/courses/{studentId}")
    public ResponseEntity<List<StudentRegisteredCourseResponse>> getAllCourses(
            @Parameter(description = "Student's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID studentId){
        return new ResponseEntity<>(courseService.getMyCourses(studentId), HttpStatus.OK);
    }

    @Operation(
            summary = "Get exam registration status for registered courses",
            description = "Returns whether each course is registered for exams in the student's active semester. " +
                    "If courseIds are provided, status is returned for those specific course IDs; " +
                    "if omitted, status is returned for all courses registered by the student in the active semester."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Exam registration statuses successfully retrieved",
                    content = @Content(schema = @Schema(implementation = StudentExamRegistrationStatusResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid UUID format for studentId or courseIds"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have STUDENT role"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - Student not found"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Database error"
            )
    })
    @GetMapping("/courses/{studentId}/exam-status")
    public ResponseEntity<List<StudentExamRegistrationStatusResponse>> getExamRegistrationStatus(
            @Parameter(description = "Student's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID studentId,
            @Parameter(description = "Optional list of course UUIDs to check. If omitted, all registered courses are returned.")
            @RequestParam(required = false) List<UUID> courseIds
    ) {
        return new ResponseEntity<>(courseService.getExamRegistrationStatus(studentId, courseIds), HttpStatus.OK);
    }

    @Operation(
            summary = "Register student for course exam",
            description = "Registers the authenticated student to sit for the exam of a specific course. Student must be registered for the course first. " +
                    "Exam registration confirms the student's intent to take the exam and generates exam hall/room assignments. " +
                    "Registration must occur before the exam registration deadline."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Student successfully registered for the exam"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid UUID format for studentId or courseId"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have STUDENT role or cannot register for this exam"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - Student or course not found"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflict - Student already registered for exam or registration deadline passed"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Exam registration service error"
            )
    })
    @PostMapping("/courses/{studentId}/{courseId}/exam")
    public ResponseEntity<Void> registerExam(
            @Parameter(description = "Student's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID studentId,
            @Parameter(description = "Course's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440001", required = true)
            @PathVariable UUID courseId){
        examService.registerForExam(studentId, courseId);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Generate and retrieve student transcript",
            description = "Generates and returns the authenticated student's academic transcript showing all completed courses, grades, and GPA. " +
                    "The transcript includes course codes, titles, credits, grades, and semester information. This official document can be used for transfers or employment."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Student transcript successfully generated and retrieved",
                    content = @Content(schema = @Schema(implementation = TranscriptResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request - Invalid UUID format for studentId"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have STUDENT role"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not Found - Student not found or no transcript data available"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error - Transcript generation error"
            )
    })
    @GetMapping("/{studentId}/transcript")
    public ResponseEntity <List<TranscriptResponse>> getTranscripts(
            @Parameter(description = "Student's unique identifier (UUID)", example = "550e8400-e29b-41d4-a716-446655440000", required = true)
            @PathVariable UUID studentId){
        return new ResponseEntity<>(transcriptService.generate(studentId), HttpStatus.OK);
    }

}
