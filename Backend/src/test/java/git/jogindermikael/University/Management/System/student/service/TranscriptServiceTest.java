package git.jogindermikael.University.Management.System.student.service;

import git.jogindermikael.University.Management.System.academic.TranscriptDTOs.TranscriptResponse;
import git.jogindermikael.University.Management.System.academicYear.entity.AcademicYear;
import git.jogindermikael.University.Management.System.course.entity.Course;
import git.jogindermikael.University.Management.System.semester.entity.Semester;
import git.jogindermikael.University.Management.System.student.entity.Student;
import git.jogindermikael.University.Management.System.student.entity.StudentCourseResult;
import git.jogindermikael.University.Management.System.student.repositories.StudentCourseResultRepository;
import git.jogindermikael.University.Management.System.student.repositories.StudentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Map;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TranscriptServiceTest {

    @Mock
    private StudentCourseResultRepository courseResultRepository;
    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private TranscriptService transcriptService;

    @Test
    void generate_ShouldReturnTranscript_WhenStudentExists() {
        UUID studentId = UUID.randomUUID();
        Student student = Student.builder().build();
        AcademicYear academicYear = AcademicYear.builder().name("2023-2024").build();
        Semester semester = Semester.builder().academicYear(academicYear).number(1).build();
        Course course = new Course();
        course.setCode("CS101");
        StudentCourseResult result = StudentCourseResult.builder()
                .semester(semester)
                .course(course)
                .marks(90)
                .grade("A")
                .build();

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(courseResultRepository.findByStudent(student)).thenReturn(List.of(result));

        List<TranscriptResponse> transcript = transcriptService.generate(studentId);

        assertFalse(transcript.isEmpty());
        assertEquals("2023-2024", transcript.getFirst().academicYear());
        assertEquals(1, transcript.getFirst().semesters().size());
        assertEquals("CS101", transcript.getFirst().semesters().getFirst().courses().getFirst().courseCode());
    }

    @Test
    void generate_ShouldReturnFourYearsWithEightSemestersAndEightCoursesPerSemester() {
        UUID studentId = UUID.randomUUID();
        Student student = Student.builder().build();

        List<StudentCourseResult> allResults = new ArrayList<>();
        for (int year = 1; year <= 4; year++) {
            String yearLabel = (2025 + year) + "/" + (2026 + year);
            AcademicYear academicYear = AcademicYear.builder().name(yearLabel).build();

            for (int semesterNumber = 1; semesterNumber <= 2; semesterNumber++) {
                Semester semester = Semester.builder().academicYear(academicYear).number(semesterNumber).build();

                for (int courseIndex = 1; courseIndex <= 8; courseIndex++) {
                    Course course = new Course();
                    course.setId(UUID.randomUUID());
                    course.setCode("Y" + year + "S" + semesterNumber + "C" + courseIndex);
                    course.setTitle("Course " + year + "-" + semesterNumber + "-" + courseIndex);

                    allResults.add(StudentCourseResult.builder()
                            .student(student)
                            .semester(semester)
                            .course(course)
                            .marks(70 + (courseIndex % 5))
                            .grade("A")
                            .build());
                }
            }
        }

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(courseResultRepository.findByStudent(student)).thenReturn(allResults);

        List<TranscriptResponse> transcript = transcriptService.generate(studentId);

        assertEquals(4, transcript.size());

        Map<String, TranscriptResponse> byYear = transcript.stream()
                .collect(Collectors.toMap(TranscriptResponse::academicYear, response -> response));

        for (int year = 1; year <= 4; year++) {
            String yearLabel = (2025 + year) + "/" + (2026 + year);
            TranscriptResponse yearResponse = byYear.get(yearLabel);
            assertEquals(2, yearResponse.semesters().size());

            assertEquals(1, yearResponse.semesters().get(0).semesterNumber());
            assertEquals(2, yearResponse.semesters().get(1).semesterNumber());
            assertEquals(8, yearResponse.semesters().get(0).courses().size());
            assertEquals(8, yearResponse.semesters().get(1).courses().size());
        }
    }

    @Test
    void generate_ShouldThrowWhenStudentNotFound() {
        UUID studentId = UUID.randomUUID();
        when(studentRepository.findById(studentId)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> transcriptService.generate(studentId));
    }
}
