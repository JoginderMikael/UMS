package git.jogindermikael.University.Management.System.student.service;

import git.jogindermikael.University.Management.System.academicYear.repository.AcademicYearRepository;
import git.jogindermikael.University.Management.System.semester.entity.Semester;
import git.jogindermikael.University.Management.System.semester.repository.SemesterRepository;
import git.jogindermikael.University.Management.System.student.entity.Student;
import git.jogindermikael.University.Management.System.student.entity.StudentSemesterEnrollment;
import git.jogindermikael.University.Management.System.student.repositories.StudentRepository;
import git.jogindermikael.University.Management.System.student.repositories.StudentSemesterEnrollmentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class StudentSemesterService {

    private final StudentSemesterEnrollmentRepository studentSemesterEnrollmentRepository;
    private final SemesterRepository semesterRepository;
    private final StudentRepository studentRepository;
    private final AcademicYearRepository academicYearRepository;
    private final CentralizedServices centralizedServices;

    public void enrollToSemester(UUID studentId){
        log.info("Starting semester enrollment for studentId={}", studentId);

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        log.debug("Resolved student registrationNumber={} currentYearOfStudy={}",
                student.getRegistrationNumber(), student.getYearOfStudy());

        List<Semester> activeSemesters = semesterRepository.findByActiveTrueOrderByUpdatedAtDescCreatedAtDesc();
        if (activeSemesters.isEmpty()) {
            log.error("No active semester configured while enrolling studentId={}", studentId);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No Active Semester");
        }
        if (activeSemesters.size() > 1) {
            log.warn("Multiple active semesters found (count={}) while enrolling studentId={}. semesterIds={}",
                    activeSemesters.size(),
                    studentId,
                    activeSemesters.stream().map(Semester::getId).toList());
        }
        Semester activeSemester = activeSemesters.getFirst();
        log.info("Using active semesterId={} number={} year={}",
                activeSemester.getId(),
                activeSemester.getNumber(),
                activeSemester.getAcademicYear() == null ? null : activeSemester.getAcademicYear().getName());

        // Handle possibly duplicated active rows safely by using list lookup.
        List<StudentSemesterEnrollment> activeEnrollments = studentSemesterEnrollmentRepository
                .findByStudentAndActiveTrueOrderByCreatedAtDesc(student);
        if (!activeEnrollments.isEmpty()) {
            log.warn("StudentId={} has {} active enrollment row(s). enrollmentIds={} semesterIds={}",
                    studentId,
                    activeEnrollments.size(),
                    activeEnrollments.stream().map(StudentSemesterEnrollment::getId).toList(),
                    activeEnrollments.stream().map(enrollment -> enrollment.getSemester().getId()).toList());
            boolean alreadyActiveInTargetSemester = activeEnrollments.stream()
                    .anyMatch(enrollment -> enrollment.getSemester().getId().equals(activeSemester.getId()));
            if (alreadyActiveInTargetSemester) {
                log.info("StudentId={} already enrolled in active semesterId={}", studentId, activeSemester.getId());
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Already Enrolled!");
            }
            activeEnrollments.forEach(enrollment -> enrollment.setActive(false));
            log.info("Deactivated {} previous active enrollment row(s) for studentId={}", activeEnrollments.size(), studentId);
        }

        if(studentSemesterEnrollmentRepository.existsByStudentAndSemester(student, activeSemester)){
            log.info("StudentId={} already has historical enrollment for semesterId={}", studentId, activeSemester.getId());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Semester enrollment already completed!");
        }

        //promote the student to next academic year and semester-student repo
        centralizedServices.studentPromotionIfNeeded(student, activeSemester);
        studentRepository.save(student);

        //enroll student to new semester
        StudentSemesterEnrollment enrollment = StudentSemesterEnrollment.builder()
                .student(student)
                .academicYear(activeSemester.getAcademicYear())
                .semester(activeSemester)
                .yearOfStudy(student.getYearOfStudy())
                .semesterNumber(activeSemester.getNumber())
                .active(true)
                .build();


        studentSemesterEnrollmentRepository.save(enrollment);
        log.info("Student enrollment created for studentId={} semesterId={} enrollmentYearOfStudy={} semesterNumber={}",
                studentId, activeSemester.getId(), enrollment.getYearOfStudy(), enrollment.getSemesterNumber());
    }
}
