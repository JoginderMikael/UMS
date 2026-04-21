package git.jogindermikael.University.Management.System.student.service;


import git.jogindermikael.University.Management.System.academicYear.entity.AcademicYear;
import git.jogindermikael.University.Management.System.academicYear.repository.AcademicYearRepository;
import git.jogindermikael.University.Management.System.semester.entity.Semester;
import git.jogindermikael.University.Management.System.semester.repository.SemesterRepository;
import git.jogindermikael.University.Management.System.student.entity.Student;
import git.jogindermikael.University.Management.System.student.entity.StudentCourseRegistration;
import git.jogindermikael.University.Management.System.student.repositories.StudentCourseRegistrationRepository;
import git.jogindermikael.University.Management.System.student.repositories.StudentRepository;
import git.jogindermikael.University.Management.System.student.repositories.StudentSemesterEnrollmentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ExamRegistrationService {
    private final StudentCourseRegistrationRepository courseRegistrationRepository;
    private final StudentRepository studentRepository;
    private final StudentSemesterEnrollmentRepository studentSemesterEnrollmentRepository;
    private final SemesterRepository semesterRepository;
    private final AcademicYearRepository academicYearRepository;
    private final StudentFeePaymentService feePaymentService;


    public void registerForExam(UUID studentId, UUID courseId) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student Not Found"));

        AcademicYear activeAcademicYear = academicYearRepository.findByActiveTrue()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No active academic year"));

        Semester activeSemester = semesterRepository.findByActiveTrue()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No active semester"));

        if (!activeSemester.getAcademicYear().getId().equals(activeAcademicYear.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Active semester does not belong to active academic year");
        }

        var activeEnrollment = studentSemesterEnrollmentRepository.findByStudentAndActiveTrue(student)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Student is not actively enrolled in a semester"));

        if (!activeEnrollment.getSemester().getId().equals(activeSemester.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Student is not enrolled in the active semester");
        }

        StudentCourseRegistration courseRegistration = courseRegistrationRepository
                .findByStudentAndCourse_IdAndSemester(student, courseId, activeSemester)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not registered in active semester"));

        if (courseRegistration.isExamRegistered()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Exam already registered for this course");
        }

        if(!feePaymentService.isFeesCleared(student, activeSemester)){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Fee not cleared");
        }

        courseRegistration.setExamRegistered(true);
        log.info("Successfully registered exam for student {}", student.getRegistrationNumber());
    }
}
