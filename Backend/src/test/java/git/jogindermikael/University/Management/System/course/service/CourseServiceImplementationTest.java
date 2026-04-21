package git.jogindermikael.University.Management.System.course.service;

import git.jogindermikael.University.Management.System.academic.school.entity.School;
import git.jogindermikael.University.Management.System.academic.school.repository.SchoolRepository;
import git.jogindermikael.University.Management.System.academic.school.department.entity.Department;
import git.jogindermikael.University.Management.System.academic.school.department.repository.DepartmentRepository;
import git.jogindermikael.University.Management.System.course.entity.Course;
import git.jogindermikael.University.Management.System.course.repository.CourseRepository;
import git.jogindermikael.University.Management.System.program.repository.ProgramRepository;
import git.jogindermikael.University.Management.System.course.dto.CreateCourseRequest;
import git.jogindermikael.University.Management.System.course.dto.UpdateCourseRequest;
import git.jogindermikael.University.Management.System.user.entity.User;
import git.jogindermikael.University.Management.System.auth.security.UserPrincipal;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseServiceImplementationTest {

    @Mock
    CourseRepository courseRepository;

    @Mock
    ProgramRepository programRepository;

    @Mock
    SchoolRepository schoolRepository;

    @Mock
    DepartmentRepository departmentRepository;

    @InjectMocks
    CourseServiceImplementation courseService;

    @Test
    void getAllCourses_returnsMappedResponses() {
        UUID schoolId = UUID.randomUUID();
        UUID deptId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();

        School school = new School();
        school.setId(schoolId);
        school.setCode("ENG");
        school.setName("Engineering");

        Department department = new Department();
        department.setId(deptId);
        department.setCode("CSE");
        department.setName("Computer Science");

        Course course = new Course();
        course.setId(courseId);
        course.setTitle("Intro");
        course.setCode("CSC101");
        course.setCreditUnits(3);
        course.setSchool(school);
        course.setDepartment(department);

        when(courseRepository.findAll()).thenReturn(List.of(course));

        var responses = courseService.getAllCourses();

        assertEquals(1, responses.size());
        assertEquals(courseId, responses.get(0).id());
        assertEquals("Intro", responses.get(0).title());
        assertEquals("CSC101", responses.get(0).code());
        assertEquals(3, responses.get(0).creditUnits());
    }

    @Test
    void createCourse_success_and_missingDeps() {
        UUID schoolId = UUID.randomUUID();
        UUID deptId = UUID.randomUUID();

        CreateCourseRequest req = new CreateCourseRequest("T", "C", 3, schoolId, deptId);

        School school = new School();
        school.setId(schoolId);
        Department dept = new Department();
        dept.setId(deptId);

        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(departmentRepository.findById(deptId)).thenReturn(Optional.of(dept));

        Course saved = new Course();
        saved.setId(UUID.randomUUID());
        saved.setTitle("T");
        saved.setCode("C");
        saved.setCreditUnits(3);
        saved.setSchool(school);
        saved.setDepartment(dept);

        when(courseRepository.save(any())).thenReturn(saved);

        var resp = courseService.createCourse(req);
        assertEquals(saved.getId(), resp.id());

        // missing school
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.empty());
        var ex = assertThrows(RuntimeException.class, () -> courseService.createCourse(req));
        assertEquals("School not found", ex.getMessage());

        // missing department
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(school));
        when(departmentRepository.findById(deptId)).thenReturn(Optional.empty());
        var ex2 = assertThrows(RuntimeException.class, () -> courseService.createCourse(req));
        assertEquals("Department not found", ex2.getMessage());
    }

    @Test
    void getCourseAndUpdateAndDelete() {
        UUID cid = UUID.randomUUID();
        Course c = new Course();
        c.setId(cid);
        c.setTitle("Orig");
        c.setCreditUnits(2);
        School school = new School();
        school.setId(UUID.randomUUID());
        school.setName("S");
        school.setCode("SC");
        Department dept = new Department();
        dept.setId(UUID.randomUUID());
        dept.setName("D");
        dept.setCode("DC");
        c.setSchool(school);
        c.setDepartment(dept);

        when(courseRepository.findById(cid)).thenReturn(Optional.of(c));

        var resp = courseService.getCourseById(cid);
        assertEquals(cid, resp.id());

        UpdateCourseRequest upd = new UpdateCourseRequest("New", 4);
        when(courseRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        var updated = courseService.updateCourse(cid, upd);
        assertEquals("New", updated.title());

        // deleteCourse - requires SecurityContext; provide a principal
        User admin = User.builder().email("admin@x.com").firstName("A").lastName("B").role(git.jogindermikael.University.Management.System.user.entity.Role.ADMIN).build();
        admin.setId(UUID.randomUUID());
        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(new UserPrincipal(admin));
        SecurityContext sc = mock(SecurityContext.class);
        when(sc.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(sc);

        when(courseRepository.findById(cid)).thenReturn(Optional.of(c));
        when(courseRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        courseService.deleteCourse(cid);
        verify(courseRepository, atLeastOnce()).save(any());
    }

}
