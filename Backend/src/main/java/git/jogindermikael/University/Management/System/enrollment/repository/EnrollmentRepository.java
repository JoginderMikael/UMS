package git.jogindermikael.University.Management.System.enrollment.repository;

import git.jogindermikael.University.Management.System.enrollment.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
}
