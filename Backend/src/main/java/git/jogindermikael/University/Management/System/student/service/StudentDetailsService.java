package git.jogindermikael.University.Management.System.student.service;

import git.jogindermikael.University.Management.System.academic.school.entity.School;
import git.jogindermikael.University.Management.System.academic.school.repository.SchoolRepository;
import git.jogindermikael.University.Management.System.program.entity.Program;
import git.jogindermikael.University.Management.System.program.repository.ProgramRepository;
import git.jogindermikael.University.Management.System.student.dto.UpdateStudentDetailsRequest;
import git.jogindermikael.University.Management.System.student.dto.UpdateStudentDetailsResponse;
import git.jogindermikael.University.Management.System.student.entity.Student;
import git.jogindermikael.University.Management.System.student.repositories.StudentRepository;
import git.jogindermikael.University.Management.System.user.entity.User;
import git.jogindermikael.University.Management.System.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class StudentDetailsService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final ProgramRepository programRepository;

    @Transactional(readOnly = true)
    public UpdateStudentDetailsResponse getStudentDetailsByRegistrationNumber(String registrationNumber) {
        String normalizedRegistrationNumber = registrationNumber.trim();
        Student student = studentRepository.findByRegistrationNumber(normalizedRegistrationNumber)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        User user = student.getUser();

        return new UpdateStudentDetailsResponse(
                student.getId(),
                user.getId(),
                student.getFirstName(),
                student.getLastName(),
                user.getEmail(),
                student.getNationalId(),
                student.getSecondarySchool(),
                student.getSecondaryPerformance(),
                student.getSchool().getId(),
                student.getSchool().getName(),
                student.getProgram().getId(),
                student.getProgram().getName()
        );
    }

    @Transactional
    public UpdateStudentDetailsResponse updateStudentDetails(UUID studentId, UpdateStudentDetailsRequest request) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        User user = student.getUser();

        String normalizedEmail = request.email().trim().toLowerCase();
        if (!normalizedEmail.equals(user.getEmail()) && userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email already exists");
        }

        School school = schoolRepository.findById(request.schoolId())
                .orElseThrow(() -> new IllegalArgumentException("School not found"));

        Program program = programRepository.findById(request.programId())
                .orElseThrow(() -> new IllegalArgumentException("Program not found"));

        if (!program.getSchool().getId().equals(school.getId())) {
            throw new IllegalArgumentException("Selected program does not belong to the selected school");
        }

        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setEmail(normalizedEmail);

        student.setFirstName(request.firstName().trim());
        student.setLastName(request.lastName().trim());
        student.setNationalId(request.nationalId().trim());
        student.setSecondarySchool(request.secondarySchool().trim());
        student.setSecondaryPerformance(request.secondaryPerformance().trim());
        student.setSchool(school);
        student.setProgram(program);

        userRepository.save(user);
        Student updatedStudent = studentRepository.save(student);

        log.info("Admin updated student details for studentId={} and userId={}", updatedStudent.getId(), user.getId());

        return new UpdateStudentDetailsResponse(
                updatedStudent.getId(),
                user.getId(),
                updatedStudent.getFirstName(),
                updatedStudent.getLastName(),
                user.getEmail(),
                updatedStudent.getNationalId(),
                updatedStudent.getSecondarySchool(),
                updatedStudent.getSecondaryPerformance(),
                updatedStudent.getSchool().getId(),
                updatedStudent.getSchool().getName(),
                updatedStudent.getProgram().getId(),
                updatedStudent.getProgram().getName()
        );
    }
}
