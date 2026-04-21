package git.jogindermikael.University.Management.System.program.service;

import git.jogindermikael.University.Management.System.academic.school.department.entity.Department;
import git.jogindermikael.University.Management.System.academic.school.department.repository.DepartmentRepository;
import git.jogindermikael.University.Management.System.academic.school.entity.School;
import git.jogindermikael.University.Management.System.academic.school.repository.SchoolRepository;
import git.jogindermikael.University.Management.System.auth.security.UserPrincipal;
import git.jogindermikael.University.Management.System.course.entity.Course;
import git.jogindermikael.University.Management.System.course.repository.CourseRepository;
import git.jogindermikael.University.Management.System.program.dto.AddProgramCourseRequest;
import git.jogindermikael.University.Management.System.program.dto.ProgramCourseResponse;
import git.jogindermikael.University.Management.System.user.entity.Role;
import git.jogindermikael.University.Management.System.user.entity.User;
import git.jogindermikael.University.Management.System.program.dto.CreateProgramRequest;
import git.jogindermikael.University.Management.System.program.dto.ProgramResponse;
import git.jogindermikael.University.Management.System.program.dto.UpdateProgramRequest;
import git.jogindermikael.University.Management.System.program.entity.ProgramCourse;
import git.jogindermikael.University.Management.System.program.entity.ProgramCourseId;
import git.jogindermikael.University.Management.System.program.entity.ProgramCourseType;
import git.jogindermikael.University.Management.System.program.repository.ProgramCourseRepository;
import git.jogindermikael.University.Management.System.program.entity.Program;
import git.jogindermikael.University.Management.System.program.repository.ProgramRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProgramServiceImplementationTest {

    @Mock
    private ProgramRepository programRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private ProgramCourseRepository programCourseRepository;

    @Mock
    private SchoolRepository schoolRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @InjectMocks
    private ProgramServiceImplementation programService;

    private UUID programId;
    private UUID schoolId;
    private UUID departmentId;
    private UUID courseId;
    private UUID userId;
    private Program testProgram;
    private School testSchool;
    private Department testDepartment;
    private Course testCourse;

    @BeforeEach
    void setUp() {
        programId = UUID.randomUUID();
        schoolId = UUID.randomUUID();
        departmentId = UUID.randomUUID();
        courseId = UUID.randomUUID();
        userId = UUID.randomUUID();

        testSchool = new School();
        testSchool.setId(schoolId);
        testSchool.setName("Engineering School");
        testSchool.setCode("ENG");

        testDepartment = new Department();
        testDepartment.setId(departmentId);
        testDepartment.setName("Computer Science");
        testDepartment.setCode("CS");

        testProgram = new Program();
        testProgram.setId(programId);
        testProgram.setName("Bachelor of Science in Computer Science");
        testProgram.setCode("BSCS");
        testProgram.setSchool(testSchool);
        testProgram.setDepartment(testDepartment);
        testProgram.setActive(true);

        testCourse = new Course();
        testCourse.setId(courseId);
        testCourse.setTitle("Data Structures");
        testCourse.setCode("CS101");
        testCourse.setCreditUnits(3);
        testCourse.setSchool(testSchool);
        testCourse.setDepartment(testDepartment);

        // Create and set up UserPrincipal for security context
        User mockUser = new User();
        mockUser.setId(userId);
        mockUser.setEmail("test@example.com");
        mockUser.setPassword("password");
        mockUser.setRole(Role.ADMIN);
        UserPrincipal userPrincipal = new UserPrincipal(mockUser);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void addProgram_success() {
        // Arrange
        CreateProgramRequest request = new CreateProgramRequest("Bachelor of Science in Computer Science", "BSCS", schoolId, departmentId);
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(testSchool));
        when(departmentRepository.findById(departmentId)).thenReturn(Optional.of(testDepartment));
        when(programRepository.save(any(Program.class))).thenReturn(testProgram);

        // Act
        ProgramResponse response = programService.addProgram(request);

        // Assert
        assertNotNull(response);
        assertEquals("Bachelor of Science in Computer Science", response.name());
        assertEquals("BSCS", response.code());
        assertEquals(schoolId, response.schoolId());
        assertEquals(departmentId, response.departmentId());
        verify(programRepository, times(1)).save(any(Program.class));
    }

    @Test
    void addProgram_schoolNotFound() {
        // Arrange
        CreateProgramRequest request = new CreateProgramRequest("Bachelor of Science in Computer Science", "BSCS", schoolId, departmentId);
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> programService.addProgram(request));
        verify(programRepository, never()).save(any(Program.class));
    }

    @Test
    void addProgram_departmentNotFound() {
        // Arrange
        CreateProgramRequest request = new CreateProgramRequest("Bachelor of Science in Computer Science", "BSCS", schoolId, departmentId);
        when(schoolRepository.findById(schoolId)).thenReturn(Optional.of(testSchool));
        when(departmentRepository.findById(departmentId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> programService.addProgram(request));
        verify(programRepository, never()).save(any(Program.class));
    }

    @Test
    void getProgramById_success() {
        // Arrange
        when(programRepository.findById(programId)).thenReturn(Optional.of(testProgram));

        // Act
        ProgramResponse response = programService.getProgramById(programId);

        // Assert
        assertNotNull(response);
        assertEquals("Bachelor of Science in Computer Science", response.name());
        assertEquals("BSCS", response.code());
    }

    @Test
    void getProgramById_notFound() {
        // Arrange
        when(programRepository.findById(programId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> programService.getProgramById(programId));
    }

    @Test
    void getAllPrograms_success() {
        when(programRepository.findAll()).thenReturn(List.of(testProgram));

        var responses = programService.getAllPrograms();

        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals(programId, responses.getFirst().id());
        assertEquals(schoolId, responses.getFirst().schoolId());
        assertEquals(departmentId, responses.getFirst().departmentId());
    }

    @Test
    void getAllProgramsBySchool_success() {
        // Arrange
        List<Program> programs = List.of(testProgram);
        when(programRepository.findAllBySchoolId(schoolId)).thenReturn(programs);

        // Act
        List<ProgramResponse> responses = programService.getAllProgramsBySchool(schoolId);

        // Assert
        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals("Bachelor of Science in Computer Science", responses.getFirst().name());
    }

    @Test
    void getAllProgramsBySchool_empty() {
        // Arrange
        when(programRepository.findAllBySchoolId(schoolId)).thenReturn(new ArrayList<>());

        // Act
        List<ProgramResponse> responses = programService.getAllProgramsBySchool(schoolId);

        // Assert
        assertNotNull(responses);
        assertTrue(responses.isEmpty());
    }

    @Test
    void getAllProgramsByDepartment_success() {
        // Arrange
        List<Program> programs = List.of(testProgram);
        when(programRepository.findAllByDepartmentId(departmentId)).thenReturn(programs);

        // Act
        List<ProgramResponse> responses = programService.getAllProgramsByDepartment(departmentId);

        // Assert
        assertNotNull(responses);
        assertEquals(1, responses.size());
    }

    @Test
    void updateProgram_success() {
        // Arrange
        UpdateProgramRequest request = new UpdateProgramRequest("Updated Program Name", "UPCS");
        when(programRepository.findById(programId)).thenReturn(Optional.of(testProgram));
        testProgram.setName("Updated Program Name");
        testProgram.setCode("UPCS");
        when(programRepository.save(any(Program.class))).thenReturn(testProgram);

        // Act
        ProgramResponse response = programService.updateProgram(programId, request);

        // Assert
        assertNotNull(response);
        assertEquals("Updated Program Name", response.name());
        assertEquals("UPCS", response.code());
        verify(programRepository, times(1)).save(any(Program.class));
    }

    @Test
    void updateProgram_notFound() {
        // Arrange
        UpdateProgramRequest request = new UpdateProgramRequest("Updated Program Name", "UPCS");
        when(programRepository.findById(programId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> programService.updateProgram(programId, request));
    }

    @Test
    void deleteProgram_success() {
        // Arrange
        when(programRepository.findById(programId)).thenReturn(Optional.of(testProgram));
        when(programRepository.save(any(Program.class))).thenReturn(testProgram);

        // Act
        ProgramResponse response = programService.deleteProgram(programId);

        // Assert
        assertNotNull(response);
        assertFalse(testProgram.isActive());
        assertNotNull(testProgram.getDeletedBy());
        assertNotNull(testProgram.getDeletedAt());
        verify(programRepository, times(1)).save(any(Program.class));
    }

    @Test
    void deleteProgram_notFound() {
        // Arrange
        when(programRepository.findById(programId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> programService.deleteProgram(programId));
    }

    @Test
    void addCourse_success() {
        // Arrange
        AddProgramCourseRequest request = new AddProgramCourseRequest(ProgramCourseType.CORE, 1);
        when(programRepository.findById(programId)).thenReturn(Optional.of(testProgram));
        when(courseRepository.findById(courseId)).thenReturn(Optional.of(testCourse));
        when(programCourseRepository.findByProgram_IdAndCourse_Id(programId, courseId)).thenReturn(Optional.empty());
        when(programCourseRepository.save(any(ProgramCourse.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        ProgramCourseResponse response = programService.addCourse(programId, courseId, request);

        // Assert
        assertNotNull(response);
        assertEquals(courseId, response.courseId());
        assertEquals(ProgramCourseType.CORE, response.courseType());
        assertEquals(1, response.yearOfStudy());
        verify(programCourseRepository, times(1)).save(any(ProgramCourse.class));
    }

    @Test
    void addCourse_courseNotFound() {
        // Arrange
        AddProgramCourseRequest request = new AddProgramCourseRequest(ProgramCourseType.CORE, 1);
        when(programRepository.findById(programId)).thenReturn(Optional.of(testProgram));
        when(courseRepository.findById(courseId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> programService.addCourse(programId, courseId, request));
    }

    @Test
    void updateProgramCourse_success() {
        AddProgramCourseRequest request = new AddProgramCourseRequest(ProgramCourseType.ELECTIVE, 2);
        ProgramCourse association = new ProgramCourse(
                new ProgramCourseId(programId, courseId),
                testProgram,
                testCourse,
                ProgramCourseType.CORE,
                1
        );

        when(programRepository.findById(programId)).thenReturn(Optional.of(testProgram));
        when(programCourseRepository.findByProgram_IdAndCourse_Id(programId, courseId)).thenReturn(Optional.of(association));
        when(programCourseRepository.save(any(ProgramCourse.class))).thenAnswer(i -> i.getArgument(0));

        ProgramCourseResponse response = programService.updateProgramCourse(programId, courseId, request);

        assertEquals(ProgramCourseType.ELECTIVE, response.courseType());
        assertEquals(2, response.yearOfStudy());
        verify(programCourseRepository).save(association);
    }

    @Test
    void removeCourse_success() {
        // Arrange
        ProgramCourse association = new ProgramCourse(
                new ProgramCourseId(programId, courseId),
                testProgram,
                testCourse,
                ProgramCourseType.ELECTIVE,
                2
        );
        when(programRepository.findById(programId)).thenReturn(Optional.of(testProgram));
        when(programCourseRepository.findByProgram_IdAndCourse_Id(programId, courseId)).thenReturn(Optional.of(association));

        // Act
        programService.removeCourse(programId, courseId);

        // Assert
        verify(programCourseRepository, times(1)).delete(association);
    }

    @Test
    void getAllProgramCourses_success() {
        // Arrange
        ProgramCourse association = new ProgramCourse(
                new ProgramCourseId(programId, courseId),
                testProgram,
                testCourse,
                ProgramCourseType.CORE,
                1
        );
        when(programRepository.findById(programId)).thenReturn(Optional.of(testProgram));
        when(programCourseRepository.findAllByProgram_Id(programId)).thenReturn(List.of(association));

        // Act
        var courses = programService.getAllProgramCourses(programId);

        // Assert
        assertNotNull(courses);
        assertEquals(1, courses.size());
        assertEquals("Data Structures", courses.getFirst().courseTitle());
        assertEquals(ProgramCourseType.CORE, courses.getFirst().courseType());
        assertEquals(1, courses.getFirst().yearOfStudy());
    }

    @Test
    void getAllProgramCourses_empty() {
        // Arrange
        when(programRepository.findById(programId)).thenReturn(Optional.of(testProgram));
        when(programCourseRepository.findAllByProgram_Id(programId)).thenReturn(List.of());

        // Act
        var courses = programService.getAllProgramCourses(programId);

        // Assert
        assertNotNull(courses);
        assertTrue(courses.isEmpty());
    }
}
