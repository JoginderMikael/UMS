package git.jogindermikael.University.Management.System.academic.controller;

import git.jogindermikael.University.Management.System.program.dto.AddProgramCourseRequest;
import git.jogindermikael.University.Management.System.program.controller.ProgramController;
import git.jogindermikael.University.Management.System.program.dto.CreateProgramRequest;
import git.jogindermikael.University.Management.System.program.dto.ProgramCourseResponse;
import git.jogindermikael.University.Management.System.program.dto.ProgramMinimalResponse;
import git.jogindermikael.University.Management.System.program.dto.ProgramResponse;
import git.jogindermikael.University.Management.System.program.dto.UpdateProgramRequest;
import git.jogindermikael.University.Management.System.program.entity.ProgramCourseType;
import git.jogindermikael.University.Management.System.program.service.ProgramService;
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
class ProgramControllerTest {

    @Mock
    private ProgramService programService;

    @InjectMocks
    private ProgramController programController;

    private UUID programId;
    private UUID schoolId;
    private UUID departmentId;
    private UUID courseId;

    @BeforeEach
    void setUp() {
        programId = UUID.randomUUID();
        schoolId = UUID.randomUUID();
        departmentId = UUID.randomUUID();
        courseId = UUID.randomUUID();
    }

    @Test
    void createProgram_returnsOk() {
        CreateProgramRequest request = new CreateProgramRequest("Computer Science", "CS", schoolId, departmentId);
        ProgramResponse response = new ProgramResponse(programId, "Computer Science", "CS", schoolId, "ENG",
                "Engineering", departmentId, "CSE", "Computer Science");

        when(programService.addProgram(request)).thenReturn(response);

        ResponseEntity<ProgramResponse> result = programController.createProgram(request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(programService).addProgram(request);
    }

    @Test
    void getProgram_returnsOk() {
        ProgramResponse response = new ProgramResponse(programId, "Computer Science", "CS", schoolId, "ENG",
                "Engineering", departmentId, "CSE", "Computer Science");

        when(programService.getProgramById(programId)).thenReturn(response);

        ResponseEntity<ProgramResponse> result = programController.getProgram(programId);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(programService).getProgramById(programId);
    }

    @Test
    void getAllPrograms_returnsOk() {
        ProgramMinimalResponse response = new ProgramMinimalResponse(programId, schoolId, departmentId);

        when(programService.getAllPrograms()).thenReturn(List.of(response));

        ResponseEntity<List<ProgramMinimalResponse>> result = programController.getAllPrograms();

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(1, result.getBody().size());
        verify(programService).getAllPrograms();
    }

    @Test
    void bySchool_returnsOk() {
        ProgramResponse response = new ProgramResponse(programId, "Computer Science", "CS", schoolId, "ENG",
                "Engineering", departmentId, "CSE", "Computer Science");

        when(programService.getAllProgramsBySchool(schoolId)).thenReturn(List.of(response));

        ResponseEntity<List<ProgramResponse>> result = programController.bySchool(schoolId);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(1, result.getBody().size());
        verify(programService).getAllProgramsBySchool(schoolId);
    }

    @Test
    void byDepartment_returnsOk() {
        ProgramResponse response = new ProgramResponse(programId, "Computer Science", "CS", schoolId, "ENG",
                "Engineering", departmentId, "CSE", "Computer Science");

        when(programService.getAllProgramsByDepartment(departmentId)).thenReturn(List.of(response));

        ResponseEntity<List<ProgramResponse>> result = programController.byDepartment(departmentId);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(1, result.getBody().size());
        verify(programService).getAllProgramsByDepartment(departmentId);
    }

    @Test
    void updateProgram_returnsOk() {
        UpdateProgramRequest request = new UpdateProgramRequest("Computer Science", "CS");
        ProgramResponse response = new ProgramResponse(programId, "Computer Science", "CS", schoolId, "ENG",
                "Engineering", departmentId, "CSE", "Computer Science");

        when(programService.updateProgram(programId, request)).thenReturn(response);

        ResponseEntity<ProgramResponse> result = programController.updateProgram(programId, request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(programService).updateProgram(programId, request);
    }

    @Test
    void deleteProgram_returnsOk() {
        ProgramResponse response = new ProgramResponse(programId, "Computer Science", "CS", schoolId, "ENG",
                "Engineering", departmentId, "CSE", "Computer Science");

        when(programService.deleteProgram(programId)).thenReturn(response);

        ResponseEntity<ProgramResponse> result = programController.deleteProgram(programId);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(programService).deleteProgram(programId);
    }

    @Test
    void addCourse_returnsOk() {
        AddProgramCourseRequest request = new AddProgramCourseRequest(ProgramCourseType.CORE, 1);
        ProgramCourseResponse response = new ProgramCourseResponse(courseId, "Intro", "CSC101", 3, ProgramCourseType.CORE, 1);

        when(programService.addCourse(programId, courseId, request)).thenReturn(response);

        ResponseEntity<ProgramCourseResponse> result = programController.addCourse(programId, courseId, request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(programService).addCourse(programId, courseId, request);
    }

    @Test
    void deleteCourse_returnsOk() {
        ResponseEntity<Void> result = programController.deleteCourse(programId, courseId);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertNull(result.getBody());
        verify(programService).removeCourse(programId, courseId);
    }

    @Test
    void updateProgramCourse_returnsOk() {
        AddProgramCourseRequest request = new AddProgramCourseRequest(ProgramCourseType.ELECTIVE, 3);
        ProgramCourseResponse response = new ProgramCourseResponse(courseId, "Intro", "CSC101", 3, ProgramCourseType.ELECTIVE, 3);

        when(programService.updateProgramCourse(programId, courseId, request)).thenReturn(response);

        ResponseEntity<ProgramCourseResponse> result = programController.updateProgramCourse(programId, courseId, request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(programService).updateProgramCourse(programId, courseId, request);
    }

    @Test
    void getAllCourse_returnsOk() {
        ProgramCourseResponse courseResponse = new ProgramCourseResponse(courseId, "Intro", "CSC101", 3, ProgramCourseType.ELECTIVE, 2);

        when(programService.getAllProgramCourses(programId)).thenReturn(List.of(courseResponse));

        ResponseEntity<List<ProgramCourseResponse>> result = programController.getAllCourse(programId);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(1, result.getBody().size());
        verify(programService).getAllProgramCourses(programId);
    }
}
