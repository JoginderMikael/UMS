package git.jogindermikael.University.Management.System.academic.TranscriptDTOs;

import git.jogindermikael.University.Management.System.course.entity.Course;
import git.jogindermikael.University.Management.System.semester.entity.Semester;

import java.util.UUID;

public record GradeRequest(
        UUID studentId,
        UUID courseId,
        UUID semesterId,
        int marks
) {}
