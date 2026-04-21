package git.jogindermikael.University.Management.System.academic.controller;

import git.jogindermikael.University.Management.System.academic.school.department.controller.DepartmentController;
import git.jogindermikael.University.Management.System.academic.school.department.dto.CreateDepartmentRequest;
import git.jogindermikael.University.Management.System.academic.school.department.dto.DepartmentResponse;
import git.jogindermikael.University.Management.System.academic.school.department.service.DepartmentService;
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
class DepartmentControllerTest {

    @Mock
    private DepartmentService departmentService;

    @InjectMocks
    private DepartmentController departmentController;

    private UUID schoolId;
    private UUID departmentId;

    @BeforeEach
    void setUp() {
        schoolId = UUID.randomUUID();
        departmentId = UUID.randomUUID();
    }

    @Test
    void addDepartment_returnsCreated() {
        CreateDepartmentRequest request = new CreateDepartmentRequest();
        request.setName("Engineering");
        request.setCode("ENG");

        DepartmentResponse response = DepartmentResponse.builder()
                .id(departmentId)
                .name("Engineering")
                .code("ENG")
                .schoolId(schoolId)
                .build();

        when(departmentService.addDepartment(schoolId, request)).thenReturn(response);

        ResponseEntity<DepartmentResponse> result = departmentController.addDepartment(schoolId, request);

        assertEquals(HttpStatus.CREATED, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(departmentService).addDepartment(schoolId, request);
    }

    @Test
    void getAllDepartments_returnsOk() {
        DepartmentResponse response = DepartmentResponse.builder()
                .id(departmentId)
                .name("Engineering")
                .code("ENG")
                .schoolId(schoolId)
                .build();

        when(departmentService.getAllDepartments(schoolId)).thenReturn(List.of(response));

        ResponseEntity<List<DepartmentResponse>> result = departmentController.getAllDepartments(schoolId);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assert result.getBody() != null;
        assertEquals(1, result.getBody().size());
        verify(departmentService).getAllDepartments(schoolId);
    }

    @Test
    void getDepartment_returnsOk() {
        DepartmentResponse response = DepartmentResponse.builder()
                .id(departmentId)
                .name("Engineering")
                .code("ENG")
                .schoolId(schoolId)
                .build();

        when(departmentService.getDepartmentById(schoolId, departmentId)).thenReturn(response);

        ResponseEntity<DepartmentResponse> result = departmentController.getDepartment(schoolId, departmentId);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(departmentService).getDepartmentById(schoolId, departmentId);
    }

    @Test
    void deleteDepartment_returnsNoContent() {
        ResponseEntity<Void> result = departmentController.deleteDepartment(schoolId, departmentId);

        assertEquals(HttpStatus.NO_CONTENT, result.getStatusCode());
        assertNull(result.getBody());
        verify(departmentService).deleteDepartmentById(schoolId, departmentId);
    }

    @Test
    void restoreDepartment_returnsOk() {
        ResponseEntity<DepartmentResponse> result = departmentController.restoreDepartment(schoolId, departmentId);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertNull(result.getBody());
        verify(departmentService).restoreDepartment(schoolId, departmentId);
    }

    @Test
    void updateDepartment_returnsOk() {
        CreateDepartmentRequest request = new CreateDepartmentRequest();
        request.setName("Engineering");
        request.setCode("ENG");

        DepartmentResponse response = DepartmentResponse.builder()
                .id(departmentId)
                .name("Engineering")
                .code("ENG")
                .schoolId(schoolId)
                .build();

        when(departmentService.updateDepartment(schoolId, departmentId, request)).thenReturn(response);

        ResponseEntity<DepartmentResponse> result = departmentController.updateDepartment(schoolId, departmentId, request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(departmentService).updateDepartment(schoolId, departmentId, request);
    }

    @Test
    void getAllDeleted_returnsOk() {
        DepartmentResponse response = DepartmentResponse.builder()
                .id(departmentId)
                .name("Engineering")
                .code("ENG")
                .schoolId(schoolId)
                .build();

        when(departmentService.getAllDeletedDepartments(schoolId)).thenReturn(List.of(response));

        ResponseEntity<List<DepartmentResponse>> result = departmentController.getAllDeleted(schoolId);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assert result.getBody() != null;
        assertEquals(1, result.getBody().size());
        verify(departmentService).getAllDeletedDepartments(schoolId);
    }
}
