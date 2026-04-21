package git.jogindermikael.University.Management.System.academic.school.service;

import git.jogindermikael.University.Management.System.academic.school.dto.CreateSchoolRequest;
import git.jogindermikael.University.Management.System.academic.school.dto.SchoolResponse;
import git.jogindermikael.University.Management.System.academic.school.dto.UpdateSchoolRequest;
import git.jogindermikael.University.Management.System.academic.school.entity.School;
import git.jogindermikael.University.Management.System.academic.school.repository.SchoolRepository;
import git.jogindermikael.University.Management.System.auth.security.UserPrincipal;
import git.jogindermikael.University.Management.System.user.entity.Role;
import git.jogindermikael.University.Management.System.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SchoolServiceImplementationTest {

    @Mock
    private SchoolRepository schoolRepository;

    @InjectMocks
    private SchoolServiceImplementation schoolService;

    private UUID schoolId;
    private UUID adminId;
    private School testSchool;

    @BeforeEach
    void setUp() {
        schoolId = UUID.randomUUID();
        adminId = UUID.randomUUID();

        testSchool = new School();
        testSchool.setId(schoolId);
        testSchool.setName("Engineering");
        testSchool.setCode("ENG");
        testSchool.setActive(true);

        // setup admin principal
        User admin = new User();
        admin.setId(adminId);
        admin.setEmail("admin@example.com");
        admin.setPassword("pass");
        admin.setRole(Role.ADMIN);
        UserPrincipal principal = new UserPrincipal(admin);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void createSchool_success() {
        CreateSchoolRequest req = new CreateSchoolRequest();
        req.setName("Engineering");
        req.setCode("ENG");
        when(schoolRepository.findByNameIgnoreCase("Engineering")).thenReturn(Optional.empty());
        when(schoolRepository.existsByNameIgnoreCase("Engineering")).thenReturn(false);
        when(schoolRepository.existsByCodeIgnoreCase("ENG")).thenReturn(false);
        when(schoolRepository.save(any(School.class))).thenReturn(testSchool);

        SchoolResponse res = schoolService.createSchool(req);

        assertNotNull(res);
        assertEquals("Engineering", res.getName());
        assertEquals("ENG", res.getCode());
        verify(schoolRepository, times(1)).save(any(School.class));
    }

    @Test
    void createSchool_duplicateName_throws() {
        CreateSchoolRequest req = new CreateSchoolRequest();
        req.setName("Engineering");
        req.setCode("ENG");
        when(schoolRepository.findByNameIgnoreCase("Engineering")).thenReturn(Optional.of(testSchool));

        assertThrows(ResponseStatusException.class, () -> schoolService.createSchool(req));
        verify(schoolRepository, never()).save(any());
    }

    @Test
    void findAllSchools_returnsList() {
        when(schoolRepository.findAll()).thenReturn(List.of(testSchool));

        var res = schoolService.findAllSchools();
        assertNotNull(res);
        assertEquals(1, res.size());
        assertEquals("Engineering", res.getFirst().getName());
    }

    @Test
    void findSchoolById_success() {
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(testSchool));

        SchoolResponse res = schoolService.findSchoolById(schoolId);
        assertNotNull(res);
        assertEquals(schoolId, res.getId());
    }

    @Test
    void findSchoolById_notFound() {
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class, () -> schoolService.findSchoolById(schoolId));
    }

    @Test
    void findSchoolByCode_success() {
        when(schoolRepository.findByCodeIgnoreCase("ENG")).thenReturn(Optional.of(testSchool));
        SchoolResponse res = schoolService.findSchoolByCode("ENG");
        assertEquals("ENG", res.getCode());
    }

    @Test
    void updateSchool_success() {
        UpdateSchoolRequest request = new UpdateSchoolRequest();
        request.setName("Health Sciences");
        request.setCode("HS");

        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(testSchool));
        when(schoolRepository.existsByNameIgnoreCase("Health Sciences")).thenReturn(false);
        when(schoolRepository.existsByCodeIgnoreCase("HS")).thenReturn(false);
        when(schoolRepository.save(any(School.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SchoolResponse response = schoolService.updateSchool(schoolId, request);

        assertEquals("Health Sciences", response.getName());
        assertEquals("HS", response.getCode());
        verify(schoolRepository).save(testSchool);
    }

    @Test
    void deleteSchoolById_success() {
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(testSchool));
        when(schoolRepository.save(any(School.class))).thenReturn(testSchool);

        schoolService.deleteSchoolById(schoolId);

        assertFalse(testSchool.isActive());
        assertNotNull(testSchool.getDeletedAt());
        assertEquals(adminId, testSchool.getDeletedBy());
        verify(schoolRepository, times(1)).save(any(School.class));
    }

    @Test
    void deleteSchoolById_notFound() {
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class, () -> schoolService.deleteSchoolById(schoolId));
    }

    @Test
    void restore_success() {
        testSchool.setActive(false);
        testSchool.setDeletedBy(adminId);
        testSchool.setDeletedAt(Instant.now());
        when(schoolRepository.findDeleted(schoolId)).thenReturn(Optional.of(testSchool));
        when(schoolRepository.save(any(School.class))).thenReturn(testSchool);

        schoolService.restore(schoolId);

        assertTrue(testSchool.isActive());
        assertNull(testSchool.getDeletedBy());
        assertNull(testSchool.getDeletedAt());
        verify(schoolRepository, times(1)).save(any(School.class));
    }

    @Test
    void findAllDeletedSchools_returnsList() {
        testSchool.setActive(false);
        when(schoolRepository.findAllDeleted()).thenReturn(List.of(testSchool));

        var res = schoolService.findAllDeletedSchools();
        assertNotNull(res);
        assertEquals(1, res.size());
    }
}
