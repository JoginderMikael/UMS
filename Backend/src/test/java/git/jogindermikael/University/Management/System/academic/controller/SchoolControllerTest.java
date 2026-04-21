package git.jogindermikael.University.Management.System.academic.controller;

import git.jogindermikael.University.Management.System.academic.school.controller.SchoolController;
import git.jogindermikael.University.Management.System.academic.school.dto.CreateSchoolRequest;
import git.jogindermikael.University.Management.System.academic.school.dto.SchoolResponse;
import git.jogindermikael.University.Management.System.academic.school.dto.UpdateSchoolRequest;
import git.jogindermikael.University.Management.System.academic.school.service.SchoolService;
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
class SchoolControllerTest {

    @Mock
    private SchoolService schoolService;

    @InjectMocks
    private SchoolController schoolController;

    private UUID schoolId;

    @BeforeEach
    void setUp() {
        schoolId = UUID.randomUUID();
    }

    @Test
    void addSchool_returnsOk() {
        CreateSchoolRequest request = new CreateSchoolRequest();
        request.setName("Engineering");
        request.setCode("ENG");

        SchoolResponse response = SchoolResponse.builder()
                .id(schoolId)
                .name("Engineering")
                .code("ENG")
                .build();

        when(schoolService.createSchool(request)).thenReturn(response);

        ResponseEntity<SchoolResponse> result = schoolController.addSchool(request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(schoolService).createSchool(request);
    }

    @Test
    void getAllSchools_returnsOk() {
        SchoolResponse response = SchoolResponse.builder()
                .id(schoolId)
                .name("Engineering")
                .code("ENG")
                .build();

        when(schoolService.findAllSchools()).thenReturn(List.of(response));

        ResponseEntity<List<SchoolResponse>> result = schoolController.getAllSchools();

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(1, result.getBody().size());
        verify(schoolService).findAllSchools();
    }

    @Test
    void getSchoolByCode_returnsOk() {
        String code = "ENG";
        SchoolResponse response = SchoolResponse.builder()
                .id(schoolId)
                .name("Engineering")
                .code(code)
                .build();

        when(schoolService.findSchoolByCode(code)).thenReturn(response);

        ResponseEntity<SchoolResponse> result = schoolController.getSchoolByCode(code);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(schoolService).findSchoolByCode(code);
    }

    @Test
    void getSchoolById_returnsOk() {
        SchoolResponse response = SchoolResponse.builder()
                .id(schoolId)
                .name("Engineering")
                .code("ENG")
                .build();

        when(schoolService.findSchoolById(schoolId)).thenReturn(response);

        ResponseEntity<SchoolResponse> result = schoolController.getSchoolById(schoolId);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(schoolService).findSchoolById(schoolId);
    }

    @Test
    void deleteSchoolById_returnsOk() {
        ResponseEntity<Void> result = schoolController.deleteSchoolById(schoolId);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertNull(result.getBody());
        verify(schoolService).deleteSchoolById(schoolId);
    }

    @Test
    void restoreSchoolById_returnsOk() {
        SchoolResponse response = SchoolResponse.builder()
                .id(schoolId)
                .name("Engineering")
                .code("ENG")
                .build();

        when(schoolService.findSchoolById(schoolId)).thenReturn(response);

        ResponseEntity<SchoolResponse> result = schoolController.restoreSchoolById(schoolId);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(schoolService).restore(schoolId);
        verify(schoolService).findSchoolById(schoolId);
    }

    @Test
    void updateSchoolById_returnsOk() {
        UpdateSchoolRequest request = new UpdateSchoolRequest();
        request.setName("Health Sciences");
        request.setCode("HS");

        SchoolResponse response = SchoolResponse.builder()
                .id(schoolId)
                .name("Health Sciences")
                .code("HS")
                .build();

        when(schoolService.updateSchool(schoolId, request)).thenReturn(response);

        ResponseEntity<SchoolResponse> result = schoolController.updateSchoolById(schoolId, request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertSame(response, result.getBody());
        verify(schoolService).updateSchool(schoolId, request);
    }

    @Test
    void deleteAllSchools_returnsOk() {
        SchoolResponse response = SchoolResponse.builder()
                .id(schoolId)
                .name("Engineering")
                .code("ENG")
                .build();

        when(schoolService.findAllDeletedSchools()).thenReturn(List.of(response));

        ResponseEntity<List<SchoolResponse>> result = schoolController.deleteAllSchools();

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assert result.getBody() != null;
        assertEquals(1, result.getBody().size());
        verify(schoolService).findAllDeletedSchools();
    }
}
