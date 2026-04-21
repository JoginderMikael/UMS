package git.jogindermikael.University.Management.System.student.service;

import git.jogindermikael.University.Management.System.academic.TranscriptDTOs.GradeRequest;
import git.jogindermikael.University.Management.System.course.entity.Course;
import git.jogindermikael.University.Management.System.course.repository.CourseRepository;
import git.jogindermikael.University.Management.System.semester.entity.Semester;
import git.jogindermikael.University.Management.System.semester.repository.SemesterRepository;
import git.jogindermikael.University.Management.System.student.entity.Student;
import git.jogindermikael.University.Management.System.student.entity.StudentCourseResult;
import git.jogindermikael.University.Management.System.student.repositories.StudentCourseRegistrationRepository;
import git.jogindermikael.University.Management.System.student.repositories.StudentCourseResultRepository;
import git.jogindermikael.University.Management.System.student.repositories.StudentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ResultService {

    private final StudentCourseResultRepository resultRepository;
    private final StudentRepository studentRepository;
    private final CentralizedServices centralizedServices;
    private final CourseRepository courseRepository;
    private final SemesterRepository semesterRepository;
    private final StudentCourseRegistrationRepository studentCourseRegistrationRepository;

    public void grade(GradeRequest request){

        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        Semester semester = semesterRepository.findById(request.semesterId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Semester not found"));

        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        var registration = studentCourseRegistrationRepository
                .findByStudentAndCourse_IdAndSemester(student, course.getId(), semester)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Student is not registered for this course in the specified semester"
                ));

        if (!registration.isExamRegistered()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot update result: student is not registered for exam"
            );
        }

        StudentCourseResult result = resultRepository
                .findByStudentAndCourseAndSemester(student, course, semester)
                .orElseGet(StudentCourseResult::new);

        result.setStudent(student);
        result.setCourse(course);
        result.setSemester(semester);
        result.setMarks(request.marks());
        result.setGrade(centralizedServices.calculateGrade(request.marks()));

        resultRepository.save(result);
        log.info("Student {} has grade {}", student.getRegistrationNumber(), result.getGrade());

    }
}
