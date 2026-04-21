package git.jogindermikael.University.Management.System.student.repositories;

import git.jogindermikael.University.Management.System.student.entity.Student;
import git.jogindermikael.University.Management.System.student.entity.StudentFeePayment;
import git.jogindermikael.University.Management.System.semester.entity.Semester;
import git.jogindermikael.University.Management.System.program.entity.Program;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.List;
import java.util.UUID;

public interface StudentFeePaymentRepository extends JpaRepository<StudentFeePayment, UUID> {
    Optional<StudentFeePayment> findByStudentAndSemester(Student student, Semester semester);
    List<StudentFeePayment> findByStudentOrderByCreatedAtDesc(Student student);
    List<StudentFeePayment> findBySemesterAndBalanceGreaterThan(Semester semester, BigDecimal balance);
    List<StudentFeePayment> findBySemesterAndStudent_Program(Semester semester, Program program);
}
