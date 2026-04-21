package git.jogindermikael.University.Management.System.student.repositories;

import git.jogindermikael.University.Management.System.course.entity.Course;
import git.jogindermikael.University.Management.System.semester.entity.Semester;
import git.jogindermikael.University.Management.System.student.entity.StudentCourseResult;
import git.jogindermikael.University.Management.System.student.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentCourseResultRepository extends JpaRepository<StudentCourseResult, UUID> {
    List<StudentCourseResult> findByStudent(Student student);

    Optional<StudentCourseResult> findByStudentAndCourseAndSemester(Student student, Course course, Semester semester);
}
