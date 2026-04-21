package git.jogindermikael.University.Management.System.academic.school.department.service;

import git.jogindermikael.University.Management.System.academic.school.department.dto.CreateDepartmentRequest;
import git.jogindermikael.University.Management.System.academic.school.department.dto.DepartmentResponse;
import git.jogindermikael.University.Management.System.academic.school.department.entity.Department;
import git.jogindermikael.University.Management.System.academic.school.department.repository.DepartmentRepository;
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
class DepartmentServiceImplementationTest {

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private SchoolRepository schoolRepository;

    @InjectMocks
    private DepartmentServiceImplementation departmentService;

    private UUID schoolId;
    private UUID deptId;
    private UUID adminId;
    private Department testDept;
    private School testSchool;

    @BeforeEach
    void setUp() {
        schoolId = UUID.randomUUID();
        deptId = UUID.randomUUID();
        adminId = UUID.randomUUID();

        testSchool = new School();
        testSchool.setId(schoolId);
        testSchool.setName("Engineering");
        testSchool.setCode("ENG");

        testDept = Department.builder()
            .name("Computer Science")
            .code("CS")
            .active(true)
            .school(testSchool)
            .build();
        testDept.setId(deptId);

        User admin = new User();
        admin.setId(adminId);
        admin.setEmail("admin@example.com");
        admin.setRole(Role.ADMIN);
        UserPrincipal principal = new UserPrincipal(admin);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void addDepartment_success() {
        CreateDepartmentRequest req = new CreateDepartmentRequest();
        req.setName("Computer Science");
        req.setCode("CS");

        when(departmentRepository.existsByCodeIgnoreCase("CS")).thenReturn(false);
        when(departmentRepository.existsByNameIgnoreCase("Computer Science")).thenReturn(false);
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(testSchool));
        when(departmentRepository.save(any(Department.class))).thenReturn(testDept);

        DepartmentResponse res = departmentService.addDepartment(schoolId, req);

        assertNotNull(res);
        assertEquals("Computer Science", res.getName());
        assertEquals("CS", res.getCode());
        assertEquals(schoolId, res.getSchoolId());
        verify(departmentRepository, times(1)).save(any(Department.class));
    }

    @Test
    void addDepartment_duplicateCode_throws() {
        CreateDepartmentRequest req = new CreateDepartmentRequest();
        req.setName("Computer Science");
        req.setCode("CS");

        when(departmentRepository.existsByCodeIgnoreCase("CS")).thenReturn(true);

        assertThrows(ResponseStatusException.class, () -> departmentService.addDepartment(schoolId, req));
        verify(departmentRepository, never()).save(any());
    }

    @Test
    void getAllDepartments_returnsList() {
        when(schoolRepository.existsById(schoolId)).thenReturn(true);
        when(departmentRepository.findAllBySchoolId(schoolId)).thenReturn(List.of(testDept));

        var res = departmentService.getAllDepartments(schoolId);
        assertNotNull(res);
        assertEquals(1, res.size());
        assertEquals("Computer Science", res.getFirst().getName());
    }

    @Test
    void getDepartmentById_success() {
        when(schoolRepository.existsById(schoolId)).thenReturn(true);
        when(departmentRepository.findByIdAndSchoolId(deptId, schoolId)).thenReturn(Optional.of(testDept));

        var res = departmentService.getDepartmentById(schoolId, deptId);
        assertNotNull(res);
        assertEquals(deptId, res.getId());
    }

    @Test
    void getDepartmentById_schoolNotFound_throws() {
        when(schoolRepository.existsById(schoolId)).thenReturn(false);
        assertThrows(ResponseStatusException.class, () -> departmentService.getDepartmentById(schoolId, deptId));
    }

    @Test
    void updateDepartment_success() {
        CreateDepartmentRequest req = new CreateDepartmentRequest();
        req.setName("Computer Science Updated");
        req.setCode("CSU");

        when(schoolRepository.existsById(schoolId)).thenReturn(true);
        when(departmentRepository.findByIdAndSchoolId(deptId, schoolId)).thenReturn(Optional.of(testDept));
        when(departmentRepository.save(any(Department.class))).thenAnswer(i -> i.getArgument(0));

        var res = departmentService.updateDepartment(schoolId, deptId, req);
        assertEquals("Computer Science Updated", res.getName());
        assertEquals("CSU", res.getCode());
        verify(departmentRepository, times(1)).save(any(Department.class));
    }

    @Test
    void deleteDepartmentById_success() {
        when(schoolRepository.existsById(schoolId)).thenReturn(true);
        when(departmentRepository.findByIdAndSchoolId(deptId, schoolId)).thenReturn(Optional.of(testDept));
        when(departmentRepository.save(any(Department.class))).thenReturn(testDept);

        departmentService.deleteDepartmentById(schoolId, deptId);

        assertFalse(testDept.isActive());
        assertNotNull(testDept.getDeletedAt());
        assertEquals(adminId, testDept.getDeletedBy());
        verify(departmentRepository, times(1)).save(any(Department.class));
    }

    @Test
    void restoreDepartment_success() {
        testDept.setActive(false);
        testDept.setDeletedAt(Instant.now());
        testDept.setDeletedBy(adminId);

        when(schoolRepository.existsById(schoolId)).thenReturn(true);
        when(departmentRepository.findIncludingDeleted(deptId, schoolId)).thenReturn(Optional.of(testDept));
        when(departmentRepository.save(any(Department.class))).thenReturn(testDept);

        departmentService.restoreDepartment(schoolId, deptId);

        assertTrue(testDept.isActive());
        assertNull(testDept.getDeletedAt());
        assertNull(testDept.getDeletedBy());
        verify(departmentRepository, times(1)).save(any(Department.class));
    }

    @Test
    void getAllDeletedDepartments_returnsList() {
        when(schoolRepository.existsById(schoolId)).thenReturn(true);
        when(departmentRepository.findAllDeleted(schoolId)).thenReturn(List.of(testDept));

        var res = departmentService.getAllDeletedDepartments(schoolId);
        assertNotNull(res);
        assertEquals(1, res.size());
    }
}
