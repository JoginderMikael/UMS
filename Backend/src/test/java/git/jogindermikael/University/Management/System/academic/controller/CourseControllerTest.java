package git.jogindermikael.University.Management.System.academic.controller;

import git.jogindermikael.University.Management.System.course.controller.CourseController;
import git.jogindermikael.University.Management.System.course.dto.CourseResponse;
import git.jogindermikael.University.Management.System.course.dto.CreateCourseRequest;
import git.jogindermikael.University.Management.System.course.dto.UpdateCourseRequest;
import git.jogindermikael.University.Management.System.course.service.CourseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CourseControllerTest {

    @Mock
    private CourseService courseService;

    @InjectMocks
    private CourseController courseController;

    private UUID courseId;
    private UUID schoolId;
    private UUID departmentId;
    private UUID programId;

    @BeforeEach
    void setUp() {
        courseId = UUID.randomUUID();
        schoolId = UUID.randomUUID();
        departmentId = UUID.randomUUID();
        programId = UUID.randomUUID();
    }

    @Test
    void addCourse_returnsCreated() {
        CreateCourseRequest request = new CreateCourseRequest("Intro", "CSC101", 3, schoolId, departmentId);
        CourseResponse response = new CourseResponse(courseId, "Intro", "CSC101", 3, schoolId, "ENG", "Engineering",
                departmentId, "CSE", "Computer Science");

        when(courseService.createCourse(request)).thenReturn(response);

        ResponseEntity<CourseResponse> result = courseController.addCourse(request);

        assertEquals(HttpStatus.CREATED, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(courseService).createCourse(request);
    }

    @Test
    void getCourse_returnsOk() {
        CourseResponse response = new CourseResponse(courseId, "Intro", "CSC101", 3, schoolId, "ENG", "Engineering",
                departmentId, "CSE", "Computer Science");

        when(courseService.getCourseById(courseId)).thenReturn(response);

        ResponseEntity<CourseResponse> result = courseController.getCourse(courseId);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(courseService).getCourseById(courseId);
    }

    @Test
    void getAllCoursesInUniversity_returnsOk() {
        CourseResponse response = new CourseResponse(courseId, "Intro", "CSC101", 3, schoolId, "ENG", "Engineering",
                departmentId, "CSE", "Computer Science");

        when(courseService.getAllCourses()).thenReturn(List.of(response));

        ResponseEntity<List<CourseResponse>> result = courseController.getAllCoursesInUniversity();

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assert result.getBody() != null;
        assertEquals(1, result.getBody().size());
        verify(courseService).getAllCourses();
    }

    @Test
    void getAllCoursesBySchool_returnsOk() {
        CourseResponse response = new CourseResponse(courseId, "Intro", "CSC101", 3, schoolId, "ENG", "Engineering",
                departmentId, "CSE", "Computer Science");

        when(courseService.getCoursesBySchool(schoolId)).thenReturn(List.of(response));

        ResponseEntity<List<CourseResponse>> result = courseController.getAllCoursesBySchool(schoolId);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assert result.getBody() != null;
        assertEquals(1, result.getBody().size());
        verify(courseService).getCoursesBySchool(schoolId);
    }

    @Test
    void getAllCoursesByDepartment_returnsOk() {
        CourseResponse response = new CourseResponse(courseId, "Intro", "CSC101", 3, schoolId, "ENG", "Engineering",
                departmentId, "CSE", "Computer Science");

        when(courseService.getCoursesByDepartment(departmentId)).thenReturn(List.of(response));

        ResponseEntity<List<CourseResponse>> result = courseController.getAllCoursesByDepartment(departmentId);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assert result.getBody() != null;
        assertEquals(1, result.getBody().size());
        verify(courseService).getCoursesByDepartment(departmentId);
    }

    @Test
    void getAllCoursesByProgram_returnsOk() {
        CourseResponse response = new CourseResponse(courseId, "Intro", "CSC101", 3, schoolId, "ENG", "Engineering",
                departmentId, "CSE", "Computer Science");

        when(courseService.getCoursesByProgram(programId)).thenReturn(List.of(response));

        ResponseEntity<List<CourseResponse>> result = courseController.getAllCoursesByProgram(programId);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assert result.getBody() != null;
        assertEquals(1, result.getBody().size());
        verify(courseService).getCoursesByProgram(programId);
    }

    @Test
    void updateCourse_returnsOk() {
        UpdateCourseRequest request = new UpdateCourseRequest("Intro", 3);
        CourseResponse response = new CourseResponse(courseId, "Intro", "CSC101", 3, schoolId, "ENG", "Engineering",
                departmentId, "CSE", "Computer Science");

        when(courseService.updateCourse(courseId, request)).thenReturn(response);

        ResponseEntity<CourseResponse> result = courseController.updateCourse(courseId, request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(courseService).updateCourse(courseId, request);
    }

    @Test
    void deleteCourse_returnsOk() {
        ResponseEntity<Void> result = courseController.deleteCourse(courseId);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertNull(result.getBody());
        verify(courseService).deleteCourse(courseId);
    }
}
