package git.jogindermikael.University.Management.System.enrollment.service;

import git.jogindermikael.University.Management.System.academic.school.entity.School;
import git.jogindermikael.University.Management.System.program.entity.Program;
import git.jogindermikael.University.Management.System.program.repository.ProgramRepository;
import git.jogindermikael.University.Management.System.academic.school.repository.SchoolRepository;
import git.jogindermikael.University.Management.System.academicYear.entity.AcademicYear;
import git.jogindermikael.University.Management.System.academicYear.repository.AcademicYearRepository;
import git.jogindermikael.University.Management.System.enrollment.dtos.CancelEnrollmentRequest;
import git.jogindermikael.University.Management.System.enrollment.dtos.EnrollStudentRequest;
import git.jogindermikael.University.Management.System.enrollment.dtos.EnrollmentResponse;
import git.jogindermikael.University.Management.System.enrollment.dtos.EnrollStudentResponse;
import git.jogindermikael.University.Management.System.enrollment.dtos.UpdateEnrollmentStatusRequest;
import git.jogindermikael.University.Management.System.enrollment.entity.Enrollment;
import git.jogindermikael.University.Management.System.enrollment.entity.EnrollmentStatus;
import git.jogindermikael.University.Management.System.student.entity.Student;
import git.jogindermikael.University.Management.System.enrollment.repository.EnrollmentRepository;
import git.jogindermikael.University.Management.System.student.repositories.StudentRepository;
import git.jogindermikael.University.Management.System.semester.entity.Semester;
import git.jogindermikael.University.Management.System.semester.repository.SemesterRepository;
import git.jogindermikael.University.Management.System.user.entity.Role;
import git.jogindermikael.University.Management.System.user.entity.User;
import git.jogindermikael.University.Management.System.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.Year;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class EnrollmentService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final SchoolRepository schoolRepository;
    private final ProgramRepository programRepository;
    private final PasswordEncoder passwordEncoder;
    private final RegistrationNumberService registrationNumberService;
    private final AcademicYearRepository academicYearRepository;
    private final SemesterRepository semesterRepository;

    public EnrollStudentResponse enrollStudent(EnrollStudentRequest request) {
        String normalizedEmail = request.email() == null
                ? null
                : request.email().trim().toLowerCase(Locale.ROOT);

        //Validation
        if(userRepository.existsByEmail(normalizedEmail)){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A user with that email already exists.");
        }
        School school = schoolRepository.findById(request.schoolId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "School not found"));

        Program program = programRepository.findById(request.programId())
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND, "Program not found"));

        if(!program.getSchool().getId().equals(school.getId())){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The selected program does not belong to the selected school.");
        }

        AcademicYear academicYear = academicYearRepository.findByActiveTrue()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "No active academic year is configured. Activate an academic year before enrolling students."
                ));

        Semester semester = semesterRepository.findByAcademicYearAndActiveTrue(academicYear)
                .or(() -> semesterRepository.findByAcademicYearAndNumber(academicYear, 1))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "No semester is configured for the active academic year. Create and activate a semester before enrolling students."
                ));

        //generate serial number
        long serial = registrationNumberService.nextSerial();
        int year = Year.now().getValue();

        //generate registration number
        String regNo = registrationNumberService.generateRegistrationNumber(
                school.getCode(),
                program.getCode(),
                serial % 100000,
                year
        );

        //create a new user with role student
        User user = User.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(regNo))
                .role(Role.STUDENT)
                .active(true)
                .build();

        user = userRepository.save(user);

        //create student
        Student student = Student.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .nationalId(request.nationalId())
                .secondarySchool(request.secondarySchool())
                .secondaryPerformance(request.secondaryPerformance())
                .registrationNumber(regNo)
                .school(school)
                .program(program)
                .user(user)
                .active(true)
                .academicYear(academicYear)
                .semester(semester)
                .yearOfStudy(1)
                .semesterNumber(1)
                .build();

        student = studentRepository.save(student);

        //create enrollment
        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .enrollmentYear(year)
                .status(EnrollmentStatus.ENROLLED)
                .active(true)
                .build();
        enrollmentRepository.save(enrollment);

        //return student enrollment
        return  new EnrollStudentResponse(
                student.getId(),
                regNo,
                user.getFirstName() + " " + student.getLastName(),
                user.getEmail(),
                regNo, //temporary pass
                program.getName(),
                school.getName()
        );
    }

    public EnrollmentResponse cancelEnrollment(UUID enrollmentId, CancelEnrollmentRequest request) {
        Enrollment enrollment = findEnrollment(enrollmentId);

        if (enrollment.getStatus() == EnrollmentStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Enrollment is already cancelled");
        }

        enrollment.setStatus(EnrollmentStatus.CANCELLED);
        enrollment.setCancelledAt(Instant.now());
        enrollment.setCancellationReason(request != null ? request.reason() : null);

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
        return mapToEnrollmentResponse(savedEnrollment);
    }

    public List<EnrollmentResponse> getAllEnrollments() {
        return enrollmentRepository.findAll()
                .stream()
                .map(this::mapToEnrollmentResponse)
                .toList();
    }

    public EnrollmentResponse updateEnrollmentStatus(UUID enrollmentId, UpdateEnrollmentStatusRequest request) {
        Enrollment enrollment = findEnrollment(enrollmentId);
        EnrollmentStatus nextStatus = request.status();

        enrollment.setStatus(nextStatus);
        if (nextStatus == EnrollmentStatus.CANCELLED) {
            if (enrollment.getCancelledAt() == null) {
                enrollment.setCancelledAt(Instant.now());
            }
        } else {
            enrollment.setCancelledAt(null);
            enrollment.setCancellationReason(null);
        }

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
        return mapToEnrollmentResponse(savedEnrollment);
    }

    private Enrollment findEnrollment(UUID enrollmentId) {
        return enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enrollment not found"));
    }

    private EnrollmentResponse mapToEnrollmentResponse(Enrollment enrollment) {
        Student student = enrollment.getStudent();
        return new EnrollmentResponse(
                enrollment.getId(),
                student.getId(),
                student.getFirstName() + " " + student.getLastName(),
                student.getRegistrationNumber(),
                student.getUser().getEmail(),
                student.getProgram().getName(),
                student.getSchool().getName(),
                enrollment.getEnrollmentYear(),
                enrollment.getStatus(),
                enrollment.getCancelledAt(),
                enrollment.getCancellationReason()
        );
    }
}
