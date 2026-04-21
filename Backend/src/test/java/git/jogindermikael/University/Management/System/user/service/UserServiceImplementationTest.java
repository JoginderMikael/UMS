package git.jogindermikael.University.Management.System.user.service;

import git.jogindermikael.University.Management.System.academic.school.entity.School;
import git.jogindermikael.University.Management.System.academicYear.entity.AcademicYear;
import git.jogindermikael.University.Management.System.academicYear.repository.AcademicYearRepository;
import git.jogindermikael.University.Management.System.auth.security.UserPrincipal;
import git.jogindermikael.University.Management.System.enrollment.service.RegistrationNumberService;
import git.jogindermikael.University.Management.System.program.entity.Program;
import git.jogindermikael.University.Management.System.program.repository.ProgramRepository;
import git.jogindermikael.University.Management.System.semester.entity.Semester;
import git.jogindermikael.University.Management.System.semester.repository.SemesterRepository;
import git.jogindermikael.University.Management.System.student.entity.Student;
import git.jogindermikael.University.Management.System.student.repositories.StudentRepository;
import git.jogindermikael.University.Management.System.user.dto.UpdateRequest;
import git.jogindermikael.University.Management.System.user.entity.Role;
import git.jogindermikael.University.Management.System.user.entity.User;
import git.jogindermikael.University.Management.System.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplementationTest {

    @Mock
    UserRepository userRepository;

    @Mock
    PasswordEncoder passwordEncoder;

    @Mock
    StudentRepository studentRepository;

    @Mock
    ProgramRepository programRepository;

    @Mock
    AcademicYearRepository academicYearRepository;

    @Mock
    SemesterRepository semesterRepository;

    @Mock
    RegistrationNumberService registrationNumberService;

    @InjectMocks
    UserServiceImplementation userService;

    @BeforeEach
    void before() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void after(){
        SecurityContextHolder.clearContext();
    }

    @Test
    void createUser_success_and_duplicate() {
        var req = mock(git.jogindermikael.University.Management.System.user.dto.CreateUserRequest.class);
        when(req.getEmail()).thenReturn("test@example.com");
        when(req.getFirstName()).thenReturn("First");
        when(req.getLastName()).thenReturn("Last");
        when(req.getPassword()).thenReturn("pwd");
        when(req.getRole()).thenReturn(Role.ADMIN);

        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("pwd")).thenReturn("encpwd");

        User saved = User.builder()
            .email("test@example.com")
            .firstName("First")
            .lastName("Last")
            .password("encpwd")
            .role(Role.ADMIN)
            .active(true)
            .build();
        saved.setId(UUID.randomUUID());

        when(userRepository.save(any())).thenReturn(saved);

        var resp = userService.createUser(req);

        assertNotNull(resp);
        assertEquals(saved.getId(), resp.getId());

        // duplicate path
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);
        var ex = assertThrows(IllegalArgumentException.class, () -> userService.createUser(req));
        assertEquals("User with email already exists", ex.getMessage());
    }

    @Test
    void createUser_student_creates_default_student_profile() {
        var req = mock(git.jogindermikael.University.Management.System.user.dto.CreateUserRequest.class);
        when(req.getEmail()).thenReturn("student@example.com");
        when(req.getFirstName()).thenReturn("Stu");
        when(req.getLastName()).thenReturn("Dent");
        when(req.getPassword()).thenReturn("pwd");
        when(req.getRole()).thenReturn(Role.STUDENT);

        when(userRepository.existsByEmail("student@example.com")).thenReturn(false);
        when(passwordEncoder.encode("pwd")).thenReturn("encpwd");

        User saved = User.builder()
                .email("student@example.com")
                .firstName("Stu")
                .lastName("Dent")
                .password("encpwd")
                .role(Role.STUDENT)
                .active(true)
                .build();
        saved.setId(UUID.randomUUID());
        when(userRepository.save(any())).thenReturn(saved);

        School school = School.builder().name("Engineering").code("ENG").active(true).build();
        school.setId(UUID.randomUUID());

        Program program = new Program();
        program.setId(UUID.randomUUID());
        program.setCode("CS");
        program.setSchool(school);

        AcademicYear academicYear = AcademicYear.builder().name("2025/2026").active(true).build();
        academicYear.setId(UUID.randomUUID());

        Semester semester = Semester.builder().number(1).name("Semester 1").active(true).academicYear(academicYear).build();
        semester.setId(UUID.randomUUID());

        when(programRepository.findAll()).thenReturn(List.of(program));
        when(academicYearRepository.findByActiveTrue()).thenReturn(Optional.of(academicYear));
        when(semesterRepository.findByAcademicYearAndNumber(academicYear, 1)).thenReturn(Optional.of(semester));
        when(registrationNumberService.nextSerial()).thenReturn(1L);
        when(registrationNumberService.generateRegistrationNumber(eq("ENG"), eq("CS"), eq(1L), anyInt())).thenReturn("ENG/CS/00001/2026");

        userService.createUser(req);

        verify(studentRepository).save(any(Student.class));
    }

    @Test
    void getUserByEmail_found_and_notFound() {
        User user = User.builder().email("a@b.com").firstName("F").lastName("L").role(Role.ADMIN).build();
        user.setId(UUID.randomUUID());
        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(user));

        var resp = userService.getUserByEmail("a@b.com");
        assertEquals(user.getId(), resp.getId());

        when(userRepository.findByEmail("nope@x.com")).thenReturn(Optional.empty());
        var ex = assertThrows(RuntimeException.class, () -> userService.getUserByEmail("nope@x.com"));
        assertEquals("User not found", ex.getMessage());
    }

    @Test
    void getAllUsers_empty_and_studentMapping() {
        when(userRepository.findAll()).thenReturn(List.of());
        var ex = assertThrows(IllegalArgumentException.class, () -> userService.getAllUsers());
        assertEquals("Users not found", ex.getMessage());

        // student mapping
        UUID uid = UUID.randomUUID();
        User studentUser = User.builder().email("s@u.com").firstName("U").lastName("S").role(Role.STUDENT).build();
        studentUser.setId(uid);
        Student student = Student.builder().user(studentUser).firstName("StuFirst").lastName("StuLast").registrationNumber("REG123").build();

        when(userRepository.findAll()).thenReturn(List.of(studentUser));
        when(studentRepository.findAll()).thenReturn(List.of(student));

        var list = userService.getAllUsers();
        assertEquals(1, list.size());
        assertEquals("REG123", list.getFirst().getRegistrationNumber());
    }

    @Test
    void getUserById_student_and_nonStudent_and_notFound() {
        UUID uid = UUID.randomUUID();
        User u = User.builder().email("x@x.com").firstName("F").lastName("L").role(Role.STUDENT).build();
        u.setId(uid);
        when(userRepository.findById(uid)).thenReturn(Optional.of(u));
        Student student = Student.builder().user(u).firstName("Sf").lastName("Sl").registrationNumber("R1").build();
        when(studentRepository.findByUser_Id(uid)).thenReturn(Optional.of(student));

        var resp = userService.getUserById(uid);
        assertEquals(uid, resp.getId());
        assertEquals("R1", resp.getRegistrationNumber());

        // non-student
        UUID uid2 = UUID.randomUUID();
        User u2 = User.builder().email("n@x.com").firstName("A").lastName("B").role(Role.ADMIN).build();
        u2.setId(uid2);
        when(userRepository.findById(uid2)).thenReturn(Optional.of(u2));
        var r2 = userService.getUserById(uid2);
        assertEquals(uid2, r2.getId());

        // not found
        UUID no = UUID.randomUUID();
        when(userRepository.findById(no)).thenReturn(Optional.empty());
        var ex = assertThrows(IllegalArgumentException.class, () -> userService.getUserById(no));
        assertEquals("Users not found", ex.getMessage());
    }

    @Test
    void updateUser_success_and_emailExists() {
        UUID id = UUID.randomUUID();
        User u = User.builder().email("old@x.com").firstName("F").lastName("L").role(Role.ADMIN).build();
        u.setId(id);
        when(userRepository.findById(id)).thenReturn(Optional.of(u));

        UpdateRequest req = UpdateRequest.builder().firstName("NewF").lastName("NewL").email("new@x.com").role(Role.ADMIN).build();

        when(userRepository.findByEmail("new@x.com")).thenReturn(Optional.empty());
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        var resp = userService.updateUser(id, req);
        assertEquals("NewF", resp.getFirstName());

        // email exists (simulate original user still has old email)
        u.setEmail("old@x.com");
        User exists = User.builder().email("new@x.com").build();
        exists.setId(UUID.randomUUID());
        when(userRepository.findByEmail("new@x.com")).thenReturn(Optional.of(exists));
        UpdateRequest req2 = UpdateRequest.builder().firstName("X").lastName("Y").email("new@x.com").build();
        var ex = assertThrows(IllegalArgumentException.class, () -> userService.updateUser(id, req2));
        assertEquals("User with email already exists", ex.getMessage());
    }

    @Test
    void deleteUser_and_restoreUser_paths() {
        UUID id = UUID.randomUUID();
        User toDelete = User.builder().email("d@x.com").firstName("D").lastName("Del").role(Role.ADMIN).active(true).build();
        toDelete.setId(id);
        when(userRepository.findById(id)).thenReturn(Optional.of(toDelete));

        User admin = User.builder().email("admin@x.com").firstName("A").lastName("B").role(Role.ADMIN).build();
        admin.setId(UUID.randomUUID());
        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(new UserPrincipal(admin));
        SecurityContext sc = mock(SecurityContext.class);
        when(sc.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(sc);

        userService.deleteUser(id);

        ArgumentCaptor<User> cap = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(cap.capture());
        assertFalse(cap.getValue().isActive());
        assertNotNull(cap.getValue().getDeletedAt());
        assertEquals(admin.getId(), cap.getValue().getDeletedBy());

        // restore
        User deleted = User.builder().email("d@x.com").deletedBy(UUID.randomUUID()).active(false).build();
        deleted.setId(id);
        when(userRepository.findIncludingDeleted(id)).thenReturn(Optional.of(deleted));
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        userService.restoreUser(id);
        verify(userRepository, atLeastOnce()).save(any());

        // already active
        User alreadyActive = User.builder().email("d@x.com").deletedBy(null).active(true).build();
        alreadyActive.setId(id);
        when(userRepository.findIncludingDeleted(id)).thenReturn(Optional.of(alreadyActive));
        var ex = assertThrows(IllegalStateException.class, () -> userService.restoreUser(id));
        assertEquals("User is already active!", ex.getMessage());
    }

    @Test
    void getCurrentUser_student_and_notFound() {
        User u = User.builder().email("cu@x.com").role(Role.STUDENT).build();
        u.setId(UUID.randomUUID());
        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(new UserPrincipal(u));
        SecurityContext sc = mock(SecurityContext.class);
        when(sc.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(sc);

        when(userRepository.findById(u.getId())).thenReturn(Optional.of(u));
        Student s = Student.builder().user(u).firstName("S").lastName("L").registrationNumber("RN").build();
        when(studentRepository.findByUser_Id(u.getId())).thenReturn(Optional.of(s));

        var resp = userService.getCurrentUser();
        assertEquals("RN", resp.getRegistrationNumber());

        // user not found
        when(userRepository.findById(u.getId())).thenReturn(Optional.empty());
        var ex = assertThrows(RuntimeException.class, () -> userService.getCurrentUser());
        assertEquals("User not found", ex.getMessage());
    }

    @Test
    void getAllDeletedUsers_path() {
        User u = User.builder().email("z@x.com").build();
        u.setId(UUID.randomUUID());
        when(userRepository.findAllDeleted()).thenReturn(List.of(u));
        var list = userService.getAllDeletedUsers();
        assertEquals(1, list.size());

        when(userRepository.findAllDeleted()).thenReturn(List.of());
        var ex = assertThrows(RuntimeException.class, () -> userService.getAllDeletedUsers());
        assertEquals("Users not found", ex.getMessage());
    }
}
