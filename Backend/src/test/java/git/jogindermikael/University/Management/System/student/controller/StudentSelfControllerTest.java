package git.jogindermikael.University.Management.System.student.controller;

import git.jogindermikael.University.Management.System.student.service.ExamRegistrationService;
import git.jogindermikael.University.Management.System.student.service.StudentCourseService;
import git.jogindermikael.University.Management.System.student.service.StudentSemesterService;
import git.jogindermikael.University.Management.System.student.service.TranscriptService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.http.MediaType;

import java.util.UUID;
import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class StudentSelfControllerTest {

    private MockMvc mockMvc;

    @Mock
    private StudentSemesterService semesterService;
    @Mock
    private StudentCourseService courseService;
    @Mock
    private ExamRegistrationService examService;
    @Mock
    private TranscriptService transcriptService;

    @InjectMocks
    private StudentSelfController studentSelfController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(studentSelfController).build();
    }

    @Test
    void enroll_ShouldReturnOk() throws Exception {
        UUID studentId = UUID.randomUUID();

        mockMvc.perform(post("/api/v1/students/me/semesters/enroll/{studentId}", studentId))
                .andExpect(status().isOk());

        verify(semesterService).enrollToSemester(studentId);
    }

    @Test
    void registerCourse_ShouldReturnOk() throws Exception {
        UUID studentId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();

        mockMvc.perform(post("/api/v1/students/me/courses/{studentId}/{courseId}", studentId, courseId))
                .andExpect(status().isOk());

        verify(courseService).registerCourse(studentId, courseId);
    }

    @Test
    void registerCourses_ShouldReturnOk() throws Exception {
        UUID studentId = UUID.randomUUID();
        UUID courseId1 = UUID.randomUUID();
        UUID courseId2 = UUID.randomUUID();
        String payload = """
                {
                  "studentId": "%s",
                  "courseIds": ["%s", "%s"]
                }
                """.formatted(studentId, courseId1, courseId2);

        mockMvc.perform(post("/api/v1/students/me/courses/bulk")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());

        verify(courseService).registerCourses(studentId, java.util.List.of(courseId1, courseId2));
    }

    @Test
    void getAllCourses_ShouldReturnOk() throws Exception {
        UUID studentId = UUID.randomUUID();

        mockMvc.perform(get("/api/v1/students/me/courses/{studentId}", studentId))
                .andExpect(status().isOk());

        verify(courseService).getMyCourses(studentId);
    }

    @Test
    void getExamRegistrationStatus_ShouldReturnOk_WhenNoCourseIdsProvided() throws Exception {
        UUID studentId = UUID.randomUUID();
        when(courseService.getExamRegistrationStatus(studentId, null)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/students/me/courses/{studentId}/exam-status", studentId))
                .andExpect(status().isOk());

        verify(courseService).getExamRegistrationStatus(studentId, null);
    }

    @Test
    void getExamRegistrationStatus_ShouldReturnOk_WhenCourseIdsProvided() throws Exception {
        UUID studentId = UUID.randomUUID();
        UUID courseId1 = UUID.randomUUID();
        UUID courseId2 = UUID.randomUUID();
        List<UUID> courseIds = List.of(courseId1, courseId2);
        when(courseService.getExamRegistrationStatus(studentId, courseIds)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/students/me/courses/{studentId}/exam-status", studentId)
                        .param("courseIds", courseId1.toString(), courseId2.toString()))
                .andExpect(status().isOk());

        verify(courseService).getExamRegistrationStatus(studentId, courseIds);
    }

    @Test
    void registerExam_ShouldReturnOk() throws Exception {
        UUID studentId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();

        mockMvc.perform(post("/api/v1/students/me/courses/{studentId}/{courseId}/exam", studentId, courseId))
                .andExpect(status().isOk());

        verify(examService).registerForExam(studentId, courseId);
    }

    @Test
    void getTranscripts_ShouldReturnOk() throws Exception {
        UUID studentId = UUID.randomUUID();

        mockMvc.perform(get("/api/v1/students/me/{studentId}/transcript", studentId))
                .andExpect(status().isOk());

        verify(transcriptService).generate(studentId);
    }
}
