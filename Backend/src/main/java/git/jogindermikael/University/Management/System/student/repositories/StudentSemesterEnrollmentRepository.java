package git.jogindermikael.University.Management.System.student.repositories;

import git.jogindermikael.University.Management.System.student.entity.Student;
import git.jogindermikael.University.Management.System.semester.entity.Semester;
import git.jogindermikael.University.Management.System.student.entity.StudentSemesterEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentSemesterEnrollmentRepository extends JpaRepository<StudentSemesterEnrollment, UUID> {
    Optional<StudentSemesterEnrollment> findByStudentAndActiveTrue(Student student);
    List<StudentSemesterEnrollment> findByStudentAndActiveTrueOrderByCreatedAtDesc(Student student);
    boolean existsByStudentAndSemester(Student student, Semester semester);
    List<StudentSemesterEnrollment> findByStudent(Student student);
}
