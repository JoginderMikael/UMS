package git.jogindermikael.University.Management.System.student.service;

import git.jogindermikael.University.Management.System.academic.TranscriptDTOs.GradeRequest;
import git.jogindermikael.University.Management.System.course.entity.Course;
import git.jogindermikael.University.Management.System.course.repository.CourseRepository;
import git.jogindermikael.University.Management.System.semester.entity.Semester;
import git.jogindermikael.University.Management.System.semester.repository.SemesterRepository;
import git.jogindermikael.University.Management.System.student.entity.Student;
import git.jogindermikael.University.Management.System.student.entity.StudentCourseRegistration;
import git.jogindermikael.University.Management.System.student.entity.StudentCourseResult;
import git.jogindermikael.University.Management.System.student.repositories.StudentCourseRegistrationRepository;
import git.jogindermikael.University.Management.System.student.repositories.StudentCourseResultRepository;
import git.jogindermikael.University.Management.System.student.repositories.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResultServiceTest {

    @Mock
    private StudentCourseResultRepository resultRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private CentralizedServices centralizedServices;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private SemesterRepository semesterRepository;

    @Mock
    private StudentCourseRegistrationRepository studentCourseRegistrationRepository;

    @InjectMocks
    private ResultService resultService;

    private UUID studentId;
    private UUID courseId;
    private UUID semesterId;
    private Student student;
    private Course course;
    private Semester semester;
    private StudentCourseRegistration registration;

    @BeforeEach
    void setUp() {
        studentId = UUID.randomUUID();
        courseId = UUID.randomUUID();
        semesterId = UUID.randomUUID();

        student = new Student();
        student.setId(studentId);
        student.setRegistrationNumber("REG123");

        course = new Course();
        course.setId(courseId);

        semester = new Semester();
        semester.setId(semesterId);

        registration = StudentCourseRegistration.builder()
                .student(student)
                .course(course)
                .semester(semester)
                .examRegistered(true)
                .build();
    }

    @Test
    void grade_createsNewResult() {
        GradeRequest req = new GradeRequest(studentId, courseId, semesterId, 85);

        when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(studentCourseRegistrationRepository.findByStudentAndCourse_IdAndSemester(student, courseId, semester))
                .thenReturn(Optional.of(registration));
        when(resultRepository.findByStudentAndCourseAndSemester(student, course, semester)).thenReturn(Optional.empty());
        when(centralizedServices.calculateGrade(85)).thenReturn("A");
        when(resultRepository.save(any(StudentCourseResult.class))).thenAnswer(i -> i.getArgument(0));

        resultService.grade(req);

        ArgumentCaptor<StudentCourseResult> captor = ArgumentCaptor.forClass(StudentCourseResult.class);
        verify(resultRepository).save(captor.capture());
        StudentCourseResult saved = captor.getValue();
        assertEquals(student, saved.getStudent());
        assertEquals(course, saved.getCourse());
        assertEquals(85, saved.getMarks());
        assertEquals("A", saved.getGrade());
    }

    @Test
    void grade_updatesExistingResult() {
        GradeRequest req = new GradeRequest(studentId, courseId, semesterId, 62);
        StudentCourseResult existing = new StudentCourseResult();
        existing.setStudent(student);
        existing.setCourse(course);
        existing.setSemester(semester);
        existing.setMarks(50);
        existing.setGrade("C");

        when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(studentCourseRegistrationRepository.findByStudentAndCourse_IdAndSemester(student, courseId, semester))
                .thenReturn(Optional.of(registration));
        when(resultRepository.findByStudentAndCourseAndSemester(student, course, semester)).thenReturn(Optional.of(existing));
        when(centralizedServices.calculateGrade(62)).thenReturn("B");
        when(resultRepository.save(any(StudentCourseResult.class))).thenAnswer(i -> i.getArgument(0));

        resultService.grade(req);

        assertEquals(62, existing.getMarks());
        assertEquals("B", existing.getGrade());
        verify(resultRepository, times(1)).save(existing);
    }

    @Test
    void grade_courseNotFound_throws() {
        GradeRequest req = new GradeRequest(studentId, courseId, semesterId, 10);
        when(courseRepository.findById(courseId)).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class, () -> resultService.grade(req));
    }

    @Test
    void grade_semesterNotFound_throws() {
        GradeRequest req = new GradeRequest(studentId, courseId, semesterId, 10);
        when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
        when(semesterRepository.findById(semesterId)).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class, () -> resultService.grade(req));
    }

    @Test
    void grade_studentNotFound_throws() {
        GradeRequest req = new GradeRequest(studentId, courseId, semesterId, 10);
        when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));
        when(studentRepository.findById(studentId)).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class, () -> resultService.grade(req));
    }

    @Test
    void grade_studentCourseNotRegistered_throws() {
        GradeRequest req = new GradeRequest(studentId, courseId, semesterId, 75);
        when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(studentCourseRegistrationRepository.findByStudentAndCourse_IdAndSemester(student, courseId, semester))
                .thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> resultService.grade(req));
    }

    @Test
    void grade_examNotRegistered_throws() {
        GradeRequest req = new GradeRequest(studentId, courseId, semesterId, 75);
        registration.setExamRegistered(false);

        when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(studentCourseRegistrationRepository.findByStudentAndCourse_IdAndSemester(student, courseId, semester))
                .thenReturn(Optional.of(registration));

        assertThrows(ResponseStatusException.class, () -> resultService.grade(req));
    }
}
