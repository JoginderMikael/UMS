package git.jogindermikael.University.Management.System.student.repositories;

import git.jogindermikael.University.Management.System.course.entity.Course;
import git.jogindermikael.University.Management.System.student.entity.StudentCourseRegistration;
import git.jogindermikael.University.Management.System.student.entity.Student;
import git.jogindermikael.University.Management.System.semester.entity.Semester;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentCourseRegistrationRepository extends JpaRepository<StudentCourseRegistration, UUID> {
    boolean existsByStudentAndCourseAndSemester(Student student, Course course, Semester semester);
    List<StudentCourseRegistration> findByStudentAndSemester(Student student, Semester semester);

   StudentCourseRegistration findByCourse_Id(UUID courseId);
   Optional<StudentCourseRegistration> findByStudentAndCourse_IdAndSemester(Student student, UUID courseId, Semester semester);
}
