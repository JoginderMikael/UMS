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
import git.jogindermikael.University.Management.System.user.dto.CreateUserRequest;
import git.jogindermikael.University.Management.System.user.dto.UpdateRequest;
import git.jogindermikael.University.Management.System.user.dto.UserResponse;
import git.jogindermikael.University.Management.System.user.entity.Role;
import git.jogindermikael.University.Management.System.user.entity.User;
import git.jogindermikael.University.Management.System.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.Year;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;


@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImplementation implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final StudentRepository studentRepository;
    private final ProgramRepository programRepository;
    private final AcademicYearRepository academicYearRepository;
    private final SemesterRepository semesterRepository;
    private final RegistrationNumberService registrationNumberService;


    @Override
    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public UserResponse createUser(CreateUserRequest createUserRequest) {

        log.info("Attempting to create user = {}", createUserRequest.getEmail());

        if(userRepository.existsByEmail(createUserRequest.getEmail())){
            throw new IllegalArgumentException("User with email already exists");
        }

        User user = User.builder()
                .firstName(createUserRequest.getFirstName())
                .lastName(createUserRequest.getLastName())
                .email(createUserRequest.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(createUserRequest.getPassword().trim()))
                .role(createUserRequest.getRole())
                .active(true)
                .build();

        User saved = userRepository.save(user);
        if (saved.getRole() == Role.STUDENT) {
            createDefaultStudentProfile(saved);
        }

        log.info("User created Successfully with id = {} and role={}", saved.getId(), saved.getRole());
        return mapToResponse(saved);
    }

    @Override
    @Cacheable(value = "users", key = "#email")
    public UserResponse getUserByEmail(String email) {
       log.info("Attempting to get user by email = {}", email);

       Optional<User> user = userRepository.findByEmail(email.trim().toLowerCase());

        return user.map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("User not found"));

    }

    @Override
    @Cacheable(value = "users", key = "'all'")
    public List<UserResponse> getAllUsers() {
        log.info("Attempting to get all users");
        List<User> users = userRepository.findAll();

        if(users.isEmpty()){
            throw new IllegalArgumentException("Users not found");
        }

        //Pre-fetch all students and create a look-up map: UserId -> student
        Map<UUID, Student> studentMap = studentRepository.findAll()
                .stream()
                .collect(Collectors.toMap(
                        student -> student.getUser().getId(),
                        student -> student
                ));

        return users.stream()
                .map(user -> {
                    if(user.getRole().equals(Role.STUDENT)){
                        Student student = studentMap.get(user.getId());

                        if(student == null){
                            log.warn("Student record missing for user ID: {}. Returning base user details.",
                                    user.getId());
                            return mapToResponse(user);
                        }

                        return mapToResponse(student, user);
                    }

                    return mapToResponse(user);
                })
                .toList();
    }

    @Override
    @Cacheable(value = "users", key = "#id")
    public UserResponse getUserById(UUID id) {
        log.info("Attempting to get user by ID = {}", id);

        Optional<User> user = userRepository.findById(id);

        // Check if the user is present
        if (user.isEmpty()) {
            throw new IllegalArgumentException("Users not found");
        }

        // Check if the user is a student and map accordingly
        if(user.get().getRole().equals(Role.STUDENT)){
                Optional<Student> student = studentRepository.findByUser_Id(user.get().getId());
                if(student.isPresent()){
                    return mapToResponse(student.get(), user.get());
                }
                log.warn("Student record missing for user ID: {}. Returning base user details.", user.get().getId());
                return mapToResponse(user.get());
            }

        return mapToResponse(user.get());
    }

    @Override
    @CacheEvict(value = "users", allEntries = true)
    public UserResponse updateUser(UUID id, UpdateRequest updateRequest) {
        User  user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setFirstName(updateRequest.getFirstName());
        user.setLastName(updateRequest.getLastName());

        /*
        Update email only when provided mail is not the same as the users email and
        there is no other main in db that is similar.
         */
        if(updateRequest.getEmail() != null &&
        !updateRequest.getEmail().equals(user.getEmail())){
            if(userRepository.findByEmail(updateRequest.getEmail()).isPresent()){
                throw new IllegalArgumentException("User with email already exists");
            }
            user.setEmail(updateRequest.getEmail());
        }

        if(updateRequest.getRole() != null &&
        !updateRequest.getRole().equals(user.getRole())){
            user.setRole(updateRequest.getRole());
        }

        User updated = userRepository.save(user);
        log.info("User updated Successfully with id = {} and role={}", updated.getId(), updated.getRole());

        return mapToResponse(updated);
    }



    @Override
    @CacheEvict(value = {"users"}, allEntries = true)
    public void deleteUser(UUID id) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assert auth != null;
        UserPrincipal admin = (UserPrincipal) auth.getPrincipal();

        User   user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        assert admin != null;
        user.setActive(false);
        user.setDeletedAt(Instant.now());
        user.setDeletedBy(admin.getId());
        userRepository.save(user);
        log.warn("User deleted Successfully with email: {}", user.getEmail());
    }

    @Override
    @CacheEvict(value = {"users"}, allEntries = true)
    public void restoreUser(UUID id) {

        User  user = userRepository.findIncludingDeleted(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(user.getDeletedBy() == null){
            throw new IllegalStateException("User is already active!");
        }

        user.setActive(true);
        user.setDeletedAt(null);
        user.setDeletedBy(null);

        userRepository.save(user);

        log.info("User restored Successfully with email = {}", user.getEmail());
    }

    @Override
    public UserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assert authentication != null;
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        assert userPrincipal != null;
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        log.info("Current user retrieved: {} ({})", user.getEmail(), user.getRole());

        if(user.getRole().equals(Role.STUDENT)){
            Optional<Student> student = studentRepository.findByUser_Id(user.getId());
            if(student.isPresent()){
                return mapToResponse(student.get(), user);
            }
            log.warn("Student record missing for user ID: {}. Returning base user details.", user.getId());
            return mapToResponse(user);
        }

        return mapToResponse(user);
    }

    @Override
    public List<UserResponse> getAllDeletedUsers() {
        List<User> deletedUsers = userRepository.findAllDeleted();
        if (deletedUsers.isEmpty()) {
            throw new RuntimeException("Users not found");
        }

        return deletedUsers.stream()
                .map(this::mapToResponse)
                .toList();
    }

    private void createDefaultStudentProfile(User user) {
        Program defaultProgram = programRepository.findAll()
                .stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No program found for student defaults"));
        School defaultSchool = defaultProgram.getSchool();

        AcademicYear activeAcademicYear = academicYearRepository.findByActiveTrue()
                .orElseThrow(() -> new IllegalStateException("No active academic year found for student defaults"));

        Semester defaultSemester = semesterRepository.findByAcademicYearAndNumber(activeAcademicYear, 1)
                .orElseGet(() -> semesterRepository.findByActiveTrue()
                        .orElseThrow(() -> new IllegalStateException("No semester found for student defaults")));

        long serial = registrationNumberService.nextSerial();
        String registrationNumber = registrationNumberService.generateRegistrationNumber(
                defaultSchool.getCode(),
                defaultProgram.getCode(),
                serial % 100000,
                Year.now().getValue()
        );

        String nationalId = "NID-" + user.getId().toString().replace("-", "").substring(0, 12).toUpperCase();

        Student student = Student.builder()
                .registrationNumber(registrationNumber)
                .nationalId(nationalId)
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .secondarySchool("TBD")
                .secondaryPerformance("TBD")
                .school(defaultSchool)
                .program(defaultProgram)
                .user(user)
                .academicYear(activeAcademicYear)
                .semester(defaultSemester)
                .yearOfStudy(1)
                .semesterNumber(defaultSemester.getNumber())
                .active(true)
                .build();

        studentRepository.save(student);
        log.info("Default student profile created for user id={}", user.getId());
    }


    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    private UserResponse mapToResponse(Student student,User user) {
        return UserResponse.builder()
                .id(user.getId())
                .studentId(student.getId())
                .programId(student.getProgram() != null ? student.getProgram().getId() : null)
                .firstName(student.getFirstName())
                .lastName(student.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .registrationNumber(student.getRegistrationNumber())
                .schoolName(student.getSchool() != null ? student.getSchool().getName() : null)
                .programName(student.getProgram() != null ? student.getProgram().getName() : null)
                .nationalId(student.getNationalId())
                .secondarySchool(student.getSecondarySchool())
                .secondaryPerformance(student.getSecondaryPerformance())
                .yearOfStudy(student.getYearOfStudy())
                .academicYear(student.getYearOfStudy())
                .semester(student.getSemesterNumber())
                .build();
    }
}
