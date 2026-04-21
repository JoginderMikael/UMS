package git.jogindermikael.University.Management.System.student.service;

import git.jogindermikael.University.Management.System.academic.TranscriptDTOs.TranscriptCourseDto;
import git.jogindermikael.University.Management.System.academic.TranscriptDTOs.TranscriptResponse;
import git.jogindermikael.University.Management.System.academic.TranscriptDTOs.TranscriptSemesterDto;
import git.jogindermikael.University.Management.System.student.entity.Student;
import git.jogindermikael.University.Management.System.student.entity.StudentCourseResult;
import git.jogindermikael.University.Management.System.student.repositories.StudentCourseResultRepository;
import git.jogindermikael.University.Management.System.student.repositories.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TranscriptService {

    private final StudentCourseResultRepository courseResultRepository;
    private final StudentRepository studentRepository;

    public List<TranscriptResponse> generate(UUID studentId){

        Student student = studentRepository.findById(studentId)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        return courseResultRepository.findByStudent(student)
                .stream()
                .collect(Collectors.groupingBy(
                        r -> r.getSemester().getAcademicYear().getName()
                ))
                .entrySet()
                .stream()
                .map(entry-> new TranscriptResponse(
                        entry.getKey(),
                        mapSemesters(entry.getValue())
                ))
                .toList();
    }

    private List<TranscriptSemesterDto> mapSemesters(List<StudentCourseResult> value) {
        return value.stream()
                .collect(Collectors.groupingBy(r->r.getSemester().getNumber()))
                .entrySet()
                .stream()
                .map(entry -> new TranscriptSemesterDto(
                        entry.getKey(),
                        mapCourses(entry.getValue())
                ))
                .sorted(Comparator.comparing(TranscriptSemesterDto::semesterNumber))
                .toList();
    }

    private List<TranscriptCourseDto> mapCourses(List<StudentCourseResult> value) {
        return value.stream()
                .map(result -> new TranscriptCourseDto(
                        result.getCourse().getId(),
                        result.getCourse().getCode(),
                        result.getCourse().getTitle(),
                        result.getMarks(),
                        result.getGrade()
                ))
                .toList();
    }
}
