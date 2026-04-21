package git.jogindermikael.University.Management.System.student.repositories;

import git.jogindermikael.University.Management.System.student.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface StudentRepository extends JpaRepository<Student, UUID> {
    Optional<Student> findByUser_Id(UUID userId);
    Optional<Student> findByRegistrationNumber(String registrationNumber);
}
