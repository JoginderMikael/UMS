package git.jogindermikael.University.Management.System.academic.controller;

import git.jogindermikael.University.Management.System.academic.TranscriptDTOs.GradeRequest;
import git.jogindermikael.University.Management.System.student.service.ResultService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ResultControllerTest {

    @Mock
    private ResultService resultService;

    @InjectMocks
    private ResultController resultController;

    @Test
    void updateResult_returnsOk() {
        GradeRequest request = new GradeRequest(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), 85);

        ResponseEntity<Void> result = resultController.updateResult(request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertNull(result.getBody());
        verify(resultService).grade(request);
    }
}
